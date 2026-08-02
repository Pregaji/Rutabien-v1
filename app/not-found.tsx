import HomeLink from "./HomeLink";
import { Button, Heading, PageShell, Text } from "@/components/ui";
import { NotFoundScene } from "@/components/illustrations/NotFoundScene";

export default function NotFound() {
  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <NotFoundScene width={220} height={157} className="rb-empty-illustration" />
        <Heading size="lg" style={{ marginTop: 8 }}>This page doesn&apos;t exist</Heading>
        <Text style={{ marginTop: 14 }}>
          The link may be out of date, or the page may have moved.
        </Text>
        <div style={{ marginTop: "var(--space-6)" }}>
          <Button variant="secondary" size="lg" fullWidth href="/">
            Back to homepage
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
