const initialState = {
  instance: null
}

export const WEB3_INITIALIZED = 'WEB3_INITIALIZED'

const web3Reducer = (state = initialState, action) => {
  if (action.type === WEB3_INITIALIZED) {
    return {
            ...state,
            instance: action.instance
        }
  }
  return state
}

export default web3Reducer
