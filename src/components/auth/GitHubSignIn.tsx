import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Caption1, Input, Label, Spinner, Tooltip, tokens } from '@fluentui/react-components';
import { beginDeviceFlow, getUser, hasGitHubToken, pollDeviceToken } from '@/services/github';
import { useStyles } from '@/styles/useStyles';

type Props = {
  onAuthStarted?: () => void;
  onAuthSuccess?: (user: any) => void;
  onAuthFailure?: (error: any) => void;
  compact?: boolean;
};

export default function GitHubSignIn({ onAuthStarted, onAuthSuccess, onAuthFailure, compact }: Props) {
  const styles = useStyles();
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);
  const [msg, setMsg] = useState('');
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [verifyUrl, setVerifyUrl] = useState<string>('');
  const [remaining, setRemaining] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const clientIdPresent = useMemo(() => !!(import.meta as any).env?.VITE_GITHUB_CLIENT_ID, []);

  useEffect(() => {
    (async () => {
      const ok = await hasGitHubToken().catch(() => false);
      setHasToken(ok);
      if (ok) {
    try { const u = await getUser(); setMsg(`Connected as ${u.login}`); } catch (e) { void e; }
      }
    })();
  return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  const startAuth = async () => {
    if (!clientIdPresent) {
      setMsg('Missing VITE_GITHUB_CLIENT_ID. See README → GitHub Device Flow setup and set it in .env.local, then restart dev server.');
      return;
    }
    onAuthStarted?.();
    setIsAuthInProgress(true);
    setMsg('');
    try {
      const dc = await beginDeviceFlow();
      const url = dc.verification_uri_complete || dc.verification_uri;
      setCode(dc.user_code);
      setVerifyUrl(url);
      setRemaining(dc.expires_in || 600);
  try { window.open(url, '_blank'); } catch (e) { void e; }
  try { await navigator.clipboard.writeText(dc.user_code); setMsg('Code copied to clipboard. Complete in your browser.'); } catch (e) { void e; }
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRemaining((r) => (r > 0 ? r - 1 : 0));
      }, 1000) as unknown as number;
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      await pollDeviceToken(dc.device_code, clientId);
      setHasToken(true);
      try { const u = await getUser(); setMsg(`Connected as ${u.login}`); onAuthSuccess?.(u); } catch (e) { void e; }
    } catch (e: any) {
      setMsg(e?.message || 'GitHub auth failed');
      onAuthFailure?.(e);
    } finally {
      setIsAuthInProgress(false);
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button data-appearance="primary" appearance="primary" disabled={isAuthInProgress} onClick={startAuth}>
          {isAuthInProgress ? 'Waiting…' : (hasToken ? 'Re-link GitHub' : 'Sign in with GitHub')}
        </Button>
        {isAuthInProgress && <Spinner size="tiny" />}
        {msg && <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{msg}</Caption1>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button data-appearance="primary" appearance="primary" disabled={isAuthInProgress} onClick={startAuth}>
          {isAuthInProgress ? 'Waiting…' : (hasToken ? 'Re-link GitHub' : 'Sign in with GitHub')}
        </Button>
        {isAuthInProgress && <Spinner size="tiny" />}
        {msg && <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>{msg}</Caption1>}
      </div>
      {!clientIdPresent && (
        <Caption1 style={{ color: tokens.colorPaletteRedForeground1 }}>
          Missing VITE_GITHUB_CLIENT_ID. Add it to .env.local and restart dev.
        </Caption1>
      )}
      {code && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Label>Code</Label>
          <Input 
            className={styles.frostedInput}
            value={code} 
            readOnly 
            style={{ maxWidth: 180 }}
            aria-label="Device authorization code"
          />
          <Tooltip content="Open verification page" relationship="label">
            <Button size="small" appearance="secondary" onClick={() => { try { window.open(verifyUrl, '_blank'); } catch (e) { void e; } }}>Open</Button>
          </Tooltip>
          <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
            {remaining > 0 ? `Expires in ${Math.floor(remaining / 60)}m ${remaining % 60}s` : 'Expired' }
          </Caption1>
        </div>
      )}
    </div>
  );
}
