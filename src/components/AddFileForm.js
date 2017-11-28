import React, { Component } from 'react'

var FileInput = require('react-file-input')

export default class AddFileForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      checked: true
    }
  }

  onFileAdd(event) {
    const file = event.target.files[0]
    const visibility = this.state.checked
    const { onFileAdd } = this.props
    onFileAdd(file, visibility)
    this.clearForm()
  }

  handleChange(event) {
    this.setState({
      checked: event.target.checked
    })
  }

  clearForm() {
    this.setState({
      checked: true
    })
  }

  render() {
    return (
      <div>

      <FileInput name="documentUploader"
      accept=".txt"
      placeholder="Please add a document"
      className="inputClass"
      onChange={this.onFileAdd.bind(this)} />

      <label htmlFor="checkbox">Document is public  </label>
      <input type="checkbox" id="checkbox" onChange={this.handleChange.bind(this)} checked={this.state.checked}/>

      </div>
    )
  }
}
