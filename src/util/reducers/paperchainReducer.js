const initialState = {
  account: null,
  authentication: null,
  documenter: null,
  deploymentBlock: null,
  papers: [],
  fieldPapers: [],
  reviews: []
}

export const PAPERCHAIN_INITIALIZED = 'PAPERCHAIN_INITIALIZED'
export const GOT_PAPERS = 'GOT_PAPERS'
export const UPDATED_PAPERS = 'UPDATED_PAPERS'
export const GOT_FIELD_PAPERS = 'GOT_FIELD_PAPERS'
export const UPDATED_FIELD_PAPERS = 'UPDATED_FIELD_PAPERS'

const paperchainReducer = (state = initialState, action) => {
  if (action.type === PAPERCHAIN_INITIALIZED) {
    return {
      ...state,
      account: action.account,
      authentication: action.authentication,
      documenter: action.documenter,
      deploymentBlock: action.deploymentBlock
    }
  }
  if (action.type === GOT_PAPERS) {
    return {
      ...state,
      papers: action.papers
    }
  }
  if (action.type === UPDATED_PAPERS) {
    // just in case: check if the paper hasn't been added already
    if (state.papers.filter(paper => (paper.hash === action.paper.hash)).length === 0) {
      return { ...state,
        papers: [...state.papers, action.paper]
      }
    }
  }
  if (action.type === GOT_FIELD_PAPERS) {
    return {
      ...state,
      fieldPapers: action.papers
    }
  }
  if (action.type === UPDATED_FIELD_PAPERS) {
    if (state.fieldPapers.filter(paper => (paper.hash === action.paper.hash)).length === 0) {
      return { ...state,
        fieldPapers: [...state.fieldPapers, action.paper]
      }
    }
  }
  return state
}

export default paperchainReducer
