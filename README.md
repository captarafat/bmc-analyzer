# BMC Analyzer

Aplikasi web untuk pelajar mengisi dan menganalisis Business Model Canvas (BMC) dengan penilaian AI.

## Setup Vercel Postgres

1. **Buat Vercel Postgres Database:**
   - Pergi ke [Vercel Dashboard](https://vercel.com/dashboard)
   - Pilih project anda → **Storage** tab
   - Klik **Create Database** → Pilih **Postgres**
   - Pilih plan (Hobby plan percuma untuk permulaan)
   - Klik **Create**

2. **Sambungkan ke Project:**
   - Selepas database dicipta, Vercel akan automatik tambah environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
   - Variables ini akan automatik tersedia dalam semua deployments

3. **Deploy:**
   - Push kod ke GitHub
   - Vercel akan auto-deploy
   - Database schema akan auto-create pada first request

## Environment Variables

Di Vercel Dashboard → Project Settings → Environment Variables, pastikan ada:

- `OPENAI_API_KEY` - Kunci API OpenAI (wajib untuk analisis AI)
- `POSTGRES_URL` - Auto-ditambah oleh Vercel selepas create database
- `POSTGRES_PRISMA_URL` - Auto-ditambah
- `POSTGRES_URL_NON_POOLING` - Auto-ditambah

## Development

```bash
npm install
npm run dev
```

Untuk development dengan database, tambah `.env.local`:
```
POSTGRES_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

## Production

Aplikasi akan auto-deploy ke Vercel apabila push ke GitHub.

## Features

- ✅ Halaman pelajar untuk isi BMC
- ✅ Analisis AI dengan OpenAI GPT-4o-mini
- ✅ Leaderboard dengan sesi berbilang
- ✅ Tips penambahbaikan dengan contoh konteks Sabah
- ✅ Vercel Postgres untuk data persistence

