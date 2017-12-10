import React, { Component } from 'react'

export default class PaperReader extends Component {

  onDownloadClicked(event) {
    const { paper, onDownload } = this.props
    onDownload(paper)
  }

  render() {
    const { paper, fields, web3 } = this.props
    if (paper === undefined) {
      return (
        <div>
        <p>No paper selected</p>
        </div>
      )
    } else {
      return (
        <div>
        <h3>Paper</h3>
        <p>{paper.name}</p>
        <p>{fields[paper.field.toNumber()]}</p>
        <p>{web3.toAscii(paper.hash)}</p>
        <p>{new Date(paper.timestamp.toNumber()).toString()}</p>
        <h5>Quotes made to</h5>
        <ul>
          {this.props.from.map((paper, index) => <li key={index}>{paper.name}</li>)}
        </ul>
        <h5>Quotes received by the paper</h5>
        <ul>
          {this.props.to.map((paper, index) => <li key={index}>{paper.name}</li>)}
        </ul>
        <button onClick={this.onDownloadClicked.bind(this)}>Download</button>
        </div>
      )
    }
  }
}
