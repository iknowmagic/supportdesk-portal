const DEMO_AUTO_LOGIN_KEY = 'inboxhq:demo-auto-login';

export const getDemoAutoLoginEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_AUTO_LOGIN_KEY) === 'true';
};

export const setDemoAutoLoginEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_AUTO_LOGIN_KEY, enabled ? 'true' : 'false');
};

export { DEMO_AUTO_LOGIN_KEY };
