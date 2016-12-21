#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import yargs from "yargs";
import mkdirp from "mkdirp";
import Promise from "bluebird";
import Nightmare from "nightmare";
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

const [ clientSecretPath, credentialsPath ] = argv._;

Promise.promisify(fs.readFile)(clientSecretPath)
.then(JSON.parse)
.then(credentials => {
  let clientSecret = credentials.installed.client_secret;
  let clientId = credentials.installed.client_id;
  let redirectUrl = credentials.installed.redirect_uris[0];
  let googleAuth = new GoogleAuth();
  let oauthClient = new googleAuth.OAuth2(clientId, clientSecret, redirectUrl);
  let authUrl = oauthClient.generateAuthUrl({ access_type: "offline", scope: ["https://www.googleapis.com/auth/drive"] });
  let nightmare = new Nightmare({ show: true });

  return Promise.resolve()
  .then(() => nightmare.viewport(800, 600))
  .then(() => nightmare.goto(authUrl))
  .then(() => nightmare.wait(() => window.location.href.startsWith("https://accounts.google.com/o/oauth2/approval")))
  .then(() => nightmare.wait("#code"))
  .then(() => nightmare.evaluate(() => document.getElementById("code").value))
  .tap(() => nightmare.end())
  .then(code => Promise.promisifyAll(oauthClient).getTokenAsync(code))
  .tap(() => Promise.promisify(mkdirp)(path.dirname(credentialsPath)))
  .then(token => Promise.promisify(fs.writeFile)(credentialsPath, JSON.stringify(token)));
})
.then(() => {
  console.log(chalk.green("Done!"));
  process.exit();
})
.catch(error => {
  console.error(chalk.red(error.message || "An unexpected error occurred."));
  process.exit(1);
});
