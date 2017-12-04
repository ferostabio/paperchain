import React, { Component } from 'react'

var FileInput = require('react-file-input')

export default class AddFileForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: "Quantum Physics",
    }
  }

  onFileAdd(event) {
    const selected = this.state.selected
    const file = event.target.files[0]
    const { onFileAdd } = this.props
    onFileAdd(file, selected)
  }

  render() {
    const createItem = item =>
    <option
    key={item}
    value={item} >
    {item}
    </option>
    return (
      <div>

      <FileInput name="documentUploader"
      accept=".txt"
      placeholder="Please add a document"
      className="inputClass"
      onChange={this.onFileAdd.bind(this)} />

      <select
      onChange={event => this.setState({ selected: event.target.value })}>
      {this.props.options.map(createItem)}
      </select>
      </div>
    )
  }
}
