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
} from '@react-email/components'

interface GAAnnouncementProps {
  email: string
}

export default function GAAnnouncementEmail({ email }: GAAnnouncementProps) {
  return (
    <Html>
      <Head />
      <Preview>Conduit is now free and open source!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo/Header */}
          <Text style={styles.logo}>CONDUIT</Text>

          {/* Main content */}
          <Section style={styles.card}>
            <Text style={styles.heading}>The wait is over.</Text>

            <Text style={styles.highlight}>
              Conduit is now free and open source!
            </Text>

            <Text style={styles.description}>
              Thank you for your patience on the waitlist. We're excited to
              announce that Conduit is now available to everyone—no invite
              required.
            </Text>

            <Hr style={styles.divider} />

            {/* What's New */}
            <Text style={styles.subheading}>What's included:</Text>
            <Text style={styles.listItem}>
              Run Claude Code and Codex CLI side-by-side
            </Text>
            <Text style={styles.listItem}>
              Tab-based session management (up to 10 concurrent)
            </Text>
            <Text style={styles.listItem}>
              Real-time streaming and token tracking
            </Text>
            <Text style={styles.listItem}>
              Session persistence and resumption
            </Text>
            <Text style={styles.listItem}>Git integration with PR tracking</Text>

            <Hr style={styles.divider} />

            {/* Install CTA */}
            <Text style={styles.codeLabel}>Install now:</Text>
            <Text style={styles.code}>
              curl -fsSL https://getconduit.sh/install | sh
            </Text>

            <Section style={styles.buttonContainer}>
              <Button
                href="https://github.com/conduit-cli/conduit"
                style={styles.button}
              >
                View on GitHub
              </Button>
            </Section>

            <Text style={styles.starCta}>
              If you find Conduit useful, please star the repo!
            </Text>

            <Hr style={styles.divider} />

            <Text style={styles.instructions}>
              Questions? Reply to this email or join our Discord community.
            </Text>

            <Section style={styles.buttonContainer}>
              <Button
                href="https://discord.gg/F9pfRd642H"
                style={styles.secondaryButton}
              >
                Join Discord
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Text style={styles.footer}>
            Conduit - Run a team of AI agents in your terminal
          </Text>
          <Text style={styles.unsubscribe}>
            You received this because you signed up for the Conduit waitlist.
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
    padding: '40px 20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  logo: {
    color: '#00ff88',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    margin: '0 0 30px 0',
    letterSpacing: '4px',
  },
  card: {
    backgroundColor: '#111118',
    padding: '30px',
    borderRadius: '8px',
    border: '1px solid #2a2a3a',
  },
  heading: {
    color: '#e0e0e8',
    fontSize: '24px',
    fontWeight: '600' as const,
    margin: '0 0 10px 0',
    textAlign: 'center' as const,
  },
  highlight: {
    color: '#00ff88',
    fontSize: '18px',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    margin: '0 0 20px 0',
  },
  description: {
    color: '#a0a0b0',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 10px 0',
  },
  subheading: {
    color: '#e0e0e8',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: '0 0 12px 0',
  },
  listItem: {
    color: '#a0a0b0',
    fontSize: '14px',
    lineHeight: '1.8',
    margin: '0',
    paddingLeft: '12px',
  },
  divider: {
    borderColor: '#2a2a3a',
    borderWidth: '1px',
    margin: '20px 0',
  },
  codeLabel: {
    color: '#a0a0b0',
    fontSize: '12px',
    margin: '0 0 8px 0',
  },
  code: {
    backgroundColor: '#0a0a0f',
    color: '#00d4ff',
    fontSize: '13px',
    padding: '12px 16px',
    borderRadius: '4px',
    border: '1px solid #2a2a3a',
    fontFamily: 'inherit',
    margin: '0 0 20px 0',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '20px 0',
  },
  button: {
    backgroundColor: '#00ff88',
    color: '#0a0a0f',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    display: 'inline-block',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#00ff88',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    border: '1px solid #00ff88',
  },
  starCta: {
    color: '#ffaa00',
    fontSize: '13px',
    textAlign: 'center' as const,
    margin: '10px 0 0 0',
  },
  instructions: {
    color: '#808090',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0,
    textAlign: 'center' as const,
  },
  footer: {
    color: '#606070',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '30px',
  },
  unsubscribe: {
    color: '#404050',
    fontSize: '11px',
    textAlign: 'center' as const,
    marginTop: '10px',
  },
}
