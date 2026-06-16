# Site Mariana Alcântara

Site institucional + painel de administração para a arquiteta Mariana Alcântara.
Stack: Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase, Vercel.

## Para a Mariana: como usar o painel

1. Acesse **arquitetamariana.com.br/admin**
2. Entre com o email e senha que você definiu no Supabase
3. Você verá três áreas:
   - **Visão geral** — resumo dos seus projetos e vídeos
   - **Projetos** — adicionar, editar, remover, subir fotos da galeria
   - **Vídeos** — publicar, editar e remover vídeos

### Adicionar um projeto novo

1. Em **Projetos**, clique em "Novo projeto"
2. Preencha título, categoria, descrição
3. Salve
4. Na tela seguinte, arraste ou clique para subir todas as fotos
5. Para definir uma foto como capa, passe o mouse sobre ela e clique na estrela
6. Pronto, o projeto já aparece no site

### Publicar um vídeo

1. Em **Vídeos**, clique em "Novo vídeo"
2. Selecione o arquivo (até 500 MB, MP4/MOV/WebM)
3. Opcional: suba uma imagem de capa
4. Coloque título e descrição
5. Salve

### Esconder temporariamente

Em qualquer projeto ou vídeo, desmarque "Publicado no site". O conteúdo some do site público, mas continua no admin para você voltar a publicar quando quiser.

---

## Para devs: setup local

### 1. Instalar

```bash
npm install
```

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

Você precisa criar um projeto no [Supabase](https://app.supabase.com) e pegar:
- `NEXT_PUBLIC_SUPABASE_URL` (Settings > API > Project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings > API > anon public)
- `SUPABASE_SERVICE_ROLE_KEY` (Settings > API > service_role, **secreto**)

### 3. Banco e Storage

No Supabase SQL Editor, rode em ordem:

```sql
-- 1. Cole e execute o conteúdo de supabase/migrations/001_init.sql
-- 2. Cole e execute o conteúdo de supabase/migrations/002_storage.sql
```

### 4. Criar usuário admin

No Supabase, vá em **Authentication > Users > Add user > Create new user**.
Email e senha que a Mariana usará para logar em `/admin/login`.

### 5. Migrar conteúdo inicial

Para subir os 10 projetos do portfólio original com todas as 119 fotos:

```bash
npm run seed
```

O script é idempotente, projetos já existentes são pulados.

### 6. Rodar

```bash
npm run dev
```

Site público em `http://localhost:3000`
Admin em `http://localhost:3000/admin/login`

---

## Deploy no Vercel

1. Faça push do projeto para um repositório GitHub
2. No [Vercel](https://vercel.com), importe o repositório
3. Em **Environment Variables**, adicione as 4 variáveis do `.env.local`
4. Deploy automático
5. Aponte o domínio `arquitetamariana.com.br` no painel **Domains**

## Estrutura

```
site-novo/
├── app/
│   ├── (site)/             # Site público
│   │   ├── page.tsx        # Home
│   │   ├── sobre/
│   │   ├── projetos/
│   │   └── videos/
│   ├── admin/              # Painel
│   │   ├── login/
│   │   ├── projetos/
│   │   └── videos/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── site/               # UI do site público
│   └── admin/              # UI do painel
├── lib/
│   ├── supabase/           # Helpers de auth e DB
│   ├── queries.ts          # Funções de leitura do banco
│   ├── types.ts            # Tipos compartilhados
│   └── utils.ts            # Utilitários
├── supabase/migrations/    # Schemas SQL
├── scripts/seed.ts         # Migração do portfólio inicial
└── public/                 # Logo, favicon, retrato
```

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS, Fraunces + Inter (Google Fonts) |
| Animação | Motion (React) |
| Ícones | Lucide |
| Banco | Supabase Postgres |
| Storage | Supabase Storage (buckets `projects` e `videos`) |
| Auth | Supabase Auth (email + senha) |
| Notificações | Sonner |
| Validação | Zod |
| Deploy | Vercel |

## Decisões de design

A paleta é construída sobre tons da arquitetura da própria Mariana:

| Token | Hex | Uso |
|---|---|---|
| Bone | `#F4EFE8` | Fundo principal |
| Stone 100 | `#EAE3D8` | Fundos secundários |
| Clay | `#C9B89F` | Acentos quentes |
| Walnut | `#594A3D` | Tipografia secundária, bordas |
| Ink | `#1A1714` | Tipografia principal, CTA |
| Sage | `#A6AE9A` | Detalhe natural pontual |

Tipografia: **Fraunces** (serif variável, para títulos) + **Inter** (sans, para corpo). A mistura serif/sans dá o tom editorial sem cair em jargão SaaS.

Animação: revelações suaves no scroll (Motion), nada que distraia. Respeita `prefers-reduced-motion`.

## Manutenção

- O cache do site público se renova a cada 60 segundos (`revalidate = 60`). Quando a Mariana publica algo novo, o site atualiza dentro de um minuto. Edições disparam `revalidatePath` imediato.
- Imagens são servidas pelo CDN do Supabase, otimizadas pelo `next/image`.
- Erros de upload aparecem como toast no painel, sem perder o progresso.
