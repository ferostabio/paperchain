import React, { Component } from 'react'
import DashboardListContainer from '../components/dashboardlist/DashboardListContainer'
const fields = require('../util/constants').Fields

class Dashboard extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
  }

  render() {
    return(
      <main className='container'>
        <div className='pure-g'>
          <div className='pure-u-1-1'>
            <h1>Dashboard</h1>
            <p><strong>Hi, {this.props.authData.name}!</strong></p>
            <p>{'You\'re a ' + fields[this.props.authData.field].slice(0, -1).toLowerCase() + 'ist.'}</p>
            <br />
            <DashboardListContainer />
          </div>
        </div>
      </main>
    )
  }
}

export default Dashboard
