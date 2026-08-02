import HomeLink from "../../HomeLink";
import { Button, Heading, PageShell, Text } from "@/components/ui";
import { CheckoutCancelledScene } from "@/components/illustrations/CheckoutCancelledScene";

export default function CheckoutCancelledPage() {
  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <CheckoutCancelledScene width={220} height={157} className="rb-empty-illustration" />
        <Heading size="lg" style={{ marginTop: 8 }}>Checkout cancelled</Heading>
        <Text style={{ marginTop: 14 }}>
          No charge was made. You can pick up where you left off any time.
        </Text>
        <div style={{ marginTop: "var(--space-6)" }}>
          <Button variant="secondary" size="lg" fullWidth href="/paywall">
            Back to plans
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
