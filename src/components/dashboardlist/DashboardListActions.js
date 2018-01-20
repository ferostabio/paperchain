import { browserHistory } from 'react-router'
import paperchain from '../../util/paperchain'
import store from '../../store'

export function onReadPaper(paper) {
  return dispatch => {
    const web3 = store.getState().web3.instance
    return browserHistory.push('/paper/' + web3.toAscii(paper.hash))
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
