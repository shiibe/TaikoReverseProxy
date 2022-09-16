const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const httpProxy = require("http-proxy");

const PORT_NAOMINET = 80;
const PORT_MUCHA = 10122;
const PORT_STARTUP = 54430;
const PORT_HB = 54431;

const MUCHA_CERT = path.join(__dirname, "../certificates/mucha_cert.crt");
const MUCHA_KEY = path.join(__dirname, "../certificates/mucha.key");
const VSAPI_CERT = path.join(__dirname, "../certificates/vsapi_cert.crt");
const VSAPI_KEY = path.join(__dirname, "../certificates/vsapi.key");

const localhost = "http://localhost";
const serverPort = 5000;

const initServer = () => {
    // ALL.NET
    httpProxy
        .createProxyServer({
            target: {
                host: localhost,
                port: serverPort,
            },
        })
        .listen(PORT_NAOMINET, () => {
            console.log(
                chalk.green("[NAOMINET]"),
                `listening on port ${PORT_NAOMINET}`
            );
        });

    // MUCHA
    httpProxy
        .createProxyServer({
            target: {
                host: localhost,
                port: serverPort,
            },
            ssl: {
                key: fs.readFileSync(MUCHA_KEY),
                cert: fs.readFileSync(MUCHA_CERT),
            },
        })
        .listen(PORT_MUCHA, () => {
            console.log(
                chalk.green("[MUCHA]"),
                `listening on port ${PORT_MUCHA}`
            );
        });

    // STARTUP
    httpProxy
        .createProxyServer({
            target: {
                host: localhost,
                port: serverPort,
            },
            ssl: {
                key: fs.readFileSync(VSAPI_KEY),
                cert: fs.readFileSync(VSAPI_CERT),
            },
        })
        .listen(PORT_STARTUP, () => {
            console.log(
                chalk.green("[VSI]"),
                `listening on port ${PORT_STARTUP}`
            );
        });

    // TAIKO
    httpProxy
        .createProxyServer({
            target: {
                host: localhost,
                port: serverPort,
            },
            ssl: {
                key: fs.readFileSync(VSAPI_KEY),
                cert: fs.readFileSync(VSAPI_CERT),
            },
        })
        .listen(PORT_HB, () => {
            console.log(chalk.green("[TAIKO]"), `listening on port ${PORT_HB}`);
        });
};
module.exports = initServer;
