import { useCallback } from "react";
import { erc20ABI } from "../../configure";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_TOKEN_APPROVAL_BEGIN,
  FETCH_TOKEN_APPROVAL_SUCCESS,
  FETCH_TOKEN_APPROVAL_FAILURE,
} from "./constants";
import { enqueueSnackbar } from "../../common/redux/actions";
import _ from "lodash";

export function fetchApproval({ tokenAddress, contractAddress }) {
  return (dispatch, getState) => {
    // optionally you can have getState as the second argument
    dispatch({
      type: FETCH_TOKEN_APPROVAL_BEGIN,
    });

    const promise = new Promise(async (resolve, reject) => {
      const { home } = getState();
      const { address, web3 } = home;
      const contract = new web3.eth.Contract(erc20ABI, tokenAddress);

      contract.methods
        .approve(contractAddress, web3.utils.toWei("99228162514", "ether"))
        .send({ from: address })
        .on("transactionHash", function (hash) {
          dispatch(
            enqueueSnackbar({
              message: hash,
              options: {
                key: new Date().getTime() + Math.random(),
                variant: "success",
              },
              hash,
            })
          );
        })
        .on("receipt", function (receipt) {
          dispatch(
            enqueueSnackbar({
              key: new Date().getTime() + Math.random(),
              message: "Success",
              options: {
                variant: "success",
              },
            })
          );
          dispatch({ type: FETCH_TOKEN_APPROVAL_SUCCESS });
          resolve();
        })
        .on("error", function (error) {
          dispatch(
            enqueueSnackbar({
              message: error.message || error,
              options: {
                key: new Date().getTime() + Math.random(),
                variant: "error",
              },
            })
          );
          dispatch({ type: FETCH_TOKEN_APPROVAL_FAILURE });
          resolve();
        })
        .catch((error) => {
          dispatch({ type: FETCH_TOKEN_APPROVAL_FAILURE });
          reject(error);
        });
    });
    return promise;
  };
}

export function useFetchApproval() {
  // args: false value or array
  // if array, means args passed to the action creator
  const dispatch = useDispatch();

  const { fetchApprovalPending } = useSelector((state) => ({
    fetchApprovalPending: state.stake.fetchApprovalPending,
  }));

  const boundAction = useCallback(
    (data) => dispatch(fetchApproval(data)),
    [dispatch]
  );

  return {
    fetchApproval: boundAction,
    fetchApprovalPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case FETCH_TOKEN_APPROVAL_BEGIN:
      return {
        ...state,
        fetchApprovalPending: true,
      };

    case FETCH_TOKEN_APPROVAL_SUCCESS:
    case FETCH_TOKEN_APPROVAL_FAILURE:
      return {
        ...state,
        fetchApprovalPending: false,
      };

    default:
      return state;
  }
}
