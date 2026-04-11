#!/usr/bin/env node
/**
 * SwimPass Admin Setup Script
 * Erstellt/repariert admin@swimpass.lu garantiert via Supabase Admin API
 *
 * Usage:
 *   node scripts/setup-admin.mjs <SERVICE_ROLE_KEY>
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL    = 'https://oltmevbiphpeezwbklrk.supabase.co'
const ADMIN_EMAIL     = 'admin@swimpass.lu'
const ADMIN_PASSWORD  = 'Admin1234!'
const ADMIN_NAME      = 'Andy'
const SCHOOL_ID       = '00000000-0000-0000-0000-000000000001'

const serviceRoleKey = process.argv[2]
if (!serviceRoleKey || !serviceRoleKey.startsWith('eyJ')) {
  console.error('\n❌ Service Role Key fehlt!\n')
  console.error('Usage: node scripts/setup-admin.mjs <SERVICE_ROLE_KEY>')
  console.error('\nDen Key findest du unter:')
  console.error('Supabase Dashboard → Settings → API → service_role (secret)\n')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('\n🏊 SwimPass Admin Setup\n')
  console.log(`Projekt: ${SUPABASE_URL}`)
  console.log(`User:    ${ADMIN_EMAIL}`)
  console.log(`Passwort: ${ADMIN_PASSWORD}\n`)

  // ── 1. Check ob User existiert ──────────────────────────────
  console.log('1/4 Prüfe ob User existiert...')
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('❌ Fehler beim Lesen der Users:', listErr.message); process.exit(1) }

  const existing = users.find(u => u.email === ADMIN_EMAIL)

  let userId

  if (existing) {
    console.log(`   ✅ User gefunden (id: ${existing.id})`)
    userId = existing.id

    // Update Passwort + confirm email
    console.log('2/4 Passwort setzen + E-Mail bestätigen...')
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: 'admin', school_id: SCHOOL_ID },
    })
    if (updateErr) { console.error('❌ Fehler beim Update:', updateErr.message); process.exit(1) }
    console.log('   ✅ Passwort gesetzt, E-Mail bestätigt')

  } else {
    // Neu erstellen
    console.log('   ℹ️  User existiert nicht — wird erstellt...')
    console.log('2/4 Erstelle User...')
    const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: 'admin', school_id: SCHOOL_ID },
    })
    if (createErr) { console.error('❌ Fehler beim Erstellen:', createErr.message); process.exit(1) }
    userId = user.id
    console.log(`   ✅ User erstellt (id: ${userId})`)
  }

  // ── 3. Profil upsert ────────────────────────────────────────
  console.log('3/4 Profil in profiles Tabelle sicherstellen...')
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: 'admin',
    school_id: SCHOOL_ID,
    avatar: '🏊',
  }, { onConflict: 'id' })

  if (profileErr) {
    console.warn('   ⚠️  Profil-Fehler (möglicherweise RLS):', profileErr.message)
    console.warn('   → Bitte führe diesen SQL im Supabase SQL Editor aus:')
    console.warn(`
INSERT INTO profiles (id, email, name, role, school_id, avatar)
VALUES ('${userId}', '${ADMIN_EMAIL}', '${ADMIN_NAME}', 'admin', '${SCHOOL_ID}', '🏊')
ON CONFLICT (id) DO UPDATE SET role = 'admin', school_id = '${SCHOOL_ID}', name = '${ADMIN_NAME}';
`)
  } else {
    console.log('   ✅ Profil gesetzt (role: admin)')
  }

  // ── 4. Verifikation ─────────────────────────────────────────
  console.log('4/4 Verifiziere Login...')
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdG1ldmJpcGhwZWV6d2JrbHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjczODAsImV4cCI6MjA5MTMwMzM4MH0.oWEVNDg06xo8OgfK4rWCfuSSS1NMdvn9uHlES2Yu1_E'
  const anonClient = createClient(SUPABASE_URL, anonKey)
  const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })

  if (signInErr) {
    console.error('   ❌ Login-Test fehlgeschlagen:', signInErr.message)
    process.exit(1)
  }

  console.log('   ✅ Login-Test erfolgreich!\n')
  console.log('═══════════════════════════════════════')
  console.log('✅ SETUP ABGESCHLOSSEN')
  console.log('═══════════════════════════════════════')
  console.log(`📧 E-Mail:   ${ADMIN_EMAIL}`)
  console.log(`🔑 Passwort: ${ADMIN_PASSWORD}`)
  console.log(`🌐 App:      http://localhost:5173`)
  console.log('═══════════════════════════════════════\n')
}

run().catch(err => { console.error('Unerwarteter Fehler:', err); process.exit(1) })
