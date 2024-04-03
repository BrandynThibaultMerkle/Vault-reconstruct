import React, { memo, useEffect } from "react";
import { useFetchPrice } from "../../price/fetchPrice";
import { useConnectWallet } from "features/home/redux/connectWallet";
import { LineChart, Line, Tooltip, XAxis } from "recharts";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import _ from "lodash";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import moment from "moment";
const PriceChart = ({ label }) => {
  const theme = useTheme();
  const { web3 } = useConnectWallet();
  const { chart, priceData } = useFetchPrice();
  const chartData = _.map(chart, (data) => {
    return { timestamp: data[0], price: data[1] };
  });
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card" style={{ opacity: 0.7 }}>
          <p className="tooltipDesc">{`${moment(
            payload[0]?.payload?.timestamp
          ).format("YYYY/MM/DD")}`}</p>
          <p className="tooltipLabel">{`$${payload[0].payload?.price.toFixed(
            4
          )}`}</p>
        </div>
      );
    }

    return null;
  };
  const change =
    chartData && chartData.length > 0
      ? parseFloat(
          ((chartData[chartData.length - 1].price -
            chartData[chartData.length - 2].price) *
            100) /
            chartData[chartData.length - 2].price
        ).toFixed(2)
      : 0;
  return (
    <div style={{ margin: "34px 0" }}>
      {/* <InfoIcon style={{float:"right"}} onClick={()=>{
        window.open("https://v2.info.uniswap.org/token/0x721a1b990699ee9d90b6327faad0a3e840ae8335");
      }}/> */}
      <LineChart width={400} height={80} data={chartData}>
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#59AEFF"
          strokeWidth={2}
        />
      </LineChart>
      <Grid container style={{ fontSize: 20 }}>
        <Grid item xs={4}>
          Price
        </Grid>
        <Grid item xs={4}>
          ${parseFloat(priceData).toFixed(4)}
        </Grid>
        <Grid item xs={4} style={{ color: change >= 0 ? "green" : "red" }}>
          {change >= 0 ? (
            <ArrowDropUpIcon style={{ verticalAlign: "middle" }} />
          ) : (
            <ArrowDropDownIcon style={{ verticalAlign: "middle" }} />
          )}
          {change}%
        </Grid>
      </Grid>
    </div>
  );
};

export default memo(PriceChart);
