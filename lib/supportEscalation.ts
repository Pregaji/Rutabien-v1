// The defined, visible escalation trigger from CLAUDE.md — support chat must
// not assess document sufficiency or predict outcomes; those route to Ida's
// legal-partner path. Deliberately keyword-based and explicit here, not left
// to agent/AI discretion, and not AI-generated at all (see "No AI for
// roadmap content" — kept consistent for support responses too).

type EscalationReason = "document_sufficiency" | "outcome_prediction" | "other";

const OUTCOME_PREDICTION_PATTERNS = [
  /will (i|my .*) (get|be) (approved|rejected|denied)/i,
  /chances? of (approval|getting approved|success)/i,
  /likely to (be approved|get approved|be rejected)/i,
  /will this (work|succeed)/i,
];

const DOCUMENT_SUFFICIENCY_PATTERNS = [
  /is (this|my) (document|documents|evidence) (enough|sufficient|good enough|ok|okay)/i,
  /(will|does) this document (work|qualify|count)/i,
  /is my case strong enough/i,
];

export function checkEscalation(message: string): { escalate: boolean; reason?: EscalationReason } {
  for (const pattern of OUTCOME_PREDICTION_PATTERNS) {
    if (pattern.test(message)) return { escalate: true, reason: "outcome_prediction" };
  }
  for (const pattern of DOCUMENT_SUFFICIENCY_PATTERNS) {
    if (pattern.test(message)) return { escalate: true, reason: "document_sufficiency" };
  }
  return { escalate: false };
}

export const ESCALATION_REPLY =
  "That's a case-specific question about document sufficiency or your likely outcome — that's outside what platform support can answer, so I've flagged this for Rutabien's legal partner. You can book a consult any time from the Lawyer tab.";

export const OPERATIONAL_FALLBACK_REPLY =
  "Thanks for the message — the team will follow up if this needs more than a quick answer. For document questions or \"where do I find X\", check your Roadmap and Documents tabs first; most answers are there.";
