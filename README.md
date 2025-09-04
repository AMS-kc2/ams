# KCS‑2.0 Monorepo — Backend

> Backend API for KCS‑2.0 attendance management system (Node.js + Express + Prisma/MongoDB).

---

## 📌 Table of Contents

- [KCS‑2.0 Monorepo — Backend](#kcs20-monorepo--backend)
  - [📌 Table of Contents](#-table-of-contents)
  - [🔎 Overview](#-overview)
  - [📂 Ways to Clone](#-ways-to-clone)
    - [1. Clone only the backend (sparse checkout)](#1-clone-only-the-backend-sparse-checkout)
    - [2. Clone the full repository](#2-clone-the-full-repository)
    - [⚖ Which should you choose?](#-which-should-you-choose)
  - [⚙ Setup \& Run](#-setup--run)
  - [📜 Scripts](#-scripts)
  - [🔑 Configuration (`.env`)](#-configuration-env)
  - [🗂 Project Structure](#-project-structure)
  - [📝 Git Basics: Commit \& Push](#-git-basics-commit--push)
  - [🛠 Troubleshooting](#-troubleshooting)

---

## 🔎 Overview

This is the **backend application** of the KCS‑2.0 monorepo. It's a RESTful API built with:

* **Node.js** (ESM)
* **Express**
* **Prisma** connected to **MongoDB**
* Utilities: error handling (`AppError`), validation (Zod), response helpers, etc.

It's structured for clarity, maintainability, and easy collaboration.

---

## 📂 Ways to Clone

There are **two ways to clone this repository**, depending on your needs and internet speed.

### 1. Clone only the backend (sparse checkout)

```bash
git clone --filter=blob:none --sparse git@github.com:MonaTech-Solution/KCS-2.0.git
cd KCS-2.0
# checkout only the backend folder
git sparse-checkout set backend-api/
cd backend-api
```

✅ **Pros**

* Faster download (only backend files).
* Less disk space used.
* Perfect if you only care about backend.

❌ **Cons**

* You won’t have the frontend code locally.
* Switching later to full clone is a bit tricky.

---

### 2. Clone the full repository

```bash
git clone git@github.com:MonaTech-Solution/KCS-2.0.git
cd KCS-2.0/backend-api
```

✅ **Pros**

* You get **everything** (frontend + backend).
* Easier if you later need to work on frontend too.
* Simpler Git workflow (no sparse-checkout config).

❌ **Cons**

* Slower to download.
* Takes more storage.

---

### ⚖ Which should you choose?

* If you are **only working on backend**, use **sparse checkout**.
* If you want **both backend & frontend**, or don’t mind larger download, use **full clone**.

---

## ⚙ Setup & Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Setup environment variables:

   * Copy `.env.example` → `.env`
   * Edit variables: e.g. `DATABASE_URL`, `PORT`, `JWT_SECRET`, `NODE_ENV`

3. Generate Prisma client:

   ```bash
   npm run db:generate
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

---

## 📜 Scripts

| Script                | Description                      |
| --------------------- | -------------------------------- |
| `npm run dev`         | Starts dev server (with nodemon) |
| `npm run lint`        | Runs Biome lint                  |
| `npm run format`      | Formats code with Biome          |
| `npm run db:generate` | Regenerates Prisma client        |

---

## 🔑 Configuration (`.env`)

Example variables:

```env
DATABASE_URL="mongodb://localhost:27017/kcs"
PORT=3000
JWT_SECRET="supersecretkey"
NODE_ENV="development"
```

---

## 🗂 Project Structure

```
backend-api/
├── src/
│   ├── configs/        # config files (DB, env, etc.)
│   ├── controllers/    # route handlers
│   ├── routes/         # route definitions
│   ├── schema/         # Zod validation schemas
│   ├── utils/          # helpers (AppError, response handlers)
│   ├── generated/      # Prisma client (auto-generated)
│   └── index.js        # main server entrypoint
├── prisma/             # Prisma schema & migrations
├── .env.example
├── package.json
└── README.md           # you are here
```

---

## 📝 Git Basics: Commit & Push

If you’re new to Git, here’s how you make changes and push them:

1. **Check your current branch**

   ```bash
   git branch
   ```

2. **Create a new branch** (don’t work directly on `main`)

   ```bash
   git checkout -b feature/my-change
   ```

3. **See what changed**

   ```bash
   git status
   ```

4. **Stage files** (mark them for commit)

   ```bash
   git add .
   ```

5. **Commit your changes** (write a clear message)

   ```bash
   git commit -m "feat: add student signup controller"
   ```

6. **Push your branch to GitHub**

   ```bash
   git push origin feature/my-change
   ```

7. On GitHub, open a **Pull Request (PR)** so teammates can review and merge.

---

## 🛠 Troubleshooting

| Issue                 | Solution                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| `zod` errors          | Ensure payload matches schema. Check error message for details.          |
| `PrismaClient` issues | Run `npm run db:generate` and restart the server.                        |
| Connection failed     | Check `DATABASE_URL` and ensure MongoDB is running.                      |
| Missing types         | Ensure VSCode or TS server is aware of Prisma client (restart if needed) |

---

💡 **Tip for beginners:** Don’t be afraid to break things — Git remembers everything. If you mess up, you can always reset or reclone.

Happy coding 🎉

— *Abu Abdir-Rahman*
