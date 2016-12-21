import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import Promise from "bluebird";
import Nightmare from "nightmare";
import GoogleAuth from "google-auth-library";

export default function(clientSecretPath, credentialsPath) {
  return Promise.promisify(fs.readFile)(clientSecretPath)
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
  });
}
