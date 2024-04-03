import React from "react";
import styled from "styled-components";
import { ThemeProvider, StylesProvider } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import LandingHeader from "./components/LandingHeader";
import LandingContent from "./components/LandingContent";
import Grid from "@material-ui/core/Grid";
import createTheme from "../home/jss/appTheme";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { useTranslation } from "react-i18next";

const Landing = () => {
  const theme = createTheme(true);
  const { t } = useTranslation();

  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div
          style={{
            minHeight: `100vh`,
            position: "relative",
            overflow: "hidden",
          }}>
          <LandingContent />
        </div>
      </ThemeProvider>
    </StylesProvider>
  );
};

const ContainerDiv = styled.div`
  padding-left: 20px;
  a:hover {
    text-decoration: none;
  }
`;
const StyledDiv = styled.div`
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #69abcc;
  margin-top: 9px;
  margin-left: 50px;
`;

function LinkHref({ style, title, href, color }) {
  return (
    <ContainerDiv style={style}>
      <a href={href} target="_blank" style={{ textDecoration: "none" }}>
        <StyledDiv>{title}</StyledDiv>
      </a>
    </ContainerDiv>
  );
}

const StyledText = styled.span`
  color: black;
  font-weight: 900;
`;

const Blank = styled.div`
  height: 50px;
  @media (max-width: 500px) {
    height: 30px;
  }
`;

const StyledNav = styled.nav`
  padding: 1.5rem;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const StyledLink = styled.a`
  color: white;
  padding: 16px;
  text-decoration: none;
  &:hover {
    color: #805e49;
  }
`;

export default Landing;
