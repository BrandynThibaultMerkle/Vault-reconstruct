import React, { useEffect, useState } from "react";
import { ThemeProvider, StylesProvider } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import {
  useFetchPoolDetails,
  useConnectWallet,
  useFetchDelegateBadges,
  useFetchDashboard,
} from "./redux/hooks";
import Footer from "components/Footer/Footer";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Notifier } from "features/common";
import appStyle from "./jss/appStyle.js";
import createAppTheme from "./jss/appTheme";
import LandingHeader from "./components/LandingHeader";
import Background from "assets/img/background.png";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { pools, activeBadgeList } from "features/configure";

const useStyles = makeStyles(appStyle);

export default function App({ children }) {
  const classes = useStyles();
  const theme = createAppTheme(true);
  const { fetchDashboard, detail } = useFetchDashboard();
  const { poolDetails, fetchPoolDetails, selectedPool } = useFetchPoolDetails();
  const { web3, address } = useConnectWallet();
  const [userStaked, setUserStaked] = useState([]);
  const [poolTotalStaked, setPoolTotalStaked] = useState([]);
  const { delegatedTokens, fetchBadgeStatus } = useFetchDelegateBadges();
  useEffect(() => {
    if (web3 && address) {
      fetchPoolDetails({ web3, address });
      fetchDashboard({ web3, address });
      fetchBadgeStatus({
        web3,
        address,
        userBadges: activeBadgeList[selectedPool],
        tabValue: selectedPool,
      });
      const id = setInterval(() => {
        fetchPoolDetails({ web3, address });
        fetchDashboard({ web3, address });
        fetchBadgeStatus({
          web3,
          address,
          userBadges: activeBadgeList[selectedPool],
          tabValue: selectedPool,
        });
      }, 30000);
      return () => clearInterval(id);
    }
  }, [web3, address, selectedPool]);

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
    let poolTotalStaked = [];
    let poolLength = poolDetails ? poolDetails.length : 0;
    for (let i = 0; i < poolLength; i++) {
      poolTotalStaked.push(poolDetails[i].totalStaked);
    }
    setPoolTotalStaked(poolTotalStaked);
  }, [poolDetails]);

  const poolName = pools[selectedPool].stakedTokenName;
  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div
          style={{
            background: `url(${Background})`,
            backgroundPosition: "top",
            backgroundSize: "contain",
            backgroundAttachment: "fixed",
            padding: 10,
          }}>
          <LandingHeader />
          <main className={classes.container}>
            <Grid container>
              <Grid item xs={12} sm={3}></Grid>
              <Grid item xs={12} sm={3}>
                <div className="card" style={{ padding: 5 }}>
                  <div className="cardSubHeader" style={{ paddingBottom: 0 }}>
                    {poolName} Staked
                  </div>
                  <div className="cardLgValue" style={{ paddingBottom: 0 }}>
                    {new BigNumber(
                      _.get(userStaked, `[${selectedPool}]`, 0)
                    ).toFormat(2)}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={3}>
                <div className="card" style={{ padding: 5 }}>
                  <div className="cardSubHeader" style={{ paddingBottom: 0 }}>
                    s{poolName} Badge Boost
                  </div>
                  <div className="cardLgValue" style={{ paddingBottom: 0 }}>
                    {delegatedTokens[selectedPool]
                      ? _.reduce(
                          delegatedTokens[selectedPool].delegated,
                          function (sum, n) {
                            let result = _.find(activeBadgeList[selectedPool], {
                              tokenId: n.badge.tokenId.toString(),
                            });
                            if (!result) return sum;
                            return sum + result.boostFactor;
                          },
                          0
                        ).toFixed(3)
                      : 0}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={3}>
                {" "}
                <div className="card" style={{ padding: 5 }}>
                  <div className="cardSubHeader" style={{ paddingBottom: 0 }}>
                    s{poolName} Balance
                  </div>
                  <div className="cardLgValue" style={{ paddingBottom: 0 }}>
                    {new BigNumber(
                      _.get(poolDetails, `[${selectedPool}].userRBWBalance`, 0)
                    ).toFormat(2)}
                  </div>
                </div>
              </Grid>
            </Grid>

            {children}

            <Notifier />
          </main>
        </div>
        <Footer />
      </ThemeProvider>
    </StylesProvider>
  );
}
