const initialState = {
  storage: null
}

export const START_STORAGE = 'START_STORAGE'

const storageReducer = (state = initialState, action) => {
  if (action.type === START_STORAGE) {
    return {
            ...state,
            storage: action.storage
        }
  }
  return state
}

export default storageReducer
