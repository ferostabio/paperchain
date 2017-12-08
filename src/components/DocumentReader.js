import React, { Component } from 'react'

export default class DocumentReader extends Component {

  onDownloadClicked() {
    const { doc, onDownload } = this.props
    onDownload(doc)
  }

  render() {
    const { doc, categories, web3 } = this.props
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
        <p>{categories[doc.category.toNumber()]}</p>
        <p>{web3.toAscii(doc.hash)}</p>
        <p>{new Date(doc.timestamp.toNumber()).toString()}</p>
        <button onClick={this.onDownloadClicked}>Download</button>
        </div>
      )
    }
  }
}
