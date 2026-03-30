# DT Events — Daniel's Guide

> yo daniel its johan. i wrote this whole thing step by step for you so read it carefully. dont skip anything. if something is confusing or you didnt get it ask me dont just guess and break stuff 😭

---

## what even is this project

ok so basically we have 3 things that work together:

| Thing | What It Does | Where It Lives |
|-------|-------------|----------------|
| **Website** | the store where people browse and buy products | hosted on Vercel (automatically deploys from github) |
| **Discord Bot** | handles login codes, account linking, giving products, all the slash commands | hosted on JustRunMy.App (runs 24/7 in a docker container) |
| **Roblox Hub** | the in-game store where people actually buy stuff with robux | inside Roblox Studio (published as a game) |

they all talk to the same Firebase database so when someone buys something on the website the bot knows about it and the roblox game knows about it. they all share the same data.

**the 3 github repos are:**
- `https://github.com/J-ohan1/DTEvents-Website`
- `https://github.com/J-ohan1/DTEvents-Bot`
- `https://github.com/J-ohan1/DTEvents-RobloxHub`

---

## accounts you need

before we do anything you need these accounts. go make all of them right now:

1. **GitHub** — https://github.com (where all the code lives, you need this to clone and push)
2. **Vercel** — https://vercel.com (hosts the website, sign up with your github account)
3. **Firebase** — https://console.firebase.google.com (the database, sign in with google)
4. **Discord Developer Portal** — https://discord.com/developers/applications (for the bot)
5. **JustRunMy.App** — https://justrunmy.app (runs the bot 24/7)

you probably already have most of these since we set them up together but just making sure.

---

## things you need to install on your computer

ok so before you touch any code you need to install these 3 things. do them in order.

### 1. Visual Studio Code (VS Code)

this is where you edit all the code. its free.

1. go to https://code.visualstudio.com
2. click the big download button
3. run the installer, just click next through everything, default settings are fine
4. open it up after its installed

### 2. Git

this is what lets you download the code from github and push changes back up.

1. go to https://git-scm.com/downloads
2. download it for windows
3. run the installer, again just next through everything
4. after its installed open vs code, press **Ctrl + `** (thats the key above tab, next to the 1 key), a terminal should open at the bottom
5. type `git --version` and press enter. if you see a version number like `2.43.0` then its installed correctly. if it says "command not found" then restart your computer and try again.

### 3. Node.js

the website and the bot both need this to run. it comes with npm which installs all the libraries.

1. go to https://nodejs.org
2. download the **LTS** version (the big green button that says "Recommended for Most Users")
3. run the installer, next through everything
4. after its installed open a terminal in vs code (Ctrl + `)
5. type `node --version` and press enter. you should see something like `v20.x.x` or `v22.x.x`
6. then type `npm --version` and press enter. you should see something like `10.x.x`

if both of those show version numbers youre good.

---

## setting up your folders

alr so now youre going to create a main folder for everything and clone the 3 repos into it. follow this exactly.

### step 1: create the main folder

1. open **File Explorer** (the yellow folder icon in your taskbar)
2. go to your **Documents** folder (or wherever you want to keep this stuff)
3. right click in the empty space → **New** → **Folder**
4. name it **DTEvents**

### step 2: open it in VS Code

1. open **Visual Studio Code**
2. look at the very top left of the window, you'll see a tab that says **File**
3. click **File** → **Open Folder...**
4. a window will pop up — navigate to the **DTEvents** folder you just created
5. click **Select Folder** (the button at the bottom right of the window)
6. you should see "DTEvents" in the top left corner of vs code now

### step 3: open the terminal

press **Ctrl + `** — a terminal panel opens at the bottom of vs code. you'll be using this a lot so dont close it.

### step 4: clone the repos

run these one by one in the terminal. just copy each line, paste it (Ctrl + V), and press enter:

```bash
git clone https://github.com/J-ohan1/DTEvents-Website.git
```

wait for it to finish, then:

```bash
git clone https://github.com/J-ohan1/DTEvents-Bot.git
```

wait for it to finish, then:

```bash
git clone https://github.com/J-ohan1/DTEvents-RobloxHub.git
```

you should now see 3 folders inside your DTEvents folder in vs code:
- `DTEvents-Website`
- `DTEvents-Bot`
- `DTEvents-RobloxHub`

thats all your code. if you ever need to pull the latest changes i pushed, you just open that folder in vs code and run `git pull` in the terminal.

---

## how to push changes (important read this)

ok so this is how you push changes when you edit code. you'll do this a lot so memorize it.

1. open the folder you want to change in vs code (File → Open Folder → select the repo folder)
2. make your changes to whatever file you need to edit
3. press **Ctrl + S** to save the file
4. open the terminal (**Ctrl + `**)
5. run these commands one by one:

