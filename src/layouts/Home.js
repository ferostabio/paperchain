import React, { Component } from 'react'

class Home extends Component {
  render() {
    return(
      <main className='container'>
        <div className='pure-g'>
          <div className='pure-u-1-1'>
            <h2>Welcome to Paperchain!</h2>
            <p>Project made for <i>CryptoDevs</i> course on <i>blockchain</i> and <i>smart contract</i> development organized by <i>ONG Bitcoin Argentina</i>, <i>ATIX LABS</i> and <i>RSK</i>. Code setup taken from a couple of truffle boxes, namely <a href='https://github.com/truffle-box/react-auth-box' target='_blank'>react-auth-box</a> in order to have an out of the box auth system and to take advantage of redux’s global states.</p>
            <h3>Project</h3>
            <p>Paperchain is a dApp to keep track of scientific papers: users have to sign up with their name and field of work and can then upload documents, stored in a descentralized way with IPFS, as long as they are new (app includes <i>POE</i>). Users can also specify quoted papers during the document registration process and can peer-review existing papers, as long as they have the same <i>field</i>.</p>
            <p>You can find the full project <a href='https://github.com/ferostar/paperchain' target='_blank'>here</a>.</p>
          </div>
        </div>
      </main>
    )
  }
}

export default Home
