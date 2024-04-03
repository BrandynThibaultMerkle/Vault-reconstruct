import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  POOL_FETCH_BEGIN,
  POOL_FETCH_SUCCESS,
  POOL_FETCH_FAILURE,
  SELECT_POOL,
} from "../../price/constants";
import { MultiCall } from "eth-multicall";
import {
  erc20ABI,
  singleTokenStakingABI,
  contracts,
  pools,
} from "../../configure";
import { convertAmountFromRawNumber } from "../../helpers/bignumber";

export function fetchPoolDetails({ address, web3 }) {
  return (dispatch, getState) => {
    dispatch({
      type: POOL_FETCH_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const multicall = new MultiCall(web3, contracts.multicall.address);

      let calls = [];
      for (let i = 0; i < pools.length; i++) {
        let poolAddress = pools[i].poolAddress;
        let tokenContract = new web3.eth.Contract(
          erc20ABI,
          pools[i].tokenAddress
        );

        let poolContract = new web3.eth.Contract(
          singleTokenStakingABI,
          pools[i].poolAddress
        );

        calls.push({ result: tokenContract.methods.balanceOf(poolAddress) });

        calls.push({ result: poolContract.methods.totalSupply() });

        calls.push({ result: poolContract.methods.balanceOf(address) });
      }

      multicall
        .all([calls])
        .then(async ([results]) => {
          let output = [];
          for (let i = 0; i < pools.length; i++) {
            const poolTotalStaked = results[i * 3].result
              ? convertAmountFromRawNumber(results[i * 3].result)
              : 0;
            const poolTotalSupply = results[i * 3 + 1].result
              ? convertAmountFromRawNumber(results[i * 3 + 1].result)
              : 0;
            const userRBWBalance = results[i * 3 + 2].result
              ? convertAmountFromRawNumber(results[i * 3 + 2].result)
              : 0;
            output[i] = {
              totalStaked: poolTotalStaked,
              totalSupply: poolTotalSupply,
              userRBWBalance: userRBWBalance,
            };
          }
          dispatch({
            type: POOL_FETCH_SUCCESS,
            data: output,
          });
          resolve();
        })
        .catch((error) => {
          dispatch({
            type: POOL_FETCH_FAILURE,
          });
          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function setSelctedPool(index) {
  return async (dispatch) => {
    dispatch({ type: SELECT_POOL, data: index });
  };
}

export function useFetchPoolDetails() {
  const dispatch = useDispatch();

  const {
    poolDetails,
    fetchPoolDetailsPending,
    fetchPoolDetailsDone,
    selectedPool,
  } = useSelector(
    (state) => ({
      poolDetails: state.home.poolDetails,
      fetchPoolDetailsPending: state.home.fetchPoolDetailsPending,
      fetchPoolDetailsDone: state.home.fetchPoolDetailsDone,
      selectedPool: state.home.selectedPool,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchPoolDetails(data));
    },
    [dispatch]
  );
  const setSelctedPoolAction = useCallback(
    (data) => {
      return dispatch(setSelctedPool(data));
    },
    [dispatch]
  );

  return {
    poolDetails,
    fetchPoolDetails: boundAction,
    fetchPoolDetailsDone,
    fetchPoolDetailsPending,
    setSelctedPool: setSelctedPoolAction,
    selectedPool,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case POOL_FETCH_BEGIN:
      return {
        ...state,
        fetchPoolDetailsPending: true,
      };

    case POOL_FETCH_SUCCESS:
      return {
        ...state,
        poolDetails: action.data,
        fetchPoolDetailsDone: true,
        fetchPoolDetailsPending: false,
      };

    case POOL_FETCH_FAILURE:
      return {
        ...state,
        fetchPoolDetailsPending: false,
      };
    case SELECT_POOL:
      return {
        ...state,
        selectedPool: action.data,
      };

    default:
      return state;
  }
}
