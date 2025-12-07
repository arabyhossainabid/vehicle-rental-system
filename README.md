## Live URL

https://y-mauve-delta-29.vercel.app/

## Features

- JWT দিয়ে লগইন/রেজিস্ট্রেশন করেছি (Admin & Customer)
- গাড়ি যোগ, আপডেট, ডিলিট এবং লিস্ট দেখা
- বুকিং করা, ক্যান্সেল করা, এপ্রুভ আর রিটার্ন করা
- অ্যাডমিন দিয়ে ইউজার ও বুকিং ম্যানেজ করা

## Tech Stack

- Node.js, Express.js, TypeScript
- PostgreSQL
- JWT, Bcrypt
- Deployment: Vercel

## Setup & Usage Instructions

1. npm install: `npm install`
2. Set .env:

- DATABASE_URL: psql 'postgresql://neondb_owner:npg_mpC2nPNEqJc4@ep-quiet-king-a4op4kdz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
- JWT_SECRET : `a-string-secret-at-least-256-bits-long`
- PORT=5000
- DB_USER=neondb_owner
- DB_PASSWORD=npg_v63FWQGzsxST
- DB_HOST=ep-sweet-frog-adkdurrw-pooler.c-2.us-east-1.aws.neon.tech
- DB_PORT=5432
- DB_NAME=neondb
- JWT_SECRET=a-string-secret-at-least-256-bits-long
- NODE_ENV=development

3. Run: `npm run dev`
4. admin email: admin@example.com

- password: Admin123456
