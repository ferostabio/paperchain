import React, { Component } from 'react'

const FileInput = require('react-file-input')

export default class AddPaperForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      options: ['Refereed', 'Non-refereed'],
      refereed: 'Refereed',
      text: '',
      quotes: []
    }
  }

  onPaperAdd(event) {
    const { refereed, quotes } = this.state
    const file = event.target.files[0]
    const { onPaperAdd } = this.props
    const status = refereed === 'Refereed'
    onPaperAdd(file, status, quotes)
  }

  onAddClicked(event) {
    const text = this.state.text
    this.setState({...this.state,
      quotes: [...this.state.quotes, text],
      text: ''
    })
  }

  /*
   * Since currently the user can only have one field, it doesn't make any sense
   * for him to be able to choose the paper's one
   */
  render() {
    const createItem = item =>
    <option
    key={item}
    value={item} >
    {item}
    </option>
    return (
      <div>

      <FileInput name='documentUploader'
      accept='.txt,.pdf,.doc,.docx'
      placeholder='Please add a document'
      className='inputClass'
      onChange={this.onPaperAdd.bind(this)} />

      <select
      onChange={event => this.setState({ refereed: event.target.value })}>
      {this.state.options.map(createItem)}
      </select>

      <input type='text' value={this.state.text} onChange={event => this.setState({ text: event.target.value })}/>
      <button onClick={this.onAddClicked.bind(this)}>Quote</button>

      <ul>
        {this.state.quotes.map(quote => <li key={quote}>{quote} </li>)}
      </ul>

      </div>
    )
  }
}
