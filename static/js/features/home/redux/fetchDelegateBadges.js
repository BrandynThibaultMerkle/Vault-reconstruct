import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  DELEGATE_BADGES_BEGIN,
  DELEGATE_BADGES_SUCCESS,
  DELEGATE_BADGES_FAILURE,
  FETCH_BADGES_SUCCESS,
} from "../../price/constants";
import {
  contracts,
  MutliRewardsTimeLockNonTransferablePoolV3ABI,
  BadgeManagerABI,
} from "../../configure";
import { enqueueSnackbar } from "features/common/redux/actions";
import { MultiCall } from "eth-multicall";
import _ from "lodash";

export function delegateBadges({
  address,
  delegator,
  web3,
  delegateToken,
  tabValue,
  userBadges,
}) {
  return (dispatch, getState) => {
    dispatch({
      type: DELEGATE_BADGES_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const badgeManagerContract = new web3.eth.Contract(
        BadgeManagerABI,
        contracts.badgeManagers[tabValue]
      );
      badgeManagerContract.methods
        .delegateBadgeTo(
          delegateToken.contractAddress,
          delegateToken.tokenId,
          delegator
        )
        .send({ from: address })
        .then((results) => {
          dispatch(
            enqueueSnackbar({
              message: "Delegate Success!",
              options: {
                key: new Date().getTime() + Math.random(),
                variant: "success",
              },
            })
          );
          dispatch({
            type: DELEGATE_BADGES_SUCCESS,
            data: results,
          });
          dispatch(
            fetchBadgeStatus({
              address,
              web3,
              userBadges,
              tabValue,
            })
          );
          resolve();
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbar({
              message: _.get(error, "message", "Error"),
              options: {
                key: new Date().getTime() + Math.random(),
                variant: "error",
              },
            })
          );
          dispatch({
            type: DELEGATE_BADGES_FAILURE,
          });
          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function fetchBadgeStatus({ address, web3, userBadges, tabValue }) {
  return (dispatch, getState) => {
    dispatch({
      type: "FETCH_BADGES_BEGIN",
    });
    const promise = new Promise(async (resolve, reject) => {
      try {
        const badgeManagerContract = new web3.eth.Contract(
          BadgeManagerABI,
          contracts.badgeManagers[tabValue]
        );

        let tokenIdArray = _.map(userBadges, "tokenId");
        let tokenAddressArray = _.map(userBadges, "contractAddress");
        let userAddressArray = _.map(userBadges, (b) => {
          return address;
        });

        let result = await badgeManagerContract.methods
          .getDelegateByBadges(
            userAddressArray,
            tokenAddressArray,
            tokenIdArray
          )
          .call();

        let mappedResult = _.mapKeys(
          _.map(result, (item, index) => {
            return {
              tokenId: tokenIdArray[index],
              delegatedTo: item,
            };
          }),
          "tokenId"
        );

        let results = { result: mappedResult };

        results["delegated"] = await badgeManagerContract.methods
          .getDelegationsOfDelegate(address)
          .call();

        dispatch({
          type: FETCH_BADGES_SUCCESS,
          data: results,
          tab: tabValue,
        });
        resolve();
      } catch (error) {
        return reject(error.message || error);
      }
    });

    return promise;
  };
}

export function useFetchDelegateBadges() {
  const dispatch = useDispatch();

  const {
    delegateBadgesPending,
    delegateStatus,
    delegatedTokens,
    fetchBadgesPending,
  } = useSelector(
    (state) => ({
      delegateStatus: state.home.delegateStatus,
      delegateBadgesPending: state.home.delegateBadgesPending,
      delegatedTokens: state.home.delegatedTokens,
      fetchBadgesPending: state.home.fetchBadgesPending,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(delegateBadges(data));
    },
    [dispatch]
  );
  const boundAction2 = useCallback(
    (data) => {
      return dispatch(fetchBadgeStatus(data));
    },
    [dispatch]
  );

  return {
    delegateStatus,
    delegateBadges: boundAction,
    fetchBadgeStatus: boundAction2,
    delegateBadgesPending,
    delegatedTokens,
    fetchBadgesPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case DELEGATE_BADGES_BEGIN:
      return {
        ...state,
        delegateBadgesPending: true,
      };

    case DELEGATE_BADGES_SUCCESS:
      return {
        ...state,
        delegateBadgesPending: false,
      };
    case "FETCH_BADGES_BEGIN":
      return {
        ...state,
        fetchBadgesPending: true,
      };
    case FETCH_BADGES_SUCCESS:
      let updatedDelegatedTokens = {
        ...state.delegatedTokens,
        [action.tab]: action.data,
      };
      return {
        ...state,
        fetchBadgesPending: false,
        delegatedTokens: updatedDelegatedTokens,
      };

    case DELEGATE_BADGES_FAILURE:
      return {
        ...state,
        delegateBadgesPending: false,
      };

    default:
      return state;
  }
}
