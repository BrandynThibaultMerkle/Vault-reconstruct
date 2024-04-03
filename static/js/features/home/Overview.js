import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Grid, Tabs as DefaultTabs, Tab } from "@material-ui/core";
import Button from "components/CustomButtons/Button.js";
import { useConnectWallet } from "features/home/redux/hooks";
import { Link } from "react-router-dom";
import BigNumber from "bignumber.js";
import { pools, activeBadgeList } from "features/configure";
import {
  useFetchDashboard,
  useFetchPoolDetails,
  useFetchRewardPoolDetails,
  useFetchWithdraw,
} from "./redux/hooks";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useFetchPrice } from "../price/redux/hooks";
import { convertAmountFromRawNumber } from "../helpers/bignumber";
import ConnectWallet from "components/ConnectWallet/ConnectWallet";
import CustomTable from "components/CustomTable/CustomTable.js";
import _ from "lodash";
import moment from "moment";
import PriceChart from "./components/PriceChart";
import OwnerPie from "./components/OwnerPie";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 700,
    textAlign: "center",
    color: "white",
    fontSize: 40,
    lineHeight: 1.1,
  },
  dateText: {
    fontWeight: 700,
    fontSize: 34,
  },
  bidInfo: {
    backgroundColor: "rgba(255,255,255,0.2)",
    textAlign: "right",
    marginTop: 30,
    padding: 20,
    fontSize: 44,
    lineHeight: 1.1,
    fontWeight: 700,
  },
  bidSpan: {
    fontSize: 24,
    fontWeight: 500,
  },
  bidField: {
    backgroundColor: "#1E2025",
    marginTop: 50,
    padding: 20,
  },
  card: {
    flexGrow: 1,
    maxWidth: 400,
    verticalAlign: "middle",
    backgroundColor: "#1E2025",
    overflow: "hidden",
    borderRadius: 10,
    margin: "0 auto",
    marginTop: 10,
    marginRight: 10,
    padding: "10px 20px",
    fontSize: 18,
  },
  cardSubTitle: {
    fontSize: 14,
    marginTop: 5,
  },
  timeSpan: {
    fontSize: 28,
    marginLeft: "5px",
  },
  time: {
    fontSize: 32,
    marginLeft: "5px",
  },
  tooltip: {
    backgroundColor: "rgba(255,255,255,0.5)",
    margin: "0 10px",
    padding: 3,
    textAlign: "center",
    verticalAlign: "middle",
  },

  grayText: {
    color: "rgba(255,255,255,0.6)",
  },
  heading: {
    fontSize: 20,
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  tabIndicator: {
    backgroundColor: "#FF9F0B",
    padding: 3,
  },
  tab: {
    fontSize: "25px",
    margin: "0 10px",
  },
}));

