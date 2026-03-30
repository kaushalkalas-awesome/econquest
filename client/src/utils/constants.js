/** App-wide constants and labels */

// export const API_URL = import.meta.env.VITE_API_URL;
export const API_URL = 'https://econquest-production.up.railway.app';

export const CATEGORY_LABELS = {
  ALL: 'All',
  MICROECONOMICS: '🏪 Microeconomics',
  MACROECONOMICS: '🏛️ Macroeconomics',
  PERSONAL_FINANCE: '💰 Personal Finance',
  BEHAVIORAL_ECONOMICS: '🧠 Behavioral Economics',
};

export const CATEGORY_ORDER = [
  'MICROECONOMICS',
  'MACROECONOMICS',
  'PERSONAL_FINANCE',
  'BEHAVIORAL_ECONOMICS',
];

export const AVATAR_OPTIONS = ['🧑‍💼', '👩‍💼', '🧑‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻'];

export const START_PATHS = [
  { key: 'MICROECONOMICS', label: '🏪 Microeconomics' },
  { key: 'MACROECONOMICS', label: '🏛️ Macroeconomics' },
  { key: 'PERSONAL_FINANCE', label: '💰 Personal Finance' },
  { key: 'BEHAVIORAL_ECONOMICS', label: '🧠 Behavioral Economics' },
];
