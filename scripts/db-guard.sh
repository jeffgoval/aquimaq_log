#!/usr/bin/env bash
# Garante que o CLI do Supabase SEMPRE aponta para o projeto correto (hzi - dev/teste)
# Bloqueia qualquer operação se o project-ref for diferente.

EXPECTED_REF="hziovsgaqmrwthnlqobd"
REF_FILE="supabase/.temp/project-ref"

if [ -f "$REF_FILE" ]; then
  CURRENT_REF=$(cat "$REF_FILE" | tr -d '[:space:]')
  if [ "$CURRENT_REF" != "$EXPECTED_REF" ]; then
    echo ""
    echo "❌ BLOQUEADO: CLI linkado ao projeto errado!"
    echo "   Atual:    $CURRENT_REF"
    echo "   Esperado: $EXPECTED_REF"
    echo ""
    echo "   Execute: npx supabase link --project-ref $EXPECTED_REF"
    echo ""
    exit 1
  fi
fi

# Re-linka para garantir
npx supabase link --project-ref "$EXPECTED_REF"
