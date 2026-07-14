import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Hard block on real payment processing until explicitly told otherwise —
// see CLAUDE.md "Do not do yet". Refuses to initialize with a live key.
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
  if (!key.startsWith("sk_test_")) {
    throw new Error(
      "Refusing to initialize Stripe with a non-test secret key — sandbox/test mode only until told otherwise."
    );
  }
  _stripe = new Stripe(key);
  return _stripe;
}
