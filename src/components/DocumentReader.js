import React, { Component } from 'react'

export default class DocumentReader extends Component {

  onDownloadClicked(event) {
    const { doc, onDownload } = this.props
    onDownload(doc)
  }

  render() {
    const { doc, fields, web3 } = this.props
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
        <p>{fields[doc.field.toNumber()]}</p>
        <p>{web3.toAscii(doc.hash)}</p>
        <p>{new Date(doc.timestamp.toNumber()).toString()}</p>
        <h5>Quotes made to</h5>
        <ul>
          {this.props.from.map((document, index) => <li key={index}>{document.name}</li>)}
        </ul>
        <h5>Quotes received by the document</h5>
        <ul>
          {this.props.to.map((document, index) => <li key={index}>{document.name}</li>)}
        </ul>
        <button onClick={this.onDownloadClicked.bind(this)}>Download</button>
        </div>
      )
    }
  }
}
