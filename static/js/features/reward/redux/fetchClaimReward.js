import { useCallback } from "react";
import { erc20ABI, tokens, contracts } from "../../configure";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_CLAIM_SINGLE_TOKEN_BEGIN,
  FETCH_CLAIM_SINGLE_TOKEN_SUCCESS,
  FETCH_CLAIM_SINGLE_TOKEN_FAILURE,
} from "./constants";
import { enqueueSnackbar } from "features/common/redux/actions";
import _ from "lodash";
import { claimReward } from "features/web3";

export function fetchClaimReward({
  address,
  web3,
  contractAddress,
  rewardAddress,
}) {
  return (dispatch) => {
    dispatch({
      type: FETCH_CLAIM_SINGLE_TOKEN_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      claimReward({ web3, address, contractAddress, rewardAddress, dispatch })
        .then((data) => {
          dispatch({
            type: FETCH_CLAIM_SINGLE_TOKEN_SUCCESS,
            data,
          });
          // dispatch(fetchFarmPools());
          dispatch(
            enqueueSnackbar({
              key: new Date().getTime() + Math.random(),
              message: "Claim Success",
              options: {
                variant: "success",
              },
            })
          );
          resolve(data);
        })
        .catch((error) => {
          dispatch({
            type: FETCH_CLAIM_SINGLE_TOKEN_FAILURE,
          });
          dispatch(
            enqueueSnackbar({
              message: error.message || error,
              options: {
                key: new Date().getTime() + Math.random(),
                variant: "error",
              },
            })
          );
          reject(error.message || error);
        });
    });
    return promise;
  };
}

export function useFetchClaimReward() {
  // args: false value or array
  // if array, means args passed to the action creator
  const dispatch = useDispatch();

  const { fetchClaimRewardPending } = useSelector((state) => ({
    fetchClaimRewardPending: state.stake.fetchClaimRewardPending,
  }));

  const boundAction = useCallback(
    (data) => dispatch(fetchClaimReward(data)),
    [dispatch]
  );

  return {
    fetchClaimReward: boundAction,
    fetchClaimRewardPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case FETCH_CLAIM_SINGLE_TOKEN_BEGIN:
      return {
        ...state,
        fetchClaimRewardPending: true,
      };

    case FETCH_CLAIM_SINGLE_TOKEN_SUCCESS:
    case FETCH_CLAIM_SINGLE_TOKEN_FAILURE:
      return {
        ...state,
        fetchClaimRewardPending: false,
      };

    default:
      return state;
  }
}
