// A narrow, rules-based responder for common navigation/platform questions -
// same "defined trigger in code, not agent discretion" pattern as
// lib/supportEscalation.ts. Deliberately small: only answers questions
// about *finding things in the app*, never document sufficiency or case
// outcomes (checkEscalation always runs first and wins).

type FaqEntry = {
  id: string;
  patterns: RegExp[];
  answer: string;
};

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "roadmap-link",
    patterns: [/roadmap/i, /where.*(steps|checklist)/i],
    answer: "Your roadmap lives under the Roadmap tab in the left-hand menu - it's the full step-by-step list generated from your intake answers.",
  },
  {
    id: "upload-document",
    patterns: [/how.*(upload|add).*(document|file)/i, /upload.*(document|file)/i],
    answer: 'Go to the Documents tab, find the document under its category, and use "Choose file or drop here" on that row. Each file uploads individually.',
  },
  {
    id: "download-document",
    patterns: [/how.*(download|get a copy)/i, /download.*(document|file)/i],
    answer: 'On the Documents tab, use "View / Download" on any uploaded file, or "Download all (zip)" at the top of a person\'s folder. You\'ll need a fresh verification code each time.',
  },
  {
    id: "locked-meaning",
    patterns: [/locked/i, /why.*(can.?t|cannot).*(see|view|open)/i],
    answer: "\"Locked\" means that step is part of the full roadmap, which unlocks once you're on a paid plan. You can see plans from the Roadmap tab.",
  },
  {
    id: "family-member",
    patterns: [/family member/i, /add.*(spouse|child|dependent)/i],
    answer: 'On the Documents tab, scroll to the bottom and use "+ Add a family member" - spouse or child. Each gets their own folder.',
  },
  {
    id: "translation-status",
    patterns: [/translation.*(order|status)/i, /where.*translation/i],
    answer: "Translation order status is under the Translation tab. Documents flagged \"Translation required\" can be sent from there or directly from the Documents tab.",
  },
  {
    id: "account-security",
    patterns: [/2fa|two.factor|account security|change.*(email|security)/i],
    answer: "Account security settings (including two-factor) are under Account in the left-hand menu.",
  },
  {
    id: "sign-out",
    patterns: [/sign out|log ?out/i],
    answer: 'You can sign out from the "Sign out" link at the bottom of the left-hand menu.',
  },
  {
    id: "bienvenido",
    patterns: [/bienvenido|settl(e|ing) in|after.*arriv/i],
    answer: "Post-arrival settling-in guidance is under the Bienvenido tab.",
  },
];

export function matchFaq(message: string): FaqEntry | null {
  for (const entry of FAQ_ENTRIES) {
    if (entry.patterns.some((p) => p.test(message))) return entry;
  }
  return null;
}
