import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  FETCH_REWARD_DETAIL_BEGIN,
  FETCH_REWARD_DETAIL_SUCCESS,
  FETCH_REWARD_DETAIL_FAILURE,
} from "./constants";
import { MultiCall } from "eth-multicall";
import {
  singleTokenStakingABI,
  escrowedRewardABI,
  contracts,
  pools,
  tokens,
} from "../../configure";
import { convertAmountFromRawNumber } from "../../helpers/bignumber";

export function fetchRewardDetail({ web3, address, data }) {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_REWARD_DETAIL_BEGIN,
    });

    const promise = new Promise(async (resolve, reject) => {
      const multicall = new MultiCall(web3, contracts.multicall.address);

      const singleTokenPoolContract = new web3.eth.Contract(
        singleTokenStakingABI,
        contracts.singleTokenPool.address
      );
      const lpPoolContract = new web3.eth.Contract(
        singleTokenStakingABI,
        contracts.lpPool.address
      );
      const escrowedContract = new web3.eth.Contract(
        escrowedRewardABI,
        contracts.escrowedReward.address
      );

      const calls = [
        { result: singleTokenPoolContract.methods.getTotalDeposit(address) },
        {
          result: singleTokenPoolContract.methods.withdrawableRewardsOf(
            tokens.rewardToken.address,
            address
          ),
        },
        { result: lpPoolContract.methods.getTotalDeposit(address) },
        {
          result: lpPoolContract.methods.withdrawableRewardsOf(
            tokens.rewardToken.address,
            address
          ),
        },
      ];

      multicall
        .all([calls])
        .then(async ([results]) => {
          const output = {};
          for (let pool of pools) {
            if (!pool.hidden) {
              let i = pool.pid;
              output[i] = {
                stakedToken: results[i * 2].result
                  ? convertAmountFromRawNumber(results[i * 2].result)
                  : 0,
                claimableTokenReward: results[i * 2 + 1].result
                  ? convertAmountFromRawNumber(results[i * 2 + 1].result)
                  : 0,
              };
            }
          }

          const escrowedData = await escrowedContract.methods
            .getDepositsOf(address)
            .call();

          output["escrowedData"] = escrowedData;
          dispatch({
            type: FETCH_REWARD_DETAIL_SUCCESS,
            data: output,
          });
          resolve();
        })
        .catch((error) => {
          dispatch({
            type: FETCH_REWARD_DETAIL_FAILURE,
          });
          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function useFetchRewardDetail() {
  const dispatch = useDispatch();

  const { detail, fetchRewardPending } = useSelector(
    (state) => ({
      fetchRewardPending: state.reward.fetchRewardPending,
      detail: state.reward.detail,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchRewardDetail(data));
    },
    [dispatch]
  );

  return {
    detail,
    fetchRewardDetail: boundAction,
    fetchRewardPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case FETCH_REWARD_DETAIL_BEGIN:
      return {
        ...state,
        fetchRewardPending: true,
      };

    case FETCH_REWARD_DETAIL_SUCCESS:
      return {
        ...state,
        detail: action.data,
        fetchRewardPending: false,
      };

    case FETCH_REWARD_DETAIL_FAILURE:
      return {
        ...state,
        fetchRewardPending: false,
      };

    default:
      return state;
  }
}
