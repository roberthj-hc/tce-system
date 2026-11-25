const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const { getLocalIp } = require('./config/network');
const { generateQR } = require('./config/qr');
const { ensureSchema } = require('./config/schema');

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  }
}));
app.use(morgan('dev'));
app.use(express.json());

const fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/sections', require('./routes/section.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/roles', require('./routes/role.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/sales', require('./routes/sale.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/repairs', require('./routes/repair.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/dollar', require('./routes/dollar.routes'));
app.use("/qr", express.static(path.join(__dirname, "public")));
app.use("/api/qr", require("./routes/qr.routes"));

ensureSchema()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      const ip = getLocalIp();
      console.log(`Servidor iniciado en http://${ip}:${port}`);
      generateQR();
    });
  })
  .catch((err) => {
    console.error('Error preparando la base de datos:', err);
    process.exit(1);
  });



/*
// CERT
const https = require('https');
const fs = require('fs');
const certPath = path.join(__dirname, '../../cert/cert.pem');
const keyPath = path.join(__dirname, '../../cert/key.pem');

const credentials = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};
const ip = getLocalIp();

https.createServer(credentials, app).listen(port, '0.0.0.0', () => {
  console.log(`Servidor seguro corriendo en https://${ip}:${port}`);
  generateQR();
});

*/





/*
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const { getLocalIp } = require("./config/network");
const { generateQR } = require("./config/qr");
const fs = require("fs");

const app = express();
const port = 4000;

app.use(cors({ origin: (origin, callback) => callback(null, true) }));
app.use(morgan("dev"));
app.use(express.json());
app.use(require("express-fileupload")());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/suppliers", require("./routes/supplier.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/sales", require("./routes/sale.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/repairs", require("./routes/repair.routes"));
app.use("/api/reports", require("./routes/report.routes"));
app.use("/qr", express.static(path.join(__dirname, "public")));

const certPath = path.join(__dirname, "../../cert/cert.pem");
const keyPath = path.join(__dirname, "../../cert/key.pem");
const credentials = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const ip = getLocalIp();
require("https").createServer(credentials, app).listen(port, "0.0.0.0", () => {
  console.log(`Servidor seguro corriendo en https://${ip}:${port}`);
  generateQR();
});
*/