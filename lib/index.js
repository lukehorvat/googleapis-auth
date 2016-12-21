#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import chalk from "chalk";
import mkdirp from "mkdirp";
import GoogleAuth from "google-auth-library";

let googleAuth = new GoogleAuth();
let scope = ["https://www.googleapis.com/auth/drive"];
let [ clientSecretPath, credentialsPath ] = process.argv.slice(2);
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
  });
});
