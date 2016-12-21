import fs from "fs";
import path from "path";
import readline from "readline";
import GoogleAuth from "google-auth-library";

const [ clientSecretPath, credentialsPath ] = process.argv.slice(2);
const scopes = ["https://www.googleapis.com/auth/drive"];

fs.readFile(clientSecretPath, (err, content) => {
  if (err) {
    console.log(`Error loading client secret file: ${err}`);
    return;
  }

  let credentials = JSON.parse(content);
  let clientSecret = credentials.installed.client_secret;
  let clientId = credentials.installed.client_id;
  let redirectUrl = credentials.installed.redirect_uris[0];
  let googleAuth = new GoogleAuth();
  let oauthClient = new googleAuth.OAuth2(clientId, clientSecret, redirectUrl);
  let authUrl = oauthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes
  });
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`Authorize this app by visiting "${authUrl}".`);
  rl.question("Enter the code from that page here: ", code => {
    rl.close();

    oauthClient.getToken(code, (err, token) => {
      if (err) {
        console.log("Error while trying to retrieve access token.", err);
        return;
      }

      try {
        fs.mkdirSync(path.dirname(credentialsPath));
      } catch (err) {
        if (err.code !== "EEXIST") throw err;
      }

      fs.writeFileSync(credentialsPath, JSON.stringify(token));
      console.log("Done!");
    });
  });
});
