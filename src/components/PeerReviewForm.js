import React, { Component } from 'react'

class PaperList extends Component {

  onReviewClick(event) {
    event.preventDefault()

    this.props.onReviewClick()
  }

  render() {
    const { isOwnPaper, alreadyReviewed } = this.props
    if (isOwnPaper) {
      return(null)
    } else if (alreadyReviewed) {
      return (
        <form>
        <h3>Peer-Review</h3>
        <span className='pure-form-message'>You already reviewed this paper.</span>
        <br />
        </form>
      )
    } else {
      return (
        <form>
        <h3>Peer-Review</h3>
        <p>Use your knowledge and expertise to review the paper -an old school, academic <i>like</i></p>
        <button className='pure-button  pure-button-primary' onClick={this.onReviewClick.bind(this)}>Review</button>
        <p></p>
        </form>
      )
    }
  }
}

export default PaperList
