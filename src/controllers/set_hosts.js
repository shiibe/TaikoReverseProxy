import fs from "fs";
import chalk from "chalk";
import hostile from "hostile";
import toml from "toml";

const HOSTS = [
    "tenporouter.loc",
    "nbgi-amnet.jp",
    "naominet.jp",
    "v402-front.mucha-prd.nbgi-amnet.jp",
    "vsapi.taiko-p.jp",
];

const removeHosts = (silent) => {
    let hosts = hostile.get();

    hosts.map((host) => {
        if (HOSTS.includes(host[1])) {
            if (!silent) {
                console.log(chalk.yellow("[HOSTS]"), "Removing host:", host);
            }

            hostile.remove(host[0], host[1]);
        }
    });

    if (!silent) {
        console.log(chalk.green("[HOSTS]"), "Hosts removed successfully!");
    }
};

const setHosts = async () => {
    const config = toml.parse(fs.readFileSync("config.toml", "utf8"));

    if (config.hosts.remove_hosts === true) {
        console.log(chalk.yellow("[HOSTS]"), "Removing hosts...");
        removeHosts(false);
    }

    if (config.hosts.auto_set_hosts === true) {
        let ip;
        let isElevated;

        // check if user has admin rights
        try {
            child_process.execFileSync("net", ["session"], { stdio: "ignore" });
            isElevated = true;
        } catch (e) {
            isElevated = false;
        }

        if (!isElevated) {
            console.log(
                chalk.red("[HOSTS]"),
                "Error: You need admin rights to set hosts. Run this application with administrator privileges or set auto_set_hosts to false in config.toml to dismiss this error."
            );
            return;
        }

        if (config.hosts.auto_get_ip === true) {
            // get local ip address
            const interfaces = require("os").networkInterfaces();
            const addresses = [];
            for (const k in interfaces) {
                for (const k2 in interfaces[k]) {
                    const address = interfaces[k][k2];
                    if (address.family === "IPv4" && !address.internal) {
                        addresses.push(address.address);
                    }
                }
            }
            if (addresses.length === 0) {
                console.error(
                    chalk.red("[ERROR]"),
                    "No local ip address found. Try setting your IP manually in the config."
                );
                process.exit(1);
            } else {
                ip = addresses[0];
                console.log(
                    chalk.green("[HOSTS]"),
                    "Found local IP address:",
                    chalk.grey(ip)
                );
            }
        } else {
            // use ip address from config
            if (!config.hosts.local_ip) {
                console.error(
                    chalk.red("[ERROR]"),
                    "No local IP address found in config."
                );
                process.exit(1);
            } else {
                ip = config.hosts.local_ip;
            }
        }

        if (ip) {
            // remove existing hosts
            removeHosts(true);

            // add new hosts
            HOSTS.map((host) => {
                hostile.set(ip, host);
            });

            console.log(chalk.green("[HOSTS]"), "Hosts set successfully!");

            return;
        } else {
            console.error(
                chalk.red("[ERROR]"),
                "There was an unknown error while trying to set the hosts."
            );
            process.exit(1);
        }
    }
};

export default setHosts;
