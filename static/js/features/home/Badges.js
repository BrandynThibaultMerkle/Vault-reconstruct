import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Grid, Modal, IconButton, Checkbox } from "@material-ui/core";
import {
  useConnectWallet,
  useFetchDelegateBadges,
  useFetchPoolDetails,
} from "features/home/redux/hooks";

import { ethers } from "ethers";
import CustomTable from "components/CustomTable/CustomTable.js";
import Button from "components/CustomButtons/Button.js";
import { activeBadgeList } from "features/configure";
import CustomOutlinedInput from "components/CustomOutlinedInput/CustomOutlinedInput";
import _ from "lodash";
import Tabs from "components/CustomTabs/Tabs.js";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPaper: {
    color: "white",
    backgroundColor: "#17204A",
    borderRadius: 20,
    maxWidth: 500,
  },
  title: {
    fontSize: 28,
    lineHeight: 0.8,
    color: "#BDB8B8",
    margin: 10,
  },
}));

const Analytics = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { web3, address } = useConnectWallet();
  const {
    delegatedTokens,
    delegateBadges,
    delegateBadgesPending,
    fetchBadgeStatus,
    fetchBadgesPending,
  } = useFetchDelegateBadges();
  const [userBadges, setUserBadges] = useState([]);
  const [delegateAddress, setDelegateAddress] = useState("");
  const [delegateToken, setDelegateToken] = useState("");

  const [badgeType, setBadgeType] = useState(0);
  const [delegatedStatus, setDelegatedStatus] = useState({});
  const [checkedDefault, setCheckedDefault] = useState(false);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeStatusLoading, setBadgeStatusLoading] = useState(false);
  const { setSelctedPool, selectedPool } = useFetchPoolDetails();
  const [tabValue, setTabValue] = useState(selectedPool);
  const handleTabChange = (event, newValue) => {
    setSelctedPool(newValue);
    setTabValue(newValue);
  };

  const handleTypeChange = (event, newValue) => {
    setBadgeType(newValue);
  };

  useEffect(() => {
    if (web3 && address) {
      getUserBadges();
      const id = setInterval(() => {}, 30000);
      return () => clearInterval(id);
    }
  }, [web3, address]);

  useEffect(() => {
    setDelegatedStatus(delegatedTokens);
  }, [delegatedTokens]);

  useEffect(() => {
    // if (userBadges.length > 0)
    fetchBadgeStatus({
      tabValue,
      web3,
      address,
      // userBadges: _.filter(activeBadgeList[tabValue], (n) => {
      //   return _.find(userBadges, { token_id: n.tokenId.toString() });
      // }),
      userBadges: activeBadgeList[tabValue],
    });
  }, [userBadges, tabValue, address]);

  const getUserBadges = () => {
    const userAddress = address;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-Key":
          "jASPbIXOoEzD7ROOAt11r6yG4i7LUEIY1L8s9A9CbTBgRaxXX6Vzcot1cx2aqVL1",
      },
    };

    setBadgeLoading(true);
    fetch(
      // `https://deep-index.moralis.io/api/v2/0xa2949fb0032fe5bcbfd56722f18116019a7c6cee/nft?chain=polygon&format=decimal&token_addresses=0x99a558bdbde247c2b2716f0d4cfb0e246dfb697d&normalizeMetadata=true`,
      `https://deep-index.moralis.io/api/v2/${userAddress}/nft?chain=polygon&format=decimal&token_addresses=0x99a558bdbde247c2b2716f0d4cfb0e246dfb697d&normalizeMetadata=true`,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        setUserBadges(response.result);
        setBadgeLoading(false);
      })
      .catch((err) => console.error(err));
  };
  const filterBadges = _.filter(activeBadgeList[tabValue], (n) => {
    if (badgeType > 0) {
      if (
        !delegatedStatus[tabValue].result[n.tokenId] ||
        !delegatedStatus[tabValue]
      ) {
        return;
      }
    }
    return _.find(userBadges, { token_id: n.tokenId.toString() });
  });

  return (
    <div
      style={{
        position: "relative",
        margin: "0 auto",
        maxWidth: 1100,
      }}>
      <Modal
        className={classes.modal}
        open={delegateToken}
        onClose={() => setDelegateToken("")}>
        <div className={classes.modalPaper} style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 30,
              borderRadius: "20px 20px 0 0",
              padding: "0 15px",
              backgroundSize: "cover",
              background: `url(${
                require("assets/img/object.png").default
              }),linear-gradient(165.56deg, #1E3C72 0%, #2A5298 84.8%)`,
            }}
            className="betweenRow">
            <span>DELEGATE BADGE</span>
            <IconButton
              onClick={() => setDelegateToken("")}
              style={{ padding: 0 }}>
              <img
                src={require("assets/img/close.svg").default}
                className="icon"
              />
            </IconButton>
          </div>
          <div style={{ padding: "25px 40px" }}>
            <div>
              Enter the address you would like to delegate this badge to. you
              are able to delegate to own address.
            </div>

            <CustomOutlinedInput
              value={delegateAddress}
              placeholder="ENTER ADDRESS"
              onClick={() => {}}
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            <div style={{ textAlign: "left" }}>
              <Checkbox
                color="primary"
                checked={checkedDefault}
                onChange={(e) => {
                  setDelegateAddress("");
                  setCheckedDefault(e.target.checked);
                }}
              />
              Default to current address{" "}
            </div>
            <div style={{ marginTop: 30 }}>
              <Button
                color="selected"
                disabled={
                  !checkedDefault && !ethers.utils.isAddress(delegateAddress)
                }
                onClick={async () => {
                  await delegateBadges({
                    address: address,
                    delegator: checkedDefault ? address : delegateAddress,
                    web3,
                    delegateToken: delegateToken,
                    tabValue,
                    userBadges: activeBadgeList[tabValue],
                  });
                  setDelegateToken("");
                  setDelegateAddress("");
                }}>
                Delegate
              </Button>{" "}
            </div>
          </div>
        </div>
      </Modal>
      <Tabs
        tabIndex={tabValue}
        handleChange={handleTabChange}
        tabs={[
          {
            label: "RBW",
          },
          {
            label: "RBWLP",
          },
        ]}
      />
      <Grid container>
        <Grid item xs={12} md={7}>
          <div className={classes.title}>DELEGATEABLE BADGES</div>
          <div className="card">
            <Tabs
              tabIndex={badgeType}
              handleChange={handleTypeChange}
              tabs={[
                {
                  label: "ALL",
                  content: (
                    <div style={{ height: "50vh", overflow: "auto" }}>
                      {delegatedStatus[tabValue] &&
                      delegatedStatus[tabValue].result &&
                      filterBadges.length > 0 ? (
                        <CustomTable
                          leftText={{}}
                          headers={["BADGE", "ID", `BOOST`, "ACTION"]}
                          contents={_.map(filterBadges, (badge) => {
                            let result = _.find(userBadges, {
                              token_id: badge.tokenId.toString(),
                            });
                            if (result)
                              return [
                                <img
                                  style={{
                                    width: 80,
                                    hieght: 80,
                                    borderRadius: 40,
                                    border: "solid white 3px",
                                  }}
                                  src={result.normalized_metadata.image}
                                />,
                                badge.tokenId,
                                badge.boostFactor,
                                <Button
                                  color="secondary"
                                  disabled={
                                    delegatedStatus[tabValue]["result"][
                                      badge.tokenId
                                    ]["delegatedTo"] !=
                                    "0x0000000000000000000000000000000000000000"
                                  }
                                  onClick={() => {
                                    if (address) setDelegateToken(badge);
                                  }}>
                                  {delegatedStatus[tabValue]["result"][
                                    badge.tokenId
                                  ]["delegatedTo"] !=
                                  "0x0000000000000000000000000000000000000000"
                                    ? "Already Delegated"
                                    : "Delegate"}
                                </Button>,
                              ];
                          })}
                        />
                      ) : badgeLoading || fetchBadgesPending ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}>
                          Loading...
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}>
                          No Badges
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  label: "LOANED",
                  content: (
                    <div style={{ height: "50vh", overflow: "auto" }}>
                      {delegatedStatus[tabValue] &&
                      delegatedStatus[tabValue].result &&
                      filterBadges.length > 0 ? (
                        <CustomTable
                          leftText={{}}
                          headers={["BADGE", "ID", `BOOST`, "ACTION"]}
                          contents={_.map(
                            _.filter(filterBadges, (fbadge) => {
                              let result = _.find(userBadges, {
                                token_id: fbadge.tokenId.toString(),
                              });
                              return (
                                result &&
                                delegatedStatus[tabValue]["result"][
                                  fbadge.tokenId
                                ]["delegatedTo"] !=
                                  "0x0000000000000000000000000000000000000000" &&
                                delegatedStatus[tabValue]["result"][
                                  fbadge.tokenId
                                ]["delegatedTo"].toLowerCase() !=
                                  address.toLowerCase()
                              );
                            }),
                            (badge) => {
                              let result = _.find(userBadges, {
                                token_id: badge.tokenId.toString(),
                              });
                              if (
                                result &&
                                delegatedStatus[tabValue]["result"][
                                  badge.tokenId
                                ]["delegatedTo"] !=
                                  "0x0000000000000000000000000000000000000000" &&
                                delegatedStatus[tabValue]["result"][
                                  badge.tokenId
                                ]["delegatedTo"].toLowerCase() !=
                                  address.toLowerCase()
                              )
                                return [
                                  <img
                                    style={{
                                      width: 80,
                                      hieght: 80,
                                      borderRadius: 40,
                                      border: "solid white 3px",
                                    }}
                                    src={result.normalized_metadata.image}
                                  />,
                                  badge.tokenId,
                                  badge.boostFactor,
                                  <Button
                                    color="secondary"
                                    disabled={
                                      delegatedStatus[tabValue]["result"][
                                        badge.tokenId
                                      ]["delegatedTo"] !=
                                      "0x0000000000000000000000000000000000000000"
                                    }
                                    onClick={() => {
                                      if (address) setDelegateToken(badge);
                                    }}>
                                    {delegatedStatus[tabValue]["result"][
                                      badge.tokenId
                                    ]["delegatedTo"] !=
                                    "0x0000000000000000000000000000000000000000"
                                      ? "Already Delegated"
                                      : "Delegate"}
                                  </Button>,
                                ];
                            }
                          )}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}>
                          No Badges
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  label: "DELEGATED",
                  content: (
                    <div style={{ height: "50vh", overflow: "auto" }}>
                      {delegatedStatus[tabValue] &&
                      delegatedStatus[tabValue].result &&
                      filterBadges.length > 0 ? (
                        <CustomTable
                          leftText={{}}
                          headers={["BADGE", "ID", `BOOST`, "ACTION"]}
                          contents={_.map(
                            _.filter(filterBadges, (fbadge) => {
                              let result = _.find(userBadges, {
                                token_id: fbadge.tokenId.toString(),
                              });
                              return (
                                result &&
                                delegatedStatus[tabValue]["result"][
                                  fbadge.tokenId
                                ]["delegatedTo"].toLowerCase() ==
                                  address.toLowerCase()
                              );
                            }),
                            (badge) => {
                              let result = _.find(userBadges, {
                                token_id: badge.tokenId.toString(),
                              });
                              if (
                                result &&
                                delegatedStatus[tabValue]["result"][
                                  badge.tokenId
                                ]["delegatedTo"].toLowerCase() ==
                                  address.toLowerCase()
                              )
                                return [
                                  <img
                                    style={{
                                      width: 80,
                                      hieght: 80,
                                      borderRadius: 40,
                                      border: "solid white 3px",
                                    }}
                                    src={result.normalized_metadata.image}
                                  />,
                                  badge.tokenId,
                                  badge.boostFactor,
                                  <Button
                                    color="secondary"
                                    disabled={
                                      delegatedStatus[tabValue]["result"][
                                        badge.tokenId
                                      ]["delegatedTo"] !=
                                      "0x0000000000000000000000000000000000000000"
                                    }
                                    onClick={() => {
                                      if (address) setDelegateToken(badge);
                                    }}>
                                    {delegatedStatus[tabValue]["result"][
                                      badge.tokenId
                                    ]["delegatedTo"] !=
                                    "0x0000000000000000000000000000000000000000"
                                      ? "Already Delegated"
                                      : "Delegate"}
                                  </Button>,
                                ];
                            }
                          )}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}>
                          No Badges
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={5}>
          <div className={classes.title}>DELEGATED BADGES</div>
          <div className="card">
            <div style={{ height: "59vh", overflow: "auto" }}>
              {delegatedStatus[tabValue] &&
              delegatedStatus[tabValue].result &&
              _.values(delegatedStatus[tabValue].result).length > 0 ? (
                <CustomTable
                  style={{ fontSize: 18 }}
                  headers={["ID", `BOOST`, "FROM", "TO"]}
                  contents={_.map(
                    delegatedStatus[tabValue].delegated,
                    function (n) {
                      let result = _.find(activeBadgeList[tabValue], {
                        tokenId: n.badge.tokenId,
                        contractAddress: n.badge.contractAddress.toLowerCase(),
                      });
                      if (!result) return;
                      return [
                        n.badge.tokenId,
                        result.boostFactor,
                        `${n.owner.slice(0, 4)}...${n.owner.slice(-4)}`,
                        `${address.slice(0, 4)}...${address.slice(-4)}`,
                      ];
                    }
                  )}
                />
              ) : (
                <div>No DELEGATED BADGES</div>
              )}
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default Analytics;
