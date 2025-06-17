// File: bot.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const verificationPhrase = "let's gooo cws family";
const pendingVerifications = new Map();
const joinTimestamps = new Map();

console.log("🚀 CWS BOT is running and watching for new users...");

// === Utility Functions ===
function isSuspiciousName(user) {
  const name = `${user.username || ''} ${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
  return name.includes('bot') || name.includes('spin') || name.includes('bonus');
}

function containsLinkOrButton(msg) {
  const text = msg.text || msg.caption || '';
  const entities = msg.entities || msg.caption_entities || [];
  return /http|www\.|t\.me|\.me/.test(text) || entities.some(e => e.type === 'text_link' || e.type === 'url');
}

function isMediaMessage(msg) {
  return msg.photo || msg.video || msg.document || msg.audio || msg.sticker;
}

function isNewAccount(userId) {
  const accountCreated = userId >> 32;
  const now = Math.floor(Date.now() / 1000);
  const accountAgeInSeconds = now - accountCreated;
  return accountAgeInSeconds < 86400; // less than 1 day
}

// === Start Command Handler ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const intro = `👋 Yo! Welcome to *CWS Bot* — your ultimate Telegram guard dog 🐺\n\nThis bot keeps your group clean by auto-verifying new members, blocking suspicious bots, deleting scam links, and roasting them out in CWS style 😤\n\n🚀 Built with love by @cryptowithshashi 💻\n\n🔽 Check out the links below to deploy your own or see the source!`;

  bot.sendMessage(chatId, intro, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🌐 GitHub Source", url: "https://github.com/cryptowithshashi/TELEGRAM-VERIFICATION-BOT" }
        ],
        [
          { text: "💼 Deploy This Bot", url: "mailto:cryptowithshashi@gmail.com?subject=CWS Bot Deployment" }
        ],
        [
          { text: "🧠 Join Our TG Group", url: "https://t.me/crypto_with_shashi" }
        ]
      ]
    }
  });
});

// === Restrict New Members ===
bot.on('new_chat_members', async (msg) => {
  const chatId = msg.chat.id;
  for (const user of msg.new_chat_members) {
    const userId = user.id;

    if (!user.username) {
      await bot.kickChatMember(chatId, userId);
      await bot.sendMessage(chatId, `🚫 Get out of here MF You don't have username: ID ${userId}`);
      continue;
    }

    if (isSuspiciousName(user)) {
      await bot.kickChatMember(chatId, userId);
      await bot.sendMessage(chatId, `🚫 You are very suspicious dude get the hell out of here: @${user.username}`);
      continue;
    }

    if (isNewAccount(userId)) {
      await bot.kickChatMember(chatId, userId);
      await bot.sendMessage(chatId, `🚫 What does new account doing here get the fuck out of here.`);
      continue;
    }

    await bot.restrictChatMember(chatId, userId, {
      can_send_messages: true,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
    });

    pendingVerifications.set(userId, chatId);
    joinTimestamps.set(userId, Date.now());

    setTimeout(() => {
      if (pendingVerifications.has(userId)) {
        bot.kickChatMember(chatId, userId);
        bot.sendMessage(chatId, `⏰ @${user.username} You MF you can't even type this one line in 5 min.`);
        pendingVerifications.delete(userId);
      }
    }, 300000);

    await bot.sendMessage(chatId, `👋 Yo @${user.username}!

I *know* you're human bro 😎... but to keep the scammy MFs away, you gotta REPLY to this message with:

\`${verificationPhrase}\`

🚫 You can’t send *anything* until you verify. If you don't... RIP 😂`, {
      parse_mode: 'Markdown',
    });
  }
});

// === Message Handling ===
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (containsLinkOrButton(msg) && pendingVerifications.has(userId)) {
    await bot.kickChatMember(chatId, userId);
    await bot.sendMessage(chatId, `🚫 Do you think you can send scam message here MF?.`);
    return;
  }

  if (isMediaMessage(msg) && pendingVerifications.has(userId)) {
    await bot.kickChatMember(chatId, userId);
    await bot.sendMessage(chatId, `🚫 You can't even verify yourself MF and you are sending photos.`);
    return;
  }

  if (msg.text && msg.text.toLowerCase().includes(verificationPhrase)) {
    if (!pendingVerifications.has(userId)) return;

    await bot.restrictChatMember(chatId, userId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });

    await bot.sendMessage(chatId, `✅ Welcome to CWS fam @${msg.from.username}, you're now verified!`);

    pendingVerifications.delete(userId);
    joinTimestamps.delete(userId);
  }
});
