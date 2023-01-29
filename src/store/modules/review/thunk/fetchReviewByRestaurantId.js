import { createAsyncThunk } from '@reduxjs/toolkit';
import { LOADING_STATUSES } from '../../../constants/loadingStatuses';

import { normalizer } from '../../../utils/normalizer';
import { selectRestaurantReviewsById } from '../../restaurant/selectors';
import {
  REVIEW_ACTIONS,
  failLoadingReviews,
  finishLoadingReviews,
  startLoadingReviews,
} from '../actions';
import { selectReviewIds } from '../selectors';

export const loadReviewByRestaurantIdIfNotExist =
  (store) => (next) => (action) => {
    if (action?.type !== REVIEW_ACTIONS.load) {
      return next(action);
    }

    const restaurantId = action.payload;
    const state = store.getState();
    const restaurantReviewIds = selectRestaurantReviewsById(state, {
      restaurantId,
    });
    const loadedReviewIds = selectReviewIds(state);

    if (
      restaurantReviewIds.every((restaurantReviewId) =>
        loadedReviewIds.includes(restaurantReviewId)
      )
    ) {
      return;
    }

    store.dispatch(startLoadingReviews());
    fetch(`http://localhost:3001/api/reviews?restaurantId=${restaurantId}`)
      .then((response) => response.json())
      .then((reviews) => {
        store.dispatch(finishLoadingReviews(normalizer(reviews)));
      })
      .catch(() => store.dispatch(failLoadingReviews));
  };

export const fetchReviewByRestaurantId = createAsyncThunk(
  'review/fetchReviewByRestaurantId',
  async (restaurantId, { getState, rejectWithValue }) => {
    const state = getState();
    const restaurantReviewIds = selectRestaurantReviewsById(state, {
      restaurantId,
    });
    const loadedReviewIds = selectReviewIds(state);

    if (
      restaurantReviewIds.every((restaurantReviewId) =>
        loadedReviewIds.includes(restaurantReviewId)
      )
    ) {
      return rejectWithValue(LOADING_STATUSES.earlyAdded);
    }

    const response = await fetch(
      `http://localhost:3001/api/reviews?restaurantId=${restaurantId}`
    );

    return await response.json();
  }
);