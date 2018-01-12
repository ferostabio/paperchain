import React, { Component } from 'react'

class PaperList extends Component {

  onReadClicked(index, event) {
    const paper = this.props.papers[index]
    this.props.onReadClicked(paper)
  }

  render() {
    return (
      <div>
        <h3>{this.props.title}</h3>
        <ul>
          {this.props.papers.map((paper, index) => <li key={index}>{paper.name} <button className='pure-button' onClick={this.onReadClicked.bind(this, index)}>Read</button></li>)}
        </ul>
      </div>
    )
  }
}

export default PaperList
