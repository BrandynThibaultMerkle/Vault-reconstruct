import React from "react";
import { useTranslation } from "react-i18next";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Container from "@material-ui/core/Container";
import Drawer from "@material-ui/core/Drawer";
import Menu from "@material-ui/icons/Menu";
import Close from "@material-ui/icons/Close";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import Chip from "@material-ui/core/Chip";
import MenuItems from "./MenuItems";
import clsx from "clsx";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";

const drawerWidth = "17rem";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    margin: "0 50px",
    padding: "10px 0",
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  toolbar: {
    float: "right",
    paddingRight: 4, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    background: "rgb(22,27,62)",
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  sideBarDrawerPaper: {
    whiteSpace: "nowrap",
    width: drawerWidth,
    borderRight: "0px",
    backgroundColor: `transparent`,
    overflow: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  sideBarDrawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
  gradientBtn: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
  },
}));

const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const { t } = useTranslation();
  const classes = useStyles();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Hidden mdUp>
          <Toolbar className={classes.toolbar}>
            <Grid justifyContent="space-between" container>
              <Grid item>
                <div
                  style={{ color: "white", fontSize: 24, padding: 10 }}></div>
              </Grid>

              <Grid item>
                <IconButton
                  aria-label="open drawer"
                  style={{ color: "white" }}
                  onClick={handleDrawerToggle}>
                  <Menu />
                </IconButton>
              </Grid>
            </Grid>
          </Toolbar>
        </Hidden>
        <Hidden mdUp implementation="js">
          <Drawer
            classes={{
              paper: clsx(
                classes.drawerPaper,
                !mobileOpen && classes.drawerPaperClose
              ),
            }}
            variant="temporary"
            anchor={"right"}
            open={mobileOpen}
            onClose={handleDrawerToggle}>
            <div style={{ textAlign: "center" }}>
              <List>
                <MenuItems handleDrawerToggle={handleDrawerToggle} />
              </List>
            </div>
          </Drawer>
        </Hidden>
      </AppBar>
      <Hidden smDown>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.sideBarDrawerPaper),
          }}
          open={true}>
          <List style={{ height: "90%" }}>
            <MenuItems />
          </List>
        </Drawer>
      </Hidden>
    </div>
  );
};

export default LandingHeader;
