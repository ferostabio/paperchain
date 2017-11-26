const fs = require("fs")
const crypto = require("crypto")

// fs related code, used in some placess across the app

module.exports.hashFile = path => {
  return new Promise((resolve, reject) => {
    var shasum = crypto.createHash("md5")
    var s = fs.ReadStream(path)
    s.on("data", d => { shasum.update(d) })
    s.on("end", () => {
      resolve(shasum.digest("hex"))
    })
  })
}

module.exports.readSync = path => {
  return fs.readFileSync(path)
}
