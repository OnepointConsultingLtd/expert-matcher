import { Session, SessionHistory, SessionStatus } from '../types/session';

export const SESSION_KEY = 'session';
export const SESSION_HISTORY_KEY = 'session_history';

export function saveSession(session: Session) {
  const currentSession = getSession();
  if (currentSession?.id === session.id) {
    session.updatedAt = new Date();
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export function getSessionId(): string | null {
  const session = getSession();
  return session?.id || null;
}

export function deleteSession() {
  const session = getSession();
  if (session) {
    session.status = SessionStatus.COMPLETED;
    let sessionHistory = getSessionHistory();
    if (sessionHistory) {
      // Add session to history
      sessionHistory.sessions.push(session);
    } else {
      // Create new history
      sessionHistory = {
        sessions: [session],
      };
    }
    saveSessionHistory(sessionHistory);
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getSessionHistory(): SessionHistory | null {
  const sessionHistory = localStorage.getItem(SESSION_HISTORY_KEY);
  return sessionHistory ? JSON.parse(sessionHistory) : null;
}

export function saveSessionHistory(sessionHistory: SessionHistory) {
  localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(sessionHistory));
}
