// Bridge between the axios interceptor (outside React) and a global React modal.
// When the API returns a token/auth error (401), the interceptor calls
// triggerSessionExpired() and the mounted <SessionExpiredModal/> reacts.

type Listener = () => void;

let listeners: Listener[] = [];
let triggered = false;

export const onSessionExpired = (fn: Listener): (() => void) => {
  listeners.push(fn);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
};

export const triggerSessionExpired = (): void => {
  // Guard so parallel failing requests only raise a single popup.
  if (triggered) return;
  triggered = true;
  listeners.forEach((l) => l());
};

export const resetSessionExpired = (): void => {
  triggered = false;
};
