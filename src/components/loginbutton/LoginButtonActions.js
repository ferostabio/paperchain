import { browserHistory } from 'react-router'
import paperchain from '../../util/paperchain'

export function loginUser() {
  return dispatch => {
    paperchain.login().then(user => {
      // Used a manual redirect here as opposed to a wrapper.
      // This way, once logged in a user can still access the home page.
      const currentLocation = browserHistory.getCurrentLocation()
      if ('redirect' in currentLocation.query) {
        return browserHistory.push(decodeURIComponent(currentLocation.query.redirect))
      }
      return browserHistory.push('/dashboard')
    }).catch(error => {
      return browserHistory.push('/signup')
    })
  }
}
