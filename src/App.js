// Libraries

import React, { Component } from 'react'
import Contract from 'truffle-contract'

// Contract Abis
import Documenter from '../build/contracts/Documenter.json'

// Utils
import getWeb3 from './utils/getWeb3'
import promisify from './utils/promisify'

// Components
import AddFileForm from './components/AddFileForm'
//import AddVoterForm from './components/AddVoterForm'
//import Header from './components/Header'
//import LogsList from './components/LogsList'
//import ProposalsList from './components/ProposalsList'

const CryptoJS = require("crypto-js")
const storage = require("./storage.js")


const styles = {
  main: {
    'maxWidth': '80%',
    'margin': '0 auto',
  },
}

export default class App extends Component {
  constructor(props) {
    super(props)

    // Set default state
    this.state = {
      documents: [],
      logs: [],
      defaultAccount: undefined,
      documenterInstance: undefined,
      errorMessage: undefined,
      web3: undefined,
      id: undefined,
      version: undefined,
      protocol: undefined
    }
  }

  componentWillMount() {
    console.log("mount")
    this.initialize()
    .then(() => {
      this.watchNewDocuments()
    })
  }

  async initialize() {
    const { web3 } = await getWeb3

    console.log("account:")
    // Create voting entity from contract abi
    const documenter = Contract(Documenter)
    documenter.setProvider(web3.currentProvider)
    const accounts = await promisify(web3.eth.getAccounts)
    console.log(accounts[0])

    const defaultAccount = accounts[0]

    const documenterInstance = await documenter.deployed()

    storage.start('ipfs-' + Math.random()).then(error => {
      console.log("started ipfs")
      return storage.id()
    }).then(info => {
      this.setState({
          id: info[0],
          version: info[1],
          protocol: info[2]
        })
    })


    this.setState({
      ...this.state,
      web3,
      defaultAccount,
      documenterInstance,
    })
    //
    this.loadDocuments()
  }



  async onFileAdd(file) {
    const { web3, documenterInstance, defaultAccount } = this.state

    console.log('Name: ', file.name);

    var reader = new FileReader();


    reader.onload = function(event) {
      if (event === undefined) return
      const binary = event.target.result;
      var md5 = CryptoJS.MD5(binary).toString()
      console.log(md5);

      documenterInstance.documentExists.call(md5).then(exists => {
        if (exists) {
          alert("Document already exists")
        } else {
          documenterInstance.notarizeDocument(md5, file.name, "multihash", Date.now(), { from: defaultAccount })
        }
      })
/*
      documenterInstance.documentExists.call(md5).then(exists => {
        if (exists) {
          alert("Document already exists")
        } else {
          return storage.add(file.name, Buffer.from(binary))
        }
      }).then(multihash => {
        console.log(multihash)
        return storage.get(multihash)
      }).then(content => {
        var string = String.fromCharCode.apply(null, content[0])
        return documenterInstance.notarizeDocument(md5, file.name, multihash, Date.now(), { from: defaultAccount })
      }).then(() => {
        return documenterInstance.documentExists.call(md5)
      }).then(exists => {
        if (exists) {
          console.log("osom")
        } else {
          alert("something went wrong")
        }
      })
*/
    }
    reader.readAsBinaryString(file)
  }

  async loadDocuments() {
    const { web3, documenterInstance, defaultAccount } = this.state

    console.log(`It's about to load documents for account ${defaultAccount}`)
    console.log(`Documenter instance address: ${documenterInstance.address}`)

    try {
      // TODO:
      /*
      const hashesInBytes32 = await documenterInstance.getProposals.call(defaultAccount)
      const proposals = proposalsInBytes32.map((proposal) => web3.toAscii(proposal).replace(/\u0000/g, ''))
      this.setState({
      ...this.state,
      proposals,
    })*/
  } catch (error) {
    console.log(`Error loading documents: ${error}`)
  }
}

watchNewDocuments() {
  const { web3, documenterInstance, defaultAccount } = this.state

  documenterInstance.LogNewDocument({owner: defaultAccount}).watch((error, result) => {
    if (error) {
      console.log(`Nooooo! ${error}`)
    } else {
      console.log(`Result ${JSON.stringify(result.args)}`)
      // TODO:
      /*
      const proposalInBytes32 = result.args.proposal
      const proposal = web3.toAscii(proposalInBytes32).replace(/\u0000/g, '')
      this.setState({...this.state, proposals: [...this.state.proposals, proposal]})
      this.log(`New proposal added: ${proposal}`)*/
    }
  })
}

log(text) {
  this.setState({...this.state, logs: [...this.state.logs, text]})
}

onDocumentAdded(document) {
  const { documenterInstance, defaultAccount } = this.state
  console.log(`
    It's about upload a new document: ${document}.
    The default account is ${defaultAccount}
    The documenter instance address is ${documenterInstance.address}
    `)
    // TODO:
    /*
    votingInstance.addProposal(proposal, { from: defaultAccount })
    */
  }

  render() {
    return (
      <div style={styles.main}>
      <h1>Edgar Allen</h1>
      <hr/>
      <AddFileForm onFileAdd={this.onFileAdd.bind(this)} />
      <p>Your ID is <strong>{this.state.id}</strong></p>
      <p>Your IPFS version is <strong>{this.state.version}</strong></p>
      <p>Your IPFS protocol version is <strong>{this.state.protocol}</strong></p>
      <hr/>
      </div>
    )
  }
}
