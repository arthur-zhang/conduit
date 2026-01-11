#!/usr/bin/env tsx
/**
 * Resend Correction Email Script
 * Sends correction email to users who accepted invites (and received welcome email)
 *
 * Usage:
 *   pnpm resend-correction --dry-run    # Preview recipients
 *   pnpm resend-correction --send       # Send correction emails
 */

import 'dotenv/config'
import { Resend } from 'resend'
import * as readline from 'readline'

const resendKey = process.env.RESEND_API_KEY
const resendAdminKey = process.env.RESEND_ADMIN_API_KEY

if (!resendKey) {
  console.error('Error: RESEND_API_KEY must be set')
  process.exit(1)
}

if (!resendAdminKey) {
  console.error('Error: RESEND_ADMIN_API_KEY must be set (full access key for listing emails)')
  process.exit(1)
}

const resend = new Resend(resendKey)

const args = process.argv.slice(2)
const getArg = (name: string): string | undefined => {
  const index = args.findIndex((a) => a.startsWith(`--${name}`))
  if (index === -1) return undefined
  const arg = args[index]
  if (arg.includes('=')) return arg.split('=')[1]
  return args[index + 1]
}
const hasFlag = (name: string): boolean => args.includes(`--${name}`)

const dryRun = hasFlag('dry-run')
const sendEmails = hasFlag('send')
const targetEmail = getArg('email')

if (!dryRun && !sendEmails) {
  console.error('Usage: pnpm resend-correction --dry-run | --send [--email user@example.com]')
  process.exit(1)
}

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

function buildCorrectionEmailHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="background-color: #0a0a0f; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; margin: 0; padding: 0;">
  <div style="padding: 40px 20px; max-width: 600px; margin: 0 auto;">
    <p style="color: #00ff88; font-size: 24px; font-weight: bold; text-align: center; margin: 0 0 30px 0; letter-spacing: 4px;">CONDUIT</p>
    <div style="background-color: #111118; padding: 30px; border-radius: 8px; border: 1px solid #2a2a3a;">
      <p style="color: #e0e0e8; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Quick Fix: Discord Link</p>

      <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        Hey! I just noticed the Discord link in my previous welcome email was broken. Here's the correct one:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://discord.gg/F9pfRd642H" style="background-color: #00ff88; color: #0a0a0f; padding: 14px 32px; border-radius: 6px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">Join Discord</a>
      </div>

      <p style="color: #808090; font-size: 13px; line-height: 1.5; margin: 20px 0 0 0; text-align: center;">
        Sorry for the extra email. See you in the community!
      </p>
    </div>
    <p style="color: #606070; font-size: 12px; text-align: center; margin-top: 30px;">
      — Felipe
    </p>
  </div>
</body>
</html>
`
}

async function main() {
  console.log('\n📧 Resend Correction Email Script\n')

  // Fetch emails from Resend API
  console.log('Fetching sent emails from Resend...\n')

  try {
    // List emails - Resend API returns recent emails
    const response = await fetch('https://api.resend.com/emails?limit=100', {
      headers: {
        'Authorization': `Bearer ${resendAdminKey}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch emails:', response.statusText)
      process.exit(1)
    }

    const data = await response.json()
    const emails = data.data || []

    // Filter for welcome emails
    const welcomeEmails = emails.filter((email: any) =>
      email.subject === 'Welcome to Conduit - Getting Started'
    )

    if (welcomeEmails.length === 0) {
      console.log('No welcome emails found.')
      process.exit(0)
    }

    // Extract unique recipients
    let recipients = [...new Set(welcomeEmails.map((e: any) => e.to?.[0] || e.to).filter(Boolean))] as string[]

    // Filter to specific email if provided
    if (targetEmail) {
      if (!recipients.includes(targetEmail)) {
        console.error(`Email ${targetEmail} not found in welcome email recipients.`)
        process.exit(1)
      }
      recipients = [targetEmail]
      console.log(`Targeting specific email: ${targetEmail}\n`)
    }

    console.log(`Found ${welcomeEmails.length} welcome email(s) sent to ${recipients.length} recipient(s):\n`)

    recipients.forEach((email, i) => {
      console.log(`  ${i + 1}. ${email}`)
    })
    console.log()

    if (dryRun) {
      console.log('Dry run mode - no emails will be sent.')
      console.log('\nTo send correction emails, run: pnpm resend-correction --send')
      process.exit(0)
    }

    // Confirm before sending
    const confirmed = await confirm(`Send correction email to ${recipients.length} recipient(s)?`)
    if (!confirmed) {
      console.log('Aborted.')
      process.exit(0)
    }

    console.log('\nSending correction emails...\n')

    let successCount = 0
    let failCount = 0

    for (const recipient of recipients) {
      try {
        const { error } = await resend.emails.send({
          from: 'Felipe Coury <felipe@getconduit.sh>',
          to: recipient,
          subject: 'Fixed Discord Link',
          html: buildCorrectionEmailHtml(),
        })

        if (error) {
          console.error(`  ✗ ${recipient}: ${error.message}`)
          failCount++
        } else {
          console.log(`  ✓ ${recipient}`)
          successCount++
        }
      } catch (err) {
        console.error(`  ✗ ${recipient}: ${err}`)
        failCount++
      }
    }

    console.log('\n────────────────────────────────────────')
    console.log(`Summary: ${successCount} sent, ${failCount} failed`)
    console.log('────────────────────────────────────────\n')

  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

main()
