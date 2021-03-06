import handleError from '../utils/handleError';
import { notifySuccess, notifyError } from './notifyActions';
import goImage from '../utils/goImage';
import uploadImageRoute from '../utils/uploadImageRoute';
import socket from '../classes/SocketInstance';
import { axiosAPI } from '../utils/axios';

export const getPlaylists = userName => async dispatch => {
  dispatch({
    type: 'LOADING_PLAYLISTS_PROFILE',
  });
  const [response, error] = await handleError(
    axiosAPI.get(`/profile/playlists/${userName}`),
  );
  // If erorr console log and dispatch error
  if (error) {
    console.log(error.response.data);
    return dispatch({
      type: 'ERROR_GETTING_PLAYLIST_FROM_USER',
    });
  }
  const { data } = response;
  // else set in redux the playlist
  const { playlists } = data;
  return dispatch({
    type: 'SET_PLAYLISTS_PROFILE',
    payload: playlists,
  });
};

export const getProfile = (id, userId = '') => async dispatch => {
  dispatch({
    type: 'LOADING_PROFILE',
  });
  const [response, error] = await handleError(
    axiosAPI.get(`/profile/${id}?userId=${userId}`),
  );

  if (error) {
    return dispatch({
      type: 'ERROR_GETTING_PROFILE',
      payload: error.response.data.error,
    });
  }
  const { data } = response;
  return dispatch({
    type: 'GET_PROFILE_FULL',
    payload: data,
  });
};

export const setListenedArtists = lastfm => async dispatch => {
  if (lastfm) {
    const [response, error] = await handleError(
      axiosAPI.get(`/user/artists/${lastfm}`),
    );
    if (error) {
      return dispatch({ type: 'ERROR_LOADING_ARTISTS ' });
    }
    return dispatch({
      type: 'GET_ARTISTS_PROFILE',
    });
  }
  return null;
};

export const cleanErrors = () => dispatch => {
  return dispatch({
    type: 'CLEAN_ERRORS',
  });
};

export const uploadImage = file => async dispatch => {
  const [res, error] = await goImage(file);
  if (error) {
    notifyError('Error adding image to the server...', 3000);
    return console.log('error');
  }
  const { data } = res;
  const _ = await uploadImageRoute(
    '/profile/image',
    dispatch,
    images =>
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: { images },
      }),
    data,
  );
  return _;
};

export const cleanProfile = () => dispatch => {
  return dispatch({
    type: 'CLEAN_PROFILE',
  });
};

/**
 * @param {String} id
 * @description Follow user button action.
 */
export const followUser = id => async (dispatch, state) => {
  const [response, error] = await handleError(
    axiosAPI.post(`/following/follow/${id}`),
  );
  if (error) {
    return dispatch(notifyError('Error following user!', 2000));
  }
  if (response.data.followed) dispatch(notifySuccess('User followed!', 1000));
  const { data } = response;
  const { followed, followers, followsUser } = data;

  // if (followed) {
  //   dispatch({
  //     type: 'ADD_AUTH',
  //     payload: { type: 'followedAccounts', data: id },
  //   });
  // } else {
  //   dispatch({
  //     type: 'SLICE_AUTH',
  //     payload: { type: 'followedAccounts', data: id },
  //   });
  // }

  // if (followsUser && !followed) {
  //   dispatch({
  //     type: 'SLICE_OFF_FRIEND_LIST',
  //     payload: id,
  //   });
  // } else if (followsUser && followed) {
  //   dispatch({
  //     type: 'ADD_TO_FRIEND_LIST',
  //     payload: id,
  //   });
  // }
  // // Inform sockets if there is a change in the list of friends so they can handle connections
  if (followed) socket.socket.notifyFollowed(id);
  else socket.socket.notifyUnfollowed(id);
  // socket.socket.updateListOfFriends(state().auth.apiUser.listOfFriends);
  // // socket.socket.updateListOfFriends()

  return dispatch({
    type: 'UPDATE_PROFILE',
    payload: {
      followed,
      followers,
    },
  });
};
