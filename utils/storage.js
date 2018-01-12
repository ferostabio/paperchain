const IPFS = require('ipfs')
const fs = require('./file')

// IPFS proxy: as basic as it gets, currently. Almost no error handling, etc
class Storage {

  // function that starts a node, with a path param
  start(path) {
    this.path = path
    return new Promise((resolve, reject) => {
      this.node = new IPFS({ repo:  path})
      this.node.once('ready', () => {
        resolve()
      })
    })
  }

  // function that returns node info
  info() {
    return new Promise((resolve, reject) => {
      this.node.id((err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve([res.id, res.agentVersion, res.protocolVersion])
        }
      })
    })
  }

  /*
  * function that adds a file to IPFS: it takes a string name and a file's
  * contents buffer and returns the files's multihash after uploading completes
  */
  add(name, buffer) {
    return new Promise((resolve, reject) => {
      this.node.files.add({
        path: name,
        content: buffer
      }, (err, result) => {
        if (err) {
          rejec(err)
        } else {
          resolve(result[0].hash)
        }
      })
    })
  }

  // function that cats a file from IPFS, with it's multihash as param
  cat(hash) {
    return new Promise((resolve, reject) => {
      this.node.files.cat(hash, (err, stream) => {
        if (err) {
          reject(undefined)
        } else {
          stream.on('data', file => {
            resolve(file)
          })
        }
      })
    })
  }

  // function that stops the running node
  stop(clear) {
    return new Promise((resolve, reject) => {
      this.node.stop(() => {
        if (clear) {
          fs.rmrf(this.path)
        }
        this.path = undefined
        resolve()
      })
    })
  }
}

module.exports = Storage
