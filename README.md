# Aquimaq Log — Sistema de Gestão de Tratores

Este é o repositório do Aquimaq Log, um sistema de gestão industrial para frotas de tratores.

## Pré-requisitos
- Node.js (v18+)
- Conta no Supabase

## Instalação

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente baseando-se no `.env.example`:
   Crie um arquivo `.env.local` na raiz com as chaves do seu projeto Supabase atual.
   ```
   VITE_SUPABASE_URL=https://hziovsgaqmrwthnlqobd.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

3. Configure o banco de dados:
   - Abra o dashboard do Supabase (SQL Editor)
   - Copie e cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
   - Execute o script para criar as tabelas, views, triggers e regras de RLS (Row Level Security).

4. Rode a aplicação em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Opcionalmente, pode rodar e testar o build do projeto e os unit tests das regras de negócios com:
   ```bash
   npm run build
   npm run test
   ```

Acesse o sistema localmente em `http://localhost:5173`.

## GitHub e Vercel (CI/CD)

### GitHub Actions
O projeto agora tem um workflow automatizado em `.github/workflows/main.yml`. 
Toda vez que você fizer um `git push` para a branch `main`, o GitHub vai:
- Instalar as dependências
- Rodar o **ESLint** (Lint)
- Rodar os **Testes Unitários** com Vitest
- Testar o **Build** de produção

### Deploy na Vercel
1. Vá ao [Dashboard da Vercel](https://vercel.com/dashboard) e clique em **Add New > Project**.
2. Importe o repositório do GitHub.
3. Configure as **Environment Variables** com os valores do seu `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy**. A partir daí, cada push no GitHub atualizará o site automaticamente.

### DNS e Domínio
Se for usar o domínio `aquimaq.com.br`, adicione-o na aba **Domains** da Vercel. 
- Como a Vercel não suporta DNSSEC, certifique-se de que o **Registro DS** esteja removido no Registro.br (ele é desatualizado com a Vercel).
