import { connect } from 'react-redux'
import DashboardList from './DashboardList'
import { getPapers, watchPapers, getReviews, watchReviews, stopWatching, onReadPaper } from './DashboardListActions'

const mapStateToProps = (state, ownProps) => {
  return {
    papers: state.paperchain.papers,
    fieldPapers: state.paperchain.fieldPapers,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getPapers: () => dispatch(getPapers()),
    watchPapers: () => dispatch(watchPapers()),
    stopWatching: () => dispatch(stopWatching()),
    onReadPaper: paper => {
      event.preventDefault()

      dispatch(onReadPaper(paper))
    }
  }
}

const DashboardListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardList)

export default DashboardListContainer
