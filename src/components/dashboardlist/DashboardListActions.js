import { browserHistory } from 'react-router'
import paperchain from '../../util/paperchain'

export function onReadPaper(paper) {
  return dispatch => {
    return browserHistory.push({pathname:'/paper', state: { paper: paper}})
  }
}

export function getPapers() {
  return dispatch => {
    paperchain.getPapers().then(paper => {

    }).catch(error => {
      console.error(error)
    })

    paperchain.getFieldPapers().then(paper => {

    }).catch(error => {
      console.error(error)
    })
  }
}

export function watchPapers() {
  return dispatch => {
    paperchain.watchPapers().then(paper => {

    }).catch(error => {
      console.error(error)
    })

    paperchain.watchFieldPapers().then(paper => {

    }).catch(error => {
      console.error(error)
    })
  }
}

export function stopWatching() {
  return dispatch => {
    paperchain.stopWatchingPapers()
    paperchain.stopWatchingFieldPapers()
  }
}
