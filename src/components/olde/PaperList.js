import React, { Component } from 'react'

export default class PaperList extends Component {

  onReadClicked(index, event) {
    const hash = this.props.papers[index]
    const { onRead } = this.props
    onRead(hash)
  }

  render() {
    return (
      <div>
        <h3>Papers</h3>
        <ul>
          {this.props.papers.map((paper, index) => <li key={index}>{paper.name} <button onClick={this.onReadClicked.bind(this, index)}>Read</button></li>)}
        </ul>
      </div>
    )
  }
}
