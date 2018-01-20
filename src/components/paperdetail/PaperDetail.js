import React, { Component } from 'react'
import store from '../../store'
import PeerReviewForm from '../PeerReviewForm'
const fields = require('../../util/constants').Fields

class PaperDetail extends Component {

  componentWillMount() {
    this.props.getPaper(this.props.hash)
  }

  onReviewClick(event) {
    this.props.reviewPaper(this.props.paper)
  }

  onDownloadClick(event) {
    event.preventDefault()

    this.props.downloadPaper(this.props.paper)
  }

  render() {
    const {  paper, quotesMade, quotesReceived, reviews } = this.props
    if (paper === null) {
      return(null)
    } else {
      const web3 = store.getState().web3.instance
      const { account } = store.getState().paperchain
      const isOwnPaper = paper.owner === account
      const canReview = paper.refereed
      const alreadyReviewed = reviews.filter(review => review.hash === paper.hash).length > 0
      return(
        <div>
        <h1>Paper Detail</h1>
        <h2>{paper.name}</h2>
        <p>{'Field: ' + fields[paper.field.toNumber()]}</p>
        <p>{'Hash: ' + web3.toAscii(paper.hash)}</p>
        <p>{'Created at: ' + new Date(paper.timestamp.toNumber()).toString()}</p>
        <p>Description:</p>
        <p>{paper.description}</p>

        <h3>Quotes made to the following papers:</h3>
        <ul>
        {quotesMade.map((paper, index) => <li key={index}>{paper.name}</li>)}
        </ul>
        <h3>Quotes received by the paper:</h3>
        <ul>
        {quotesReceived.map((paper, index) => <li key={index}>{paper.name}</li>)}
        </ul>
        <h3>Peer reviews</h3>
        <ul>
        {reviews.map((review, index) => <li key={index}>{review.user}</li>)}
        </ul>

        <br />

        <button className='pure-button  pure-button-primary' onClick={this.onDownloadClick.bind(this)}>Download</button>

        <PeerReviewForm isOwnPaper={isOwnPaper} canReview={canReview} alreadyReviewed={alreadyReviewed} onReviewClick={this.onReviewClick.bind(this)} />

        </div>
      )
    }
  }
}

export default PaperDetail
