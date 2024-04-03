import React, { useState } from "react";
import Overview from "./Overview";
import _ from "lodash";
import Tabs from "components/CustomTabs/Tabs.js";
import { useFetchPoolDetails } from "features/home/redux/hooks";
const NewOverview = () => {
  const { setSelctedPool, selectedPool } = useFetchPoolDetails();
  const [tabValue, setTabValue] = useState(selectedPool);
  const handleTabChange = (event, newValue) => {
    setSelctedPool(newValue);
    setTabValue(newValue);
  };
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Tabs
        tabIndex={tabValue}
        noHeight
        handleChange={handleTabChange}
        tabs={[
          {
            label: "RBW",
            content: <Overview poolIndex={tabValue} />,
          },
          {
            label: "RBWLP",
            content: <Overview poolIndex={tabValue} />,
          },
        ]}
      />
    </div>
  );
};

export default NewOverview;
