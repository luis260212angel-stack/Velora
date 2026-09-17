const VISITOR_KEY = "velora-visitor";
const CART_KEY = "velora-cart-id";
const VISIT_MARK = "velora-visit-session";

function readOrCreate(storageKey: string) {
  if (typeof window === "undefined") return "";
  let value = localStorage.getItem(storageKey);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(storageKey, value);
  }
  return value;
}

export function getVisitorKey() {
  return readOrCreate(VISITOR_KEY);
}

export function getCartKey() {
  return readOrCreate(CART_KEY);
}

export function markSessionVisit() {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(VISIT_MARK)) return false;
  sessionStorage.setItem(VISIT_MARK, "1");
  return true;
}
