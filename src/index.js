// index.js provides easy entry points for components. Simplifies imports.

import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker';

// Import required dependencies from installed packages
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { BrowserRouter } from 'react-router-dom'
import { setContext } from 'apollo-link-context'
import { AUTH_TOKEN } from './constants'

// GraphQL need 2 API layers in the backend. Prisma provides the database layer which offers CRUD operations
// the 2nd layer is the application layer for business logic


// Connects Apollo Client instance with GraphQL API
// Apollo abstracts away low level networking logic and provides interface to GraphQL server
// You dont have to construct HTTP requests like REST, you can write queries and mutations and send them
// using an ApolloClient instance.
// To configure ApolloClient instance, it needs to know the endpoint of GraphQL API
const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
})

// Configure Apollo with authentication token using middleware, implemented as an Apollo Link:
// https://github.com/apollographql/apollo-link more info
// This must go between httpLink and ApolloClient instantiations
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

// Instantiate ApolloClient by passing in httpLink and new instance of an InMemoryCache
const client = new ApolloClient({
  link: authLink.concat(httpLink), // make sure ApolloClient gets instantiated with correct link
  cache: new InMemoryCache()
})

// Render the root component of React App, wrapped with higher order component ApolloProvider that gets passed the client
// as a prop
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)