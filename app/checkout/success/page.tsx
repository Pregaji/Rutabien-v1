import HomeLink from "../../HomeLink";
import { Button, Heading, PageShell, Text } from "@/components/ui";
import { PaymentCompletedTracker } from "./PaymentCompletedTracker";

export default function CheckoutSuccessPage() {
  return (
    <PageShell style={{ textAlign: "center" }}>
      <PaymentCompletedTracker />
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Heading size="lg">Payment confirmed</Heading>
        <Text style={{ marginTop: 14 }}>
          Check your email for a fresh access link to your unlocked roadmap.
        </Text>
        <div style={{ marginTop: "var(--space-6)" }}>
          <Button variant="secondary" size="lg" fullWidth href="/access">
            Access my roadmap
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
