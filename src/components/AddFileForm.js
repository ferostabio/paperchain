import React, { Component } from 'react'

const FileInput = require('react-file-input')

export default class AddFileForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: "Quantum Physics",
      text: "",
      quotes: []
    }
  }

  onFileAdd(event) {
    const { selected, quotes } = this.state
    const file = event.target.files[0]
    const { onFileAdd } = this.props
    onFileAdd(file, selected, quotes)
  }

  onAddClicked(event) {
    const text = this.state.text
    this.setState({...this.state,
      quotes: [...this.state.quotes, text],
      text: ""
    })
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
      accept=".txt,.pdf,.doc,.docx"
      placeholder="Please add a document"
      className="inputClass"
      onChange={this.onFileAdd.bind(this)} />

      <p>Category:

      <select
      onChange={event => this.setState({ selected: event.target.value })}>
      {this.props.options.map(createItem)}
      </select>

      </p>

      <p></p>

      <input type="text" value={this.state.text} onChange={event => this.setState({ text: event.target.value })}/>
      <button onClick={this.onAddClicked.bind(this)}>Quote</button>

      <ul>
        {this.state.quotes.map(quote => <li key={quote}>{quote} </li>)}
      </ul>

      </div>
    )
  }
}
