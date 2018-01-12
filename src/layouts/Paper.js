import React, { Component } from 'react'
import PaperDetailContainer from '../components/paperdetail/PaperDetailContainer'

class Paper extends Component {

  render() {
    const paper = this.props.location.state.paper
    return(
      <main className='container'>
        <div className='pure-g'>
          <div className='pure-u-1-1'>
            <h1>Paper Detail</h1>
            <h2>{paper.name}</h2>
            <PaperDetailContainer paper={paper} />
          </div>
        </div>
      </main>
    )
  }
}

export default Paper
