import { envConfigMessage } from '@/app/config/env'

export const EnvConfigMissingScreen = () => (
    <div className="flex min-h-dvh w-full max-w-full min-w-0 flex-col items-center justify-center gap-4 overflow-x-hidden bg-background p-8 text-center text-foreground">
      <div className="w-full max-w-md min-w-0 space-y-3">
        <h1 className="text-lg font-semibold">Configuração do ambiente</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {envConfigMessage ?? 'Variáveis de ambiente em falta.'}
        </p>
        <div className="rounded-lg border border-border bg-card p-4 text-left">
          <p className="typo-caption text-muted-foreground mb-2">Exemplo (.env.local):</p>
          <pre className="typo-caption font-mono whitespace-pre-wrap break-all text-foreground">
            {`VITE_SUPABASE_URL=https://…supabase.co
VITE_SUPABASE_ANON_KEY=…`}
          </pre>
        </div>
        <p className="typo-caption text-muted-foreground">
          Depois de salvar o arquivo, reinicie o servidor (<kbd className="px-1 rounded bg-muted">npm run dev</kbd>
          ).
        </p>
      </div>
    </div>
)
