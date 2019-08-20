import axios from 'axios';

import User from '../classes/User';
import Auth, {
  deleteAuthTokenAxios,
  deleteAuthTokenFromLS
} from '../utils/Auth';
import { notifyError, notifyNormality } from './notifyActions';
import handleError from '../utils/handleError';
import socket from '../classes/SocketInstance';

export const logOut = () => dispatch => {
  Auth.LogOut();
  dispatch({
    type: 'SET_API_USER',
    payload: {}
  });
};

/**
 * @description This action is called when lastfm auth is done.
 */
export const setUser = (
  token,
  username,
  history = null,
  typeoflogin = null
) => async dispatch => {
  axios
    .post(`/api/user/${token}`, { username })
    .then(async res => {
      history.push('/auth/login');
      const user = new User(res.data);
      const apiUser = await axios.post(`/api/user/lastfm/${username}`, user);
      deleteAuthTokenFromLS();
      dispatch(logOut());
    })
    .catch(err => console.log(err));
};

export const getUser = () => {
  return new Promise(async (resolve, reject) => {
    const [user, error] = await handleError(axios.get('/api/user/info'));
    if (error) return reject(error);
    return resolve({
      type: 'SET_API_USER',
      payload: user.data
    });
  });
};

export const logFromSession = () => async dispatch => {
  const user = Auth.LogUserFromLS();
  if (!user) return;
  if (user.exp < Date.now() / 1000) {
    return;
  }
  dispatch({
    type: 'SET_API_USER',
    payload: user
  });
  const [res, err] = await handleError(getUser());
  if (err) {
    dispatch({
      type: 'SET_API_USER',
      payload: null
    });
    Auth.LogOut();
    dispatch(notifyError('Error retrieving updated data.'));
    return;
  }
  // socket.socket.updateListOfFriends(res.payload.listOfFriends);
  dispatch(res);
};

export const logIn = user_ => async dispatch => {
  const user = await Auth.LogUserFromLogin(user_);
  if (user.error) {
    dispatch(notifyError('Error authenticating credentials...', 2000));
    // dispatch error
    dispatch({
      type: 'SET_ERRORS_LOGIN',
      payload: user.error.errors
    });
    return;
  }
  dispatch(notifyNormality('Welcome to Grampy!'), 3000);
  dispatch({
    type: 'SET_API_USER',
    payload: user
  });
  const [res, error] = await handleError(getUser());
  if (error) {
    return;
  }
  dispatch(res);
};

export const register = (
  email,
  password,
  password2,
  username,
  history
) => async dispatch => {
  const [, error] = await handleError(
    axios.post('/api/user/auth/register', {
      email,
      password,
      password2,
      username
    })
  );
  if (!error) {
    dispatch(notifyNormality('Account created succesfuly! Log in!', 3000));
    history.push('/auth/login');
    return;
  } // dispatch errors
  console.log(error);
  dispatch({
    type: 'SET_ERRORS_REGISTER',
    payload: error.response.data
  });
};

/**
 * @description Get the artists that the user listens to in Lastfm.
 */

export const setUsersArtists = name => dispatch => {
  if (name)
    axios
      .get(`/api/user/artists/${name}`)
      .then(res => {
        dispatch({
          type: 'SET_USER_ARTISTS',
          payload: res.data
        });
      })
      .catch(err => console.log(err.response.data));
};
