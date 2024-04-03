import { Analytics, NewOverview, Badges, Info } from ".";
export default {
  path: "",
  childRoutes: [
    { path: "overview", component: NewOverview, isIndex: false },
    { path: "analytics", component: Analytics, isIndex: false },
    { path: "badges", component: Badges, isIndex: false },
    { path: "info", component: Info, isIndex: false },
    { path: "", component: NewOverview, isIndex: true },
  ],
};
