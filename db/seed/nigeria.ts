import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "@/db";
import { requirements } from "@/db/schema";

// Draft structural placeholders for the Nigeria pilot, per MVP_Draft.md
// section 7. signedOff stays false — do not publish as final without Ida's
// explicit sign-off (see CLAUDE.md).
const LEGALIZATION_CHAIN =
  "Ministry of Education → Ministry of Foreign Affairs → Spanish Embassy";
const FUNDS_FORMULA =
  "100% IPREM + 75% for first accompanying family member + 50% per additional";

const rows = [
  {
    documentName: "Valid passport",
    sortOrder: 1,
    notarizationRequired: false,
    translationRequired: false,
  },
  {
    documentName: "University acceptance letter",
    sortOrder: 2,
    translationRequired: true,
    legalizationChain: LEGALIZATION_CHAIN,
  },
  {
    documentName: "Academic transcript",
    sortOrder: 3,
    translationRequired: true,
    legalizationChain: LEGALIZATION_CHAIN,
    notarizationRequired: true,
  },
  {
    documentName: "Police certificate",
    sortOrder: 4,
    translationRequired: true,
    legalizationChain: LEGALIZATION_CHAIN,
    validityWindowDays: 90,
    conditions: [
      { field: "stayDurationMonths", operator: "gte", value: 6, effect: "require" },
    ],
  },
  {
    documentName: "Medical certificate",
    sortOrder: 5,
    translationRequired: true,
    validityWindowDays: 90,
    documentTemplate: "Standard consulate-required medical certificate wording — TODO, pending Ida.",
  },
  {
    documentName: "Birth certificate",
    sortOrder: 6,
    translationRequired: true,
    legalizationChain: LEGALIZATION_CHAIN,
    notarizationRequired: true,
  },
  {
    documentName: "Proof of funds",
    sortOrder: 7,
    fundsFormula: FUNDS_FORMULA,
    translationRequired: false,
  },
  {
    documentName: "Proof of accommodation",
    sortOrder: 8,
    translationRequired: false,
  },
];

async function seed() {
  const values = rows.map((r) => ({
    nationality: "Nigeria",
    visaType: "student_visa",
    studentStatus: "new" as const,
    homeCountryApostilleAuthority: "Nigeria Ministry of Foreign Affairs",
    postAppointmentGracePeriodDays: 14,
    signedOff: false,
    // All 8 rows are pre-arrival visa-application documents — genuinely
    // one phase. Not labeling later phases (address registration, TIE)
    // since that content doesn't exist in this table yet; adding those
    // labels without the underlying requirement rows would be fabricating
    // structure ahead of real content.
    phase: "Before you fly",
    ...r,
  }));

  await db.insert(requirements).values(values);
  console.log(`Seeded ${values.length} Nigeria requirement rows (signedOff: false).`);
}

seed().then(() => process.exit(0));
