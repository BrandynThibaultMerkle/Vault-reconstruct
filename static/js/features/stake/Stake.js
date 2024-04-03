import React, { useState, useEffect } from "react";
import Button from "components/CustomButtons/Button.js";
import ExchangeOutlinedInput from "components/ExchangeOutlinedInput/ExchangeOutlinedInput";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { inputLimitPass, inputFinalVal } from "features/helpers/utils";
import BigNumber from "bignumber.js";
import { activeBadgeList, pools } from "features/configure";
import { useParams } from "react-router-dom";
import { convertAmountToNumber } from "features/helpers/bignumber";
import { convertAmountFromRawNumber } from "features/helpers/bignumber";
import _ from "lodash";
import {
  useFetchStakeDetail,
  useFetchApproval,
  useFetchStake,
} from "features/stake/redux/hooks";

import {
  useFetchPoolDetails,
  useFetchDelegateBadges,
} from "../home/redux/hooks";

import { useFetchPrice } from "../../price/redux/hooks";

import { useConnectWallet } from "features/home/redux/hooks";
import { Grid, Slider } from "@material-ui/core";
import CustomOutlinedInput from "components/CustomOutlinedInput/CustomOutlinedInput";
const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    margin: 20,
    textAlign: "center",
    color: theme.palette.text.primary,
  },
  paper: {
    width: "30%",
    minWidth: 360,
    backgroundColor: theme.palette.background.paper,
    padding: "15px 25px",
  },
}));

