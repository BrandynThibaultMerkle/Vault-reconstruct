import axios from "axios";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_PRICE_BEGIN,
  FETCH_PRICE_SUCCESS,
  FETCH_PRICE_FAILURE,
} from "./constants";
import {
  uniswapV2PairABI,
  liquidityBootstrappingPoolABI,
  balancerVaultABI,
  erc20ABI,
  contracts,
} from "features/configure";
import {
  convertAmountFromRawNumber,
  convertStringToNumber,
} from "../helpers/bignumber";
import _ from "lodash";
import BigNumber from "bignumber.js";

export function fetchPrice({ web3 }) {
  return (dispatch) => {
    dispatch({
      type: FETCH_PRICE_BEGIN,
    });

    const promise = new Promise(async () => {
      try {
        const copperLaunchPoolContract = new web3.eth.Contract(
          liquidityBootstrappingPoolABI,
          contracts.copperLaunchPoolContract.address
        );
        const balancerVaulContract = new web3.eth.Contract(
          balancerVaultABI,
          contracts.balancerVault.address
        );
        const balancerLpTokenContract = new web3.eth.Contract(
          erc20ABI,
          contracts.balancerLpPairAddress.address
        );

        const data = await Promise.all([
          copperLaunchPoolContract.methods.getNormalizedWeights().call(),
          balancerVaulContract.methods
            .getPoolTokens(contracts.balancerVault.poolId)
            .call(),
          // axios.get('https://api2.sushipro.io/', {
          //   params: { action: 'get_pair', chainID: '1', pair:"0xc2Ce29Af8930fc32Ca24ccB76C2866fB2Bf692fE" },
          // }),

          // axios.get('https://api.coingecko.com/api/v3/simple/price', {
          //   params: { ids: 'loot', vs_currencies: 'usd' },
          // }),
          axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: { ids: "ethereum", vs_currencies: "usd" },
          }),
          // uniswapPairContract.methods.getReserves().call(),
          // uniswapPairContract.methods.totalSupply().call(),
          axios.get(
            `https://coins.llama.fi/chart/polygon:0x431CD3C9AC9Fc73644BF68bF5691f4B83F9E104f?span=14&period=1d&searchWidth=600`
          ),
          balancerLpTokenContract.methods.totalSupply().call(),
          axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: { ids: "rainbow-token-2", vs_currencies: "usd" },
          }),
        ]);
        dispatch({
          type: FETCH_PRICE_SUCCESS,
          data,
        });
        return data;
      } catch (err) {
        dispatch({
          type: FETCH_PRICE_FAILURE,
        });
      }
    });

    return promise;
  };
}

export function useFetchPrice() {
  const dispatch = useDispatch();

  const { fetchPricePending, priceData, lpData, ethData, chart } = useSelector(
    (state) => ({
      fetchPricePending: state.price.fetchPricePending,
      priceData: state.price.priceData,
      lpData: state.price.lpData,
      ethData: state.price.ethData,
      chart: state.price.chart,
    })
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchPrice(data));
    },
    [dispatch]
  );

  return {
    fetchPrice: boundAction,
    fetchPricePending,
    priceData,
    lpData,
    ethData,
    chart,
  };
}

export function reducer(
  state = { fetchPricePending: false, priceData: {}, lpData: {}, chart: [] },
  action
) {
  switch (action.type) {
    case FETCH_PRICE_BEGIN:
      return {
        ...state,
        fetchPricePending: {
          ...state.fetchPricePending,
        },
      };

    case FETCH_PRICE_SUCCESS:
      const tokenBalances = convertAmountFromRawNumber(
        action.data[1].balances[0]
      );
      const baseBalances = convertAmountFromRawNumber(
        action.data[1].balances[1]
      );

      const priceData = action.data[5].data["rainbow-token-2"].usd;

      let chart =
        action.data[3].data.coins[
          "polygon:0x431CD3C9AC9Fc73644BF68bF5691f4B83F9E104f"
        ].prices;
      chart = _.map(chart, (item) => {
        return [item.timestamp * 1000, item.price];
      });

      const ethData = action.data[2].data["ethereum"].usd;

      let latest = _.last(chart);

      let modifiedLatest = _.dropRight(latest);
      modifiedLatest.push(priceData);

      let modifiedChart = _.dropRight(chart);
      modifiedChart.push(modifiedLatest);

      const lpData = {
        tokenReserve: tokenBalances,
        baseReserve: baseBalances,
        totalSupply: convertAmountFromRawNumber(action.data[4]),
      };
      return {
        ...state,
        chart: modifiedChart,
        priceData: priceData,
        ethData: ethData,
        lpData: lpData,
        fetchPricePending: {
          ...state.fetchPricePending,
        },
      };

    case FETCH_PRICE_FAILURE:
      return {
        ...state,
        fetchPricePending: {
          ...state.fetchPricePending,
        },
      };

    default:
      return state;
  }
}
