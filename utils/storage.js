const IPFS = require("ipfs")

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
    node.once("error", error => {
      resolve(error)
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
      const buff = []
      stream.on("data", file => {
        if (file.content) {
          file.content.on("data", data => buff.push(data))
          file.content.resume()
        }
      })
      stream.resume()
      stream.on("end", () => {
        resolve(buff)
      })
    })
  })
}

// function that cats a file from IPFS, with it's multihash as param
module.exports.cat = hash => {
  return new Promise((resolve, reject) => {
    node.files.cat(hash, (err, stream) => {
      if (err) { resolve(undefined) }
      var buff = []
      stream.on("data", file => {
        var bb = new Blob(file)
        var f = new FileReader()
        f.onload = e => {
          resolve(e.target.result)
        }
        f.readAsText(bb)
      })
    })
  })
}

// function that stops the running node
module.exports.stop = () => {
  return new Promise((resolve, reject) => {
    node.removeAllListeners()
    node.stop(() => {
      nodePath = undefined
      resolve()
      process.exit
    })
  })
}
