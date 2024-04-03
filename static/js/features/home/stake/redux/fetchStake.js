import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_STAKE_BEGIN,
  FETCH_STAKE_SUCCESS,
  FETCH_STAKE_FAILURE,
} from "./constants";
import { deposit } from "../../../web3";
import { fetchStakeDetail } from "./action";
import { enqueueSnackbar } from "features/common/redux/actions";

export function fetchStake({ address, web3, poolData, amount, duration }) {
  return (dispatch) => {
    dispatch({
      type: FETCH_STAKE_BEGIN,
      index: poolData.pid,
    });

    const promise = new Promise((resolve, reject) => {
      deposit({ web3, address, poolData, amount, duration, dispatch })
        .then((data) => {
          dispatch({
            type: FETCH_STAKE_SUCCESS,
            data,
            index: poolData.pid,
          });
          dispatch(fetchStakeDetail({ web3, address, data: poolData }));
          dispatch(
            enqueueSnackbar({
              key: new Date().getTime() + Math.random(),
              message: "Stake Success",
              options: {
                variant: "success",
              },
            })
          );
          resolve(data);
        })
        .catch((error) => {
          dispatch({
            type: FETCH_STAKE_FAILURE,
            index: poolData.pid,
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

export function useFetchStake(poolData) {
  const dispatch = useDispatch();

  const { fetchStakePending } = useSelector((state) => ({
    fetchStakePending: state.stake.fetchStakePending[poolData.pid],
  }));

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchStake(data));
    },
    [dispatch]
  );

  return {
    fetchStake: boundAction,
    fetchStakePending,
  };
}

export function reducer(state, action) {
  let { fetchStakePending } = state;
  switch (action.type) {
    case FETCH_STAKE_BEGIN:
      fetchStakePending[action.index] = true;
      return {
        ...state,
        fetchStakePending,
      };

    case FETCH_STAKE_SUCCESS:
      fetchStakePending[action.index] = false;
      return {
        ...state,
        fetchStakePending,
      };

    case FETCH_STAKE_FAILURE:
      fetchStakePending[action.index] = false;
      return {
        ...state,
        fetchStakePending,
      };

    default:
      return state;
  }
}
