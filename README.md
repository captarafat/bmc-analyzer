# BMC Analyzer

Aplikasi web untuk pelajar mengisi dan menganalisis Business Model Canvas (BMC) dengan penilaian AI.

## Setup Upstash Redis

1. **Buat Upstash Redis Database:**
   - Pergi ke [Upstash Console](https://console.upstash.com/)
   - Daftar/log masuk (percuma)
   - Klik **Create Database**
   - Pilih **Global** atau **Regional** (Global disyorkan)
   - Pilih plan **Free** (10,000 requests/day)
   - Klik **Create**

2. **Dapatkan Credentials:**
   - Selepas database dicipta, klik pada database
   - Salin **UPSTASH_REDIS_REST_URL** dan **UPSTASH_REDIS_REST_TOKEN**

3. **Tambah ke Vercel Environment Variables:**
   - Pergi ke Vercel Dashboard → Project → Settings → Environment Variables
   - Tambah:
     - `UPSTASH_REDIS_REST_URL` = (URL dari Upstash)
     - `UPSTASH_REDIS_REST_TOKEN` = (Token dari Upstash)
   - Pastikan tambah untuk **Production**, **Preview**, dan **Development**

4. **Deploy:**
   - Push kod ke GitHub
   - Vercel akan auto-deploy
   - Data akan automatik disimpan ke Redis

## Environment Variables

Di Vercel Dashboard → Project Settings → Environment Variables, pastikan ada:

- `OPENAI_API_KEY` - Kunci API OpenAI (wajib untuk analisis AI)
- `UPSTASH_REDIS_REST_URL` - URL dari Upstash Redis
- `UPSTASH_REDIS_REST_TOKEN` - Token dari Upstash Redis

## Development

```bash
npm install
npm run dev
```

Untuk development dengan database, tambah `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
OPENAI_API_KEY=sk-...
```

## Production

Aplikasi akan auto-deploy ke Vercel apabila push ke GitHub.

## Features

- ✅ Halaman pelajar untuk isi BMC
- ✅ Analisis AI dengan OpenAI GPT-4o-mini
- ✅ Leaderboard dengan sesi berbilang
- ✅ Tips penambahbaikan dengan contoh konteks Sabah
- ✅ Upstash Redis untuk data persistence (percuma tier)

## Alternatif Database

Jika mahu guna PostgreSQL, boleh guna:
- **Supabase** (percuma tier) - https://supabase.com
- **Neon** (percuma tier) - https://neon.tech
- **Railway** (percuma tier) - https://railway.app
