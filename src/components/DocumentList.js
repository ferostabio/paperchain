import React, { Component } from 'react'

export default class DocumentList extends Component {

  onReadClicked(index, event) {
    const hash = this.props.documents[index]
    const { onRead } = this.props
    onRead(hash)
  }

  render() {
    return (
      <div>
        <h3>Documents</h3>
        <ul>
          {this.props.documents.map((document, index) => <li key={index}>{document.name} <button onClick={this.onReadClicked.bind(this, index)}>Read</button></li>)}
        </ul>
      </div>
    )
  }
}
