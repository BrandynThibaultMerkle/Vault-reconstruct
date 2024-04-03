import React, { memo, useState } from "react";
import { PieChart, Pie, Sector, Tooltip } from "recharts";

import _ from "lodash";

const OwnerPie = ({ data }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <PieChart
        width={400}
        height={340}
        style={{ marginLeft: "auto", marginRight: "auto" }}>
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={data}
          fill="rgb(19,51,150)"
          cx="50%"
          cy="50%"
          outerRadius={130}
          startAngle={90}
          endAngle={450}
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            value,
            index,
          }) => {
            const radius = 25 + innerRadius + (outerRadius - innerRadius);
            const x = cx;
            const y =
              cy +
              (midAngle <= 90 || (midAngle > 270 && midAngle <= 450)
                ? -radius
                : radius);

            return (
              <text
                x={x}
                y={y}
                fill="#ffffff"
                textAnchor={"middle"}
                dominantBaseline="central">
                {data[index].name} ({value.toFixed(2)}%)
              </text>
            );
          }}
        />
        <Tooltip
          formatter={(value, name, props) => {
            return value.toFixed(2) + "%";
          }}
        />
      </PieChart>
    </div>
  );
};

export default memo(OwnerPie);
