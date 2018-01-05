import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { UserIsAuthenticated, UserIsNotAuthenticated } from './util/wrappers.js'
import getPaperchain from './util/getPaperchain'

// Layouts
import App from './App'
import Home from './layouts/Home'
import Dashboard from './layouts/Dashboard'
import SignUp from './layouts/SignUp'
import Add from './layouts/Add'

// Storage
import getStorage from './util/getStorage'

// Redux Store
import store from './store'

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store)

// Initialize paperchain and set in Redux.
getPaperchain
.then(result => {
  console.log('Web3 initialized!')
})

// Initialize storge and set in Redux.
getStorage.
then(storage => {
  console.log('IPFS initialized!')
})

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
          <Route path="dashboard" component={UserIsAuthenticated(Dashboard)} />
          <Route path="signup" component={UserIsNotAuthenticated(SignUp)} />
          <Route path="add" component={UserIsAuthenticated(Add)} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
)
