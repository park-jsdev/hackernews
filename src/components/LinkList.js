import React, { Component, Fragment } from 'react'
import Link from './Link'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { LINKS_PER_PAGE } from '../constants'

// Stores the query. gql function is used to parse the plain string that contains the GraphQL code (GraphQl queries are a single string in JSON)
// Use Apollo's render prop API to manage GraphQL data using components:
// we pass GraphQL query as prop and Query component will fetch data under the hood and make it available in the component's render prop function.
// in general, the process for data fetching logic is:
//  1. write query as a JavaScript constant using the gql parser function
//  2. use the <Query /> component passing the GraphQL query as pro
//  3. access query results that gets injected into the component's render prop function
// skip defines the offset where the query will start. if X is passed for this arg,
// first X items of the list will not be included in the response.
// first then defines the limit, or how many elements you want to load from
// that list.
// orderBy defines how the returned list should be sorted.
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
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
      count
    }
  }
`

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
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
`

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
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
      user {
        id
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
  // read current state of the cached data for the FEED_QUERY from the store
  // Now you’re retrieving the link that the user just voted for from that list. You’re also manipulating 
  // that link by resetting its votes to the votes that were just returned by the server.
  // Finally, you take the modified data and write it back into the store.

  // readQuery works similarly to query method on ApolloClient, but instead of making a call to the server,
  // it will simply resolve the query against the local store.
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)
  
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    })
  
    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    store.writeQuery({ query: FEED_QUERY, data })
  }

  // Passing 2 arguments to subscribeToMore:
  // 1. document: This represents the subscription query itself. In your case, the subscription will fire every time a new link is created.
  // 2. updateQuery: Similar to cache update prop, this function allows you to determine how the store should be updated with the information 
  // that was sent by the server after the event occurred. In fact, it follows exactly the same principle as a Redux reducer: It takes as arguments 
  // the previous state (of the query that subscribeToMore was called on) and the subscription data that’s sent by the server. You can then determine 
  // how to merge the subscription data into the existing state and return the updated data. All you’re doing inside updateQuery is retrieving the new 
  // link from the received subscriptionData, merging it into the existing list of links and returning the result of this operation.
  _subscribeToNewLinks = subscribeToMore => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newLink = subscriptionData.data.newLink
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;
  
        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        })
      }
    })
  }

  // Subscribe to new votes that are submitted by other users so that the latest vote count is always visible in app
  // similar to subscribeToLinks but now using NEW_VOTES_SUBSCRIPTION as document.
  // You pass in a subscription that asks for newly created votes.
  // When the subscription fires, Apollo Client automatically updates the link that was voted on.
  _subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION
    })
  }

  // Passing first, skip, orderBy values as variables based on the current page (this.props.match.params.page)
  // which is used to calculate the chunk of links that you retrieve
  // include ordering attribute createdAt_DESC for the new page to make sure the newest links are displayed first
  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)
  
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return { first, skip, orderBy }
  }

  // for the newPage, simnply return all the links returned by the query.
  _getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes('new')
    if (isNewPage) {
      return data.feed.links
    }
    const rankedLinks = data.feed.links.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    return rankedLinks
  }

  //  retrieving the current page from the url and implement a sanity check to make sure that it makes sense to paginate back or forth. 
  // Then you simply calculate the next page and tell the router where to navigate next. The router will then reload the component with 
  // a new page in the url that will be used to calculate the right chunk of links to load.

  _nextPage = data => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }
  
  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
  }

  render() {
    return (
      <Query query={FEED_QUERY} variables={this._getQueryVariables()}>
          {({ loading, error, data, subscribeToMore }) => {
            if (loading) return <div>Fetching</div>
            if (error) return <div>Error</div>
            // using subscribeToMore received as prop into component's render prop function
            // Calling _subscribeToNewLinks with its respective subscribeToMore function you make sure that
            // the component actually subscribes to the events.
            // This call opens up a websocket connection to the subscription server.
            this._subscribeToNewLinks(subscribeToMore)
            this._subscribeToNewVotes(subscribeToMore)
      
            const linksToRender = this._getLinksToRender(data)
            const isNewPage = this.props.location.pathname.includes('new')
            const pageIndex = this.props.match.params.page
              ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
              : 0
      
            // updated to render the Link components to also include the link's position
            return (
              <Fragment>
                {linksToRender.map((link, index) => (
                  <Link
                    key={link.id}
                    link={link}
                    index={index + pageIndex}
                    updateStoreAfterVote={this._updateCacheAfterVote}
                  />
                ))}
                {isNewPage && (
                  <div className="flex ml4 mv3 gray">
                    <div className="pointer mr2" onClick={this._previousPage}>
                      Previous
                    </div>
                    <div className="pointer" onClick={() => this._nextPage(data)}>
                      Next
                    </div>
                  </div>
                )}
              </Fragment>
            )
          }}
        </Query>
      )
  }

}

export default LinkList