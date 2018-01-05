import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import userReducer from './util/userReducer'
import web3Reducer from './util/web3/web3Reducer'
import paperchainReducer from './util/paperchainReducer'
import storageReducer from './util/storageReducer'

const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  web3: web3Reducer,
  paperchain: paperchainReducer,
  storage: storageReducer
})

export default reducer
