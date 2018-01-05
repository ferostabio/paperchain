const initialState = {
  data: null
}

export const USER_LOGGED_IN = 'USER_LOGGED_IN'
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT'

const userReducer = (state = initialState, action) => {
  if (action.type === USER_LOGGED_IN) {
    return {
            data: action.data
        }
  }
  if (action.type === USER_LOGGED_OUT) {
    return initialState
  }
  return state
}

export default userReducer
