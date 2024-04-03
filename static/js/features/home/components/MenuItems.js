import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Hidden from "@material-ui/core/Hidden";
import Box from "@material-ui/core/Box";
import { useFetchPoolDetails } from "features/home/redux/hooks";
import Button from "components/CustomButtons/Button.js";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ConnectWallet from "components/ConnectWallet/ConnectWallet";
import logo from "assets/img/title.png";

import { useLocation } from "react-router-dom";
const checkSelected = (location, linkTo) => {
  if (linkTo.length < 5) return location == "#" + linkTo;
  return location.indexOf("#" + linkTo) >= 0;
};

const MenuItems = ({
  handleDrawerToggle,
  style,
  footer = false,
  color = "white",
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  let currentLocation = window.location.hash;
  const [tabIndex, setTabIndex] = useState(0);
  const { setSelctedPool } = useFetchPoolDetails();
  useEffect(() => {
    if (location.pathname == "/reward") {
      setTabIndex(1);
    } else if (location.pathname == "/") {
      setTabIndex(0);
    }
  }, [location]);

  const renderListItem = (name, color, linkTo, location, index) => {
    const selected = checkSelected(location, linkTo);
    // if(selected)
    // setTabIndex(index)
    if (name == "Swap") {
      return (
        <LinkButton
          color={color}
          style={{ padding: 0 }}
          title={name}
          href="/"
          onClick={() => {
            window.open(
              "https://polygon.balancer.fi/#/trade/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x431CD3C9AC9Fc73644BF68bF5691f4B83F9E104f"
            );
          }}
          selected={selected}
        />
      );
    } else {
      return (
        <LinkButton
          color={color}
          style={{ padding: 0 }}
          title={name}
          href={linkTo}
          onClick={() => {
            // setSelctedPool(0);
            setTabIndex(index);
          }}
          selected={selected}
        />
      );
    }
  };
  return (
    <div style={style}>
      <Hidden mdUp>
        <ConnectWallet textButton />
        <ListItem
          button
          component={Link}
          to="/overview"
          onClick={handleDrawerToggle}
          style={{ marginTop: 20 }}>
          <ListItemText primary={t("Overview")} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/reward"
          onClick={handleDrawerToggle}
          style={{ marginTop: 20 }}>
          <ListItemText primary={t("Rewards")} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/badges"
          onClick={handleDrawerToggle}
          style={{ marginTop: 20 }}>
          <ListItemText primary={t("Badges")} />
        </ListItem>
        {/* <ListItem
          button
          component={Link}
          to="/analytics"
          onClick={handleDrawerToggle}
          style={{ marginTop: 20 }}
        >
          <ListItemText primary={t("Analytics")} />
        </ListItem> */}
        <ListItem
          button
          component={Link}
          to="/leaderboard"
          onClick={handleDrawerToggle}
          style={{ marginTop: 20 }}>
          <ListItemText primary={t("Leaderboard")} />
        </ListItem>
      </Hidden>
      <Hidden smDown>
        <div style={{ textAlign: "center" }}>
          <a href="https://www.cryptounicorns.fun/" target="_blank">
            <Hidden xsDown>
              <h1 style={{ color: "white" }}>
                <img
                  src={logo}
                  style={{
                    height: "120px",
                    marginRight: "5px",
                    objectFit: "contain",
                  }}
                />
              </h1>
            </Hidden>
          </a>
          <div
            style={{
              background: "#2C1C67",

              padding: "10px 10px",
              borderRadius: 85,
              margin: 10,
            }}>
            <div>
              <img
                src={require("assets/img/RBW.png").default}
                style={{
                  height: "70px",
                  marginRight: "5px",
                  objectFit: "contain",
                }}
              />
            </div>

            <ConnectWallet textButton />

            <Box
              alignItems={"center"}
              style={{
                marginBottom: 30,
                borderTop: "2px solid #A9A4C3",
                margin: "20px auto",
                paddingTop: 20,
              }}>
              {renderListItem("Overview", color, "/", currentLocation, 0)}
              {renderListItem("Rewards", color, "/reward", currentLocation, 1)}
              {renderListItem("Badges", color, "/badges", currentLocation, 2)}

              {/* {renderListItem(
                "Analytics",
                color,
                "/analytics",
                currentLocation,
                4
              )} */}

              {renderListItem(
                "Leaderboard",
                color,
                "/leaderboard",
                currentLocation,
                3
              )}

              {renderListItem("Swap", color, "/swap", currentLocation, 5)}

              {/* <Price /> */}
            </Box>
          </div>
          <Link
            to={"/info"}
            style={{
              textDecoration: "none",
            }}>
            <img
              src={require("assets/img/info.svg").default}
              style={{
                marginTop: "-20px",
                height: "100px",
                objectFit: "contain",
              }}
            />
          </Link>
        </div>
      </Hidden>
    </div>
  );
};
const Href = styled.a`
  a:hover {
    text-decoration: none;
  }
`;
const ContainerDiv = styled.div`
  padding-left: 20px;
  a:hover {
    text-decoration: none;
  }
`;
const StyledDiv = styled.div`
  padding: 4px;
  margin: 2px 10px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: ${(props) => props.color};
  :hover {
  }
`;

function LinkButton({ style, title, href, color, selected, onClick }) {
  return (
    <ContainerDiv style={style}>
      {href ? (
        <Link
          to={href}
          style={{
            textDecoration: "none",
          }}>
          <Button color={selected ? "selected" : "secondary"} onClick={onClick}>
            {title}
          </Button>
        </Link>
      ) : (
        <StyledDiv color={color}>{title}</StyledDiv>
      )}
    </ContainerDiv>
  );
}

export default MenuItems;
