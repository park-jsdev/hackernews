import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'

// Takes in an argument called filter that will be used to constrain the list of links you want to retrieve
// The actual filter is built and used in the feed resolver which is implemented in server/src/resolvers/Query.js
const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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
  }
`

class Search extends Component {

  state = {
    links: [],
    filter: ''
  }

  // rendering an input field where the user can type a search string
  render() {
    return (
      <div>
        <div>
          Search
          <input
            type='text'
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {this.state.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    )
  }

  // executing FEED_SEARCH_QUERY manually and retrieving the links from the
  // response that's returned by the server. Then these links are put into the component's
  // state so that they can be rendered.
  _executeSearch = async () => {
    const { filter } = this.state
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })
    const links = result.data.feed.links
    this.setState({ links })
  }
}

export default withApollo(Search)