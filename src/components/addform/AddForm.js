import React, { Component } from 'react'
const FileInput = require('react-file-input')
const options = require('../../util/constants').RefereedOptions

class AddForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
      refereed: options[0],
      quoteText: '',
      quotes: [],
      description: ''
    }
  }

  onFileAdd(event) {
    this.setState({ file: event.target.files[0]})
  }

  onQuoteInputChange(event) {
    this.setState({ quoteText: event.target.value })
  }

  onDescriptionInputChange(event) {
    this.setState({ description: event.target.value })
  }

  onAddQuoteClicked(event) {
    event.preventDefault()

    const { quoteText, quotes } = this.state
    if (quoteText.length != 32) {
      return alert('Please enter a valid MD5 hash.')
    }
    if (quotes.filter(quote => quote == quoteText).length !== 0) {
      return alert('Already quoted that paper.')
    }
    this.setState({...this.state,
      quotes: [...this.state.quotes, quoteText],
      quoteText: ''
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    const { file, refereed, quotes, description } = this.state
    if (file === null) {
      return alert('You need to add a file')
    }
    const index = options.indexOf(refereed)
    this.props.onProfileFormSubmit(file, index, description, quotes)
  }

  render() {
    const createItem = item =>
    <option
    key={item}
    value={item} >
    {item}
    </option>
    return(
      <form className='pure-form pure-form-stacked' onSubmit={this.handleSubmit.bind(this)}>
      <fieldset>
      <FileInput name='documentUploader'
      accept='.txt,.pdf,.doc,.docx'
      placeholder='Tap to add'
      className='inputClass'
      onChange={this.onFileAdd.bind(this)} />

      <select
      onChange={event => this.setState({ refereed: event.target.value })}>
      {options.map(createItem)}
      </select>
      <span className='pure-form-message'>Specify if the paper can be peer reviewed.</span>

      <br />

      <label>
        Description:
        <textarea value={this.state.description} onChange={this.onDescriptionInputChange.bind(this)} />
      </label>
      <span className='pure-form-message'>This is a requierd field.</span>

      <br />

      <label>
        Quoted papers
        <input id='quote' type='text' value={this.state.quoteText} onChange={this.onQuoteInputChange.bind(this)} placeholder='Paper hash' />
      </label>

      <button className='pure-button' onClick={this.onAddQuoteClicked.bind(this)}>Quote</button>

      <ul>
        {this.state.quotes.map(quote => <li key={quote}>{quote} </li>)}
      </ul>

      <br />

      <button type='submit' className='pure-button pure-button-primary'>Register</button>
      </fieldset>
      </form>
    )
  }
}

export default AddForm
