import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Title1, Title3, Input, Button, Label, makeStyles, shorthands, tokens, Text, Divider, Toast, ToastTitle, Toaster, useId, useToastController, Dropdown, Option } from '@fluentui/react-components';
import { checkSurrealHealth, createWorkflow, getSecret, setSecret, upsertProject } from '@/services/surreal';
import { getUser, hasGitHubToken } from '@/services/github';
import GitHubSignIn from '@/components/auth/GitHubSignIn';
import { beginGoogleDeviceFlow, pollGoogleDeviceToken, hasGoogleAuth, getGoogleUserInfo } from '@/services/google';
import { useStyles as useGlobalStyles } from '@/styles/useStyles';
import { Checkmark24Regular, ErrorCircle24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gridColumn: '2 / 3',
    width: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
  },
  card: {
    // inner padding layer inside the canvas-like container
    display: 'flex',
    flexDirection: 'column',
  // Match Projects page card padding
  ...shorthands.padding('8px'),
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  flexWrap: 'nowrap',
    ...shorthands.gap('8px'),
  // Keep minimal space like Projects (inputs start right after top padding)
  ...shorthands.padding(0),
  },
  scrollArea: {
  overflowY: 'auto',
  // Fill remaining space in the card below the header
  flex: '1 1 auto',
  minHeight: 0,
  overscrollBehavior: 'contain',
  WebkitOverflowScrolling: 'touch',
  // Reserve space for the vertical scrollbar so left/right padding look equal
  scrollbarGutter: 'stable both-edges',
  },
  grid: {
    display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  ...shorthands.gap('clamp(10px, 2vw, 16px)'),
  // Internal gutters only
  paddingInline: 0,
  // Ensure sections pack to the top instead of distributing across the full height
  alignContent: 'start',
  placeContent: 'start',
  placeItems: 'start',
  height: 'max-content',
  alignItems: 'start',
  justifyContent: 'start',
  // small top margin below the divider for visual separation
  marginTop: 'clamp(10px, 2vh, 20px)',
  },
  sectionCard: {
    display: 'flex',
    flexDirection: 'column',
  ...shorthands.gap('clamp(8px, 1.6vw, 12px)'),
  // Outline only; no fill for sub-cards
  backgroundColor: 'transparent',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  ...shorthands.padding('clamp(10px, 1.6vw, 16px)'),
  },
  inlineRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
  },
  result: {
    fontFamily: tokens.fontFamilyMonospace,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: '40px',
    whiteSpace: 'pre-wrap',
  },
});

