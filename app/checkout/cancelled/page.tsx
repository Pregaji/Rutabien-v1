import HomeLink from "../../HomeLink";
import { Button, Heading, PageShell, Text } from "@/components/ui";

export default function CheckoutCancelledPage() {
  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Heading size="lg">Checkout cancelled</Heading>
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
