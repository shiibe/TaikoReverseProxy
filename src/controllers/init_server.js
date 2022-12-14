const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const httpProxy = require("http-proxy");
const toml = require("toml");

const PORT_NAOMINET = 80;
const PORT_MUCHA = 10122;
const PORT_STARTUP = 54430;
const PORT_HB = 54431;

const MUCHA_CERT = path.join(__dirname, "../certificates/mucha_cert.crt");
const MUCHA_KEY = path.join(__dirname, "../certificates/mucha.key");
const VSAPI_CERT = path.join(__dirname, "../certificates/vsapi_cert.crt");
const VSAPI_KEY = path.join(__dirname, "../certificates/vsapi.key");

const config = toml.parse(fs.readFileSync("./config.toml", "utf-8"));

let serverTarget = "http://localhost:5000";

const initServer = () => {
    if (config.proxy.proxy_target_url) {
        // if proxy_target_url is set in config.toml, use that instead
        serverTarget = config.proxy.proxy_target_url;
    }

    console.log(
        chalk.grey(
            `Proxying to ${serverTarget}, please make sure the game server is running on that address.\n`
        )
    );

    if (config.proxy.naominet === true) {
        // ALL.NET
        const naominet = httpProxy
            .createProxyServer({
                target: serverTarget,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                changeOrigin: true,
            })
            .listen(PORT_NAOMINET, () => {
                console.log(
                    chalk.green("[NAOMINET]"),
                    `listening on port ${PORT_NAOMINET}`
                );
            });

        naominet.on("proxyRes", function (proxyRes, req, res) {
            console.log(chalk.grey(`[NAOMINET] ${req.method} ${req.url}`));
        });
    } else {
        console.log(chalk.grey("[NAOMINET] disabled"));
    }

    if (config.proxy.mucha === true) {
        // MUCHA
        const mucha = httpProxy
            .createProxyServer({
                target: serverTarget,
                ssl: {
                    key: fs.readFileSync(MUCHA_KEY),
                    cert: fs.readFileSync(MUCHA_CERT),
                },
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                changeOrigin: true,
                secure: true,
            })
            .listen(PORT_MUCHA, () => {
                console.log(
                    chalk.green("[MUCHA]"),
                    `listening on port ${PORT_MUCHA}`
                );
            });

        mucha.on("proxyRes", function (proxyRes, req, res) {
            console.log(chalk.grey(`[MUCHA] ${req.method} ${req.url}`));
        });
    } else {
        console.log(chalk.grey("[MUCHA] disabled"));
    }

    if (config.proxy.vsi === true) {
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
    } else {
        console.log(chalk.grey("[VSI] disabled"));
    }

    if (config.proxy.taiko === true) {
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
                console.log(
                    chalk.green("[TAIKO]"),
                    `listening on port ${PORT_HB}`
                );
            });

        taiko.on("proxyRes", function (proxyRes, req, res) {
            console.log(chalk.grey(`[TAIKO] ${req.method} ${req.url}`));

            let body = [];
            proxyRes.on("data", (chunk) => {
                body.push(chunk);
            });

            proxyRes.on("end", () => {
                res.end(Buffer.concat(body));
            });
        });
    } else {
        console.log(chalk.grey("[TAIKO] disabled"));
    }
};

module.exports = initServer;
