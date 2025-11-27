// Jules Bridge: use GitHub Issues as the communication channel
// Outgoing: post a comment
// Incoming: poll recent comments and filter by a configured Jules actor username
import { addIssueComment, getIssueComments, createIssue } from '@/services/github';

export type JulesSession = {
  repo: string; // owner/name
  issueNumber?: number; // existing session thread, optional
  julesActor?: string; // e.g., 'google-jules-bot' (configurable)
};

export async function ensureSessionIssue(session: JulesSession, title?: string, body?: string): Promise<number> {
  if (session.issueNumber) return session.issueNumber;
  const t = title || 'Jules Session';
  const b = body || 'This issue will serve as a bi-directional channel between Jules and SquadAID.';
  const res = await createIssue(session.repo, t, b, ['jules']);
  return res?.number as number;
}

export async function sendMessage(session: JulesSession, message: string, opts?: { createIfMissing?: boolean; title?: string; body?: string; }) {
  let issueNumber = session.issueNumber;
  if (!issueNumber && opts?.createIfMissing) {
    issueNumber = await ensureSessionIssue(session, opts.title, opts.body);
  }
  if (!issueNumber) throw new Error('No issueNumber in session');
  await addIssueComment(session.repo, issueNumber, message);
  return issueNumber;
}

export type JulesMessage = { id: number; author: string; body: string; created_at: string };

export async function fetchNewMessages(session: JulesSession, sinceId?: number): Promise<JulesMessage[]> {
  if (!session.issueNumber) return [];
  const cs = await getIssueComments(session.repo, session.issueNumber);
  const filtered = (cs || [])
    .filter((c: any) => (sinceId ? c.id > sinceId : true))
    .map((c: any) => ({ id: c.id, author: c.user?.login || 'unknown', body: c.body || '', created_at: c.created_at }));
  // If a specific Jules actor is provided, filter to that; else return all
  const actor = (session.julesActor || '').trim();
  return actor ? filtered.filter((m: JulesMessage) => m.author.toLowerCase() === actor.toLowerCase()) : filtered;
}

export async function runWorkflowForTask(taskId: string, workflowId: string): Promise<void> {
  // This is a placeholder for the web-based fallback.
  // In a real scenario, this would likely hit a cloud function or a dedicated backend
  // that has the credentials to run the workflow.
  console.log(`[Web Fallback] Running workflow ${workflowId} for task ${taskId}.`);
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log(`[Web Fallback] Workflow ${workflowId} for task ${taskId} finished.`);
}
