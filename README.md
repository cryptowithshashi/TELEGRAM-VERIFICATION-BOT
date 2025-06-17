# 🤖 CWS Verification Bot (Telegram Group Bot)

A powerful, customizable Telegram bot that auto-mutes new members and forces them to verify by replying with a unique text phrase. Built in Node.js using node-telegram-bot-api.

## 🔧 Prerequisites

### 🖥 VPS Server Requirements

- A fresh Ubuntu 20.04+ VPS (1 GB RAM minimum)

- Root access

- Stable internet connection

Recommended VPS Providers: Contabo, Hetzner, DigitalOcean, Oracle (free tier for small bots)

### For free use google cloud platform -- https://cloud.google.com

### 🖥️ VPS Requirements (Google Cloud Platform)

| Parameter      | Type         | Description                                                                 |
| :------------- | :----------- | :-------------------------------------------------------------------------- |
| `Machine Type` | `string`     | Recommended: `e2-micro` or higher (free tier eligible)                       |
| `RAM`          | `string`     | Minimum `8 GB` RAM to run the bot smoothly                                   |
| `vCPU`         | `string`     | At least `2 vCPU` is sufficient for lightweight Telegram bot operations     |
| `Storage`      | `string`     | `100 - 200 GB` standard persistent disk (Ubuntu fits comfortably)                  |
| `OS`           | `string`     | Use `Ubuntu 22.04 LTS` (tested and stable)                                   |
| `Region`       | `string`     | Any preferred region (e.g. `asia-south1`) based on your target user base     |



### 📦 Software Requirements

- Node.js (v18 or above)

- npm (comes with Node.js)

- Git


### 📌 How It Works

- Bot listens for new members in a Telegram group.

- It instantly mutes them.

- Sends a custom welcome message asking them to reply with a verification phrase.

- If user replies correctly, they are unmuted and welcomed.

- Messages are auto-deleted for a clean chat.

## 🛠️ Setup Guide (Start to Finish)

### Step 1: 🔑 Create a Telegram Bot via BotFather

- Open @BotFather in Telegram.

- Run /newbot

- Give it a name and username (e.g., @myverifybot)

- Save the Bot Token — you'll use this later.

### Step 2: ⚙️ Turn Off Privacy Mode

By default, bots cannot read messages in groups. You must disable privacy mode to let it verify replies.

Go to BotFather → `/mybots` → `Select your bot` → `Click Group Privacy` → `Select Turn off`

### Step 3: 👥 Add Bot to Your Group

- Add your bot to your Telegram group.

- Promote it to Admin with permissions:

- Delete messages

- Restrict members

- Pin messages (optional)

### Step4: 🖥 VPS Setup (One-Time)

🔁 Update & Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git nodejs npm -y
```

🧱 Install Dependencies (First Time Only)

```bash
npm init -y
npm install node-telegram-bot-api
npm install dotenv
```


📥 Clone the GitHub Repo

```bash
git clone https://github.com/cryptowithshashi/TELEGRAM-VERIFICATION-BOT.git
cd TELEGRAM-VERIFICATION-BOT
```

📄 Create .env File With Bot Token

```bash
nano .env
```

Then tell users to paste this inside: `BOT_TOKEN=your_bot_token_here` And save with CTRL + X, then Y, then ENTER.



## ✅ Updating the Main Bot Code with Your Group Name

The current bot messages are written for CWS Family. If you're setting up this bot for your own group or community, you'll want to change the bot's welcome text and verification phrase to match your branding or vibe.

Here’s how to edit the bot code directly:

### 🛠️ Open the Main Bot File

```bash
nano index.js
```

This opens the bot's main logic. Inside, you can update:

- Verification Phrase

- Welcome Message

- Response Message

For example, look for lines like these and update them:

```bash
const VERIFICATION_PHRASE = "let's gooo cws family"; // 👉 Change this to your custom phrase
...
"✅ Verified! Welcome to the CWS Family!" // 👉 Customize this line too
...
"You can't send anything until you verify. RIP!" // 👉 Fun messages? Add your own twist!
```


### 🧠 Tip:

Be creative, but make sure:

- The verification phrase is unique and exact

- The messages are clear for new users

- You save the file with CTRL + X, then Y, then ENTER















### Step 5: 🚀 Run the Bot

For quick testing:

```bash
node index.js
```

To keep it running after logout (using `screen`):

```bash
sudo apt install screen -y
screen -S verifybot
node index.js
```
- Press Ctrl+A then D to detach

## 🧪 Testing

- Join the group from a new account.

- You’ll be muted.

- A message appears asking you to reply with the phrase.

- If correct, the bot unmutes you and deletes verification messages.

## ✏️ Customization

- Change the verification phrase in index.js

- Update reply messages, emojis, tone to match your community vibe.

- Add more logging or webhook support as needed.


## Disclaimer

All information shared is for educational and community purposes only. Nothing here constitutes financial advice or a solicitation to invest.

## About Me

- **Twitter**: [https://x.com/SHASHI522004](https://x.com/SHASHI522004)
- **GitHub**: [https://github.com/cryptowithshashi](https://github.com/cryptowithshashi)
- **Telegram**: [https://t.me/crypto_with_shashi](https://t.me/crypto_with_shashi)
