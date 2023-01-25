import { normalizer } from '../../../utils/normalizer';
import { selectRestaurantReviewsById } from '../../restaurant/selectors';
import {
  failLoadingReviews,
  finishLoadingReviews,
  REVIEW_ACTIONS,
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
      .then((dishes) => {
        store.dispatch(finishLoadingReviews(normalizer(dishes)));
      })
      .catch(() => store.dispatch(failLoadingReviews));
  };
