import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setUser } from '../actions/authActions'
import ArtistsUser from './ArtistsUser'
import PropTypes from 'prop-types'

const __propTypes = {
  setUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
}

class Auth extends Component {
  static propTypes = __propTypes

  constructor(props) {
    super(props)
    this.state = {
      user: null
    }
  }

  componentWillReceiveProps() {
    if (this.state.user !== this.props.auth.currentUser) {
      this.setState({
        user: this.props.auth.currentUser
      })
    }
  }
  render() {
    const { user } = this.state
    if (!user) {
    }
    return (
      <div>
        {user ? (
          <h1>Welcome to my app, {user.name}! </h1>
        ) : (
          'No user was received, please go back'
        )}
        <ArtistsUser history={this.props.history} />
      </div>
    )
  }
}

const mapStateToProps = state => ({ auth: state.auth })

export default connect(
  mapStateToProps,
  { setUser }
)(Auth)
