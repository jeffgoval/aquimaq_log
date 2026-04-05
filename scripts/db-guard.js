#!/usr/bin/env node
// Garante que o CLI do Supabase aponta para o projeto correto (hzi - dev/teste)
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'

const EXPECTED_REF = 'hziovsgaqmrwthnlqobd'
const REF_FILE = 'supabase/.temp/project-ref'

if (existsSync(REF_FILE)) {
  const current = readFileSync(REF_FILE, 'utf8').trim()
  if (current !== EXPECTED_REF) {
    console.error('\n❌ BLOQUEADO: CLI linkado ao projeto errado!')
    console.error(`   Atual:    ${current}`)
    console.error(`   Esperado: ${EXPECTED_REF}`)
    console.error(`\n   Execute: npx supabase link --project-ref ${EXPECTED_REF}\n`)
    process.exit(1)
  }
}

execSync(`npx supabase link --project-ref ${EXPECTED_REF}`, { stdio: 'inherit' })
