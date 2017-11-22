const IPFS = require("ipfs")
// const fs = require("fs-extra")
// TODO: Replace fs-extra: there's a collision with a webpack thingie, so...

var node = undefined
var nodePath = undefined

// As basic as it gets

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

module.exports.id = () => {
  return new Promise((resolve, reject) => {
    node.id((err, res) => {
      resolve([res.id, res.agentVersion, res.protocolVersion])
    })
  })
}

module.exports.add = (name, buffer) => {
  return new Promise((resolve, reject) => {
    node.files.add({
      path: name,
      content: buffer
    }, (err, result) => {
      console.log(err)
      console.log(result)
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

module.exports.cat = hash => {
  return new Promise((resolve, reject) => {
    console.log("about to cat")
    node.files.cat(hash, (err, stream) => {
      console.log("catting")
      console.log(err)
      console.log(stream)
      if (err) { resolve(undefined) }

      var buff = []
      console.log("dattings")
      stream.on("data", file => {
        console.log(file)

        var bb = new Blob(file);
    var f = new FileReader();
    f.onload = function(e) {
        resolve(e.target.result);
    };

    f.readAsText(bb);
        /*
        if (file.content) {
          file.content.on("data", data => {
            console.log(data)
            buff.push(data)
          })
          file.content.once("end", () => {
            console.log("did end")
          })
          file.content.resume()
        }*/
      })
      //stream.resume()
      //stream.on("end", () => resolve(buff))
    })
  })
}

module.exports.stop = clear => {
  return new Promise((resolve, reject) => {
    node.removeAllListeners()
    node.stop(() => {
      if (clear) {
        //fs.remove(nodePath)
        nodePath = undefined
      }
      resolve()
      process.exit
    })
  })
}
