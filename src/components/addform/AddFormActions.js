import { browserHistory } from 'react-router'
import paperchain from '../../util/paperchain'

export function addPaper(file, refereed, description, quotes) {
  return dispatch => {
    paperchain.addPaper(file, refereed, description, quotes).then(() => {
      return browserHistory.push('/dashboard')
    }).catch(error => {
      console.error(error)
    })
  }
}
