import React, { Component } from 'react'

class Home extends Component {
  render() {
    return(
      <main className='container'>
        <div className='pure-g'>
          <div className='pure-u-1-1'>
            <p>Your Truffle Box is installed and ready.</p>
            <h2>Smart Contract Authentication</h2>
            <p>This particular box comes with autentication via a smart contract built-in.</p>
            <h3>Redirect Path</h3>
            <p>This example redirects home ('/') when trying to access an authenticated route without first authenticating. You can change this path in the failureRedriectUrl property of the UserIsAuthenticated wrapper on <strong>line 9</strong> of util/wrappers.js.</p>
            <h3>Accessing User Data</h3>
            <h3>Further Reading</h3>
            <p>The React/Redux portions of the authentication fuctionality are provided by <a href='https://github.com/mjrussell/redux-auth-wrapper' target='_blank'>mjrussell/redux-auth-wrapper</a>.</p>
          </div>
        </div>
      </main>
    )
  }
}

export default Home
