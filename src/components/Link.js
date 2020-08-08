// Component which offers functionality of loading and displaying a list of Link elements

import React, { Component } from 'react'

// This component expects a link in its props and renders the link's description and url
class Link extends Component {
  render() {
    return (
      <div>
        <div>
          {this.props.link.description} ({this.props.link.url})
        </div>
      </div>
    )
  }
}

export default Link