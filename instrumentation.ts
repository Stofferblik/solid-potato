// Node.js 22 injecteert soms een globale `localStorage` via --localstorage-file,
// maar als het bestandspad ongeldig is, bestaat localStorage wel als object
// maar werkt getItem/setItem niet. Dit crasht de Next.js dev overlay.
// We patchen het hier vroeg in de lifecycle.
export async function register() {
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof globalThis.localStorage?.getItem !== "function"
  ) {
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      },
      writable: true,
      configurable: true,
    });
  }

  if (
    typeof globalThis.sessionStorage !== "undefined" &&
    typeof globalThis.sessionStorage?.getItem !== "function"
  ) {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      },
      writable: true,
      configurable: true,
    });
  }
}
