import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  Title1,
  Input,
  Button,
  Label,
  makeStyles,
  shorthands,
  tokens,
  Text,
  Divider,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalL),
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    maxWidth: '400px',
  },
  result: {
    fontFamily: tokens.fontFamilyMonospace,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: '40px',
    whiteSpace: 'pre-wrap', // Ensure error messages wrap
  },
});

function SettingsPage() {
  const styles = useStyles();
  const [name, setName] = useState('');
  const [greetMsg, setGreetMsg] = useState('');
  const [dbStatusMsg, setDbStatusMsg] = useState('');

  const performGreet = async () => {
    if (!name) return;
    try {
      const message = await invoke<string>('greet', { name });
      setGreetMsg(message);
    } catch (error) {
      console.error("Failed to invoke 'greet' command:", error);
      setGreetMsg(`Error: ${error}`);
    }
  };

  /**
   * Calls the `db_init` command on the Rust backend.
   *
   * @description This function demonstrates handling a command that returns a Result<(), String>.
   * If the Rust function returns `Ok`, the `invoke` Promise resolves.
   * If the Rust function returns `Err`, the Promise rejects, and the error is caught
   * in the `catch` block, allowing us to display a meaningful status to the user.
   */
  const handleDbInit = async () => {
    try {
      await invoke('db_init');
      setDbStatusMsg('Database initialized successfully. "workflows" table is present.');
    } catch (error) {
      console.error("Failed to invoke 'db_init' command:", error);
      setDbStatusMsg(`Error initializing database: ${error}`);
    }
  };

  /**
   * Calls the `save_workflow` command with a sample payload.
   */
  const handleSaveWorkflow = async () => {
    const sampleWorkflow = {
      nodes: [{ id: '1', data: { label: 'Test Node' } }],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    try {
      await invoke('save_workflow', {
        id: 1, // The ID of the workflow to save
        graphStateJson: JSON.stringify(sampleWorkflow),
      });
      setDbStatusMsg('Sample workflow with ID=1 saved successfully.');
    } catch (error) {
      console.error("Failed to invoke 'save_workflow' command:", error);
      setDbStatusMsg(`Error saving workflow: ${error}`);
    }
  };

  return (
    <div className={styles.container}>
      <Title1>Settings</Title1>

      <section className={styles.section}>
        <Title1 as="h2">Database Service Test</Title1>
        <Text>
          Use these buttons to test the backend database commands.
        </Text>
        <Button onClick={handleDbInit}>Initialize Database</Button>
        <Button appearance="primary" onClick={handleSaveWorkflow}>
          Save Sample Workflow (ID=1)
        </Button>
        <Label>Database Status:</Label>
        <div className={styles.result}>
          <Text>{dbStatusMsg}</Text>
        </div>
      </section>

      <Divider />

      <section className={styles.section}>
        <Title1 as="h2">IPC Bridge Test</Title1>
        <Label htmlFor="name-input">Enter your name:</Label>
        <Input
          id="name-input"
          value={name}
          onChange={(_e, data) => setName(data.value)}
          placeholder="e.g., Jane Doe"
        />
        <Button onClick={performGreet}>Greet from Rust</Button>
        <Label>Response from Backend:</Label>
        <div className={styles.result}>
          <Text>{greetMsg}</Text>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;