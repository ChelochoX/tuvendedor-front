const VISITOR_ID_KEY = "tuvendedor_visitor_id";

export function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}