const Overview = ({ poolIndex }) => {
  const classes = useStyles();
  const theme = useTheme();
  const REWARD_PER_SECOND = convertAmountFromRawNumber(814027488411996000);
  const SECONDS_PER_YEAR = 86400 * 30 * 12;
  const MAX_LOCKED_BOOSTED = 4;
  const MIN_LOCKED_BOOSTED = 1 + (3 * 1) / 12;

  const data = _.find(pools, { pid: 0 });

  const { fetchDashboard, detail } = useFetchDashboard();
  const { fetchPrice, priceData, lpData, ethData } = useFetchPrice();
  const { poolDetails, selectedPool, setSelctedPool } = useFetchPoolDetails();
  // const { rewardPoolDetails, fetchRewardPoolDetails } =
  //   useFetchRewardPoolDetails();
  const { fetchWithdraw } = useFetchWithdraw(data);

  const [userDeposits, setDeposits] = useState([]);
  const [userStaked, setUserStaked] = useState([]);

  const [poolTotalStaked, setPoolTotalStaked] = useState([]);
  const [poolTotalSupply, setPoolTotalSupply] = useState("");
  const [poolApr, setPoolApr] = useState([]);
  const computer = useMediaQuery(theme.breakpoints.up("sm"));
  const [poolTotalValueLocked, setPoolTotalLocked] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const poolIdForLp = 1;

  const { web3, address } = useConnectWallet();

  const onWithdraw = (pooldId, depositId) => {
    fetchWithdraw({
      address,
      web3,
      depositId,
      poolData: _.find(pools, { pid: pooldId }),
    });
  };

  useEffect(() => {
    let userStakesAmount = [];
    if (detail["pools"]) {
      _.map(detail["pools"], function (n, index) {
        userStakesAmount[index] = n.accountTotalDeposit;
      });
      setUserStaked(userStakesAmount);
    }
  }, [detail]);

  useEffect(() => {
    if (web3 && !priceData) fetchPrice({ web3 });
  }, [web3]);

  // useEffect(() => {
  //   if (web3 && address) {
  //     fetchRewardPoolDetails();

  //     const id = setInterval(() => {
  //       fetchRewardPoolDetails();
  //     }, 30000);
  //     return () => clearInterval(id);
  //   }
  // }, [web3, address, poolIndex]);

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
    let poolTotalValueLocked = [];
    let poolApr = [];

    let poolTotalStakedLength = poolTotalStaked ? poolTotalStaked.length : 0;

    for (let i = 0; i < poolTotalStakedLength; i++) {
      if (i === poolIdForLp) {
        let lpTotalSupply = lpData ? lpData.totalSupply : 0;
        let lpBaseReserve = lpData ? lpData.baseReserve : 0;
        let lpPrice = (lpBaseReserve * 2 * ethData) / lpTotalSupply;
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

  useEffect(() => {
    let deposits = [];
    let poolLength = detail["pools"] ? detail["pools"].length : 0;
    for (let i = 0; i < poolLength; i++) {
      let depositsLength = detail["pools"][i].deposits.length;
      for (let j = 0; j < depositsLength; j++) {
        let userDeposit = {
          poolId: i,
          amount: detail["pools"][i].deposits[j][0],
          start: detail["pools"][i].deposits[j][1],
          end: detail["pools"][i].deposits[j][2],
          depositId: j,
        };
        deposits.push(userDeposit);
      }
    }
    setDeposits(deposits);
  }, [detail]);

  const getPoolRowData = () => {
    const row = pools[poolIndex];
    if (!row || row.readonly) {
      return [
        poolTotalValueLocked[poolIndex]
          ? `$ ${new BigNumber(poolTotalValueLocked[poolIndex]).toFormat(2)}`
          : "Loading...",
        "-",
        "-",
      ];
    }

    if (row.hidden) {
      return [];
    }

    return [
      poolTotalValueLocked[poolIndex]
        ? `$ ${new BigNumber(poolTotalValueLocked[poolIndex]).toFormat(2)}`
        : "Loading...",
      poolApr[poolIndex] > 0
        ? `${new BigNumber(MIN_LOCKED_BOOSTED * poolApr[poolIndex]).toFormat(
            0
          )} % - ${new BigNumber(
            MAX_LOCKED_BOOSTED * poolApr[poolIndex]
          ).toFormat(0)} %`
        : "-",
      [
        <Button
          color="secondary"
          size="lg"
          component={Link}
          to={`/stake/${row.stakedTokenName}`}>
          Stake {row.stakedTokenSymbol}
        </Button>,
        // <Button color="secondary" onClick={() => window.open(row.getUrl)}>
        //   {poolIndex == 0 ? "Buy" : "Add "} {row.stakedTokenSymbol}
        // </Button>,
      ],
    ];
  };
  const totalStakedAmount = _.get(poolTotalStaked, `[${poolIndex}]`, 100);
  const userStakedAmount = _.get(userStaked, `[${poolIndex}]`, 0);
  const poolName = pools[poolIndex].stakedTokenName;
  const ownership = [
    {
      name: "My",
      value: parseFloat((userStakedAmount * 100) / totalStakedAmount),
    },
    {
      name: "Others",
      value: parseFloat(
        ((totalStakedAmount - userStakedAmount) * 100) / totalStakedAmount
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          position: "relative",
          margin: "20px auto",
          maxWidth: 1100,
        }}>
        <Grid container>
          {address ? (
            <>
              <Grid item xs={12}>
                <Grid justifyContent="space-between" container>
                  <Grid item />
                  <Grid item>
                    <DefaultTabs
                      value={tabValue}
                      classes={{ indicator: classes.tabIndicator }}
                      onChange={handleTabChange}
                      indicatorColor="primary">
                      <Tab label={"DEPOSIT"} className={classes.tab} />
                      <Tab label={"HISTORY"} className={classes.tab} />
                    </DefaultTabs>
                  </Grid>
                </Grid>
                {[
                  {
                    label: "DEPOSIT",
                    content: pools && (
                      <div className="card">
                        <CustomTable
                          style={{ fontSize: 45 }}
                          leftText={{}}
                          headers={[`Total Value Staked`, "APR", "Action"]}
                          contents={[getPoolRowData()]}
                        />
                      </div>
                    ),
                  },
                  {
                    label: "HISTORY",
                    content: (
                      <div className="card">
                        <CustomTable
                          style={{ fontSize: 25 }}
                          leftText={{}}
                          headers={[
                            `Amount Staked`,
                            "Lock Date",
                            "Unlock Date",
                            "Action",
                          ]}
                          contents={_.sortBy(userDeposits, "end").map((row) => {
                            if (poolIndex !== row.poolId) return;
                            return [
                              new BigNumber(
                                Number(
                                  convertAmountFromRawNumber(row.amount)
                                ).toFixed(pools[row.poolId].toFixed)
                              ).toFormat(pools[row.poolId].toFixed),
                              moment(new Date(row.start * 1000)).format(
                                "YYYY/MM/DD, HH:mm:ss"
                              ),
                              moment(new Date(row.end * 1000)).format(
                                "YYYY/MM/DD, HH:mm:ss"
                              ),
                              <Button
                                color="secondary"
                                onClick={() => {
                                  onWithdraw(row.poolId, row.depositId);
                                }}
                                disabled={
                                  !moment(new Date()).isAfter(
                                    moment(new Date(row.end * 1000))
                                  )
                                }>
                                Unlock
                              </Button>,
                            ];
                          })}
                        />
                      </div>
                    ),
                  },
                ].map((tab, index) => {
                  return (
                    <div key={index} value={tab} hidden={tabValue !== index}>
                      {tab.content}
                    </div>
                  );
                })}
              </Grid>
              <Grid item xs={12} md={6}>
                <div className="card">
                  <div className="cardSubHeader">Share OF OWNERSHIP</div>
                  <div style={{ textAlign: "center" }}>
                    {totalStakedAmount > 0 ? (
                      <OwnerPie data={ownership} />
                    ) : (
                      "No Data"
                    )}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <div className="card">
                  <div className="cardSubHeader">TOTAL {poolName} STAKED</div>
                  <div className="cardLgValue">
                    {new BigNumber(
                      _.get(poolDetails, `[${poolIndex}].totalStaked`, 0)
                    ).toFormat(2)}
                    {/* {new BigNumber(userStakedAmount).toFormat(2)} */}
                  </div>
                </div>
                <div className="card">
                  <div className="cardSubHeader">RBW PRICE</div>
                  <PriceChart />
                </div>
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <div className="card">
                  <div className="cardSubHeader">cumulative SRBW BOOSTS</div>
                  <div className="cardLgValue">
                    {_.reduce(
                      delegatedTokens.delegated,
                      function (sum, n) {
                        let result = _.find(activeBadgeList[poolIndex], {
                          tokenId: n.badge.tokenId.toString(),
                        });
                        if (!result) return sum;
                        return sum + result.boostFactor;
                      },
                      0
                    )}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <div className="card">
                  <div className="cardSubHeader">VALUE OF STAKED</div>
                  <div className="cardLgValue">
                    $
                    {stakes[poolIndex]
                      ? new BigNumber(stakes[poolIndex]).toFormat(2)
                      : "0.00"}
                  </div>{" "}
                </div>
              </Grid> */}
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <div
                  className="card"
                  style={{
                    height: "60vh",
                    marginTop: 70,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <ConnectWallet />
                </div>
              </Grid>
            </>
          )}
        </Grid>
      </div>
    </>
  );
};

export default Overview;
