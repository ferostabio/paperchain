import React, { Component } from 'react'

var FileInput = require('react-file-input')

export default class AddFileForm extends Component {

  onFileAdd(event) {
    const file = event.target.files[0]
    const { onFileAdd } = this.props
    onFileAdd(file)
  }

  render() {
    return (
      <div>

      <FileInput name="documentUploader"
      accept=".txt"
      placeholder="Please add a document"
      className="inputClass"
      onChange={this.onFileAdd.bind(this)} />

      </div>
    )
  }
}
