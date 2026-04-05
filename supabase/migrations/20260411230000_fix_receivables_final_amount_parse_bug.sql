-- Corrige parcelas onde final_amount foi gravado ~100× o valor certo (bug: String(número) com
-- ponto decimal + parser que removia todos os pontos). Só linhas ainda não pagas e com ratio exato 100×.
-- Idempotente: após corrigir, final_amount deixa de ser = original_amount * 100.

update public.receivables
set
  final_amount = round((final_amount / 100)::numeric, 2),
  updated_at = now()
where
  paid_amount = 0
  and original_amount > 0
  and final_amount = original_amount * 100;