```bash
git add .
git commit -m "what you changed"
git push
```

- `git add .` — stages all your changes (the dot means "everything")
- `git commit -m "message"` — saves a snapshot with a message describing what you did
- `git push` — uploads it to github

**thats it.** every time you push to github, vercel automatically rebuilds the website. you dont have to do anything else for the website.

for the bot its slightly different, i'll explain that in the bot section.

---

## firebase setup

both the website and the bot need firebase. this is the database where everything is stored — products, users, carts, all of it.

### create the project

1. go to https://console.firebase.google.com
2. sign in with your google account
3. click **"Create a project"** (or "Add project")
4. name it something like `DTEvents` or whatever you want
5. you can disable google analytics, we dont need it
6. click **Create project**, wait for it to finish

### create the realtime database

1. in your firebase project, click **"Build"** → **"Realtime Database"** in the left sidebar
2. click **"Create Database"**
3. pick a location closest to your users
4. **IMPORTANT** — select **"Start in test mode"** for now
5. click **Enable**

### copy your database url

at the top of the realtime database page you'll see a url like:
```
https://dt-events-abc123-default-rtdb.firebaseio.com
```
copy that whole thing. you'll need it later.

### copy your project id

1. click the **gear icon** (top left near "Project Overview") → **"Project settings"**
2. under the "General" tab you'll see your **Project ID**
3. copy it

### get the service account key

this is what lets the website and bot write to the database. do NOT share this with anyone.

1. still in project settings, click the **"Service accounts"** tab at the top
2. scroll down to "Firebase Admin SDK"
3. click **"Generate new private key"**
4. click **"Generate key"** on the popup
5. a JSON file will download to your computer
6. open it with notepad or any text editor
7. you need 3 things from it:
   - `"project_id"` — your firebase project id
   - `"client_email"` — looks like `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
   - `"private_key"` — a long string that starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----`

8. **delete** the downloaded JSON file after you copy those values. dont leave it sitting on your computer.

### set the database rules

1. go to **Realtime Database** → **Rules** tab
2. **delete everything** in the editor and paste this exactly:

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

3. click **Publish**

---

## discord bot setup

the bot handles login codes, account linking, and all the slash commands. without it nobody can log into the website.

### create the bot application

1. go to https://discord.com/developers/applications
2. click **"New Application"**
3. name it `DT Events Bot` or whatever
4. click **"Bot"** in the left sidebar
5. click **"Reset Token"** → copy the token immediately. you will NOT be able to see it again. save it somewhere safe.
6. scroll down to **"Privileged Gateway Intents"** and turn ON:
   - **Message Content Intent**
   - **Server Members Intent**
7. click **Save Changes**

### invite the bot to the server

1. go to **"OAuth2"** → **"URL Generator"**
2. check **"bot"** under Scopes
3. check **"Administrator"** under Bot Permissions
4. copy the generated url, open it in your browser
5. select the DT Events server and click **Authorize**

### the ids you need

you already have these but just in case:

| What | ID |
|------|-----|
| Guild ID (server id) | `1416818305527714035` |
| Admin Role ID | `1417477583645446264` |
| Booster Role ID | `1464428369650123030` |

to get IDs from discord you need developer mode on:
1. discord settings → **Advanced** → turn on **Developer Mode**
2. right-click server icon → **Copy ID** (for guild id)
3. right-click a role → **Copy ID** (for role ids)
4. right-click a user → **Copy ID** (for user ids)

### the webhook

you already made this but heres the info:
- channel: `#announcements`
- webhook name: `DT-Notices`
- webhook url is saved in vercel as `DISCORD_WEBHOOK_URL`

if you ever need to make a new one:
1. go to server settings → **Integrations** → **Webhooks**
2. click **New Webhook**
3. pick the announcements channel, name it, click **Copy Webhook URL**

