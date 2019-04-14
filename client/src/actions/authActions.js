import axios from 'axios'

import User from '../classes/User'
import Auth, {
  handleError,
  deleteAuthTokenAxios,
  deleteAuthTokenFromLS
} from '../utils/Auth'

export const setUser = (
  token,
  username,
  history = null,
  typeoflogin = null
) => async dispatch => {
  axios
    .post(`/api/user/${token}`, { username })
    .then(async res => {
      const user = new User(res.data)
      const apiUser = await axios.post(`/api/user/lastfm/${username}`, user)
      deleteAuthTokenFromLS()
      dispatch({
        type: 'SET_API_USER',
        payload: apiUser.data
      })
    })
    .catch(err => console.log(err))
}

//

export const logFromSession = () => dispatch => {
  const user = Auth.LogUserFromLS()
  if (!user) return
  dispatch({
    type: 'SET_API_USER',
    payload: user
  })
}

export const logIn = (email, password) => async dispatch => {
  const user = await Auth.LogUserFromLogin({ email, password })
  if (user.error) {
    // dispatch error
    return
  }
  dispatch({
    type: 'SET_API_USER',
    payload: user
  })
}

export const register = async (
  email,
  password,
  password2,
  username,
  history
) => {
  const [error, userRegister] = handleError(
    await axios.post('/api/user/register', {
      email,
      password,
      password2,
      username
    })
  )
  if (!error) {
    history.push('/auth/login')
  } else {
    //dispatch errors
  }
}

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
        })
      })
      .catch(err => console.log(err.response.data))
}
// http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=${
//   API_KEYS.API_KEY
// }&user=${name}&format=json
//export const setFullUserFromSession = () => async dispatch => {
//   try {
//     const localStorageSession = JSON.parse(localStorage.getItem('session'))
//     dispatch({ type: 'SET_IS_LOADING_AUTH' })
//     const apiUser = await axios.post('/api/user', localStorageSession)
//     dispatch({ type: 'SET_USER', payload: localStorageSession })
//     dispatch({
//       type: 'SET_API_USER',
//       payload: apiUser.data
//     })
//   } catch (err) {
//     dispatch({
//       type: 'SET_USER',
//       payload: {}
//     })
//     dispatch({
//       type: 'SET_API_USER',
//       payload: {}
//     })
//   }
// }
