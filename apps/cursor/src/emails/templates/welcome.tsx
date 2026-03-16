import { Footer } from "@/emails/components/footer";
import { Logo } from "@/emails/components/logo";
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function WelcomeEmail({
  name = "there",
}: {
  name: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to the Cursor Directory community
      </Preview>
      <Tailwind>
        <Body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f6f8fa' }}>
          <Container className="mx-auto max-w-[580px] bg-white py-5 pb-12">
            <Logo />

            <Section className="px-8">
              <Text className="text-sm leading-7 mb-4">Hi {name},</Text>

              <Text className="text-sm leading-7 mb-4">
                Welcome to Cursor Directory — the community hub for developers
                building with Cursor. Whether you&apos;re here to discover new
                tools, share your work, or connect with other developers,
                you&apos;re in the right place.
              </Text>

              <Text className="text-sm leading-7 mb-2">
                Here&apos;s what you can explore:
              </Text>

              <Text className="text-sm leading-7 mb-1">
                <span className="text-base">◇ </span>
                <Link
                  href="https://cursor.directory/plugins"
                  className="underline text-black"
                >
                  Plugins
                </Link>{" "}
                — Browse and install community-built plugins for Cursor
              </Text>

              <Text className="text-sm leading-7 mb-1">
                <span className="text-base">◇ </span>
                <Link
                  href="https://cursor.directory/events"
                  className="underline text-black"
                >
                  Events
                </Link>{" "}
                — Find meetups and events happening in the Cursor community
              </Text>

              <Text className="text-sm leading-7 mb-1">
                <span className="text-base">◇ </span>
                <Link
                  href="https://cursor.directory/jobs"
                  className="underline text-black"
                >
                  Jobs
                </Link>{" "}
                — Discover opportunities at companies using Cursor
              </Text>

              <Text className="text-sm leading-7 mb-1">
                <span className="text-base">◇ </span>
                <Link
                  href="https://cursor.directory/members"
                  className="underline text-black"
                >
                  Members
                </Link>{" "}
                — Connect with developers and companies in the community
              </Text>

              <Text className="text-sm leading-7 mb-4">
                <span className="text-base">◇ </span>
                <Link
                  href="https://cursor.directory/board"
                  className="underline text-black"
                >
                  Board
                </Link>{" "}
                — Share ideas, ask questions, and join the conversation
              </Text>

              <Text className="text-sm leading-7 mb-6">
                Start exploring:{" "}
                <Link
                  href="https://cursor.directory"
                  className="underline text-black"
                >
                  cursor.directory
                </Link>
              </Text>

              <Text className="text-sm leading-7">
                Looking forward to seeing what you build!
              </Text>

              <Text className="text-sm leading-7 mt-2">
                Best,
                <br />
                <Link
                  href="https://twitter.com/pontusab"
                  className="text-black text-sm underline"
                >
                  @Pontus
                </Link>{" "}
                &{" "}
                <Link
                  href="https://twitter.com/viktorhofte"
                  className="text-black text-sm underline"
                >
                  @Viktor
                </Link>
              </Text>
            </Section>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
