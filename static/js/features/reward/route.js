import { Reward } from ".";
export default {
  path: "reward",

  childRoutes: [{ path: "/", component: Reward, isIndex: true }],
};
