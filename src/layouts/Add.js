import React, { Component } from 'react'
import AddFormContainer from '../components/addform/AddFormContainer'

class Add extends Component {
  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Add Paper</h1>
            <p>Please add the document and enter some info.</p>
            <AddFormContainer />
          </div>
        </div>
      </main>
    )
  }
}

export default Add
