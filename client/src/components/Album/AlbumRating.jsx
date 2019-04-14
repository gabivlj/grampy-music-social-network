import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addAlbumRating } from '../../actions/albumActions'
import PropTypes from 'prop-types'

const __propTypes = {
  album: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  addAlbumRating: PropTypes.func.isRequired
}

const buttonStyle = {
  textDecoration: 'none',
  border: 'none',
  background: 'none',
  cursor: 'pointer'
}

class AlbumRating extends Component {
  static propTypes = __propTypes
  constructor() {
    super()
    this.state = {
      rating: 0,
      actualRating: 0,
      generalRating: 0,
      currentVersion: 0,
      error: null
    }
  }
  componentDidMount() {
    this.ratingUpdate()
  }
  componentDidUpdate() {
    this.ratingUpdate()
  }
  ratingUpdate = () => {
    if (
      this.props.album.albumDB &&
      this.props.album.albumDB.ratings.length > 0 &&
      this.props.album.albumDB.__v !== this.state.currentVersion
    ) {
      let actualRating = 0
      for (let rating of this.props.album.albumDB.ratings) {
        actualRating += rating.puntuation
      }
      actualRating /= this.props.album.albumDB.ratings.length
      let userRating = this.props.album.albumDB.ratings.filter(
        element => element.user === this.props.auth.currentUser.name
      )
      if (userRating.length > 0) userRating = userRating[0].puntuation
      else {
        userRating = actualRating
      }
      this.setState({
        generalRating: actualRating,
        rating: userRating,
        actualRating: userRating,
        currentVersion: this.props.album.albumDB.__v
      })
      this.changedRating = true
    }
  }
  handleClick = i => {
    const { auth } = this.props.auth
    if (auth) {
      this.setState({ actualRating: i })
      this.props.addAlbumRating(
        this.props.album.albumDB._id,
        i,
        this.props.auth.currentUser.name
      )
    } else {
      this.setState({
        error: 'You cannot rate an album if you are not logged!'
      })
      setTimeout(() => this.setState({ error: null }), 2000)
    }
  }
  render() {
    let stars = []
    const { albumDB } = this.props.album
    if (albumDB && albumDB.ratings.length >= 0) {
      for (let i = 0; i < 10; i++) {
        if (i >= this.state.rating) {
          stars.push(
            <button
              style={buttonStyle}
              onPointerEnter={() => this.setState({ rating: i + 1 })}
              onPointerLeave={() =>
                this.setState({ rating: this.state.actualRating })
              }
              key={i}
              onClick={() => this.handleClick(i + 1)}
            >
              <i className="far fa-star" id={i} style={{ color: '#b29600' }} />
            </button>
          )
        } else {
          stars.push(
            <button
              style={buttonStyle}
              onPointerEnter={() => this.setState({ rating: i + 1 })}
              onPointerLeave={() =>
                this.setState({ rating: this.state.actualRating })
              }
              key={i}
              onClick={() => this.handleClick(i + 1)}
            >
              <i className="fas fa-star" id={i} style={{ color: '#FFD700' }} />
            </button>
          )
        }
      }
    }
    return (
      <div>
        {stars}{' '}
        <div className="badge badge-primary">{this.state.generalRating}</div>
        {this.state.error ? (
          <div className="badge badge-danger ml-3">{this.state.error}</div>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  album: state.album,
  auth: state.auth
})
export default connect(
  mapStateToProps,
  { addAlbumRating }
)(AlbumRating)
