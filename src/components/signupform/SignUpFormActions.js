import { loginUser } from '../loginbutton/LoginButtonActions'
import paperchain from '../../util/paperchain'

export function signUpUser(name, field) {
  return dispatch => {
    paperchain.signup(name, field).then(user => {
      return dispatch(loginUser())
    }).catch(error => {
      console.error(error)
    })
  }
}
