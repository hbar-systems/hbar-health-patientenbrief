/**
 * brain-app bridge client — talks to the brain host shell via postMessage.
 *
 * Medikationsabgleich runs its diff deterministically client-side. The ONLY use
 * of the model is the optional "Plan aus Text einlesen" convenience, which asks
 * the brain to turn a pasted free-text medication plan into structured rows. If
 * the app is not embedded in a brain (or no model is available), that button is
 * disabled and the doctor enters rows manually — the core value never depends on
 * the model.
 *
 * Contract (brain-app/v1, llm.complete intent):
 *   iframe -> host:  { type:'llm.complete', request_id, payload:{ messages } }
 *   host -> iframe:  { type:'reply', request_id, ok, result?, error? }
 */

export interface BridgeMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmResult {
  text: string;
  model: string;
  sources: string[];
}

const REPLY_TIMEOUT_MS = 120_000;

let counter = 0;
function nextRequestId(): string {
  counter += 1;
  return `medabgleich-${Date.now()}-${counter}`;
}

/** True when the app runs embedded inside a brain (not standalone dev/preview). */
export function inBrain(): boolean {
  return typeof window !== "undefined" && window.parent !== window;
}

/**
 * Ask the host brain to generate a completion. Rejects with an Error whose
 * message is the bridge error code (not_in_brain | permission_denied
 * | missing_messages | permit_failed | llm_complete_failed
 * | llm_complete_network_error | llm_complete_timeout).
 */
export function llmComplete(messages: BridgeMessage[]): Promise<LlmResult> {
  return new Promise((resolve, reject) => {
    if (!inBrain()) {
      reject(new Error("not_in_brain"));
      return;
    }

    const request_id = nextRequestId();
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener("message", onReply);
      fn();
    };

    const timer = setTimeout(
      () => finish(() => reject(new Error("llm_complete_timeout"))),
      REPLY_TIMEOUT_MS
    );

    function onReply(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type !== "reply" || msg.request_id !== request_id) return;
      finish(() => {
        if (msg.ok && msg.result) {
          resolve({
            text: String(msg.result.text || ""),
            model: String(msg.result.model || ""),
            sources: Array.isArray(msg.result.sources) ? msg.result.sources : [],
          });
        } else {
          const code = (msg.error && msg.error.code) || "llm_complete_failed";
          reject(new Error(String(code)));
        }
      });
    }

    window.addEventListener("message", onReply);
    window.parent.postMessage(
      { type: "llm.complete", request_id, payload: { messages } },
      "*"
    );
  });
}
