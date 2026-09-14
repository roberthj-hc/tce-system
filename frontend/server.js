
/*const express = require('express');
const https = require('https');
const fs = require('fs');
const next = require('next');

const port = 3000;
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('../cert/key.pem'),
  cert: fs.readFileSync('../cert/cert.pem'),
};

app.prepare().then(() => {
  const server = express();

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  https.createServer(httpsOptions, server).listen(port, () => {
    console.log(`Frontend corriendo en https://192.168.1.2:${port}`);
  });
});
*/


const express = require("express");
const https = require("https");
const fs = require("fs");
const next = require("next");

const port = 3001;
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("../cert/key.pem"),
  cert: fs.readFileSync("../cert/cert.pem"),
};

const ip = fs.readFileSync("../cert/ip.txt", "utf8");

app.prepare().then(() => {
  const server = express();
  server.all("*", (req, res) => handle(req, res));
  https.createServer(httpsOptions, server).listen(port, () => {
    console.log(`Frontend corriendo en https://${ip}:${port}`);
  });
});
