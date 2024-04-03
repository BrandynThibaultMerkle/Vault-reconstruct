import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Grid, Modal } from "@material-ui/core";
import Button from "components/CustomButtons/Button.js";
import { useConnectWallet } from "features/home/redux/hooks";
import { contracts, tokens, pools } from "features/configure";
import { useFetchRewardDetail, useFetchClaimReward } from "./redux/hooks";
import { useFetchPrice } from "../../price/redux/hooks";
import {
  useFetchWithdraw,
  useFetchDashboard,
  useFetchPoolDetails,
} from "../home/redux/hooks";
import { convertAmountFromRawNumber } from "features/helpers/bignumber";
import { formatCountdown } from "features/helpers/format";
import CustomTable from "components/CustomTable/CustomTable.js";
import _ from "lodash";
import moment from "moment";
import BigNumber from "bignumber.js";
import { useHistory } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: 28,
    lineHeight: 0.8,
    color: "#BDB8B8",
    margin: 10,
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
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPaper: {
    width: "50%",
    minWidth: 360,
    color: "white",
    backgroundColor: theme.palette.background.paper,
    padding: "15px 25px",
    borderRadius: 20,
  },
}));

const Reward = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { fetchRewardDetail, fetchRewardDetailPending, detail } =
    useFetchRewardDetail();

  const { fetchClaimReward } = useFetchClaimReward();
  const { fetchWithdraw } = useFetchWithdraw({ pid: 100 });
  const { fetchPrice, priceData } = useFetchPrice();
  const { fetchDashboard } = useFetchDashboard();
  const dashboardDetail = useFetchDashboard().detail;
  const history = useHistory();
  const { web3, address } = useConnectWallet();
  const [now, setNow] = useState(moment());
  const [openForce, setOpenForce] = useState(false);
  const [singlePoolForce, setSinglePoolForce] = useState(false);
  const [lpPoolForce, setLpForce] = useState(false);

  const escrowedData = detail.escrowedData ? detail.escrowedData : [];
  const computer = useMediaQuery(theme.breakpoints.up("sm"));
  let deadline = moment().set({
    hour: 12,
    minute: 45,
    second: 0,
    millisecond: 0,
  });
  if (now > deadline) {
    deadline = deadline.add(1, "days");
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(moment());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [now]);
  let countdown = formatCountdown(deadline, now);

  const onClaim = (pid) => {
    fetchClaimReward({
      address,
      web3,
      contractAddress:
        pid == 0 ? contracts.singleTokenPool.address : contracts.lpPool.address,
      rewardAddress: tokens.rewardToken.address,
    }).then(() => {});
  };

  const onWithdraw = (depositId) => {
    fetchWithdraw({
      address,
      web3,
      depositId,
      poolData: { poolAddress: contracts.escrowedReward.address, pid: 100 },
    });
  };

  useEffect(() => {
    if (web3 && !priceData) fetchPrice({ web3 });
  }, [web3]);

  useEffect(() => {
    if (web3 && address) {
      fetchDashboard({ web3, address });
      fetchRewardDetail({ web3, address });
      const id = setInterval(() => {
        fetchDashboard({ web3, address });
        fetchRewardDetail({ web3, address });
      }, 30000);
      return () => clearInterval(id);
    }
  }, [web3, address]);

  useEffect(() => {
    if (dashboardDetail && dashboardDetail.pools) {
      let singleForce = !_.every(
        dashboardDetail.pools[0].deposits,
        (deposit) => {
          const timeDiff = moment(deposit[2] * 1000) - moment(now);
          return timeDiff > 0;
        }
      );

      let lpForce = !_.every(dashboardDetail.pools[1].deposits, (deposit) => {
        const timeDiff = moment(deposit[2] * 1000) - moment(now);
        return timeDiff > 0;
      });

      setSinglePoolForce(singleForce);
      setLpForce(lpForce);
    }
  }, [dashboardDetail]);

  // console.log(dashboardDetail);

  return (
    <div
      style={{
        position: "relative",
        margin: "0 auto",
        paddingTop: 40,
        maxWidth: 1000,
      }}>
      <Modal
        className={classes.modal}
        open={openForce}
        onClose={() => setOpenForce(false)}>
        <div className={classes.modalPaper} style={{}}>
          <h3>
            Expired RBW deposits must be unlocked before you can claim rewards
          </h3>
          <div style={{ textAlign: "center" }}>
            <Button
              color="secondary"
              onClick={() => {
                history.push("/?y=" + (computer ? 1520 : 2500).toString());
              }}>
              GO TO
            </Button>
          </div>
        </div>
      </Modal>

      <Grid container alignItems="center">
        <Grid item xs={12} sm={6}>
          <div className={classes.title}>Rewards</div>
        </Grid>
        <Grid item xs={12} sm={6} style={{ fontSize: 18, lineHeight: 1.5 }}>
          <b>
            {`Staking rewards enter a 7 days vesting period after claiming. sAssets
          are non-transferable and only used for accounting purposes.`}
          </b>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          style={{ fontSize: 14, lineHeight: 1.5 }}></Grid>
        <Grid
          item
          xs={12}
          sm={6}
          style={{
            fontSize: 14,
            textAlign: "right",
            color: "white",
          }}>
          Next rewards released in {countdown.hours} : {countdown.minutes} :{" "}
          {countdown.seconds}
        </Grid>

        <Grid item xs={12}>
          <div className="card" style={{ marginBottom: 40 }}>
            <CustomTable
              leftText={{}}
              headers={[
                "Core Pools",
                `Amount Staked`,
                "Claimable Rewards",
                "Action",
              ]}
              contents={pools.map((row, index) => {
                if (row.hidden || row.readonly) return;
                return [
                  row.stakedTokenName,
                  new BigNumber(
                    parseFloat(
                      Number(
                        _.get(detail, `[${row.pid}.stakedToken]`, 0)
                      ).toFixed(pools[index].toFixed)
                    )
                  ).toFormat(2),
                  new BigNumber(
                    parseFloat(
                      Number(
                        _.get(detail, `[${row.pid}.claimableTokenReward]`, 0)
                      ).toFixed(2)
                    )
                  ).toFormat(2),
                  <Button
                    color="secondary"
                    onClick={() => {
                      if (row.pid == 0 && singlePoolForce) {
                        setOpenForce(true);
                        return;
                      }

                      if (row.pid == 1 && lpPoolForce) {
                        setOpenForce(true);
                        return;
                      }

                      onClaim(row.pid);
                    }}
                    disabled={
                      _.get(detail, `[${row.pid}.claimableTokenReward]`, 0) == 0
                    }>
                    Claim
                  </Button>,
                ];
              })}
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.title}>Locked Rewards</div>
        </Grid>
        <Grid item xs={12}>
          <div className="card" style={{ marginBottom: 40 }}>
            <CustomTable
              leftText={{}}
              headers={[
                "Token",
                `Amount`,
                "Dollar Value",
                "Status",
                "Time Remaining",
              ]}
              contents={escrowedData.map((row, index) => {
                const endTime = new Date(row[2] * 1000);
                const now = new Date();
                const timeDiff = moment(endTime) - moment(now);
                const dur = moment.duration(timeDiff);
                const amount = Number(
                  convertAmountFromRawNumber(row[0])
                ).toFixed(2);
                const value = (amount * parseFloat(priceData)).toFixed(2);
                const status = timeDiff > 0 ? "Locked" : "Unlocked";

                return [
                  pools[0].rewardTokenName, //TODO
                  new BigNumber(parseFloat(amount)).toFormat(2),
                  `$${new BigNumber(parseFloat(value)).toFormat(2)}`,
                  status,
                  timeDiff > 0 ? (
                    `${dur.months()} months ${dur.days()} days ${dur.hours()} hrs ${dur.minutes()} mins`
                  ) : (
                    <Button
                      color="secondary"
                      onClick={() => {
                        onWithdraw(index);
                      }}>
                      Claim
                    </Button>
                  ),
                ];
              })}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default Reward;
