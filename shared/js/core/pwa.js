export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const url = new URL('../../../service-worker.js', import.meta.url);
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(url.href).catch((err) => {
      console.warn('Service Worker не зарегистрирован:', err);
    });
  });
}
