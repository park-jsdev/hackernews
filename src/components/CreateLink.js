// In Apollo you send mutations by:
//  1. write the mutation as a JavaScript constant using the gql parser function
//  2. use the <Mutation /> component passing the GraphQL mutation and variables (if needed) as props
//  3. use the mutation function that gets injected into the component’s render prop function

import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'


// First create JS constant that stores the mutation
const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`

class CreateLink extends Component {
  state = {
    description: '',
    url: '',
  }

  // we wrap the button element as render prop function result with <Mutation /> component
  // passing POST_MUTATION as prop
  // pass description and url states as variables prop
  render() {
    const { description, url } = this.state
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        {/*Implement an automatic redirect from CreateLink component to LinkList component after a mutation is performed.
        After mutation is performed, react-router-dom will navigate back to LinkList component that's accessible on root route '/' */}
        <Mutation
          mutation={POST_MUTATION}
          variables={{ description, url }}
          onCompleted={() => this.props.history.push('/')}
        >
          {postMutation => <button onClick={postMutation}>Submit</button>}
        </Mutation>
      </div>
    )
  }
}

export default CreateLink