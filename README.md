# EconQuest — Gamified Economics Learning Platform

Learn microeconomics, macroeconomics, personal finance, and behavioral economics through quests, challenges, and simple simulations.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, React Hot Toast, Lucide React
- **Backend:** Node.js, Express (plain JavaScript)
- **Database:** MySQL 8+ (raw SQL via `mysql2`)

## Prerequisites

- Node.js 18+
- MySQL 8+ (local install, XAMPP, etc.)

## Setup

### 1. Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE econquest;
USE econquest;
SOURCE /absolute/path/to/econquest/server/database/schema.sql;
```

Seed content (quests, lessons, challenges, shop, achievements, demo users):

```bash
cd econquest/server
cp ../.env.example .env   # or edit existing .env
# Edit .env with DB credentials
npm install
npm run seed
```

> Note: `server/database/seed.sql` only reminds you to run `npm run seed`. All seed data is loaded by `database/loadSeed.js` so large lesson JSON stays maintainable.

### 2. Backend

```bash
cd econquest/server
npm install
node app.js
```

API: `http://localhost:3001`

### 3. Frontend

```bash
cd econquest/client
npm install
npm run dev
```

App: `http://localhost:5173`

Optional: create `client/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Demo login

- **Email:** `demo@econquest.com`
- **Password:** `password123`

## Environment variables

See `.env.example` in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=econquest
DB_PORT=3306
JWT_SECRET=econquest-secret-key-change-in-production
PORT=3001
CLIENT_URL=http://localhost:5173
```

Copy to `server/.env` and adjust passwords.

## Project layout

- `client/` — Vite + React UI
- `server/` — Express API and `database/` (schema, seed loader, quest content)

## License

Educational demo — customize as needed.
