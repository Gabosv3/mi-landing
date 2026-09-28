const REF_KEY = "bm_ref";

export function captureReferral() {
  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem(REF_KEY, ref);
  } catch {
    // localStorage no disponible (modo privado, etc.) -> se ignora
  }
}

export function getReferral() {
  try {
    return localStorage.getItem(REF_KEY) || null;
  } catch {
    return null;
  }
}
