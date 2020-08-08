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
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

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

// Configure the ApolloClient with info about the subscriptions endpoint.
// This is done by adding another ApolloLink to the Apollo middleware chain.
// Use WebSocketLink from the apollo-link-ws package.
// We instantiate a WebSocketLink that knows the subscriptions endpoint.
// We use ws instead of http protocol. We also authenticate using the websocket
// connection with the user's token from localStorage

// Create a new WebSocketLink that represents the WebSocket connection
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    }
  }
})

// Use split for proper "routing" of the requests and update the constructor call of ApolloClient
// split takes three arguments: test function that returns a boolean. Other two are type ApolloLink.
// if test returns true, the request will be forwarded to the link passed as the second argument.
// If false, to the third one.
// In this case, test is checking whether the request operation is a subscription. If so, it will be
// forwarded to the wsLink, otherwise (if its a query or mutation), the authLink.concat(httpLink) will handle it.
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link,
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