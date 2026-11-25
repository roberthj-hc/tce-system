const QRCode = require("qrcode")
const { getLocalIp } = require("./network")
const path = require("path")

const QR_PATH = path.join(__dirname, "../public/qr.png")

async function generateQR(urlManual = null) {
  let url
  let colorDark = "#0000a8"

  if (urlManual) {
    url = urlManual
    colorDark = "#008000"
  } else {
    url = process.env.PUBLIC_URL || `http://${getLocalIp()}:3000`
  }

  try {
    await QRCode.toFile(QR_PATH, url, {
      color: {
        dark: colorDark,
        light: "#FFFFFF",
      },
    })

    console.log("QR generado:", url)
  } catch (err) {
    console.error("Error generando QR:", err)
  }
}

module.exports = { generateQR, QR_PATH }
