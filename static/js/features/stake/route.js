import { Stake } from ".";
export default {
  path: "stake",

  childRoutes: [
    { path: ":poolName", component: Stake, isIndex: false },
    { path: "/", component: Stake, isIndex: true },
  ],
};
