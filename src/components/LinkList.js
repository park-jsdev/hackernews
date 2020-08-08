import React, { Component } from 'react'
import Link from './Link'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

// Stores the query. gql function is used to parse the plain string that contains the GraphQL code (GraphQl queries are a single string in JSON)
// Use Apollo's render prop API to manage GraphQL data using components:
// we pass GraphQL query as prop and Query component will fetch data under the hood and make it available in the component's render prop function.
// in general, the process for data fetching logic is:
//  1. write query as a JavaScript constant using the gql parser function
//  2. use the <Query /> component passing the GraphQL query as pro
//  3. access query results that gets injected into the component's render prop function
const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`

// Render links that are fetched from server from <Query /> render prop function
// Wrap the returned code with <Query /> component passing FEED_QUERY as prop
// Return linksToRender due to render prop function provided by <Query /> component
// 
// Explanation:
// Apollo injects several props into component's render prop function, which provide information
// about state of network request:
//  1. loading is true as long as the request is still ongoing and the response hasnt been received
//  2. error: in case request fails, thie field will contain information about what exactly went wrong
//  3. data: This is the actual data that was received from the server. It has the links property which
// represents a list of Link elements
class LinkList extends Component {
  render() {
    return (
        <Query query={FEED_QUERY}>
          {({ loading, error, data }) => {
            if (loading) return <div>Fetching</div>
            if (error) return <div>Error</div>
      
            const linksToRender = data.feed.links
      
            return (
              <div>
                {linksToRender.map(link => <Link key={link.id} link={link} />)}
              </div>
            )
          }}
        </Query>
      )
  }
}

export default LinkList