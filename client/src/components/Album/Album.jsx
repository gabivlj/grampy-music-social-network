import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { LinearProgress, IconButton, Button } from '@material-ui/core';
import {
  getAlbum,
  addAlbumRating,
  addComment,
  likeComment,
  likeAlbum,
} from '../../actions/albumActions';
import store from '../../store';
import hourFormat from '../../utils/hourFormat';
import RatingsCommon from '../Common/RatingsCommon';
import { Link } from 'react-router-dom';
import CommentComponent from '../CommentSection/Common/CommentComponent';
import HeartBorderIcon from '@material-ui/icons/FavoriteBorder';
import HeartIcon from '@material-ui/icons/Favorite';
import { postReview } from '../../actions/reviewActions';
import { withRouter } from 'react-router-dom';
import ReviewsSection from '../Common/ReviewsSection';
import guidGenerator from '../../utils/idCreator';

const __propTypes = {
  getAlbum: PropTypes.func.isRequired,
  album: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

class Album extends Component {
  static propTypes = __propTypes;

  constructor(props) {
    super(props);
    this.state = {
      artist: '',
      album: null,
    };

    // There is a delay with this.setState that'd bug the componentDidUpdate()
    this.loadedAlbum = false;
  }

  componentWillUnmount() {
    store.dispatch({
      type: 'CLEAR_ALBUM',
    });
  }

  componentDidMount() {
    const { artist, albumname, mbid } = this.props.match.params;
    this.setState({
      artist,
    });
    this.props.getAlbum({
      artist,
      albumname,
      mbid,
      userId: this.props.currentUser ? this.props.currentUser.id : null,
      username:
        this.props.currentUser && this.props.currentUser.user
          ? this.props.currentUser.user
          : null,
      lastfm:
        this.props.currentUser && this.props.currentUser.lastfm
          ? this.props.currentUser.lastfm
          : null,
    });
  }

  componentDidUpdate() {
    if (!this.loadedAlbum && this.props.album.album) {
      this.setState({
        album: this.props.album.album.album,
      });
      this.loadedAlbum = true;
    }
  }

  render() {
    let { album } = this.props;
    const {
      currentUser,
      addComment,
      likeComment,
      likeAlbum,
      postReview,
      history,
    } = this.props;
    if (album) album = album.album;
    if (album) album = album.album;

    let tracks;
    let duration;
    if (album) {
      // Map through every track
      tracks = album.tracks.track.map((tr, index) => (
        <li
          key={index}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <Link to={`/track/${this.state.artist}/${album.name}/${tr.name}/0`}>
            {tr.name}
          </Link>
          <span className="badge badge-primary badge-pill">
            {hourFormat.fmtMSS(tr.duration)}
          </span>
        </li>
      ));
      duration = album.tracks.track.reduce(
        (total, current) => total + parseInt(current.duration),
        0,
      );
    }
    const bg = album ? `url(http://localhost:2222${album.headerURL}-0)` : '';
    console.log(bg);
    return (
      <div>
        <div>
          <div>
            {album ? (
              <div>
                <div
                  style={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: bg,
                    backgroundAttachment: 'fixed',
                  }}
                >
                  <div className="container" style={{ padding: '5%' }}>
                    <div className="row">
                      <div className="col-md-4" style={{ marginTop: '10%' }}>
                        <h1 className="display-6">
                          <Link
                            to={encodeURI(
                              `/artist/${this.state.artist}/${album.artistId}`,
                            )}
                          >
                            {album.artist}
                          </Link>
                        </h1>
                        <h2 className="display-3">{album.name}</h2>
                        <p>{album.mbid}</p>
                        {album.userplaycount ? (
                          <h5>
                            {this.props.currentUser
                              ? this.props.currentUser.user
                              : ''}
                            's playcount: {album.userplaycount}
                          </h5>
                        ) : null}
                      </div>
                      <div className="col-md-4">
                        <img
                          style={{ borderRadius: '3%' }}
                          alt="Album"
                          src={album.image[3]['#text']}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="container mt-3"
                  style={{ paddingBottom: '100px' }}
                >
                  <RatingsCommon
                    model={album}
                    ratings={album.ratings}
                    auth={this.props.currentUser || null}
                    elementWithRatings={album}
                    setRatings={this.props.addAlbumRating}
                    username={
                      !this.props.currentUser ? '' : this.props.currentUser.user
                    }
                    elementId={album._id}
                  />

                  {album.liked ? (
                    <IconButton style={{}} onClick={() => likeAlbum(album._id)}>
                      <HeartIcon
                        style={{ color: '#4263f5' }} //#bfe0f2
                      ></HeartIcon>
                    </IconButton>
                  ) : (
                    <IconButton style={{}} onClick={() => likeAlbum(album._id)}>
                      <HeartBorderIcon
                        style={{ color: '#4263f5' }} //#bfe0f2
                      ></HeartBorderIcon>
                    </IconButton>
                  )}

                  {this.props.currentUser && this.props.currentUser.id ? (
                    <Button
                      color="primary"
                      variant="contained"
                      component="span"
                      onClick={() => postReview(history, album._id)}
                    >
                      Make a review
                    </Button>
                  ) : null}

                  <h5 className="mt-3 ">Track list:</h5>
                  <ul className="list-group mt-3 w-100">
                    {tracks && tracks.length > 0
                      ? tracks
                      : 'There are no tracks listed on this album, wanna add one? Collaborate!'}
                  </ul>
                  <div className="badge badge-primary mt-3">
                    Playcount: {album.playcount}
                  </div>
                  <div className="badge badge-primary ml-3 mt-3">
                    Listeners: {album.listeners}
                  </div>
                  <div className="badge badge-primary ml-3 mt-3">
                    Total duration: {hourFormat.fmtMSS(duration)}
                  </div>
                  <h3 className="m-2">Reviews</h3>
                  <ReviewsSection objectID={album._id} type={'ALBUM'} />
                  <br />
                  {/* TODO: We are cuerrently testing this component for reusable. */}
                  <div style={{ margin: '50px 0 20px 0' }}>
                    <CommentComponent
                      keyy={'999'}
                      objectId={album._id}
                      numberOfCommentsAdd={20}
                      name={`${album.name} by ${this.state.artist}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <LinearProgress />
            )}
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  album: state.album,
  currentUser: state.auth.apiUser,
  auth: state.auth,
});
export default withRouter(
  connect(
    mapStateToProps,
    {
      getAlbum,
      addAlbumRating,
      addComment,
      likeComment,
      likeAlbum,
      postReview,
    },
  )(Album),
);
