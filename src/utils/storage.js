const isBrowser = typeof window !== 'undefined' && window?.localStorage;

export const loadState = (key, fallback) => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('loadState error', error);
    return fallback;
  }
};

export const saveState = (key, value) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('saveState error', error);
  }
};
