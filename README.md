# googleapis-auth [![NPM version](http://img.shields.io/npm/v/googleapis-auth.svg?style=flat-square)](https://www.npmjs.org/package/googleapis-auth)

Generate a credentials (token) file for authorized access to Google APIs.

Heavily based on the code sample in Google Drive's [Node.js Quickstart guide](https://developers.google.com/drive/v3/web/quickstart/nodejs#step_3_set_up_the_sample) – just a bit more streamlined, robust, and general-purpose!

## Installation

Install the package with NPM:

```bash
$ npm install -g googleapis-auth
```

## Usage

First, download your `client_secret.json` file from the [Google API Console](https://console.developers.google.com).

Then, via the CLI, execute `googleapis-auth` with the following arguments:

```bash
$ googleapis-auth CLIENT_SECRET_PATH CREDENTIALS_PATH
```

If successful, credentials will be saved to `CREDENTIALS_PATH`.
