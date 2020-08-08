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
export const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
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
      
            // updated to render the Link components to also include the link's position
            return (
              <div>
                {linksToRender.map((link, index) => (
                  <Link key={link.id}
                  link={link} 
                  index={index}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                   />
                ))}
              </div>
            )
          }}
        </Query>
      )
  }
  // read current state of the cached data for the FEED_QUERY from the store
  // Now you’re retrieving the link that the user just voted for from that list. You’re also manipulating 
  // that link by resetting its votes to the votes that were just returned by the server.
  // Finally, you take the modified data and write it back into the store.
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY })
  
    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
  
    store.writeQuery({ query: FEED_QUERY, data })
  }

}

export default LinkList