function SettingsPage() {
  const styles = useStyles();
  const global = useGlobalStyles();
  
  // Toast notifications
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);
  
  // Diagnostics
  const [dbStatusMsg, setDbStatusMsg] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [greetMsg, setGreetMsg] = useState<string>('');

  // GitHub
  const [ghToken, setGhToken] = useState<string>('');
  const [ghStatus, setGhStatus] = useState<string>('');
  const [ghAuthed, setGhAuthed] = useState<boolean>(false);

  // Google
  const [gAuthInProgress, setGAuthInProgress] = useState<boolean>(false);
  const [googleToken, setGoogleToken] = useState<string>('');
  const [googleStatus, setGoogleStatus] = useState<string>('');
  const [gAuthed, setGAuthed] = useState<boolean>(false);

  // Claude
  const [claudeToken, setClaudeToken] = useState<string>('');
  const [claudeStatus, setClaudeStatus] = useState<string>('');

  // Jules
  const [julesToken, setJulesToken] = useState<string>('');
  const [julesStatus, setJulesStatus] = useState<string>('');

  // Gemini
  const [geminiModel, setGeminiModel] = useState<string>('gemini-1.5-pro');
  const [geminiStatus, setGeminiStatus] = useState<string>('');

  // Load initial statuses
  useEffect(() => {
    (async () => {
      try {
        const ghHas = await hasGitHubToken();
        setGhAuthed(!!ghHas);
        if (ghHas) {
          try {
            const u = await getUser();
            setGhStatus(`Connected as ${u.login}`);
          } catch {
            setGhStatus('GitHub token present');
          }
        } else {
          setGhStatus('Not connected');
        }
      } catch {
        setGhStatus('GitHub status unavailable');
      }

      try {
        const gHas = await hasGoogleAuth();
        setGAuthed(!!gHas);
        if (gHas) {
          try {
            const me = await getGoogleUserInfo();
            setGoogleStatus(`Connected as ${me.email || me.name || 'Google user'}`);
          } catch {
            setGoogleStatus('Google token present');
          }
        } else {
          setGoogleStatus('Not connected');
        }
      } catch {
        setGoogleStatus('Google status unavailable');
      }

      // Load stored tokens into inputs
      try { const r = await getSecret('github_token'); if ((r.result?.[0]?.value)) setGhToken(r.result[0].value as string); } catch {}
      try { const r = await getSecret('google_token'); if ((r.result?.[0]?.value)) setGoogleToken(r.result[0].value as string); } catch {}
      try { const r = await getSecret('claude_token'); if ((r.result?.[0]?.value)) setClaudeToken(r.result[0].value as string); } catch {}
      try { const r = await getSecret('jules_token'); if ((r.result?.[0]?.value)) setJulesToken(r.result[0].value as string); } catch {}
      try { const r = await getSecret('gemini_model'); if ((r.result?.[0]?.value)) setGeminiModel(r.result[0].value as string); } catch {}
    })();
  }, []);

  const handleDbInit = async () => {
    const ok = await checkSurrealHealth();
    setDbStatusMsg(ok ? 'Database reachable ✅' : 'Database offline or unreachable ❌');
  };

  const handleSaveWorkflow = async () => {
    try {
      // Ensure a demo project exists, then create a tiny workflow for validation
      await upsertProject('settings-demo', { name: 'Settings Demo', description: 'Autocreated by Settings diagnostics' });
      await createWorkflow('settings-demo', 'Sample Workflow', 'Created from Settings page');
      setDbStatusMsg('Saved sample workflow to project: settings-demo');
    } catch (e: any) {
      setDbStatusMsg(`Failed to save workflow: ${e?.message || String(e)}`);
    }
  };

  const performGreet = async () => {
    try {
      const msg = await invoke<string>('greet', { name: name || 'friend' });
      setGreetMsg(msg || '');
    } catch (e: any) {
      setGreetMsg(`IPC failed: ${e?.message || String(e)}`);
    }
  };

  return (
    <div className={styles.page}>
      <Toaster toasterId={toasterId} />
      <div className={global.canvas}>
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <Title1>Settings</Title1>
            <Text style={{ color: tokens.colorNeutralForeground2 }}>Configure integrations and run quick diagnostics.</Text>
          </div>
          <div className={styles.scrollArea}>
            <div className={styles.grid}>
            {/* Diagnostics */}
            <section className={styles.sectionCard} aria-label="Diagnostics">
              <Title3>Diagnostics</Title3>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Run basic checks against the local backend.</Text>
              <div className={styles.inlineRow}>
                <Button onClick={handleDbInit}>Initialize Database</Button>
                <Button data-appearance="primary" appearance="primary" onClick={handleSaveWorkflow}>Save Sample Workflow</Button>
              </div>
              <Label>Database Status</Label>
              <div className={styles.result}><Text>{dbStatusMsg}</Text></div>

              <Divider />
              <Label htmlFor="name-input">IPC Test</Label>
              <div className={styles.inlineRow}>
                <Input id="name-input" value={name} onChange={(_e, data) => setName(data.value)} placeholder="Your name" />
                <Button onClick={performGreet}>Greet from Rust</Button>
              </div>
              <div className={styles.result}><Text>{greetMsg}</Text></div>
            </section>

            {/* GitHub */}
            <section className={styles.sectionCard} aria-label="GitHub">
              <Title3>GitHub</Title3>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Sign in to access repos and enable Hybrid/GitHub projects.</Text>
              <GitHubSignIn
                onAuthSuccess={(u) => { setGhAuthed(true); setGhStatus(`Connected as ${u.login}`); }}
                onAuthFailure={(err) => setGhStatus(`Auth failed: ${err?.message || String(err)}`)}
              />
              <Text size={200}>{ghStatus}</Text>
              <Divider />
              <Label>Personal Access Token (fallback)</Label>
              <Input value={ghToken} onChange={(_e, d) => setGhToken(d.value)} placeholder="ghp_..." type="password" />
              <div className={styles.inlineRow}>
                <Button data-appearance="primary" appearance="primary" onClick={async () => { 
                  try {
                    await setSecret('github_token', ghToken); 
                    try { localStorage.setItem('github_token', ghToken); } catch {};
                    setGhStatus('Saved ✓'); 
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<Checkmark24Regular />}>GitHub token saved successfully</ToastTitle>
                      </Toast>,
                      { intent: 'success', timeout: 3000 }
                    );
                  } catch (err: any) {
                    setGhStatus('Failed to save');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<ErrorCircle24Regular />}>Failed to save GitHub token</ToastTitle>
                      </Toast>,
                      { intent: 'error', timeout: 5000 }
                    );
                  }
                }}>Save</Button>
                <Button onClick={async () => { try { const u = await getUser(); setGhStatus(`Connected as ${u.login}`); } catch (err: any) { setGhStatus(`Connection failed: ${err?.message || String(err)}`); } }}>Test</Button>
              </div>
            </section>

            {/* Google */}
            <section className={styles.sectionCard} aria-label="Google">
              <Title3>Google</Title3>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Optional. Used for notifications and storage links.</Text>
              <div className={styles.inlineRow}>
                <Button data-appearance="primary" appearance="primary" disabled={gAuthInProgress} onClick={async () => {
                  setGAuthInProgress(true);
                  try {
                    const dc = await beginGoogleDeviceFlow();
                    try { window.open(dc.verification_url, '_blank'); } catch {}
                    setGoogleStatus(`Enter code ${dc.user_code} at ${dc.verification_url}`);
                    await pollGoogleDeviceToken(dc.device_code, dc.interval || 5);
                    setGAuthed(true);
                    try { const me = await getGoogleUserInfo(); setGoogleStatus(`Connected as ${me.email || me.name || 'Google user'}`); } catch {}
                  } catch (e: any) {
                    setGoogleStatus(e?.message || 'Google auth failed');
                  } finally { setGAuthInProgress(false); }
                }}>Sign in with Google</Button>
                <Button appearance="secondary" onClick={async () => { try { const { signOutGoogle } = await import('@/services/google'); await signOutGoogle(); setGAuthed(false); setGoogleStatus('Signed out'); } catch {} }}>Sign out</Button>
                <Button onClick={async () => { try { const me = await getGoogleUserInfo(); setGoogleStatus(`You are ${me.email || me.name}`); } catch (e: any) { setGoogleStatus(`Failed: ${e?.message || String(e)}`); } }}>Test</Button>
              </div>
              <Text size={200}>{googleStatus}</Text>
              <Divider />
              <Label>Google Token (fallback)</Label>
              <div className={styles.inlineRow}>
                <Input value={googleToken} onChange={(_e, d) => setGoogleToken(d.value)} placeholder="OAuth token or API key" type="password" />
                <Button data-appearance="primary" appearance="primary" onClick={async () => { 
                  try {
                    await setSecret('google_token', googleToken); 
                    setGoogleStatus('Saved ✓');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<Checkmark24Regular />}>Google token saved successfully</ToastTitle>
                      </Toast>,
                      { intent: 'success', timeout: 3000 }
                    );
                  } catch (err: any) {
                    setGoogleStatus('Failed to save');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<ErrorCircle24Regular />}>Failed to save Google token</ToastTitle>
                      </Toast>,
                      { intent: 'error', timeout: 5000 }
                    );
                  }
                }}>Save</Button>
              </div>
            </section>

            {/* Claude */}
            <section className={styles.sectionCard} aria-label="Claude">
              <Title3>Claude Code</Title3>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Paste the API token if you plan to use Claude-based features.</Text>
              <div className={styles.inlineRow}>
                <Input value={claudeToken} onChange={(_e, d) => setClaudeToken(d.value)} placeholder="Claude API token" type="password" />
                <Button data-appearance="primary" appearance="primary" onClick={async () => { 
                  try {
                    await setSecret('claude_token', claudeToken); 
                    setClaudeStatus('Saved ✓');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<Checkmark24Regular />}>Claude API token saved successfully</ToastTitle>
                      </Toast>,
                      { intent: 'success', timeout: 3000 }
                    );
                  } catch (err: any) {
                    setClaudeStatus('Failed to save');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<ErrorCircle24Regular />}>Failed to save Claude token</ToastTitle>
                      </Toast>,
                      { intent: 'error', timeout: 5000 }
                    );
                  }
                }}>Save</Button>
              </div>
              <Text size={200}>{claudeStatus}</Text>
            </section>

            {/* Jules */}
            <section className={styles.sectionCard} aria-label="Jules">
              <Title3>Jules AI</Title3>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Enter your Jules API key to enable Jules-powered agents.</Text>
              <div className={styles.inlineRow}>
                <Input value={julesToken} onChange={(_e, d) => setJulesToken(d.value)} placeholder="Jules API key" type="password" />
                <Button data-appearance="primary" appearance="primary" onClick={async () => { 
                  try {
                    console.log('Saving Jules token:', julesToken ? 'token present' : 'empty');
                    await setSecret('jules_token', julesToken || ''); 
                    setJulesStatus(julesToken ? 'Saved ✓' : 'Cleared ✓');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<Checkmark24Regular />}>
                          {julesToken ? 'Jules API key saved successfully' : 'Jules API key cleared'}
                        </ToastTitle>
                      </Toast>,
                      { intent: 'success', timeout: 3000 }
                    );
                  } catch (err: any) {
                    console.error('Failed to save Jules token:', err);
                    setJulesStatus(`Failed: ${err?.message || 'Unknown error'}`);
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<ErrorCircle24Regular />}>
                          Failed to save Jules API key: {err?.message || 'Unknown error'}
                        </ToastTitle>
                      </Toast>,
                      { intent: 'error', timeout: 5000 }
                    );
                  }
                }}>Save</Button>
              </div>
              <Text size={200}>{julesStatus}</Text>
            </section>

            {/* Gemini */}
            <section className={styles.sectionCard} aria-label="Gemini">
              <Title3>Gemini CLI Agent</Title3>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Configure the local Gemini CLI wrapper.</Text>
              <Label>Select Model</Label>
              <div className={styles.inlineRow}>
                <Dropdown
                  aria-labelledby="gemini-model"
                  placeholder="Select a model"
                  value={geminiModel}
                  onOptionSelect={(_e, data) => setGeminiModel(data.optionValue as string)}
                >
                  <Option value="gemini-3-pro">Gemini 3 Pro (Preview)</Option>
                  <Option value="gemini-2.5-pro">Gemini 2.5 Pro</Option>
                  <Option value="gemini-2.5-flash">Gemini 2.5 Flash</Option>
                  <Option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</Option>
                  <Option value="gemini-2.0-flash">Gemini 2.0 Flash</Option>
                  <Option value="gemini-1.5-pro">Gemini 1.5 Pro</Option>
                </Dropdown>
                <Button data-appearance="primary" appearance="primary" onClick={async () => {
                  try {
                    await setSecret('gemini_model', geminiModel);
                    setGeminiStatus('Saved ✓');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<Checkmark24Regular />}>Gemini model saved successfully</ToastTitle>
                      </Toast>,
                      { intent: 'success', timeout: 3000 }
                    );
                  } catch (err: any) {
                    setGeminiStatus('Failed to save');
                    dispatchToast(
                      <Toast>
                        <ToastTitle media={<ErrorCircle24Regular />}>Failed to save Gemini model</ToastTitle>
                      </Toast>,
                      { intent: 'error', timeout: 5000 }
                    );
                  }
                }}>Save</Button>
              </div>
              <Text size={200}>{geminiStatus}</Text>
            </section>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default SettingsPage;