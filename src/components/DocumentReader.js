import React, { Component } from 'react'

export default class DocumentReader extends Component {

      render() {
        return (
          <div>
          <h3>{this.props.name}</h3>
          <p>{this.props.contents}</p>
          </div>
        )
      }
    }
