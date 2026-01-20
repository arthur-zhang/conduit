#!/usr/bin/env tsx
/**
 * GA Announcement Script - Send GA announcement to all waitlist subscribers
 *
 * Usage:
 *   pnpm ga-announce --dry-run     # Preview without sending
 *   pnpm ga-announce               # Send to all waitlist subscribers
 *   pnpm ga-announce --batch 50    # Send in batches of 50 (default: 100)
 *   pnpm ga-announce --delay 1000  # Delay between batches in ms (default: 2000)
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import * as readline from 'readline'
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
const hasFlag = (name: string): boolean => args.includes(`--${name}`)

const dryRun = hasFlag('dry-run')
const batchSize = parseInt(getArg('batch') || '100', 10)
const delayMs = parseInt(getArg('delay') || '2000', 10)

// Load environment variables
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY
const resendKey = process.env.RESEND_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Error: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set'
  )
  process.exit(1)
}

if (!resendKey && !dryRun) {
  console.error('Error: RESEND_API_KEY must be set (or use --dry-run)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const resend = resendKey ? new Resend(resendKey) : null

// Helper to ask for confirmation
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

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Build email HTML
async function buildEmailHtml(email: string): Promise<string> {
  return await render(GAAnnouncementEmail({ email }))
}

// Main function
async function main() {
  console.log('\n🚀 Conduit GA Announcement Email Sender\n')

  if (dryRun) {
    console.log('📋 DRY RUN MODE - No emails will be sent\n')
  }

  // Fetch all waitlist subscribers
  console.log('Fetching waitlist subscribers...')
  const { data: subscribers, error } = await supabase
    .from('waitlist')
    .select('email, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching waitlist:', error.message)
    process.exit(1)
  }

  if (!subscribers || subscribers.length === 0) {
    console.log('No subscribers found on the waitlist.')
    process.exit(0)
  }

  console.log(`Found ${subscribers.length} subscribers on the waitlist.\n`)

  // Show summary
  console.log('Summary:')
  console.log(`  Total subscribers: ${subscribers.length}`)
  console.log(`  Batch size: ${batchSize}`)
  console.log(`  Delay between batches: ${delayMs}ms`)
  console.log(`  Estimated time: ~${Math.ceil((subscribers.length / batchSize) * (delayMs / 1000))} seconds\n`)

  if (dryRun) {
    console.log('First 10 subscribers:')
    subscribers.slice(0, 10).forEach((sub, i) => {
      console.log(`  ${i + 1}. ${sub.email}`)
    })
    if (subscribers.length > 10) {
      console.log(`  ... and ${subscribers.length - 10} more`)
    }
    console.log('\n✅ Dry run complete. No emails sent.')
    return
  }

  // Confirm before sending
  const confirmed = await confirm(
    `\n⚠️  You are about to send ${subscribers.length} emails. Continue?`
  )

  if (!confirmed) {
    console.log('Aborted.')
    process.exit(0)
  }

  // Send emails in batches
  let sent = 0
  let failed = 0
  const errors: { email: string; error: string }[] = []

  console.log('\nSending emails...\n')

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(subscribers.length / batchSize)

    console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} emails)...`)

    for (const subscriber of batch) {
      try {
        const html = await buildEmailHtml(subscriber.email)

        const result = await resend!.emails.send({
          from: 'Conduit <hello@getconduit.sh>',
          to: subscriber.email,
          subject: 'Conduit is now free and open source!',
          html,
        })

        if (result.error) {
          throw new Error(result.error.message)
        }

        sent++
        process.stdout.write('.')
      } catch (err) {
        failed++
        errors.push({
          email: subscriber.email,
          error: err instanceof Error ? err.message : String(err),
        })
        process.stdout.write('x')
      }
    }

    console.log(` Done (${sent} sent, ${failed} failed)`)

    // Delay between batches (except for the last one)
    if (i + batchSize < subscribers.length) {
      await sleep(delayMs)
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary')
  console.log('='.repeat(50))
  console.log(`  ✅ Sent: ${sent}`)
  console.log(`  ❌ Failed: ${failed}`)

  if (errors.length > 0) {
    console.log('\nFailed emails:')
    errors.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`)
    })
  }

  console.log('\n🎉 GA announcement complete!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
