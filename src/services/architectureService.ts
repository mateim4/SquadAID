import { ArchitectureDiagram } from '../types/architecture';

// This is a mock polling function. Replace with real API call to Architect agent.
export async function fetchArchitecture(_projectId: string): Promise<ArchitectureDiagram> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  // Return mock data
  return {
    version: '1.0.0',
    components: [
      { id: 'frontend', label: 'Frontend', type: 'ui', status: 'active' },
      { id: 'backend', label: 'Backend', type: 'api', status: 'active' },
      { id: 'db', label: 'Database', type: 'db', status: 'active' }
    ],
    connections: [
      { from: 'frontend', to: 'backend', label: 'API Call', active: true },
      { from: 'backend', to: 'db', label: 'DB Query', active: true }
    ],
    mermaid: `graph TD;\nfrontend[Frontend]-->backend[Backend];\nbackend-->db[Database];`,
    lastUpdated: new Date().toISOString()
  };
}