---

## deploying the website on vercel

the website auto-deploys from github. every time you push to the main branch vercel rebuilds it.

### first time setup

1. go to https://vercel.com and log in with your github account
2. click **"Add New..."** → **"Project"**
3. find **DTEvents-Website** in the list and click **Import**
4. framework preset should auto-detect as **Next.js**, leave everything default
5. scroll down to **Environment Variables** and add ALL of these:

| Variable Name | What To Put |
|--------------|-------------|
| `FIREBASE_PROJECT_ID` | your firebase project id |
| `FIREBASE_CLIENT_EMAIL` | the client_email from the service account key |
| `FIREBASE_PRIVATE_KEY` | the private_key from the service account key (the whole thing including BEGIN and END lines) |
| `FIREBASE_DATABASE_URL` | your firebase database url |
| `DISCORD_WEBHOOK_URL` | the discord webhook url |
| `NEXT_PUBLIC_ROBLOX_HUB_URL` | the roblox game url (e.g. `https://www.roblox.com/games/PLACEID/DT-Events`) |
| `NEXTAUTH_SECRET` | a random string, generate one at https://generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | your vercel website url (e.g. `https://dt-events.vercel.app`) |

6. click **Deploy** and wait for it to build (1-3 minutes)
7. once its green youre live

### updating the website

just push code to github. seriously thats it.
```
git add .
git commit -m "your change"
git push
```
vercel picks it up automatically. go to the vercel dashboard if you want to watch the build.

### if you change environment variables

1. go to vercel → your project → **Settings** → **Environment Variables**
2. edit/add what you need
3. go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

---

## deploying the bot on JustRunMy.App

the bot runs on JustRunMy.App which is basically a hosting service that runs a docker container 24/7. you already set this up with me but heres the full guide in case you need to redo it.

### what you need to know

- the bot uses a `Dockerfile` — this is a file that tells docker how to build the bot. you dont need to understand it, just know it exists.
- when you push code to JustRunMy.App's git remote, it automatically builds and deploys.
- **you have to restart the bot every 3 days.** JustRunMy.App has a session limit. set a reminder on your phone. if you forget the bot goes offline and nobody can log into the website.

### first time setup

1. go to https://justrunmy.app and log in
2. click **"Create Application"**
3. choose **Docker** as the deploy method
4. follow the prompts

### connect git push (advanced tab)

this is how you push code to JustRunMy.App. you only set up the remote once.

