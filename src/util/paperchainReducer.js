const initialState = {
  account: null,
  authentication: null,
  documenter: null
}

export const PAPERCHAIN_INITIALIZED = 'PAPERCHAIN_INITIALIZED'

const paperchainReducer = (state = initialState, action) => {
  if (action.type === PAPERCHAIN_INITIALIZED) {
    return {
            ...state,
            account: action.account,
            authentication: action.authentication,
            documenter: action.documenter
        }
  }
  return state
}

export default paperchainReducer
