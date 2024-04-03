import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  FETCH_WRAP_BEGIN,
  FETCH_WRAP_SUCCESS,
  FETCH_WRAP_FAILURE,
} from "./constants";
import { MultiCall } from "eth-multicall";
import { erc20ABI, contracts } from "../../configure";
import BigNumber from "bignumber.js";
import {
  convertAmountFromRawNumber,
  convertAmountToRawNumber,
} from "../../helpers/bignumber";
const ethers = require("ethers");

export function fetchStakeDetail({ web3, address, data }) {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_WRAP_BEGIN,
    });

    const promise = new Promise(async (resolve, reject) => {
      const { home } = getState();

      const multicall = new MultiCall(web3, contracts.multicall.address);

      const tokenContract = new web3.eth.Contract(erc20ABI, data.tokenAddress);
      const calls = [
        { result: tokenContract.methods.balanceOf(address) },
        {
          result: tokenContract.methods.allowance(address, data.poolAddress),
        },
      ];

      multicall
        .all([calls])
        .then(([results]) => {
          const balance = results[0].result
            ? convertAmountFromRawNumber(results[0].result)
            : 0;

          const allowance = convertAmountFromRawNumber(results[1].result);

          const output = {
            balance,
            allowance,
          };
          dispatch({
            type: FETCH_WRAP_SUCCESS,
            data: output,
          });
          resolve();
        })
        .catch((error) => {
          dispatch({
            type: FETCH_WRAP_FAILURE,
          });
          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function useFetchStakeDetail() {
  const dispatch = useDispatch();

  const { detail, fetchStakeDetailPending } = useSelector(
    (state) => ({
      fetchStakeDetailPending: state.stake.fetchStakeDetailPending,
      detail: state.stake.detail,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchStakeDetail(data));
    },
    [dispatch]
  );

  return {
    detail,
    fetchStakeDetail: boundAction,
    fetchStakeDetailPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case FETCH_WRAP_BEGIN:
      return {
        ...state,
        fetchStakeDetailPending: true,
      };

    case FETCH_WRAP_SUCCESS:
      return {
        ...state,
        detail: action.data,
        fetchStakeDetailPending: false,
      };

    case FETCH_WRAP_FAILURE:
      return {
        ...state,
        fetchStakeDetailPending: false,
      };

    default:
      return state;
  }
}
