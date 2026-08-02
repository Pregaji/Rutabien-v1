import HomeLink from "../../HomeLink";
import { Button, Heading, PageShell, Text } from "@/components/ui";
import { ExpiredLinkScene } from "@/components/illustrations/ExpiredLinkScene";
import { ACCESS_TOKEN_TTL_MINUTES } from "@/lib/auth";

export default function ExpiredPage() {
  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <ExpiredLinkScene width={220} height={157} className="rb-empty-illustration" />
        <Heading size="lg" style={{ marginTop: 8 }}>This link has expired</Heading>
        <Text style={{ marginTop: 14 }}>
          Access links work once and expire after {ACCESS_TOKEN_TTL_MINUTES} minutes. Request a fresh one below.
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
