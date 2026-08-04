export const COOKIE_CONSENT_CONTENT = {
  title: 'Allow Cookies And IndexedDB',
  body:
    'Personal Diary Local-First App requires cookies and IndexedDB before it can run.',
  detail:
    'Cookies remember this permission. IndexedDB keeps your diary data in this browser. JSON export creates a local file that you control.',
  requiredNotice:
    'If you do not allow cookies and IndexedDB, this page will close.',
  acceptLabel: 'Allow',
  rejectLabel: 'Do Not Allow',
} as const;
