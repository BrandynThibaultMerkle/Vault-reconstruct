import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_WITHDRAW_BEGIN,
  FETCH_WITHDRAW_SUCCESS,
  FETCH_WITHDRAW_FAILURE,
} from "../../price/constants";
import { withdraw } from "../../web3";
// import { fetchStakeDetail } from './action';
import { enqueueSnackbar } from "features/common/redux/actions";
export function fetchWithdraw({ address, web3, depositId, poolData }) {
  return (dispatch) => {
    dispatch({
      type: FETCH_WITHDRAW_BEGIN,
      index: poolData.pid,
    });

    const promise = new Promise((resolve, reject) => {
      withdraw({ web3, address, depositId, poolData, dispatch })
        .then((data) => {
          dispatch({
            type: FETCH_WITHDRAW_SUCCESS,
            data,
            index: poolData.pid,
          });
          // dispatch(fetchStakeDetail({web3, address, data:poolData}));
          dispatch(
            enqueueSnackbar({
              key: new Date().getTime() + Math.random(),
              message: "Withdraw Success",
              options: {
                variant: "success",
              },
            })
          );
          resolve(data);
        })
        .catch((error) => {
          dispatch({
            type: FETCH_WITHDRAW_FAILURE,
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

export function useFetchWithdraw(poolData) {
  const dispatch = useDispatch();

  const { fetchWithdrawPending } = useSelector((state) => ({
    fetchWithdrawPending: state.home.fetchWithdrawPending[poolData.pid],
  }));

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchWithdraw(data));
    },
    [dispatch]
  );

  return {
    fetchWithdraw: boundAction,
    fetchWithdrawPending,
  };
}

export function reducer(state, action) {
  let { fetchWithdrawPending } = state;
  switch (action.type) {
    case FETCH_WITHDRAW_BEGIN:
      fetchWithdrawPending[action.index] = true;
      return {
        ...state,
        fetchWithdrawPending,
      };

    case FETCH_WITHDRAW_SUCCESS:
      fetchWithdrawPending[action.index] = false;
      return {
        ...state,
        fetchWithdrawPending,
      };

    case FETCH_WITHDRAW_FAILURE:
      fetchWithdrawPending[action.index] = false;
      return {
        ...state,
        fetchWithdrawPending,
      };

    default:
      return state;
  }
}
