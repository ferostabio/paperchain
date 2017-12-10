import React, { Component } from 'react'

export default class FieldList extends Component {

  onFieldChange(event) {
    const index = this.props.options.indexOf(event.target.value)
    const { onFieldChange } = this.props
    onFieldChange(index)
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
        {this.props.papers.map((paper, index) => <li key={index}>{paper.name}</li>)}
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
