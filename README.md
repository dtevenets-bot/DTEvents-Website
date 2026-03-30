# DT Events — read this daniel

alr so this is basically everything you need to know about running the DT Events project. i wrote it all out cause you'll probably forget half the shit we did together lol. read it properly and if anything is confusing just ask me dont just guess and push broken stuff.

---

## the big picture

we got 3 things and they all talk to the same firebase database:

- **Website** — the store where people browse and buy products. hosted on vercel, auto deploys from github
- **Discord Bot** — handles login codes, slash commands, giving products, all that. runs on JustRunMy.App
- **Roblox Hub** — the in game store where people actually buy with robux. its in roblox studio

when someone buys something on the website the bot knows, the roblox game knows, everything syncs up. its all connected.

github repos:
- `github.com/J-ohan1/DTEvents-Website`
- `github.com/J-ohan1/DTEvents-Bot`
- `github.com/J-ohan1/DTEvents-RobloxHub`

---

## accounts you need

make sure you have all of these. you probably already do but just checking:

1. **GitHub** — github.com
2. **Vercel** — vercel.com (sign in with github)
3. **Firebase** — console.firebase.google.com (sign in with google)
4. **Discord Developer Portal** — discord.com/developers/applications
5. **JustRunMy.App** — justrunmy.app

---

## installing stuff on your pc

you need 3 things installed before touching any code.

### Visual Studio Code

go to code.visualstudio.com, download it, install it. thats your code editor. open it when youre done.

### Git

go to git-scm.com/downloads, download for windows, install it. default settings are fine.

to check it worked open vs code, press Ctrl + ` (the key above tab), a terminal opens at the bottom. type `git --version` and hit enter. if you see a version number youre good. if it says command not found restart your pc and try again.

### Node.js

go to nodejs.org, download the LTS version (the big green button). install it.

check in the same terminal: `node --version` then `npm --version`. both should show version numbers.

---

## setting up folders and cloning

### make a folder

open File Explorer, go to Documents (or wherever), right click → New → Folder, name it `DTEvents`.

### open it in vs code

open vs code. at the very top left you see the File tab. click that → Open Folder. select the DTEvents folder you just made. you should see "DTEvents" in the top left of vs code now.

press Ctrl + ` to open the terminal.

### clone the repos

in the terminal run these one by one:

```
git clone https://github.com/J-ohan1/DTEvents-Website.git
git clone https://github.com/J-ohan1/DTEvents-Bot.git
git clone https://github.com/J-ohan1/DTEvents-RobloxHub.git
```

now you should see 3 folders inside DTEvents. thats all the code.

to pull the latest changes i pushed later: open that folder in vs code and run `git pull`

---

## how to push changes

this is important. every time you edit code:

