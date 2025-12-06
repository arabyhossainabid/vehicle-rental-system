## Live URL
https://vehicle-rental-system-gamma.vercel.app/

## Features
- JWT দিয়ে লগইন/রেজিস্ট্রেশন করেছি (Admin & Customer)
- গাড়ি যোগ, আপডেট, ডিলিট এবং লিস্ট দেখা
- বুকিং করা, ক্যান্সেল করা, এপ্রুভ আর রিটার্ন করা
- অ্যাডমিন দিয়ে ইউজার ও বুকিং ম্যানেজ
- Helmet, CORS, Bcrypt দিয়ে বেসিক সিকিউরিটি

## Tech Stack
- Node.js, Express.js, TypeScript
- PostgreSQL
- JWT, Bcrypt
- Deployment: Vercel

## Setup & Usage Instructions
1. git clone: `git clone https://github.com/your-username/vehicle-rental-system.git`
2. npm install: `npm install`
3. Set .env: 
   PORT=5000
   DATABASE_URL: `postgresql://neondb_owner:npg_mpC2nPNEqJc4@ep-quiet-king-a4op4kdz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
   JWT_SECRET : `a-string-secret-at-least-256-bits-long`
4. Run: `npm run dev`
5. 