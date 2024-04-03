import { reducer as fetchPriceReducer } from "../fetchPrice";
const reducers = [fetchPriceReducer];

const initialState = {
  address: "",
  web3: null,
  connected: false,
  networkId: Number(process.env.REACT_APP_NETWORK_ID),
  detail: {},
  userDetails: [],
};

export default function reducer(state = initialState, action) {
  let newState;
  switch (action.type) {
    // Handle cross-topic actions here
    default:
      newState = state;
      break;
  }
  /* istanbul ignore next */
  return reducers.reduce((s, r) => r(s, action), newState);
}
