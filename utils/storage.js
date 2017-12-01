const IPFS = require("ipfs")
const fs = require("./file")

var node = undefined
var nodePath = undefined

// IPFS proxy: as basic as it gets, currently. Almost no error handling, etc

// function that starts a node, with a path param
module.exports.start = path => {
  return new Promise((resolve, reject) => {
    node = new IPFS({ repo:  path})
    node.once("ready", () => {
      nodePath = path
      resolve(undefined)
    })
  })
}

// function that returns a node's info such as id, agent and protocol versions
module.exports.id = () => {
  return new Promise((resolve, reject) => {
    node.id((err, res) => {
      resolve([res.id, res.agentVersion, res.protocolVersion])
    })
  })
}

/*
 * function that adds a file to IPFS: it takes a string name and a file's
 * contents buffer and returns the files's multihash after uploading completes
 */
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

// function that gets a file from IPFS, with it's multihash as param
module.exports.get = hash => {
  return new Promise((resolve, reject) => {
    node.files.get(hash, (err, stream) => {
      if (err) { resolve(undefined) }
      var buffer = []
      stream.on("data", file => {
        if (file.content) {
          file.content.on("data", data => buffer.push(data))
          file.content.resume()
        }
      })
      stream.resume()
      stream.on("end", () => {
        resolve(buffer)
      })
    })
  })
}

// function that stops the running node
module.exports.stop = clear => {
  return new Promise((resolve, reject) => {
    node.removeAllListeners()
    node.stop(() => {
      if (clear) {
        fs.rmrf(nodePath)
      }
      nodePath = undefined
      resolve()
    })
  })
}
