import React, { Component } from 'react'

const FileInput = require('react-file-input')

export default class AuthForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: 'Quantum Physics',
      text: '',
    }
  }

  onSignupClicked(event) {
    const { selected, text } = this.state
    const { onSignupClicked } = this.props
    onSignupClicked(text, selected)
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
      <h1>Paperchain</h1>
      <h3>Please enter your name and field</h3>

      <input type='text' value={this.state.text} onChange={event => this.setState({ text: event.target.value })}/>
      <button onClick={this.onSignupClicked.bind(this)}>Sign Up</button>

      <p>Field:

      <select
      onChange={event => this.setState({ selected: event.target.value })}>
      {this.props.options.map(createItem)}
      </select>

      </p>

      </div>
    )
  }
}
