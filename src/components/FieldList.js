import React, { Component } from 'react'

export default class FieldList extends Component {

  onFieldChange(event) {
    const index = this.props.options.indexOf(event.target.value)
    const { onFieldChange } = this.props
    onFieldChange(index)
  }

  onReviewClicked(index, event) {
    const paper = this.props.papers[index]
    const { onReviewClicked } = this.props
    onReviewClicked(paper)
  }

  renderReviewStatus(paper, index) {
    if (paper.owner === this.props.userAddress || paper.field.toNumber() !== this.props.field) {
      return(<li key={index}>{paper.name}</li>)
    } else if (this.props.reviews.filter(review => review.hash === paper.hash).length > 0) {
      return (
        <li key={index}>{paper.name}
        <input type="checkbox" disabled="disabled" checked="checked"/>
        </li>
      )
    } else {
      return (
        <li key={index}>{paper.name}
        <button onClick={this.onReviewClicked.bind(this, index)}>Review</button>
        </li>
      )
    }
  }

  render() {
    const papers = this.props.papers
    if (papers !== undefined) {
      const createItem = item =>
      <option
      key={item}
      value={item} >
      {item}
      </option>
      return (
        <div>
        <select
        onChange={this.onFieldChange.bind(this)}>
        {this.props.options.map(createItem)}
        </select>
        <ul>
        {
          papers.map((paper, index) =>
          this.renderReviewStatus(paper, index)
        )
      }
      </ul>
      </div>
    )
  } else {
    return (
      <div>
      </div>
    )
  }
}
}