const PrettoSlider = withStyles({
  root: {
    color: "white",
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

export default function Stake({ stakedTokenName }) {
  const REWARD_PER_SECOND = convertAmountFromRawNumber(814027488411996000);
  const SECONDS_PER_YEAR = 86400 * 30 * 12;
  const poolIdForLp = 1;

  const { poolName } = useParams();
  const token = stakedTokenName || poolName;

  const data = _.find(pools, { stakedTokenName: token.toUpperCase() });
  const poolIndex = data.pid;
  const [depositBalance, setDepositBalance] = useState("");
  const { fetchStakeDetail, fetchStakeDetailPending, detail } =
    useFetchStakeDetail();

  const { fetchStake, fetchStakePending } = useFetchStake(data);

  const { fetchPrice, priceData, lpData, ethData } = useFetchPrice();
  const { poolDetails, fetchPoolDetails, selectedPool, setSelctedPool } =
    useFetchPoolDetails();

  const { web3, address } = useConnectWallet();
  const classes = useStyles();

  const { fetchApproval, fetchApprovalPending } = useFetchApproval();
  const [lockedValue, setLockedValue] = useState(12);
  const [stakeAble, setStakeAble] = useState(false);

  const [poolTotalStaked, setPoolTotalStaked] = useState([]);
  const [poolTotalSupply, setPoolTotalSupply] = useState("");
  const [poolTotalValueLocked, setPoolTotalLocked] = useState([]);
  const [poolApr, setPoolApr] = useState([]);
  const { delegatedTokens, fetchBadgeStatus } = useFetchDelegateBadges();

  const handleSliderChange = (event, newValue) => {
    setLockedValue(newValue);
  };
  useEffect(() => {
    if (web3 && !priceData) fetchPrice({ web3 });
  }, [web3]);

  useEffect(() => {
    if (web3 && address) {
      fetchStakeDetail({ web3, address, data });
      fetchPoolDetails({ web3, address });
      fetchBadgeStatus({
        web3,
        address,
        userBadges: activeBadgeList[poolIndex],
        tabValue: poolIndex,
      });
      const id = setInterval(() => {
        fetchStakeDetail({ web3, address, data });
        fetchPoolDetails({ web3, address });
        fetchBadgeStatus({
          web3,
          address,
          userBadges: activeBadgeList[poolIndex],
          tabValue: poolIndex,
        });
      }, 30000);
      return () => clearInterval(id);
    }
  }, [web3, address]);

  useEffect(() => {
    let poolTotalStaked = [];
    let poolTotalSupply = [];
    let poolLength = poolDetails ? poolDetails.length : 0;
    for (let i = 0; i < poolLength; i++) {
      poolTotalStaked.push(poolDetails[i].totalStaked);
      poolTotalSupply.push(poolDetails[i].totalSupply);
    }
    setPoolTotalStaked(poolTotalStaked);
    setPoolTotalSupply(poolTotalSupply);
  }, [poolDetails, priceData]);

  useEffect(() => {
    const walletBalance = detail.balance ? detail.balance : 0;
    const hasZeroBalance = walletBalance == 0;
    setStakeAble(!Boolean(fetchStakePending || hasZeroBalance));
  }, [fetchStakePending, detail]);

  useEffect(() => {
    let poolTotalValueLocked = [];
    let poolApr = [];

    let poolTotalStakedLength = poolTotalStaked ? poolTotalStaked.length : 0;
    for (let i = 0; i < poolTotalStakedLength; i++) {
      if (i === poolIdForLp) {
        let lpTotalSupply = lpData ? lpData.totalSupply : 0;
        let lpWethReserve = lpData ? lpData.baseReserve : 0;
        let lpPrice = (lpWethReserve * 2 * ethData) / lpTotalSupply;
        let apr =
          poolTotalStaked[i] * lpPrice < 10
            ? 0
            : (REWARD_PER_SECOND *
                SECONDS_PER_YEAR *
                pools[i].weight *
                priceData *
                100) /
              (poolTotalSupply[i] * lpPrice);
        poolTotalValueLocked.push(
          parseFloat(poolTotalStaked[i] * lpPrice).toFixed(2)
        );
        poolApr.push(apr);
      } else {
        poolTotalValueLocked.push(
          parseFloat(poolTotalStaked[i] * priceData).toFixed(2)
        );
        let apr =
          poolTotalStaked[i] * priceData < 10
            ? 0
            : (REWARD_PER_SECOND * SECONDS_PER_YEAR * pools[i].weight * 100) /
              poolTotalSupply[i];
        poolApr.push(apr);
      }
    }
    setPoolTotalLocked(poolTotalValueLocked);

    setPoolApr(poolApr);
  }, [poolTotalStaked, poolTotalSupply, priceData, lpData, ethData]);

  const setDepositMaximumInput = () => {
    const total = detail.balance;
    if (total > 0) {
      const amount = new BigNumber(total).toFormat();
      setDepositBalance(amount.replaceAll(",", ""));
    }
  };
  const changeDepositInputValue = (event) => {
    let value = event.target.value;
    const total = detail.balance;
    if (!inputLimitPass(value)) {
      return;
    }

    setDepositBalance(inputFinalVal(value, total));
  };

  const onApproval = () => {
    fetchApproval({
      tokenAddress: data.tokenAddress,
      contractAddress: data.poolAddress,
    });
  };

  const onDeposit = () => {
    let amountValue = depositBalance
      ? depositBalance.replaceAll(",", "")
      : depositBalance;

    fetchStake({
      address,
      web3,
      poolData: data,
      duration: lockedValue,
      amount: convertAmountToNumber(amountValue),
    }).then(() => {
      setDepositBalance("");
    });
  };

  function valuetext(value) {
    return `${value} months`;
  }
  const badgeConvert = delegatedTokens[selectedPool]
    ? _.reduce(
        delegatedTokens[selectedPool].delegated,
        function (sum, n) {
          let result = _.find(activeBadgeList[poolIndex], {
            tokenId: n.badge.tokenId.toString(),
          });
          if (!result) return sum;
          return sum + result.boostFactor;
        },
        0
      ).toFixed(3)
    : 0;

  const timelockConvert = (1 + (3 * lockedValue) / 12).toFixed(2);
  const renderInputField = (isLocked) => {
    let boostweight = isLocked ? (1 + (3 * lockedValue) / 12).toFixed(2) : 1;
    return (
      <div>
        {isLocked && (
          <div>
            <Grid container>
              <Grid item xs={3}>
                LOCKED FOR: {lockedValue} MONTHS
              </Grid>
              <Grid item xs={3}>
                TIMELOCK CONVERT: {timelockConvert}
              </Grid>
              <Grid item xs={3}>
                BADGE CONVERT: {badgeConvert}
              </Grid>
              <Grid item xs={3}>
                CUMULATIVE CONVERT:{" "}
                {parseFloat(timelockConvert) + parseFloat(badgeConvert)}
              </Grid>
            </Grid>
            <PrettoSlider
              min={1}
              max={12}
              style={{ height: 20 }}
              defaultValue={12}
              value={typeof lockedValue === "number" ? lockedValue : 0}
              onChange={handleSliderChange}
              step={1}
            />
          </div>
        )}
        <CustomOutlinedInput
          value={depositBalance}
          onClick={() => {}}
          availabletext={`Wallet: ${_.get(detail, "balance", "-")} ${token}`}
          onChange={changeDepositInputValue}
          setMax={() => setDepositMaximumInput()}
        />
        <div style={{ float: "left", marginTop: 15 }}>
          Est APR :{" "}
          {`${
            token.toUpperCase() == "RBW"
              ? (boostweight * poolApr[0]).toFixed(0)
              : (boostweight * poolApr[1]).toFixed(0)
          }%`}
        </div>

        <div style={{ marginTop: 100 }}>
          {/* {lockedValue==52 && <div className={classes.title}>You will get {depositBalance /1000} Badges</div>} */}
          <div className="alertCard">
            notice: Locking your rbw for the allotted time will freeze your rbw
            for that whole duration. this indicates no use of rbw during that
            time frame
          </div>
          {detail && parseFloat(detail.allowance) > 0 ? (
            <Button
              disabled={!stakeAble}
              onClick={() => {
                onDeposit();
              }}
              color="secondary">
              Stake
            </Button>
          ) : (
            <Button
              disabled={fetchApprovalPending}
              onClick={() => {
                onApproval();
              }}
              color="secondary">
              Approve
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "30px 0" }}>
      {/* <div className={classes.title}>1000 RBW + Stake + Lock 52 weeks = 1 Badge </div> */}
      <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="header">Stake {data.stakedTokenName}</div>
        <div className="subHeader"></div>
        <div className="card-black" style={{ maxWidth: 750, margin: "0 auto" }}>
          {renderInputField(true)}
        </div>
      </div>
    </div>
  );
}
