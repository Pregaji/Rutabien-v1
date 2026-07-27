import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "@/db";
import { requirements, countryProfiles } from "@/db/schema";

// SLF (accompanying family member) document types - global, not per
// nationality, since they're set by Spanish immigration law (Article
// 53.b) rather than authored per country. Sourced from Spain's own
// consulate guidance (San Francisco, Chicago) plus independent legal
// sources, per the architecture correction in MVP_Draft.md. nationality
// is intentionally omitted (null) - these rows apply to every nationality.
// signedOff stays false - do not publish as final without Ida's explicit
// sign-off (see CLAUDE.md).
const slfRows = [
  {
    documentName: "Marriage certificate",
    appliesTo: "spouse" as const,
    sortOrder: 1,
    translationRequired: true,
    notarizationRequired: false,
    phase: "Before you fly",
  },
  {
    documentName: "Birth certificate (child)",
    appliesTo: "child" as const,
    sortOrder: 2,
    translationRequired: true,
    notarizationRequired: false,
    phase: "Before you fly",
  },
  {
    documentName: "Notarized guardian authorization",
    appliesTo: "child" as const,
    sortOrder: 3,
    translationRequired: true,
    notarizationRequired: true,
    phase: "Before you fly",
    description: "Required when a minor is traveling with only one parent - authorizes travel/residence on behalf of the non-traveling parent or legal guardian.",
    conditions: [
      { field: "travelingWithOneParent", operator: "eq", value: true, effect: "require" },
    ],
  },
  {
    documentName: "Criminal record check",
    appliesTo: "spouse" as const,
    sortOrder: 4,
    translationRequired: true,
    notarizationRequired: false,
    validityWindowDays: 90,
    phase: "Before you fly",
    description: "Required for accompanying family members aged 18 and over.",
  },
  {
    documentName: "Medical certificate",
    appliesTo: "spouse" as const,
    sortOrder: 5,
    translationRequired: true,
    validityWindowDays: 90,
    phase: "Before you fly",
  },
  {
    documentName: "Medical certificate (child)",
    appliesTo: "child" as const,
    sortOrder: 5,
    translationRequired: true,
    validityWindowDays: 90,
    phase: "Before you fly",
  },
];

// Hague Apostille Convention membership - a publicly verifiable fact from
// the HCCH's own member list, not authored legal guidance, but still kept
// behind the same signedOff gate as everything else in these tables before
// being treated as production-final.
const countryProfileRows = [
  {
    nationality: "Nigeria",
    isHagueApostilleSignatory: false,
    signedOff: false,
  },
];

async function seed() {
  const values = slfRows.map((r) => ({
    nationality: null,
    visaType: "student_visa",
    studentStatus: "new" as const,
    signedOff: false,
    ...r,
  }));

  await db.insert(requirements).values(values);
  await db.insert(countryProfiles).values(countryProfileRows);
  console.log(`Seeded ${values.length} SLF requirement rows and ${countryProfileRows.length} country profile(s) (signedOff: false).`);
}

seed().then(() => process.exit(0));
