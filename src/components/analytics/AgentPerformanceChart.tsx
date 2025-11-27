import React, { useMemo } from 'react';
import { XYChart, AnimatedLineSeries, AnimatedAxis, Tooltip, Grid, buildChartTheme } from '@visx/xychart';
import { tokens } from '@fluentui/react-components';

type Datum = { x: number; y: number };

export interface AgentPerformanceChartProps {
  dataTokens: Datum[];         // token usage over time
  dataContextUse: Datum[];     // currentContext / maxContext ratio over time
  height?: number;
}

export const AgentPerformanceChart: React.FC<AgentPerformanceChartProps> = ({ dataTokens, dataContextUse, height = 220 }) => {
  const theme = useMemo(() => buildChartTheme({
    backgroundColor: 'transparent',
    colors: [tokens.colorPaletteMarigoldForeground2, tokens.colorPaletteSeafoamForeground2],
    tickLength: 4,
    gridColor: tokens.colorNeutralStroke3,
    gridColorDark: tokens.colorNeutralStroke3,
  }), []);

  return (
    <div style={{ width: '100%', height }}>
      <XYChart height={height} theme={theme} xScale={{ type: 'linear' }} yScale={{ type: 'linear' }}>
        <Grid rows columns />
        <AnimatedAxis orientation="bottom" numTicks={5} label="time" />
        <AnimatedAxis orientation="left" numTicks={5} />
        <AnimatedLineSeries dataKey="Tokens" data={dataTokens} xAccessor={(d) => d.x} yAccessor={(d) => d.y} />
        <AnimatedLineSeries dataKey="Context%" data={dataContextUse} xAccessor={(d) => d.x} yAccessor={(d) => d.y} />
        <Tooltip
          showVerticalCrosshair
          renderTooltip={({ tooltipData }) => {
            const x = tooltipData?.nearestDatum?.datum && (tooltipData.nearestDatum.datum as any).x;
            const vals = Object.entries(tooltipData?.datumByKey || {}).map(([k, v]: any) => `${k}: ${v.datum?.y?.toFixed?.(2)}`);
            return (
              <div style={{ fontSize: 12 }}>
                <div>t = {x}</div>
                {vals.map((s, i) => (<div key={i}>{s}</div>))}
              </div>
            );
          }}
        />
      </XYChart>
    </div>
  );
};

export default AgentPerformanceChart;
