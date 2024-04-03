import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  REWARD_POOL_FETCH_BEGIN,
  REWARD_POOL_FETCH_SUCCESS,
  REWARD_POOL_FETCH_FAILURE,
} from "../../price/constants";
import { MultiCall } from "eth-multicall";
import { erc20ABI, contracts, tokens } from "../../configure";
import BigNumber from "bignumber.js";
import { convertAmountFromRawNumber } from "../../helpers/bignumber";
import _ from "lodash";
import axios from "axios";

export function fetchRewardPoolDetails() {
  return (dispatch, getState) => {
    dispatch({
      type: REWARD_POOL_FETCH_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      axios
        .get(`https://analytics.vault.inc/api/stats`)
        .then((results) => {
          dispatch({
            type: REWARD_POOL_FETCH_SUCCESS,
            data: results.data,
          });
          resolve();
        })
        .catch((error) => {
          dispatch({
            type: REWARD_POOL_FETCH_FAILURE,
          });
          return reject(error.message || error);
        });
      // const { home } = getState();
      // const { web3 } = home;

      // const rewardTokenContract = new web3.eth.Contract(
      //   erc20ABI,
      //   tokens.rewardToken.address
      // );

      // rewardTokenContract.methods
      // .balanceOf(contracts.escrowedReward.address)
      //   .call()
      //   .then((results) => {
      //     dispatch({
      //       type: REWARD_POOL_FETCH_SUCCESS,
      //       data: results,
      //     });
      //     resolve();
      //   })
      //   .catch((error) => {
      //     dispatch({
      //       type: REWARD_POOL_FETCH_FAILURE,
      //     });
      //     return reject(error.message || error);
      //   });
    });

    return promise;
  };
}

export function useFetchRewardPoolDetails() {
  const dispatch = useDispatch();

  const {
    rewardPoolDetails,
    fetchRewardPoolDetailsPending,
    fetchRewardPoolDetailsDone,
  } = useSelector(
    (state) => ({
      rewardPoolDetails: state.home.rewardPoolDetails,
      fetchRewardPoolDetailsPending: state.home.fetchRewardPoolDetailsPending,
      fetchRewardPoolDetailsDone: state.home.fetchRewardPoolDetailsDone,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchRewardPoolDetails(data));
    },
    [dispatch]
  );

  return {
    rewardPoolDetails,
    fetchRewardPoolDetails: boundAction,
    fetchRewardPoolDetailsDone,
    fetchRewardPoolDetailsPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case REWARD_POOL_FETCH_BEGIN:
      return {
        ...state,
        fetchRewardPoolDetailsPending: true,
      };

    case REWARD_POOL_FETCH_SUCCESS:
      return {
        ...state,
        // rewardPoolDetails: action.data ? convertAmountFromRawNumber(action.data) : 0,
        rewardPoolDetails: action.data
          ? action.data.stats.cryptounicorn.rewardTokenBalance
          : 0,
        fetchRewardPoolDetailsDone: true,
        fetchRewardPoolDetailsPending: false,
      };

    case REWARD_POOL_FETCH_FAILURE:
      return {
        ...state,
        fetchRewardPoolDetailsPending: false,
      };

    default:
      return state;
  }
}
