import { API_BASE_URL } from "./api";

export function createRealtimeSocket(role: "customer" | "barber" | "admin", subjectId: string) {
  const url = new URL(API_BASE_URL);
  const wsOrigin = url.origin.replace(/^http/, "ws");
  const apiPath = url.pathname.replace(/\/$/, "");
  return new WebSocket(`${wsOrigin}${apiPath}/realtime/ws/${role}/${subjectId}`);
}
