import React, { Component } from 'react'

export default class CategoryList extends Component {

  onCategoryChange(event) {
    const index = this.props.options.indexOf(event.target.value)
    const { onCategoryChange } = this.props
    onCategoryChange(index)
  }

  render() {
    const documents = this.props.documents
    if (documents !== undefined) {
      const createItem = item =>
      <option
      key={item}
      value={item} >
      {item}
      </option>
      return (
        <div>
        <select
        onChange={this.onCategoryChange.bind(this)}>
        {this.props.options.map(createItem)}
        </select>
        <ul>
        {this.props.documents.map((document, index) => <li key={index}>{document.name}</li>)}
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
