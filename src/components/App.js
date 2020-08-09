// The main App (root component)

import React, { Component } from 'react'
import LinkList from './LinkList'
import CreateLink from './CreateLink'
import Header from './Header'
import { Switch, Route } from 'react-router-dom'
import Login from './Login'
import Search from './Search'
import { Switch, Route, Redirect } from 'react-router-dom'

// Router setup handled by react-router-dom
// Adjusted such that LinkList component will be used for two different use cases (and routes):
// Display 10 top voted links
// Second is to display new links in a list separated into multiple pages the user can navigate through
class App extends Component {
  render() {
    return (
      <div className='center w85'>
        <Header />
        <div className='ph3 pv1 background-gray'>
          <Switch>
            <Route exact path='/' render={() => <Redirect to='/new/1' />} />
            <Route exact path='/create' component={CreateLink} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/search' component={Search} />
            <Route exact path='/top' component={LinkList} />
            <Route exact path='/new/:page' component={LinkList} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App