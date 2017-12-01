import React, { Component } from 'react'

export default class DocumentReader extends Component {

  onDownloadClicked(index, event) {
    const { document, onDownload } = this.props
    onDownload(document)
  }

  render() {
    const doc = this.props.document
    const web3 = this.props.web3
    if (doc === undefined) {
      return (
        <div>
        <p>No document selected</p>
        </div>
      )
    } else {
      return (
        <div>
        <h3>Document</h3>
        <p>{doc.name}</p>
        <p>{web3.toAscii(doc.hash)}</p>
        <p>{new Date(doc.timestamp.toNumber()).toString()}</p>
        <button onClick={this.onDownloadClicked.bind(this, doc)}>Download</button>
        </div>
      )
    }
  }
}
