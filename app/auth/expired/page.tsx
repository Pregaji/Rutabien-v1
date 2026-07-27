import HomeLink from "../../HomeLink";
import { Button, Heading, PageShell, Text } from "@/components/ui";

export default function ExpiredPage() {
  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Heading size="lg">This link has expired</Heading>
        <Text style={{ marginTop: 14 }}>
          Access links work once and expire after 20 minutes. Request a fresh one below.
        </Text>
        <div style={{ marginTop: "var(--space-6)" }}>
          <Button variant="secondary" size="lg" fullWidth href="/access">
            Request a new link
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
