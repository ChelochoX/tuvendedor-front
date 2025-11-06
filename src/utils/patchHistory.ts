/**
 * patchHistory.ts
 * ----------------
 * Intercepta las llamadas de React Router (pushState, replaceState)
 * y emite eventos personalizados como "locationchange".
 * Esto permite al contexto de usuario detectar cambios de ruta.
 */

(() => {
  // Guardamos las funciones originales
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  // Interceptamos pushState
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
    return result;
  };

  // Interceptamos replaceState
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));
    return result;
  };

  // Detecta navegación con los botones “atrás” y “adelante” del navegador
  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
})();
