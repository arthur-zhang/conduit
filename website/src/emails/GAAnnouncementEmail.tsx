/**
 * GA Announcement Email Template
 * Sent to all waitlist subscribers when Conduit goes public
 */
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Preview,
  Section,
  Hr,
  Button,
  Link,
  Img,
} from '@react-email/components'

interface GAAnnouncementProps {
  email: string
}

export default function GAAnnouncementEmail({ email }: GAAnnouncementProps) {
  return (
    <Html>
      <Head />
      <Preview>It's live. Come break it.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo/Header */}
          <Text style={styles.logo}>CONDUIT</Text>

          {/* Main content */}
          <Section style={styles.card}>
            <Text style={styles.heading}>It's live. Come break it.</Text>

            <Text style={styles.description}>
              You signed up early. Conduit is now open source and ready for you.
            </Text>

            <Text style={styles.description}>
              It's a terminal-native way to run AI coding agents in parallel —
              works over SSH, on any machine, not just macOS.
            </Text>

            {/* Hero Screenshot */}
            <Section style={styles.imageContainer}>
              <Img
                src="https://getconduit.sh/screenshots/screenshot-web.png"
                alt="Conduit Web Interface"
                style={styles.heroImage}
              />
              <Text style={styles.imageCaption}>
                Web UI or TUI. Your call.
              </Text>
            </Section>

            <Hr style={styles.divider} />

            {/* Get Involved */}
            <Text style={styles.subheading}>Get involved</Text>

            <Text style={styles.listItem}>
              <span style={{ color: '#00ff88', marginRight: '8px' }}>→</span>
              <span style={{ color: '#e0e0e8' }}>Break things</span>
              <br />
              <span style={{ color: '#808090', marginLeft: '18px', display: 'inline-block' }}>
                Find the edge cases, the crashes, the "wait, what?"
              </span>
            </Text>

            <Text style={styles.listItem}>
              <span style={{ color: '#00ff88', marginRight: '8px' }}>→</span>
              <span style={{ color: '#e0e0e8' }}>Shape the roadmap</span>
              <br />
              <span style={{ color: '#808090', marginLeft: '18px', display: 'inline-block' }}>
                Bug reports and feature ideas actually get built
              </span>
            </Text>

            <Text style={styles.listItem}>
              <span style={{ color: '#00ff88', marginRight: '8px' }}>→</span>
              <span style={{ color: '#e0e0e8' }}>Ship code</span>
              <br />
              <span style={{ color: '#808090', marginLeft: '18px', display: 'inline-block' }}>
                PRs welcome, from typos to new features
              </span>
            </Text>

            <Text style={{ ...styles.listItem, marginBottom: '0' }}>
              <span style={{ color: '#00ff88', marginRight: '8px' }}>→</span>
              <span style={{ color: '#e0e0e8' }}>Show your setup</span>
              <br />
              <span style={{ color: '#808090', marginLeft: '18px', display: 'inline-block' }}>
                Your workflows help decide what comes next
              </span>
            </Text>

            <Hr style={styles.divider} />

            {/* Community */}
            <Text style={styles.subheading}>Join the community</Text>

            <Text style={{ ...styles.description, marginBottom: '28px' }}>
              Discord is where the action happens — bugs, ideas, PRs. Twitter is
              where I post dev updates and roadmap thinking.
            </Text>

            <Section style={{ textAlign: 'center' as const }}>
              <Button
                href="https://discord.gg/F9pfRd642H"
                style={styles.button}
              >
                Join Discord
              </Button>
            </Section>

            <Section style={{ textAlign: 'center' as const, marginTop: '16px' }}>
              <Button
                href="https://twitter.com/fcoury"
                style={styles.secondaryButton}
              >
                Follow on Twitter
              </Button>
            </Section>

            <Hr style={styles.divider} />

            {/* Install CTA */}
            <Text style={styles.subheading}>Install now</Text>

            <Text style={{ ...styles.description, marginBottom: '16px' }}>
              Ready? One command:
            </Text>

            <Text style={styles.code}>
              curl -fsSL https://getconduit.sh/install | sh
            </Text>

            <Section style={{ textAlign: 'center' as const }}>
              <Button
                href="https://github.com/conduit-cli/conduit"
                style={styles.button}
              >
                View on GitHub
              </Button>
            </Section>

            <Hr style={styles.divider} />

            {/* Help it spread */}
            <Text style={styles.subheading}>Help it spread</Text>

            <Text style={{ ...styles.description, marginBottom: '28px' }}>
              If Conduit clicks for you, a star or a tweet goes a long way.
              Trying to get it trending so more devs find it.
            </Text>

            <Section style={{ textAlign: 'center' as const }}>
              <Button
                href="https://github.com/conduit-cli/conduit"
                style={styles.button}
              >
                ⭐ Star on GitHub
              </Button>
            </Section>

            <Section style={{ textAlign: 'center' as const, marginTop: '16px', marginBottom: '0' }}>
              <Button
                href="https://twitter.com/intent/tweet?text=Every%20multi-agent%20AI%20coding%20tool%20is%20macOS-only%20or%20GUI-bound.%0AThis%20one%20runs%20in%20the%20terminal%2C%20works%20over%20SSH%2C%20handles%20parallel%20work%20streams.%0A%0Ahttps%3A%2F%2Fgithub.com%2Fconduit-cli%2Fconduit"
                style={styles.secondaryButton}
              >
                Share on X
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Text style={styles.unsubscribe}>
            You're receiving this because you signed up for the Conduit waitlist.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#0a0a0f',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    margin: 0,
    padding: 0,
  },
  container: {
    padding: '48px 20px',
    maxWidth: '560px',
    margin: '0 auto',
  },
  logo: {
    color: '#00ff88',
    fontSize: '20px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    margin: '0 0 40px 0',
    letterSpacing: '6px',
  },
  card: {
    backgroundColor: '#111118',
    padding: '40px 36px',
    borderRadius: '12px',
    border: '1px solid #2a2a3a',
  },
  heading: {
    color: '#00ff88',
    fontSize: '28px',
    fontWeight: 'bold' as const,
    margin: '0 0 32px 0',
    textAlign: 'center' as const,
    letterSpacing: '-0.5px',
  },
  description: {
    color: '#b0b0c0',
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0 0 20px 0',
  },
  imageContainer: {
    margin: '28px 0 0 0',
    textAlign: 'center' as const,
  },
  heroImage: {
    width: '100%',
    maxWidth: '100%',
    borderRadius: '8px',
    border: '1px solid #2a2a3a',
  },
  imageCaption: {
    color: '#606070',
    fontSize: '12px',
    margin: '12px 0 0 0',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
  subheading: {
    color: '#00ff88',
    fontSize: '13px',
    fontWeight: '600' as const,
    margin: '0 0 20px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  },
  listItem: {
    color: '#b0b0c0',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
    paddingLeft: '0',
  },
  divider: {
    borderColor: '#2a2a3a',
    borderWidth: '1px',
    margin: '32px 0',
  },
  codeLabel: {
    color: '#808090',
    fontSize: '12px',
    margin: '0 0 12px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  code: {
    backgroundColor: '#0a0a0f',
    color: '#00d4ff',
    fontSize: '13px',
    padding: '16px 20px',
    borderRadius: '6px',
    border: '1px solid #2a2a3a',
    fontFamily: 'inherit',
    margin: '0 0 24px 0',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  button: {
    backgroundColor: '#00ff88',
    color: '#0a0a0f',
    padding: '14px 32px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    display: 'inline-block',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#00ff88',
    padding: '12px 28px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    border: '1px solid #00ff88',
  },
  unsubscribe: {
    color: '#505060',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '32px',
  },
}
