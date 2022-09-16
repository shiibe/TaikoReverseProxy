const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const util = require("util");
const httpProxy = require("http-proxy");

const PORT_NAOMINET = 80;
const PORT_MUCHA = 10122;
const PORT_STARTUP = 54430;
const PORT_HB = 54431;

const MUCHA_CERT = path.join(__dirname, "../certificates/mucha_cert.crt");
const MUCHA_KEY = path.join(__dirname, "../certificates/mucha.key");
const VSAPI_CERT = path.join(__dirname, "../certificates/vsapi_cert.crt");
const VSAPI_KEY = path.join(__dirname, "../certificates/vsapi.key");

const serverTarget = "http://localhost:5000";

const initServer = () => {
    // ALL.NET
    const naominet = httpProxy
        .createProxyServer({
            target: serverTarget,
            selfHandleResponse: true,
        })
        .listen(PORT_NAOMINET, () => {
            console.log(
                chalk.green("[NAOMINET]"),
                `listening on port ${PORT_NAOMINET}`
            );
        });

    // MUCHA
    const mucha = httpProxy
        .createProxyServer({
            target: serverTarget,
            ssl: {
                key: fs.readFileSync(MUCHA_KEY),
                cert: fs.readFileSync(MUCHA_CERT),
            },
            selfHandleResponse: true,
        })
        .listen(PORT_MUCHA, () => {
            console.log(
                chalk.green("[MUCHA]"),
                `listening on port ${PORT_MUCHA}`
            );
        });

    // STARTUP
    const vsi = httpProxy
        .createProxyServer({
            target: serverTarget,
            ssl: {
                key: fs.readFileSync(VSAPI_KEY),
                cert: fs.readFileSync(VSAPI_CERT),
            },
            selfHandleResponse: true,
        })
        .listen(PORT_STARTUP, () => {
            console.log(
                chalk.green("[VSI]"),
                `listening on port ${PORT_STARTUP}`
            );
        });

    // TAIKO
    const taiko = httpProxy
        .createProxyServer({
            target: serverTarget,
            ssl: {
                key: fs.readFileSync(VSAPI_KEY),
                cert: fs.readFileSync(VSAPI_CERT),
            },
            selfHandleResponse: true,
        })
        .listen(PORT_HB, () => {
            console.log(chalk.green("[TAIKO]"), `listening on port ${PORT_HB}`);
        });

    naominet.on("proxyRes", function (proxyRes, req, res) {
        console.log(chalk.grey(`[VSI] ${req.method} ${req.url}`));

        let body = [];
        proxyRes.on("data", (chunk) => {
            body.push(chunk);
        });

        proxyRes.on("end", () => {
            res.end(Buffer.concat(body));
        });
    });

    mucha.on("proxyRes", function (proxyRes, req, res) {
        console.log(chalk.grey(`[MUCHA] ${req.method} ${req.url}`));

        let body = [];
        proxyRes.on("data", (chunk) => {
            body.push(chunk);
        });

        proxyRes.on("end", () => {
            res.end(Buffer.concat(body));
        });
    });

    vsi.on("proxyRes", function (proxyRes, req, res) {
        console.log(chalk.grey(`[VSI] ${req.method} ${req.url}`));

        let body = [];
        proxyRes.on("data", (chunk) => {
            body.push(chunk);
        });

        proxyRes.on("end", () => {
            res.end(Buffer.concat(body));
        });
    });

    taiko.on("proxyRes", function (proxyRes, req, res) {
        console.log(chalk.grey(`[TAIKO] ${req.method} ${req.url}`));

        // wait for full response and then send it to the client
        let body = [];
        proxyRes.on("data", (chunk) => {
            body.push(chunk);
        });

        proxyRes.on("end", () => {
            res.end(Buffer.concat(body));
        });
    });
};

module.exports = initServer;
