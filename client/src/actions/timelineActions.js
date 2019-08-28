import Axios from 'axios';
import handleError from '../utils/handleError';
import { notifyError, notifyNormality } from './notifyActions';

export const loading = () => ({ type: 'LOADING_TIMELINE' });

export const loadGramps = (beginning, end, restart) => async (
  dispatch,
  store
) => {
  dispatch(loading());
  const [res, error] = await handleError(
    Axios.get('/api/profile/gramps', {
      params: { beginning, end }
    })
  );
  if (error) {
    dispatch(notifyError('Error loading timeline!'));
    return error;
  }
  const { data } = res;
  const { gramps } = data;
  const grampsLengthBefore = store().timeline.gramps.length;
  if (restart) {
    dispatch({ type: 'CLEAN_GRAMPS' });
  }
  if (grampsLengthBefore === gramps.length + grampsLengthBefore) {
    dispatch({
      type: 'SET_GRAMPS',
      payload: []
    });
    return dispatch(
      notifyNormality('There are no more gramps for today :(', 2000)
    );
  }
  return dispatch({
    type: 'SET_GRAMPS',
    payload: gramps
  });
};

export const loadProfileGramps = (beginning, end, restart) => async (
  dispatch,
  store
) => {
  dispatch(loading());
  const [res, error] = await handleError(
    Axios.get('/api/profile/gramps', {
      params: { beginning, end }
    })
  );
  if (error) {
    dispatch(notifyError('Error loading timeline!'));
    return error;
  }
  const { data } = res;
  const { gramps } = data;
  if (restart) {
    dispatch({ type: 'CLEAN_GRAMPS' });
  }
  const grampsLengthBefore = store().timeline.gramps.length;
  if (grampsLengthBefore === gramps.length + grampsLengthBefore)
    return dispatch(
      notifyNormality('There are no more gramps for today :(', 2000)
    );
  return dispatch({
    type: 'SET_GRAMPS',
    payload: gramps
  });
};

export const loadingTrue = () => dispatch => {
  dispatch(loading());
};
