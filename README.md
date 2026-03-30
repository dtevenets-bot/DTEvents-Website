# DT Events Website - Complete Owner Guide

> **Welcome!** This guide is written for someone with **zero coding experience**. Every single step is explained in plain English. If something is confusing, read it again slowly — it will make sense.

---

## Table of Contents

1. [What Is This Project?](#what-is-this-project)
2. [How the Whole System Works (Big Picture)](#how-the-whole-system-works-big-picture)
3. [Accounts You Need to Create](#accounts-you-need-to-create)
4. [Environment Variables Explained](#environment-variables-explained)
5. [Step-by-Step: Set Up Firebase](#step-by-step-set-up-firebase)
6. [Step-by-Step: Get Your Firebase Service Account Key](#step-by-step-get-your-firebase-service-account-key)
7. [Step-by-Step: Set Firebase Database Rules](#step-by-step-set-firebase-database-rules)
8. [Step-by-Step: Create a Discord Webhook](#step-by-step-create-a-discord-webhook)
9. [Step-by-Step: Create a Discord Bot](#step-by-step-create-a-discord-bot)
10. [Step-by-Step: Deploy on Vercel](#step-by-step-deploy-on-vercel)
11. [Step-by-Step: Generate a NextAuth Secret](#step-by-step-generate-a-nextauth-secret)
12. [How the Login System Works](#how-the-login-system-works)
13. [How the Product System Works](#how-the-product-system-works)
14. [Key Features Overview](#key-features-overview)
15. [Project Structure (What Each Folder Does)](#project-structure-what-each-folder-does)
16. [Troubleshooting Common Problems](#troubleshooting-common-problems)
17. [Daily Operations Guide](#daily-operations-guide)
18. [Important Things to Remember](#important-things-to-remember)

---

## What Is This Project?

This is a **website that sells Roblox products** — specifically DJ equipment models (like Pioneer DJM-V10, GLP Burst, etc.). People visit the website, browse products, buy them through Roblox gamepasses, and then download the files to use in their Roblox games.

**The tech stack (what the site is built with):**

| Technology | What It Does | Where It Lives |
|---|---|---|
| **Next.js 16** | The website framework (makes the web pages work) | Runs on Vercel |
| **TypeScript** | A safer way to write JavaScript (the programming language) | Inside the code |
| **Tailwind CSS** | Makes the website look good (styling) | Inside the code |
| **shadcn/ui** | Pre-built UI components (buttons, cards, etc.) | Inside the code |
| **Firebase Realtime Database** | Stores ALL data (products, users, carts, files) | Google's servers |
| **Vercel** | Hosts the website (puts it on the internet) | vercel.com |
| **Discord Bot** | Handles user login and verification | Runs separately |

---

## How the Whole System Works (Big Picture)

Think of the system as a chain of connected pieces:

```
User visits website (hosted on Vercel)
        |
        v
Website loads products from Firebase Database
        |
        v
User wants to log in → Discord Bot sends them a code
        |
        v
User enters code on website → verified!
        |
        v
User browses products, adds to cart, checks out
        |
        v
Checkout redirects to Roblox gamepass purchase
        |
        v
After purchase, user can download .rbxm files
        |
        v
Discord webhook announces new products automatically
```

**None of this works without the environment variables (secret keys) set up correctly on Vercel.** That is the #1 thing to get right.

---

## Accounts You Need to Create

You need **5 accounts** to run this project. Create all of these before doing anything else:

### 1. GitHub Account
- **Website:** https://github.com
- **What it does:** Stores your code. Every time you make changes, they go here first.
- **Why you need it:** Vercel reads the code from GitHub to deploy the website.

### 2. Firebase Account (by Google)
- **Website:** https://console.firebase.google.com
- **What it does:** Stores all your data — products, users, carts, files, everything.
- **Why you need it:** The website cannot function without a database.

### 3. Vercel Account
- **Website:** https://vercel.com
- **What it does:** Puts your website on the internet so anyone can visit it.
- **Why you need it:** This is where the website actually lives and runs.

### 4. Discord Developer Account
- **Website:** https://discord.com/developers/applications
- **What it does:** Lets you create a Discord bot that handles user login.
- **Why you need it:** Users log in through Discord, not a regular username/password.

### 5. Roblox Account
- **Website:** https://roblox.com
- **What it does:** Where you create gamepasses for paid products.
- **Why you need it:** Paid products use Roblox gamepasses for payment.

---

## Environment Variables Explained

**"Environment variables"** are just secret keys/passwords that the website needs to work. Think of them like login credentials — the website uses them to connect to Firebase, Discord, etc.

You set these in **Vercel** (not in the code, not in a text file — only in Vercel's dashboard).

### Where to add them on Vercel:
1. Go to your Vercel dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add each one exactly as shown below

### Firebase Variables (REQUIRED — the site will NOT start without these):

| Variable Name | What It Is | Where to Find It |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Your Firebase project's ID | Firebase Console → Project Settings (gear icon) → General tab |
| `FIREBASE_CLIENT_EMAIL` | Email for server access | Firebase Admin SDK service account (see guide below) |
| `FIREBASE_PRIVATE_KEY` | Private key for server access | Firebase Admin SDK service account (see guide below) |
| `FIREBASE_DATABASE_URL` | URL to your database | Firebase Console → Realtime Database → it looks like `https://your-project-default-rtdb.firebaseio.com` |

### Discord Variables:

| Variable Name | What It Is | Where to Find It |
|---|---|---|
| `DISCORD_WEBHOOK_URL` | URL to send messages to your Discord channel | Discord server settings → Integrations → Webhooks (see guide below) |

### Roblox Variables:

| Variable Name | What It Is | Where to Find It |
|---|---|---|
| `NEXT_PUBLIC_ROBLOX_HUB_URL` | The URL to your Roblox game/hub | Any Roblox game link (starts with `https://www.roblox.com/games/...`) |

**NOTE:** This one starts with `NEXT_PUBLIC_` — that means it's safe to share (it shows up in the browser). All other variables are SECRET and should never be shared.

### NextAuth Variables (for session security):

| Variable Name | What It Is | How to Get It |
|---|---|---|
| `NEXTAUTH_SECRET` | A random string that encrypts user sessions | Run this command in your terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | Your website's URL | e.g. `https://dt-events.vercel.app` |

---

## Step-by-Step: Set Up Firebase

### Step 1: Create a Firebase Project
1. Go to https://console.firebase.google.com
2. Sign in with your Google account
3. Click **"Create a project"** (or "Add project")
4. Give it a name (e.g. "DT Events")
5. You can disable Google Analytics if you want (not needed)
6. Click **Create project**
7. Wait for it to finish (takes about 30 seconds)

### Step 2: Create a Realtime Database
1. In your Firebase project, look at the left sidebar
2. Click **"Build"** → **"Realtime Database"**
3. Click **"Create Database"**
4. Choose a location (pick the one closest to your users)
5. **IMPORTANT:** Select **"Start in test mode"** for now (we'll set proper rules later)
6. Click **Enable**

### Step 3: Copy Your Database URL
1. At the top of the Realtime Database page, you'll see a URL like:
   `https://your-project-name-default-rtdb.firebaseio.com`
2. Copy this entire URL — this is your `FIREBASE_DATABASE_URL`

### Step 4: Copy Your Project ID
1. Click the **gear icon** (top left, near "Project Overview") → **"Project settings"**
2. Under the "General" tab, you'll see your **Project ID**
3. Copy this — this is your `FIREBASE_PROJECT_ID`

---

## Step-by-Step: Get Your Firebase Service Account Key

This gives the website permission to read and write to your Firebase database. **Do NOT share this key with anyone.**

1. Go to **Firebase Console** → your project
2. Click the **gear icon** (top left) → **"Project settings"**
3. Click the **"Service accounts"** tab at the top
4. You'll see a section called "Firebase Admin SDK"
5. Click the **dropdown** that shows your language options (JavaScript, Python, etc.)
6. Click the button that says **"Generate new private key"**
7. A warning will pop up — click **"Generate key"**
8. A JSON file will download to your computer (something like `your-project-firebase-adminsdk-abc123.json`)
9. Open this file with any text editor (Notepad on Windows, TextEdit on Mac)
10. You will see something like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@your-project.iam.gserviceaccount.com",
  ...
}
```

11. From this file, copy these three values to your Vercel environment variables:
    - `"project_id"` value → paste as `FIREBASE_PROJECT_ID`
    - `"client_email"` value → paste as `FIREBASE_CLIENT_EMAIL`
    - `"private_key"` value → paste as `FIREBASE_PRIVATE_KEY`

**CRITICAL for `FIREBASE_PRIVATE_KEY`:** You must copy the **ENTIRE** value including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts. When you paste it into Vercel, make sure the `\n` characters stay as `\n` — do NOT replace them with actual newlines. Vercel should handle this automatically if you paste the raw value.

12. **DELETE** the downloaded JSON file from your computer after copying the values. This is a secret key — you don't want it sitting on your hard drive.

---

## Step-by-Step: Set Firebase Database Rules

Database rules control **who can read and write data** in your Firebase database. If these are wrong, the website will break.

### Where to find the rules:
1. Go to **Firebase Console** → your project
2. Click **"Realtime Database"** in the left sidebar
3. Click the **"Rules"** tab at the top

### What to paste:
**Delete everything** in the rules editor and paste this EXACTLY:

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": false
    },
    "userProducts": {
      ".read": true,
      ".write": true,
      ".indexOn": ["userId"]
    },
    "tempCarts": {
      ".read": true,
      ".write": true
    },
    "auditLogs": {
      ".read": true,
      ".write": true
    },
    "siteConfig": {
      ".read": true,
      ".write": false
    },
    "rbxmFiles": {
      ".read": true,
      ".write": false
    },
    "userLinks": {
      ".read": true,
      ".write": true
    },
    "verificationCodes": {
      ".read": true,
      ".write": true
    }
  }
}
```

### What each rule does:
| Path | What It Stores | Read | Write | Why |
|---|---|---|---|---|
| `products` | All products on the store | Anyone | Nobody (only server) | Products are created through the Owner Panel (server-side) |
| `userProducts` | Which products each user owns | Anyone | Anyone | Needed for the claim/purchase system |
| `tempCarts` | Shopping carts in progress | Anyone | Anyone | Needed for cart system to work |
| `auditLogs` | Record of admin actions | Anyone | Anyone | Needed for logging |
| `siteConfig` | Website configuration | Anyone | Nobody | Only the server should modify this |
| `rbxmFiles` | Downloadable .rbxm files | Anyone | Nobody | Files are uploaded through the Owner Panel (server-side) |
| `userLinks` | User account links | Anyone | Anyone | Needed for user accounts |
| `verificationCodes` | Login verification codes | Anyone | Anyone | Needed for the Discord login system |

### How to apply:
1. Paste the rules above into the editor
2. Click **"Publish"**
3. The rules are now live!

**NOTE:** After publishing, if Firebase warns about indexes, ignore it — the `.indexOn` rule for `userProducts` handles the important one.

---

## Step-by-Step: Create a Discord Webhook

A webhook lets the website automatically send messages to your Discord server (like when a new product is announced).

### Step 1: Open Discord Server Settings
1. Open **Discord** (desktop app or browser)
2. Go to your server
3. Right-click the server name → **"Server Settings"** (or click the server name at the top left)
4. Click **"Integrations"** in the left sidebar
5. Click **"Webhooks"**
6. Click **"New Webhook"**

### Step 2: Configure the Webhook
1. **Name:** Give it a name like "DT Events Bot"
2. **Channel:** Choose the channel where you want announcements (e.g. `#announcements`)
3. Click **"Copy Webhook URL"** — this is your `DISCORD_WEBHOOK_URL`

### Step 3: Save It
1. Go to **Vercel** → your project → **Settings** → **Environment Variables**
2. Add a variable named `DISCORD_WEBHOOK_URL` with the URL you just copied

**The webhook URL looks something like:**
`https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456`

---

## Step-by-Step: Create a Discord Bot

The Discord bot handles user login. When someone wants to log into the website, the bot DMs them a verification code.

### Step 1: Create the Application
1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Give it a name (e.g. "DT Events Bot")
4. Click **"Create"**
5. Accept the developer terms

### Step 2: Get the Bot Token
1. In your application, click **"Bot"** in the left sidebar
2. Click **"Reset Token"** (or "Copy" if it already exists)
3. Confirm by clicking "Yes, do it!"
4. **Copy the token immediately** — you will NOT be able to see it again!
5. This token goes into the **DTEvents-Bot** project (a separate bot, not this website)

### Step 3: Enable Message Content Intent
1. Still on the **"Bot"** page
2. Scroll down to **"Privileged Gateway Intents"**
3. Turn ON **"Message Content Intent"**
4. Click **"Save Changes"**

**This is CRITICAL.** Without this, the bot cannot read messages and the login system will not work.

### Step 4: Invite the Bot to Your Server
1. In your application, click **"OAuth2"** → **"URL Generator"**
2. Under "Scopes", check the box for **"bot"**
3. Under "Bot Permissions", check the box for **"Administrator"** (or at minimum: Send Messages, Use Application Commands)
4. Scroll down and copy the **"Generated URL"**
5. Open that URL in your browser
6. Select your server from the dropdown
7. Click **"Authorize"**
8. Complete the CAPTCHA
9. The bot should now appear in your Discord server!

---

## Step-by-Step: Deploy on Vercel

Vercel takes your code from GitHub and puts it on the internet. Every time you push changes to GitHub, Vercel automatically updates the website.

### Step 1: Push Code to GitHub
1. Make sure the code is in a GitHub repository (e.g. `DTEvents-Website`)
2. The repository must be set to **Public** or **Private** (both work)

### Step 2: Connect Vercel to GitHub
1. Go to https://vercel.com
2. Click **"Sign Up"** (or "Log In")
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 3: Import Your Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories — find **DTEvents-Website**
3. Click **"Import"**

### Step 4: Configure the Project
1. **Framework Preset:** Select **"Next.js"** (it should auto-detect this)
2. **Build Command:** Leave as default (`next build`)
3. **Output Directory:** Leave as default

### Step 5: Add ALL Environment Variables
This is the most important step. **The website will NOT work without these.**

Scroll down to "Environment Variables" and add every single one:

| Variable Name | Example Value |
|---|---|
| `FIREBASE_PROJECT_ID` | `dt-events-12345` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk@dt-events-12345.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIEvg...\n-----END PRIVATE KEY-----` |
| `FIREBASE_DATABASE_URL` | `https://dt-events-default-rtdb.firebaseio.com` |
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` |
| `NEXT_PUBLIC_ROBLOX_HUB_URL` | `https://www.roblox.com/games/123456/DT-Events` |
| `NEXTAUTH_SECRET` | (a long random string — see section below) |
| `NEXTAUTH_URL` | `https://your-site.vercel.app` |

### Step 6: Deploy
1. Click **"Deploy"**
2. Wait 1-3 minutes for the build to complete
3. If successful, you'll see a green checkmark and your website URL!

### Step 7: Auto-Deploy is Now On
From now on, **every time you push code to GitHub**, Vercel will automatically rebuild and redeploy the website. You don't have to do anything — it just works.

---

## Step-by-Step: Generate a NextAuth Secret

The `NEXTAUTH_SECRET` is a random string that keeps user sessions secure.

### Option 1: Use an Online Generator
1. Go to any random string generator website
2. Generate a 64+ character random string
3. Paste it as `NEXTAUTH_SECRET`

### Option 2: Use Node.js (if you have it installed)
Open your terminal/command prompt and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
a1b2c3d4e5f6...64 characters long...
```

Copy the entire output and paste it as `NEXTAUTH_SECRET` in Vercel.

---

## How the Login System Works

The website uses a **verification code system through Discord** — NOT a regular username/password login.

Here's the flow:

```
Step 1: User clicks "Login" on the website
              |
Step 2: Website tells the Discord bot to generate a 6-character code
              |
Step 3: Discord bot DMs the code to the user on Discord
              |
Step 4: User enters the code on the website
              |
Step 5: Website checks Firebase to see if the code matches
              |
Step 6: If it matches, the user is logged in!
              |
Step 7: The user's Discord roles determine their permissions:
         - Owner role  → Full access (Owner Panel, Admin Panel, everything)
         - Admin role  → Admin access (Admin Panel, grant/revoke products)
         - Booster role → Booster access (Booster Zone with exclusive products)
         - Regular user → Basic access (browse, buy, download owned products)
```

**Important:** The Discord bot must be running and able to DM users for this to work. If the bot is offline, nobody can log in.

---

## How the Product System Works

### Where Products Live
All products are stored in Firebase Realtime Database under the `products/` path.

### What a Product Looks Like
Each product has these properties:

| Property | What It Means | Example |
|---|---|---|
| `name` | Product name | `"Pioneer DJM-V10"` |
| `description` | What the product is | `"Professional DJ mixer"` |
| `price` | Price in Robux | `0` for free, `500` for paid |
| `images` | Array of image URLs | `["/Images/pioneer-djm-v10-front.png"]` |
| `tags` | Category tags | `["DJ", "Mixer", "Pioneer"]` |
| `type` | Product type | `"dj_equipment"` |
| `gamepassId` | Roblox gamepass ID | `"123456789"` (null for free products) |
| `maker` | Who made it | `"DT Events"` |
| `boosterExclusive` | Only for boosters? | `true` or `false` |

### Free vs. Paid Products

**Free Products (price = 0):**
1. User clicks "Claim" on the product
2. Product is immediately added to their "My Products" page
3. No cart, no checkout, no gamepass needed
4. User can download the file right away

**Paid Products (price > 0):**
1. User clicks "Add to Cart"
2. User goes to cart and clicks "Checkout"
3. Website redirects user to Roblox to purchase the gamepass
4. After purchasing, the product appears in "My Products"
5. User can then download the file

### How Downloads Work
- Product files (.rbxm format) are stored in Firebase under `rbxmFiles/{productId}`
- Files are stored as base64-encoded strings (basically, text that represents a file)
- When a user clicks "Download", the website:
  1. Checks if the user actually owns the product (from `userProducts`)
  2. If yes, converts the base64 data back into a file
  3. Sends the file to the user for download
  4. If no, shows an error: "You do not own this product"

---

## Key Features Overview

### Landing Page
- Hero section with branding
- Product previews (shows a few featured products)
- Services section
- Footer with links

### Hub (the main app after login)
Users see different sections based on their permissions:

| Section | Who Can See It | What It Does |
|---|---|---|
| **Product Store** | Everyone | Browse and search all available products |
| **My Products** | Everyone (after login) | View products you own, download files |
| **Booster Zone** | Users with Booster role | Products exclusive to server boosters |
| **Admin Panel** | Admins and Owners | Grant/revoke products, view audit logs |
| **Owner Panel** | Owners only | Create/edit/delete products, upload files, announce products |

### Owner Panel Features
- **Product Creation Wizard:** Step-by-step product creation
  1. Basic info (name, description, price)
  2. Images (upload product images)
  3. File upload (upload .rbxm files)
  4. Settings (tags, type, booster exclusive toggle)
- **Product Editing:** Edit any existing product
- **Product Deletion:** Delete products (cascade — also removes from all users' "My Products")
- **Announcements:** Send a formatted announcement to Discord with @everyone ping and a rich embed (includes product image, name, description, price, and link)

### Cart System
- Add/remove products
- Cart is saved to Firebase (`tempCarts/`) so it persists across sessions
- Cart syncs with the Roblox game for checkout
- Empty cart button

### Other Features
- **Dark mode / Light mode toggle**
- **Mobile responsive** (works on phones and tablets)
- **Search and filter** products by name, tag, type, price range
- **Audit logging** (tracks who did what and when)

---

## Project Structure (What Each Folder Does)

If you ever need to look at the code, here's what everything is:

```
dt-events-website/
├── public/                    # Static files (images, logos, robots.txt)
│   ├── Images/                # Product images (.png files)
│   ├── logo.png               # The DT Events logo
│   └── robots.txt             # Tells search engines how to crawl the site
│
├── src/                       # ALL the source code lives here
│   ├── app/                   # Next.js app router (web pages and API routes)
│   │   ├── page.tsx           # The landing page (homepage)
│   │   ├── layout.tsx         # The main layout (wraps every page)
│   │   ├── globals.css        # Global styles
│   │   └── api/               # API routes (server-side code)
│   │       ├── products/      # Product-related APIs
│   │       ├── cart/          # Cart API
│   │       ├── download/      # File download API (with ownership check)
│   │       ├── upload/        # File upload API (owner only)
│   │       ├── admin/         # Admin APIs (grant, revoke, audit)
│   │       ├── user/          # User profile and products APIs
│   │       └── auth/          # Authentication API
│   │
│   ├── components/            # UI components (the visual pieces)
│   │   ├── auth/              # Login modal, user menu
│   │   ├── landing/           # Landing page sections (hero, footer, etc.)
│   │   ├── hub/               # Hub page sections (store, cart, panels)
│   │   ├── ui/                # Reusable UI components (buttons, cards, etc.)
│   │   └── providers.tsx      # App-level providers (theme, auth context)
│   │
│   ├── hooks/                 # React hooks (reusable logic)
│   │   ├── use-toast.ts       # Toast notification system
│   │   └── use-mobile.ts      # Detect mobile screens
│   │
│   ├── stores/                # State management (Zustand)
│   │   ├── auth-store.ts      # User authentication state
│   │   └── cart-store.ts      # Shopping cart state
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── firebase.ts        # Firebase connection setup
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── db.ts              # Database helper functions
│   │   └── utils.ts           # General utility functions
│   │
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # All type definitions (Product, User, etc.)
│
├── package.json               # Project dependencies (like a recipe of what the project needs)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration (colors, fonts, etc.)
├── tsconfig.json              # TypeScript configuration
├── eslint.config.mjs          # Code quality checker configuration
├── postcss.config.mjs         # CSS processing configuration
├── prisma/                    # Prisma ORM (not actively used, can ignore)
├── bun.lock                   # Dependency lock file (ensures consistent versions)
└── Caddyfile                  # Caddy web server config (for self-hosting, not needed with Vercel)
```

---

## Troubleshooting Common Problems

### "Missing required Firebase environment variables"
**What it means:** The website can't connect to Firebase because it's missing one or more of the 4 required Firebase variables.
**How to fix:**
1. Go to Vercel → your project → Settings → Environment Variables
2. Make sure ALL of these are set with correct values:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_DATABASE_URL`
3. **Important:** After adding environment variables, you must **redeploy** the website for changes to take effect. Go to Vercel → Deployments → click the three dots on the latest deployment → **"Redeploy"**.

### "Firebase warning: Using an unspecified index"
**What it means:** Firebase is suggesting you add an index to make database queries faster.
**How to fix:** This is just a warning, NOT an error. The website still works. But to fix it, make sure your Firebase rules include `.indexOn: ["userId"]` under `userProducts` (shown in the [Firebase Rules](#step-by-step-set-firebase-database-rules) section).

### Webhook not sending @everyone
**What it means:** The Discord announcement message is sent but doesn't ping @everyone.
**How to fix:**
1. Make sure `DISCORD_WEBHOOK_URL` is correct in Vercel
2. Make sure the webhook is in the correct channel
3. Discord sometimes requires the bot/user who created the webhook to have the right permissions in the channel

### Roblox hub shows "Something went wrong"
**What it means:** The website can't read data from Firebase. Usually a database rules problem.
**How to fix:**
1. Go to Firebase Console → Realtime Database → Rules
2. Make sure ALL paths have `.read: true` (see the rules section above)
3. Publish the rules
4. Refresh the website

### Products not showing
**What it means:** The product list is empty on the website.
**How to fix:**
1. Check Firebase rules — `products` must have `.read: true`
2. Check that products actually exist in Firebase (go to Firebase Console → Realtime Database → click on `products`)
3. If products exist but aren't showing, check the browser console (F12 → Console tab) for errors

### Login not working
**What it means:** Users can't log in (code never arrives, or code doesn't verify).
**How to fix:**
1. Make sure the **Discord bot is running** (it's a separate application — `DTEvents-Bot`)
2. Make sure the bot can DM users (the user hasn't blocked DMs from server members)
3. Make sure `verificationCodes` has `.read: true` and `.write: true` in Firebase rules
4. Check that the bot has **Message Content Intent** enabled in the Discord Developer Portal

### Download fails with "You do not own this product"
**What it means:** The user is trying to download a file for a product they haven't claimed or purchased.
**How to fix:**
1. The user needs to go to "My Products" and confirm the product is listed there
2. If the product isn't there, they need to claim it (if free) or purchase it (if paid) first
3. If the user just purchased it, it might take a moment for the system to update — try refreshing

### Build fails on Vercel
**What it means:** The website failed to build when deploying.
**How to fix:**
1. Go to Vercel → your project → Deployments
2. Click on the failed deployment (it will be marked with an X)
3. Read the build logs — the error message is usually at the bottom
4. Common causes:
   - Missing environment variable (check ALL variables are set)
   - Code syntax error (someone made a typo in the code)
   - Dependency issue (a package update broke something)

### Cart not syncing with Roblox
**What it means:** Items added to the cart aren't being saved or checked out properly.
**How to fix:**
1. Make sure `tempCarts` has `.write: true` in Firebase rules
2. Check the browser console for errors (F12 → Console)
3. Make sure the user is logged in (cart requires authentication)

---

## Daily Operations Guide

### Adding a New Product
1. Log into the website as the owner
2. Go to the **Owner Panel**
3. Click **"Create Product"**
4. Follow the step-by-step wizard:
   - Step 1: Enter name, description, price, tags, type
   - Step 2: Upload product images
   - Step 3: Upload the .rbxm file (the actual Roblox model)
   - Step 4: Set additional options (booster exclusive, gamepass ID for paid products)
5. Click **"Create"**
6. The product is now live on the store!

### Editing a Product
1. Go to Owner Panel
2. Find the product in the list
3. Click **"Edit"**
4. Make your changes
5. Click **"Save"**

### Deleting a Product
1. Go to Owner Panel
2. Find the product
3. Click **"Delete"**
4. Confirm the deletion
5. **WARNING:** This removes the product from ALL users' "My Products" pages too (cascade delete). The .rbxm file is also deleted from Firebase.

### Announcing a Product
1. Go to Owner Panel
2. Find the product
3. Click **"Announce"**
4. A formatted message with an image embed and @everyone ping will be sent to your Discord server's announcements channel (wherever the webhook is set up)

### Granting a Product to a User (Admin)
1. Go to **Admin Panel**
2. Use the "Grant Product" feature
3. Enter the user's Discord ID and the product ID
4. The product will appear in the user's "My Products"

### Revoking a Product from a User (Admin)
1. Go to **Admin Panel**
2. Use the "Revoke Product" feature
3. Enter the user's Discord ID and the product ID
4. The product will be removed from the user's "My Products"

---

## Important Things to Remember

1. **NEVER share your environment variables.** They are secret keys that give full access to your database and services. Treat them like passwords.

2. **The Discord bot is a SEPARATE project.** This website only handles the web side. The Discord bot (DTEvents-Bot) runs independently and handles the login codes.

3. **Free products don't need a gamepass.** But paid products MUST have a valid `gamepassId` set in Firebase for the checkout flow to work.

4. **Firebase rules are security-critical.** If you make the wrong rules public, anyone could delete or modify your data. Use the exact rules provided above.

5. **Always test after making changes.** After changing environment variables or Firebase rules, redeploy on Vercel and test the website.

6. **The website auto-deploys.** Whenever you push code to the `main` branch on GitHub, Vercel automatically rebuilds and deploys. You don't need to do anything manually.

7. **Backups are important.** Firebase Realtime Database does not have automatic backups. Periodically export your database from Firebase Console → Realtime Database → three dots (top right) → "Export JSON". Save this file somewhere safe.

8. **200 status codes mean success.** If you're looking at server logs and see lots of `200` responses — that means everything is working correctly! 200 = OK. You only need to worry about 4xx and 5xx errors.

9. **The only warnings you'll see** are Firebase index warnings. These are NOT errors — they're just performance suggestions. They can be safely ignored, or you can add the suggested `.indexOn` rules to improve performance.

---

## Quick Reference Card

| What You Need | Where It Goes | How to Get It |
|---|---|---|
| Firebase Project ID | Vercel → `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| Firebase Client Email | Vercel → `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK service account |
| Firebase Private Key | Vercel → `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK service account |
| Firebase Database URL | Vercel → `FIREBASE_DATABASE_URL` | Firebase Console → Realtime Database |
| Discord Webhook URL | Vercel → `DISCORD_WEBHOOK_URL` | Discord Server Settings → Integrations → Webhooks |
| Roblox Hub URL | Vercel → `NEXT_PUBLIC_ROBLOX_HUB_URL` | Any Roblox game link |
| NextAuth Secret | Vercel → `NEXTAUTH_SECRET` | Generate with crypto command |
| NextAuth URL | Vercel → `NEXTAUTH_URL` | Your Vercel website URL |

---

## Contact & Support

If you run into issues that aren't covered in this guide:

1. **Check Vercel deployment logs** — they usually tell you exactly what went wrong
2. **Check Firebase rules** — 90% of problems are caused by incorrect database rules
3. **Check environment variables** — make sure all 8 variables are set and have correct values
4. **Search for the error message** — paste any error into Google for solutions

---

*This README was written for the new owner of DT Events. Good luck!*
