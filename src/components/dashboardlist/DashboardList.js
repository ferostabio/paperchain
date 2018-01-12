import React, { Component } from 'react'
import PaperList from '../PaperList.js'
import { getPapers } from './DashboardListActions'

class DashboardList extends Component {

  componentWillMount() {
    this.props.getPapers()
    this.props.watchPapers()
  }

  componentWillUnmount() {
    this.props.stopWatching()
  }

  onReadClicked(paper) {
    this.props.onReadPaper(paper)
  }

  render() {
    return (
      <div>
        <PaperList title={'Your papers'} papers={this.props.papers} onReadClicked={this.onReadClicked.bind(this)} />
        <PaperList title={'Field papers'} papers={this.props.fieldPapers} onReadClicked={this.onReadClicked.bind(this)} />
      </div>
    )
  }
}

export default DashboardList
