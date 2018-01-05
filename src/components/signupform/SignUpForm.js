import React, { Component } from 'react'
const fields = require('../../constants').Fields

class SignUpForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: '',
      selected: fields[0]
    }
  }

  onInputChange(event) {
    this.setState({ name: event.target.value })
  }

  handleSubmit(event) {
    event.preventDefault()

    if (this.state.name.length < 2) {
      return alert('Please fill in your name.')
    }
    const index = fields.indexOf(this.state.selected)
    this.props.onSignUpFormSubmit(this.state.name, index)
  }

  render() {
    const createItem = item =>
    <option
    key={item}
    value={item} >
    {item}
    </option>
    return(
      <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
        <fieldset>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={this.state.name} onChange={this.onInputChange.bind(this)} placeholder="Name" />

          <select
          onChange={event => this.setState({ selected: event.target.value })}>
          {fields.map(createItem)}
          </select>

          <span className="pure-form-message">All fields are required.</span>

          <br />

          <button type="submit" className="pure-button pure-button-primary">Sign Up</button>
        </fieldset>
      </form>
    )
  }
}

export default SignUpForm
