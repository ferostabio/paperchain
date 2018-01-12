import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import userReducer from './util/reducers/userReducer'
import detailReducer from './util/reducers/detailReducer'
import web3Reducer from './util/reducers/web3Reducer'
import paperchainReducer from './util/reducers/paperchainReducer'
import storageReducer from './util/reducers/storageReducer'

const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  detail: detailReducer,
  web3: web3Reducer,
  paperchain: paperchainReducer,
  storage: storageReducer
})

export default reducer
