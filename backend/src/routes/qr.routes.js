const express = require("express")
const { generateQR, QR_PATH } = require("../config/qr")
const fs = require("fs")

const router = express.Router()

router.get("/", (req, res) => {
  if (fs.existsSync(QR_PATH)) {
    res.sendFile(QR_PATH)
  } else {
    res.status(404).send("QR no disponible")
  }
})

router.post("/refresh", async (req, res) => {
  const { url } = req.body

  await generateQR(url)
  res.json({ message: "QR regenerado" })
})

module.exports = router
