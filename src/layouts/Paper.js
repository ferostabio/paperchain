import React, { Component } from 'react'
import PaperDetailContainer from '../components/paperdetail/PaperDetailContainer'

class Paper extends Component {

  render() {
    const hash = this.props.params.hash
    return(
      <main className='container'>
        <div className='pure-g'>
          <div className='pure-u-1-1'>
            <PaperDetailContainer hash={hash} />
          </div>
        </div>
      </main>
    )
  }
}

export default Paper
