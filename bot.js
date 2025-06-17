// File: bot.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const verificationPhrase = "let's gooo cws family";
const pendingVerifications = new Map();
const joinTimestamps = new Map();

// === Utility Function ===
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

// === Restrict New Members ===
bot.on('new_chat_members', async (msg) => {
  const chatId = msg.chat.id;
  for (const user of msg.new_chat_members) {
    const userId = user.id;

    // Kick if no username
    if (!user.username) {
      await bot.kickChatMember(chatId, userId);
      await bot.sendMessage(chatId, `🚫 Get out of here MF You don't have username: ID ${userId}`);
      continue;
    }

    // Kick if name is suspicious
    if (isSuspiciousName(user)) {
      await bot.kickChatMember(chatId, userId);
      await bot.sendMessage(chatId, `🚫 You are very suspicious dude get the hell out of here: @${user.username}`);
      continue;
    }

    // Kick if account is too new
    if (isNewAccount(userId)) {
      await bot.kickChatMember(chatId, userId);
      await bot.sendMessage(chatId, `🚫 What does new account doing here get the fuck out of here.`);
      continue;
    }

    // Restrict messages
    await bot.restrictChatMember(chatId, userId, {
      can_send_messages: true,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
    });

    // Set verification timeout (5 mins)
    pendingVerifications.set(userId, chatId);
    joinTimestamps.set(userId, Date.now());

    setTimeout(() => {
      if (pendingVerifications.has(userId)) {
        bot.kickChatMember(chatId, userId);
        bot.sendMessage(chatId, `⏰ @${user.username} You MF you can't even type this one line in 5 min.`);
        pendingVerifications.delete(userId);
      }
    }, 300000); // 5 minutes

    // Send welcome message
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

  // Block if verified user sends scam message
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

  // Handle verification phrase
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
console.log("🚀 CWS BOT is running and watching for new users...");