1. in your app dashboard, go to **Settings** (or **Advanced**) tab
2. find the **Git Push** section — it shows a git url like `https://justrunmy.app/git/r_XXXXX`
3. open vs code, open the `DTEvents-Bot` folder (File → Open Folder)
4. open terminal (Ctrl + `)
5. add the remote:

```bash
git remote add justrunmy https://justrunmy.app/git/r_Pd9j4R
```

replace the url with whatever yours shows in the dashboard.

6. push the code:

```bash
git push justrunmy master
```

wait for the build to finish. you'll see all the docker build steps in the terminal.

### set environment variables on JustRunMy.App

1. in your app dashboard → **Settings** → **Environment Variables**
2. add all of these:

| Variable | What To Put |
|----------|------------|
| `DISCORD_TOKEN` | the bot token from discord developer portal |
| `GUILD_ID` | `1416818305527714035` |
| `ADMIN_ROLE_ID` | `1417477583645446264` |
| `BOOSTER_ROLE_ID` | `1464428369650123030` |
| `OWNER_USER_ID` | your discord user id |
| `BOT_OWNER_USER_ID` | your discord user id (same thing) |
| `FIREBASE_PROJECT_ID` | your firebase project id |
| `FIREBASE_CLIENT_EMAIL` | the client_email from the service account key |
| `FIREBASE_PRIVATE_KEY` | the private_key (wrap it in double quotes `"..."`) |
| `FIREBASE_DATABASE_URL` | your firebase database url |

3. save and **restart the app**

### updating the bot

1. open the `DTEvents-Bot` folder in vs code
2. pull the latest code: `git pull origin master`
3. push to JustRunMy.App: `git push justrunmy master`
4. wait for the auto-rebuild

### restarting the bot (every 3 days)

1. go to https://justrunmy.app
2. find your bot app
3. click **Restart**
4. wait for it to come back online

thats it. do this every 3 days or everything breaks.

---

## roblox hub setup

the roblox hub is a game inside roblox that acts as a store. when someone clicks "checkout" on the website they get redirected here.

### what you need

1. **Roblox Studio** — download it from https://create.roblox.com (its free)
2. **The firebase url** — you already have this from the firebase setup
3. **A Roblox account** — you have one

### setting up the game

1. open **Roblox Studio**
2. create a new game (Baseplate template is fine)
3. in the **Explorer** panel (right side), create folders:
   - right-click **ReplicatedStorage** → Insert Object → Folder → name it `Shared`
   - right-click **ServerScriptService** → Insert Object → Folder → name it `Server`

4. now add the scripts. open each file from the `DTEvents-RobloxHub` repo in a text editor, copy the code, and paste it into roblox studio:

   | File From Repo | Where In Roblox | Script Type |
   |---------------|----------------|-------------|
   | `Shared/ProductConfig.lua` | ReplicatedStorage → Shared | **ModuleScript** |
   | `Shared/FirebaseModule.lua` | ReplicatedStorage → Shared | **ModuleScript** |
   | `Server/ProductService.lua` | ServerScriptService → Server | **Script** (NOT LocalScript!!) |
   | `Client/ProductHub.lua` | StarterGui | **LocalScript** (NOT Script!!) |

   ⚠️ getting the script type wrong is the #1 thing that breaks stuff. `ProductService` MUST be a regular Script. `ProductHub` MUST be a LocalScript.

5. open **ProductConfig** and find the line that says `FirebaseUrl = ""`. replace it with your firebase url:

```lua
FirebaseUrl = "https://your-project-default-rtdb.firebaseio.com",
```

no `/` at the end. no `.json`. just the raw url.

6. **enable HTTP requests** — Game Settings → Security → turn ON "Allow HTTP Requests"

7. publish the game — File → Publish to Roblox

8. make the game public so the checkout link works

### connecting the hub to the website

1. copy your game's url from roblox (looks like `https://www.roblox.com/games/123456/...`)
2. go to vercel → DTEvents-Website → Settings → Environment Variables
3. set `NEXT_PUBLIC_ROBLOX_HUB_URL` to that url
4. redeploy

---

## how everything works together

read this so you understand the full picture.

### login flow
```
user clicks "Login" on website
    → bot DMs them a 6-digit code
    → user enters code on website
    → website checks firebase, code matches
    → user is logged in
    → their discord roles determine what they can see
```

### buying a product
```
free product:
    user clicks "Claim" → product added to their account instantly

paid product:
    user adds to cart → goes to checkout → redirected to roblox hub
    → buys the gamepass in roblox → purchase recorded in firebase
    → product appears in "My Products" on website
    → user can download the .rbxm file
```

### announcements
```
you go to Owner Panel → click "Announce" on a product
    → website sends a webhook to discord
    → message posts in #announcements with @everyone
    → includes product image, name, price, link
```

### permissions
| Role | What They Can Do |
|------|-----------------|
| Owner (you) | everything — owner panel, admin panel, create/edit/delete products, announce |
| Admin | admin panel, grant/revoke products, audit logs |
| Booster | access to booster exclusive products |
| Everyone | browse, buy, download owned products |

---

## daily operations (stuff you'll do regularly)

### adding a product
1. log into website as owner
2. go to **Owner Panel**
3. click **Create Product**
4. fill in name, description, price, tags, type
5. upload images
6. upload the .rbxm file
7. click Create
8. its live

### deleting a product
1. owner panel → find the product → click Delete
2. confirm
3. **warning:** this removes it from EVERYONE's "My Products" too. and deletes the file from firebase. its permanent.

### announcing a product
1. owner panel → find the product → click Announce
2. it posts to #announcements with @everyone

### giving a product to someone (admin)
1. admin panel → Grant Product
2. enter their discord id and product id

### revoking a product
1. admin panel → Revoke Product
2. enter their discord id and product id

---

## important things to remember

1. **restart the bot every 3 days** or it goes offline and nobody can log in. this is the #1 thing you'll forget.

2. **never share environment variables.** they're secret keys. treat them like passwords.

3. **the website auto-deploys from github.** just push code and vercel handles the rest.

4. **the bot does NOT auto-deploy.** you have to manually push to JustRunMy.App's remote: `git push justrunmy master`

5. **backup firebase periodically.** go to firebase console → realtime database → three dots → Export JSON. save it somewhere safe.

6. **if the bot build fails on JustRunMy.App** — check the terminal output. it'll tell you what went wrong. the most common issue is a missing dependency or typescript error.

7. **if the website build fails on vercel** — check the deployment logs. usually its a missing environment variable.

8. **free products dont need a gamepass.** paid products MUST have a gamepass id.

9. **when you see 200 status codes in logs** — that means everything is working. 200 = good. only worry about 4xx and 5xx errors.

10. **product images in the roblox hub must be roblox asset IDs** (format: `rbxassetid://123456`). external urls like imgur or discord cdn will NOT work in roblox.

---

## troubleshooting

### "bot is offline in discord"
the bot process crashed or the 3-day limit hit. go to JustRunMy.App and restart it.

### "slash commands not showing up"
run `npm run register` in the bot folder terminal. only needs to be done once or when new commands are added.

### "verification codes not working / login broken"
- is the bot online? check JustRunMy.App dashboard
- is Message Content Intent turned on in discord developer portal? (Bot tab → Privileged Gateway Intents)
- is Server Members Intent turned on?

### "products not showing on website"
- are firebase rules correct? every path needs `.read: true`
- do products actually exist in firebase? (console.firebase.google.com → realtime database → products)
- did you redeploy after changing env variables?

### "download says you do not own this product"
the user hasnt purchased/claimed it yet. they need to go through the checkout or claim flow first.

### "checkout link goes nowhere / something went wrong"
- is `NEXT_PUBLIC_ROBLOX_HUB_URL` set in vercel?
- is the roblox game public?
- is the url correct? no typos.

### "roblox hub shows blank screen / failed to load"
- is HTTP requests enabled in roblox studio? (Game Settings → Security)
- is the firebase url correct in ProductConfig.lua?
- is ProductService a regular Script (not LocalScript)?
- are firebase rules set to `.read: true` on all paths?

### "webhook not posting to discord"
- is `DISCORD_WEBHOOK_URL` set in vercel?
- did you redeploy after setting it?
- is the webhook in the right channel?

### "bot build fails on JustRunMy.App"
read the error in the terminal. common causes:
- typescript compilation error (someone pushed broken code)
- missing dependency (check package.json)
- if it says `npx tsc` failed — make sure typescript is in the devDependencies in package.json

---

## quick reference

### website env variables (vercel)
| Variable | Example |
|----------|---------|
| `FIREBASE_PROJECT_ID` | `dt-events-abc123` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk@dt-events.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----` |
| `FIREBASE_DATABASE_URL` | `https://dt-events-default-rtdb.firebaseio.com` |
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` |
| `NEXT_PUBLIC_ROBLOX_HUB_URL` | `https://www.roblox.com/games/123/DT-Events` |
| `NEXTAUTH_SECRET` | `a1b2c3...` (random string) |
| `NEXTAUTH_URL` | `https://dt-events.vercel.app` |

### bot env variables (JustRunMy.App)
| Variable | Example |
|----------|---------|
| `DISCORD_TOKEN` | `MTIzNDU2...` |
| `GUILD_ID` | `1416818305527714035` |
| `ADMIN_ROLE_ID` | `1417477583645446264` |
| `BOOSTER_ROLE_ID` | `1464428369650123030` |
| `OWNER_USER_ID` | `your discord id` |
| `BOT_OWNER_USER_ID` | `your discord id` |
| `FIREBASE_PROJECT_ID` | same as website |
| `FIREBASE_CLIENT_EMAIL` | same as website |
| `FIREBASE_PRIVATE_KEY` | same as website |
| `FIREBASE_DATABASE_URL` | same as website |

### useful commands
| What | Command |
|------|---------|
| pull latest code | `git pull origin master` |
| push to github | `git add . && git commit -m "msg" && git push` |
| push bot to JustRunMy.App | `git push justrunmy master` |
| register slash commands | `npm run register` (in bot folder) |
| build bot locally | `npm run build` (in bot folder) |
| start bot locally | `npm start` (in bot folder) |

---

if something breaks and you cant figure it out from this guide just message me. dont guess and push random stuff that'll make it worse 😭
