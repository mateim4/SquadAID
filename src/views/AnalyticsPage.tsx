import React from 'react';
import { Title1, Button, tokens, makeStyles, shorthands } from '@fluentui/react-components';
import { agents } from '@/data/agents';
import { useMetricsStore } from '@/store/metricsStore';
import AgentPerformanceChart from '@/components/analytics/AgentPerformanceChart';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  card: {
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground3,
  },
});

export default function AnalyticsPage() {
  const styles = useStyles();
  const { samples, addSample, clear } = useMetricsStore();

  const seed = () => {
    const now = Date.now();
    agents.filter(a => a.backendType).forEach((a, idx) => {
      for (let i = 0; i < 20; i++) {
        const t = now + i * 1000;
        addSample({
          ts: t,
          agentId: a.id,
          tokensUsed: Math.round(200 + 50 * Math.sin(i / 2 + idx)),
          currentContext: Math.round(2_000 + 200 * Math.cos(i / 3 + idx)),
          maxContext: 8000,
          todoCount: (i % 5),
        });
      }
    });
  };

  return (
    <div>
      <Title1>Analytics</Title1>
      <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px' }}>
        <Button onClick={seed}>Seed demo metrics</Button>
        <Button appearance="secondary" onClick={() => clear()}>Clear</Button>
      </div>

      <div className={styles.grid}>
        {agents.filter(a => a.backendType).map((a) => {
          const rows = samples.filter(s => s.agentId === a.id).sort((x, y) => x.ts - y.ts);
          const seriesTokens = rows.map((r, i) => ({ x: i, y: r.tokensUsed }));
          const seriesCtx = rows.map((r, i) => ({ x: i, y: r.maxContext ? (r.currentContext / r.maxContext) * 100 : 0 }));
          return (
            <div key={a.id} className={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <a.Icon />
                <strong>{a.name}</strong>
              </div>
              <AgentPerformanceChart dataTokens={seriesTokens} dataContextUse={seriesCtx} />
              <div style={{ fontSize: 12, color: tokens.colorNeutralForeground2, marginTop: 6 }}>
                Points: {rows.length} · Latest todos: {rows.length ? rows[rows.length - 1].todoCount : 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
