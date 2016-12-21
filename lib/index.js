#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import chalk from "chalk";
import yargs from "yargs";
import mkdirp from "mkdirp";
import GoogleAuth from "google-auth-library";
import pkg from "../package.json";

const { argv } =
  yargs
  .usage(`Usage: ${chalk.cyan(pkg.name, chalk.underline("CLIENT SECRET PATH"), chalk.underline("CREDENTIALS PATH"))}`)
  .option("h", { alias: "help", describe: "Show help", type: "boolean" })
  .option("v", { alias: "version", describe: "Show version", type: "boolean" });

if (argv.help || argv.h) {
  yargs.showHelp();
  process.exit();
}

if (argv.version || argv.v) {
  console.log(pkg.version);
  process.exit();
}

if (argv._.length !== 2) {
  yargs.showHelp();
  console.error(chalk.red("Client secret path and credentials path must be specified."));
  process.exit(1);
}

let [ clientSecretPath, credentialsPath ] = argv._;
let googleAuth = new GoogleAuth();
let scope = ["https://www.googleapis.com/auth/drive"];
let credentials = JSON.parse(fs.readFileSync(clientSecretPath));
let clientSecret = credentials.installed.client_secret;
let clientId = credentials.installed.client_id;
let redirectUrl = credentials.installed.redirect_uris[0];
let oauthClient = new googleAuth.OAuth2(clientId, clientSecret, redirectUrl);
let authUrl = oauthClient.generateAuthUrl({ access_type: "offline", scope });
let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log(`Visit the following URL:\n${chalk.cyan(authUrl)}`);
rl.question("Enter the code here: ", code => {
  rl.close();
  oauthClient.getToken(code, (err, token) => {
    if (err) throw err;
    mkdirp.sync(path.dirname(credentialsPath));
    fs.writeFileSync(credentialsPath, JSON.stringify(token));
    console.log(chalk.green("Done!"));
    process.exit();
  });
});
