const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const setHosts = require("./controllers/set_hosts.js");
const initServer = require("./controllers/init_server.js");

// get version from package.json
const packageJson = require("../package.json");
const version = packageJson.version;

console.log(
    chalk.grey("----------------------------------------------------\n"),
    chalk.white(`TaikoProxyServer v${version} \n by shibe`),
    chalk.grey("\n----------------------------------------------------")
);

(async () => {
    // if config.toml is not found, create it using default values from config.default.toml
    if (!fs.existsSync("config.toml")) {
        console.log(
            chalk.yellow("[CONFIG]"),
            "No config found. Creating config.toml..."
        );
        fs.copyFileSync(
            path.join(__dirname, "config.defaults.toml"),
            "config.toml"
        );

        console.log(chalk.green("[CONFIG]"), "Config created successfully!");
    }

    await setHosts();

    initServer();
})();
