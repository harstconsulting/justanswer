import { EventEmitter } from "events";

const emitter = new EventEmitter();

export function publishCaseMessage(caseId: string, payload: unknown) {
  emitter.emit(`case:${caseId}`, payload);
}

export function subscribeCaseMessages(caseId: string, listener: (payload: unknown) => void) {
  const key = `case:${caseId}`;
  emitter.on(key, listener);
  return () => emitter.off(key, listener);
}
