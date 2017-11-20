const IPFS = require("ipfs")
const fs = require("fs-extra")

var node
var nodePath

// As basic as it gets

module.exports.start = path => {
  return new Promise((resolve, reject) => {
    node = new IPFS({ repo:  path})
    node.on("ready", () => {
      nodePath = path
      resolve(undefined)
    })
    node.on("error", error => {
      resolve(error)
    })
  })
}

module.exports.add = (name, buffer) => {
  return new Promise((resolve, reject) => {
    node.files.add({
      path: name,
      content: buffer
    }, (err, result) => {
      if (err) { resolve(undefined) }
      resolve(result[0].hash)
    })
  })
}

module.exports.get = hash => {
  return new Promise((resolve, reject) => {
    node.files.get(hash, (err, stream) => {
      if (err) { resolve(undefined) }

      const buff = []
      stream.on("data", file => {
        if (file.content) {
          file.content.on("data", data => buff.push(data))
          file.content.once("end", () => {

          })
          file.content.resume()
        }
      })
      stream.resume()
      stream.on("end", () => resolve(buff))
    })
  })
}

module.exports.stop = clear => {
  return new Promise((resolve, reject) => {
    node.removeAllListeners()
    node.stop(() => {
      if (clear) {
        fs.remove(nodePath)
        nodePath = undefined
      }
      resolve()
      process.exit
    })
  })
}
