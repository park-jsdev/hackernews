// Component which offers functionality of loading and displaying a list of Link elements

import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { timeDifferenceForDate } from '../utils'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

// Define Vote mutation
const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
       id
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

// This component expects a link in its props and renders the link's description and url
// Renders the number of votes for each link and the name of the user that posted it.
// Render the upvote button if a user is currently logged in - using the authToken
// If Link is not associated with a User, display name as Unknown
// Also pass a function timeDifferenceForDate at createdAt to get the timestamp
// and convert it to a string that is more user friendly
class Link extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
                <Mutation mutation={VOTE_MUTATION} variables={{ linkId: this.props.link.id }}
                update={(store, { data: { vote } }) =>
                this.props.updateStoreAfterVote(store, vote, this.props.link.id)
                }
              >
                {voteMutation => (
                  <div className="ml1 gray f11" onClick={voteMutation}>
                    ▲
                  </div>
                )}
              </Mutation>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{' '}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : 'Unknown'}{' '}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    )
  }
}

export default Link