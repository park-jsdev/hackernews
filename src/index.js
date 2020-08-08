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

// Instantiate ApolloClient by passing in httpLink and new instance of an InMemoryCache
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

// Render the root component of React App, wrapped with higher order component ApolloProvider that gets passed the client
// as a prop
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
serviceWorker.unregister();