1. open the repo folder in vs code (File → Open Folder)
2. make your edits, save with Ctrl + S
3. open terminal (Ctrl + `)
4. run:
```
git add .
git commit -m "what you changed"
git push
```

`git add .` stages everything. `git commit` saves it. `git push` sends it to github.

the website auto deploys from github so you dont gotta do anything else for that. the bot is different tho, ill explain later.

---

## firebase

both the website and bot use the same firebase database. go to console.firebase.google.com.

### if you already have the project

skip to the next section. youre good.

### creating the project

click Create a Project, name it whatever, disable analytics, create it. then go to Build → Realtime Database → Create Database. pick a location close to your users. choose "Start in test mode" for now. hit Enable.

copy the database url at the top. it looks like `https://your-project-default-rtdb.firebaseio.com`. save that.

also copy your Project ID from the gear icon → Project settings.

### service account key

this is what lets the website and bot write to the database. dont share it with anyone.

1. Project settings → Service accounts tab
2. click Generate new private key
3. download the json file, open it in notepad
4. you need 3 things from it:
   - `project_id`
   - `client_email` (looks like firebase-adminsdk@your-project.iam.gserviceaccount.com)
   - `private_key` (the whole thing from BEGIN to END)
5. delete the json file after. dont leave it on your pc.

### database rules

go to Realtime Database → Rules tab. delete everything and paste this:

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

hit Publish. dont touch these unless you know what youre doing.

---

## discord bot

the bot handles login codes, slash commands, all that shit. without it nobody can log in.

### bot application

1. go to discord.com/developers/applications
2. New Application, name it DT Events Bot
3. go to Bot tab
4. Reset Token, copy it, save it somewhere. you cant see it again.
5. turn ON Message Content Intent and Server Members Intent under Privileged Gateway Intents
6. Save Changes

### invite to server

OAuth2 → URL Generator. check "bot" scope, check "Administrator" permission. copy the url, open it, select the server, authorize.

### important ids

| What | ID |
|------|----|
| Server (Guild) ID | `1416818305527714035` |
| Admin Role ID | `1417477583645446264` |
| Booster Role ID | `1464428369650123030` |

to get ids in discord: settings → Advanced → Developer Mode (turn on). then right click stuff and Copy ID.

### webhook

you already made this in #announcements. named it DT-Notices. if you need to make a new one: server settings → Integrations → Webhooks → New Webhook → pick the channel → copy the url.

---

## deploying the website on vercel

1. go to vercel.com, log in with github
2. Add New → Project
3. find DTEvents-Website, click Import
4. leave everything default, it should detect Next.js
5. add these environment variables:

| Variable | What To Put |
|----------|------------|
| `FIREBASE_PROJECT_ID` | your firebase project id |
| `FIREBASE_CLIENT_EMAIL` | the client email from service account key |
| `FIREBASE_PRIVATE_KEY` | the private key, whole thing including BEGIN and END lines |
| `FIREBASE_DATABASE_URL` | your firebase database url |
| `DISCORD_WEBHOOK_URL` | the webhook url |
| `NEXT_PUBLIC_ROBLOX_HUB_URL` | roblox game url |
| `NEXTAUTH_SECRET` | random string, go to generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | your vercel url like https://dt-events.vercel.app |

6. Deploy. wait a minute or two. if it goes green youre live.

after that every time you push to github vercel auto rebuilds. no extra steps.

if you change env variables later: vercel → Settings → Environment Variables → edit → then go to Deployments → latest deployment → three dots → Redeploy.

---

## deploying the bot on JustRunMy.App

the bot runs on JustRunMy.App in a docker container. you push code to their git remote and it builds automatically.

**important: you gotta restart the bot every 3 days.** JustRunMy.App has a session limit. set a phone reminder. if you forget the bot dies and nobody can log in.

### first time setup

1. go to justrunmy.app, log in
2. Create Application, choose Docker
3. go to Settings → Advanced tab
4. find the Git Push section, copy that url (looks like `https://justrunmy.app/git/r_Pd9j4R`)

### connecting the git remote

open the DTEvents-Bot folder in vs code. open terminal.

```
git remote add justrunmy https://justrunmy.app/git/r_Pd9j4R
```

(yours will have a different code at the end, use whatever the dashboard shows)

```
git push justrunmy master
```

wait for the build. you'll see all the docker steps in the terminal.

### environment variables

in the JustRunMy.App dashboard → Settings → Environment Variables, add:

| Variable | What To Put |
|----------|------------|
| `DISCORD_TOKEN` | bot token from discord dev portal |
| `GUILD_ID` | `1416818305527714035` |
| `ADMIN_ROLE_ID` | `1417477583645446264` |
| `BOOSTER_ROLE_ID` | `1464428369650123030` |
| `OWNER_USER_ID` | your discord user id |
| `BOT_OWNER_USER_ID` | your discord user id |
| `FIREBASE_PROJECT_ID` | same as website |
| `FIREBASE_CLIENT_EMAIL` | same as website |
| `FIREBASE_PRIVATE_KEY` | same as website, wrap in quotes |
| `FIREBASE_DATABASE_URL` | same as website |

save and restart the app.

### updating the bot later

pull from github, push to JustRunMy.App:

```
git pull origin master
git push justrunmy master
```

### restarting

go to justrunmy.app dashboard → find the app → Restart. do this every 3 days. seriously.

---

## roblox hub

the in-game store. someone clicks checkout on the website → gets redirected here → buys with robux.

### setup in roblox studio

open Roblox Studio, create a Baseplate game.

in the Explorer panel (right side):
- ReplicatedStorage → right click → Insert Object → Folder → name it `Shared`
- ServerScriptService → right click → Insert Object → Folder → name it `Server`

now add the scripts from the DTEvents-RobloxHub repo:

| File | Where | Type |
|------|-------|------|
| `Shared/ProductConfig.lua` | ReplicatedStorage → Shared | ModuleScript |
| `Shared/FirebaseModule.lua` | ReplicatedStorage → Shared | ModuleScript |
| `Server/ProductService.lua` | ServerScriptService → Server | Script |
| `Client/ProductHub.lua` | StarterGui | LocalScript |

**do not fuck up the script types.** ProductService MUST be a regular Script (not LocalScript). ProductHub MUST be a LocalScript (not Script). if you get this wrong nothing works.

### set firebase url

open ProductConfig, find `FirebaseUrl = ""`, put your firebase url:

```lua
FirebaseUrl = "https://your-project-default-rtdb.firebaseio.com",
```

no trailing slash. no .json. just the raw url.

### enable http requests

Game Settings → Security → Allow HTTP Requests → ON

### publish

File → Publish to Roblox. then make the game public.

### connect to website

copy the game url. go to vercel → DTEvents-Website → env variables. set `NEXT_PUBLIC_ROBLOX_HUB_URL` to the game url. redeploy.

---

## how everything works

### login
someone clicks login on the website → bot DMs them a code → they enter it → they're in. their discord roles decide what they can see.

### buying
free product: click Claim → instant, no robux needed.
paid product: add to cart → checkout → redirected to roblox hub → buy the gamepass → product shows up in My Products.

### announcements
owner panel → click Announce → posts to #announcements with @everyone. nice embed with the product image and all.

### permissions
- **Owner** (you) — full access, owner panel, admin panel, everything
- **Admin** — admin panel, give/revoke products, audit logs
- **Booster** — booster exclusive products
- **Everyone** — browse, buy, download

---

## daily stuff you'll do

- **add a product:** owner panel → Create Product → fill in everything → upload images → upload .rbxm file → Create
- **delete a product:** owner panel → Delete. WARNING: this deletes it from everyone's My Products too. permanent.
- **announce a product:** owner panel → Announce
- **give a product:** admin panel → Grant Product → enter their discord id and product id
- **revoke a product:** admin panel → Revoke Product

---

## troubleshooting

| Problem | What To Do |
|---------|-----------|
| bot offline | restart on JustRunMy.App |
| slash commands not showing | run `npm run register` in bot folder |
| /verify not working | bot online? Server Members Intent ON in dev portal? |
| login broken | bot online? Message Content Intent ON? |
| products not showing | firebase rules correct? `.read: true` on everything? |
| download fails "you dont own this" | user hasnt bought/claimed it yet |
| checkout link broken | NEXT_PUBLIC_ROBLOX_HUB_URL set in vercel? game public? |
| roblox blank screen | HTTP requests enabled? firebase url correct? ProductService is Script not LocalScript? |
| webhook not posting | DISCORD_WEBHOOK_URL in vercel? redeployed after setting it? |
| bot build fails on justrunmy | read the terminal output, usually typescript error or missing dep |
| website build fails on vercel | check deployment logs, usually missing env variable |

---

## quick reference

### push commands
```
git pull origin master                    ← pull latest code
git add . && git commit -m "msg" && git push   ← push to github
git push justrunmy master                ← push bot to JustRunMy.App
```

### website env vars (vercel)
`FIREBASE_PROJECT_ID` `FIREBASE_CLIENT_EMAIL` `FIREBASE_PRIVATE_KEY` `FIREBASE_DATABASE_URL` `DISCORD_WEBHOOK_URL` `NEXT_PUBLIC_ROBLOX_HUB_URL` `NEXTAUTH_SECRET` `NEXTAUTH_URL`

### bot env vars (JustRunMy.App)
`DISCORD_TOKEN` `GUILD_ID` `ADMIN_ROLE_ID` `BOOSTER_ROLE_ID` `OWNER_USER_ID` `BOT_OWNER_USER_ID` + the 4 firebase ones (same as website)

---

backup firebase once in a while. console → realtime database → three dots → Export JSON. save that file somewhere.

if something breaks and you cant figure it out from this just message me. dont push random shit hoping it fixes itself.
