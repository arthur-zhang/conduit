#!/usr/bin/env tsx
/**
 * Test GA Announcement Email - Send a test GA announcement email
 *
 * Usage:
 *   pnpm test-ga-email --to user@example.com
 */

import 'dotenv/config'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import GAAnnouncementEmail from '../src/emails/GAAnnouncementEmail'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name: string): string | undefined => {
  const index = args.findIndex((a) => a.startsWith(`--${name}`))
  if (index === -1) return undefined
  const arg = args[index]
  if (arg.includes('=')) return arg.split('=')[1]
  return args[index + 1]
}

const to = getArg('to')

if (!to) {
  console.error('Usage: pnpm test-ga-email --to <email>')
  process.exit(1)
}

const resendKey = process.env.RESEND_API_KEY

if (!resendKey) {
  console.error('Error: RESEND_API_KEY must be set in .env')
  process.exit(1)
}

const resend = new Resend(resendKey)

async function main() {
  console.log('\n📧 Sending test GA announcement email...\n')
  console.log(`  To: ${to}\n`)

  try {
    const html = await render(GAAnnouncementEmail({ email: to! }))

    const { data, error } = await resend.emails.send({
      from: 'Conduit <hello@getconduit.sh>',
      to: to!,
      subject: 'Conduit is now free and open source!',
      html,
    })

    if (error) {
      console.error('✗ Failed to send email:', error.message)
      process.exit(1)
    }

    console.log('✓ Email sent successfully!')
    console.log(`  Message ID: ${data?.id}\n`)
  } catch (err) {
    console.error('✗ Error:', err)
    process.exit(1)
  }
}

main()
