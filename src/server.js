import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import setHosts from "./controllers/set_hosts.js";

const packageJson = createRequire(import.meta.url)("../package.json");
const version = packageJson.version;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(
    chalk.grey("----------------------------------------------------\n"),
    chalk.white(`TaikoProxyServer v${version}a`),
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
})();
