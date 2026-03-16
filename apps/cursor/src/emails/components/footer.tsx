import { Column, Img, Link, Row, Section, Text } from "@react-email/components";

export function Footer() {
  return (
    <Section className="mt-8 px-8">
      <Section className="border-t border-[#e5e7eb] pt-6">
        <Row align="left" width="auto">
          <Column className="align-middle pr-4">
            <Link
              href="https://x.com/cursordirectory"
              className="text-black no-underline"
            >
              <Img
                src="https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/email/x.png"
                alt="X"
                width={18}
                height={18}
              />
            </Link>
          </Column>

          <Column className="align-middle">
            <Link
              href="https://github.com/pontusab/directories"
              className="text-black no-underline"
            >
              <Img
                src="https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/email/github.png"
                alt="GitHub"
                width={18}
                height={18}
              />
            </Link>
          </Column>
        </Row>

        <Text className="text-xs leading-6 mt-4 text-[#999]">
          © {new Date().getFullYear()} Cursor Directory. All rights reserved.
          <br />
          This email was sent because you signed up for Cursor Directory.
        </Text>
      </Section>
    </Section>
  );
}
