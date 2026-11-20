# CampusIQ Deployment Guide

## Overview

CampusIQ is cloud-ready and can be deployed with zero architectural modifications across modern hosting providers.

---

## Recommended Deployment Topology

- **Frontend**: Vercel / Netlify / Cloudflare Pages (Static SPA build with Vite)
- **Backend**: Railway / Render / DigitalOcean App Platform (Node.js Container)
- **Database**: Neon PostgreSQL / Supabase / AWS RDS (PostgreSQL with optional pgvector)

---

## Production Environment Variables Checklist

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app
DATABASE_URL=postgresql://user:password@ep-sample-pooler.neon.tech/campusiq?sslmode=require
JWT_ACCESS_SECRET=your_production_64_character_access_secret
JWT_REFRESH_SECRET=your_production_64_character_refresh_secret
GEMINI_API_KEY=your_production_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
EMBEDDING_MODEL=text-embedding-004
```

---

## Build Commands

- **Root**: `npm run build`
- **Server Build**: `npm run build --workspace=server`
- **Client Build**: `npm run build --workspace=client`
