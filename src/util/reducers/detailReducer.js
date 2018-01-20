const initialState = {
  paper: null,
  quotesMade: [],
  quotesReceived: [],
  reviews: []
}

export const GOT_PAPER = 'GOT_PAPER'
export const UPDATED_QUOTES_MADE = 'UPDATED_QUOTES_MADE'
export const UPDATED_QUOTES_RECEIVED = 'UPDATED_QUOTES_RECEIVED'
export const GOT_REVIEWS = 'GOT_REVIEWS'
export const UPDATED_REVIEWS = 'UPDATED_REVIEWS'

// The paper should be stored this way too, but i wanted to see how to pass params with react-router

const detailReducer = (state = initialState, action) => {
  if (action.type === GOT_PAPER) {
    return {
      ...state,
      paper: action.paper
    }
  }
  if (action.type === UPDATED_QUOTES_MADE) {
    return {
      ...state,
      quotesMade: action.papers
    }
  }
  if (action.type === UPDATED_QUOTES_RECEIVED) {
    return {
      ...state,
      quotesReceived: action.papers
    }
  }
  if (action.type === GOT_REVIEWS) {
    return {
      ...state,
      reviews: action.reviews
    }
  }
  if (action.type === UPDATED_REVIEWS) {
    if (state.reviews.filter(review => (review.hash === action.review.hash)).length === 0) {
      return { ...state,
        reviews: [...state.reviews, action.review]
      }
    }
  }
  return state
}

export default detailReducer
