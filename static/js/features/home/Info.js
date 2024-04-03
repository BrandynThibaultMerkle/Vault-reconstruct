import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import _ from "lodash";

const useStyles = makeStyles((theme) => ({
  heading: { color: "white", fontSize: 20, textAlign: "left" },
  accordion: {
    background: "#5B7BAB",
    borderRadius: 5,
    margin: "30px auto",
    textAlign: "left",
  },
}));

const Info = () => {
  const classes = useStyles();

  return (
    <div className="card">
      <h1>how does all of this work?</h1>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <Accordion className={classes.accordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>
              what is staking?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography style={{ fontFamily: "Quicksand" }}>
              <ul>
                <li>
                  Staking RBW & RBWLP will provide the player with sRBW and
                  sRBWLP, The longer you choose to stake, the more sRBW/sRBWLP
                  you will receive for your deposit!
                </li>
                <li>
                  The amount of sRBW/sRBWLP you hold will determine the amount
                  of RBW staking rewards you will receive.
                </li>
                <li>
                  In addition to sRBW’s staking reward generating capabilities,
                  sRBW is also used to vote on key initiatives for the Crypto
                  Unicorns DAO!
                </li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion className={classes.accordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>
              what are the importance of badges?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography style={{ fontFamily: "Quicksand" }}>
              <ul>
                <li>
                  Badges can be earned from playing Crypto Unicorns,
                  participating in community events, voting, and by ranking high
                  on leaderboard events! Before you stake, make sure to head
                  over to the Badges tab and your delegate earned badges to
                  increase your voting power & reward potential!
                </li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion className={classes.accordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>
              WHAT IS THE DIFFERENCE BETWEEN RBW & RBWLP?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography style={{ fontFamily: "Quicksand" }}>
              <ul>
                <li>
                  RBW is the governance token for the Crypto Unicorns DAO and
                  provides sRBW when staked which allows the player to vote on
                  key initiatives, new features, and community proposals that
                  will help shape the direction of Crypto Unicorns!
                </li>
                <li>
                  RBWLP is an LP token that can be obtained from Balancer by
                  pairing RBW and ETH. RBWLP is vital to the initiative of
                  onboarding new users as it helps to lower slippage and promote
                  a healthy economy!
                </li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default Info;
