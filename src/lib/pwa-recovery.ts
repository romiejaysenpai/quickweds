export const PWA_AUTO_RECOVERY_KEY = 'quickweds-pwa-auto-recovery';

export function clearPwaAutoRecoveryGuard() {
  try {
    window.sessionStorage.removeItem(PWA_AUTO_RECOVERY_KEY);
  } catch {
    // Storage can be unavailable in restrictive browser modes.
  }
}
