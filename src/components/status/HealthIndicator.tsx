import React, { useEffect, useState } from 'react';
import { Tooltip, tokens } from '@fluentui/react-components';
import { apiService } from '@/services/api';
import { checkSurrealHealth } from '@/services/surreal';

export const HealthIndicator: React.FC = () => {
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [dbOk, setDbOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      const [api, db] = await Promise.all([
        apiService.checkHealth(),
        checkSurrealHealth(),
      ]);
      if (!mounted) return;
      setApiOk(api);
      setDbOk(db);
    };
    poll();
    const id = setInterval(poll, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const dot = (ok: boolean | null, label: string, colorOk: string, colorBad: string) => (
    <Tooltip content={`${label}: ${ok === null ? 'checking…' : ok ? 'online' : 'offline'}`} relationship="description">
      <span style={{
        display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
        background: ok === null ? tokens.colorNeutralForeground2 : ok ? colorOk : colorBad,
        boxShadow: `0 0 0 2px ${tokens.colorNeutralBackground3}`,
      }} />
    </Tooltip>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {dot(apiOk, 'API', tokens.colorPaletteGreenBackground3, tokens.colorPaletteRedBackground3)}
      {dot(dbOk, 'DB', tokens.colorPaletteGreenBackground3, tokens.colorPaletteRedBackground3)}
    </div>
  );
};

export default HealthIndicator;
