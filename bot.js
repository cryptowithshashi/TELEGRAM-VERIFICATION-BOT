// --- Imports ---
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Load BOT_TOKEN from .env

// --- Configuration ---
const TOKEN = process.env.BOT_TOKEN;
const VERIFICATION_PHRASE = "let's gooo cws family";
const PENDING_VERIFICATION = {}; // { chatId: { userId: { welcomeMessageId } } }

if (!TOKEN) {
    console.error("❌ BOT_TOKEN not found in .env file.");
    process.exit(1);
}

// --- Bot Init ---
const bot = new TelegramBot(TOKEN, { polling: true });

// --- On New Member Join ---
bot.on('new_chat_members', async (msg) => {
    const chatId = msg.chat.id;

    for (const member of msg.new_chat_members) {
        if (member.is_bot) continue;

        const userId = member.id;
        const firstName = member.first_name;

        try {
            // 👮 Restrict user (allow reply, block main chat)
            await bot.restrictChatMember(chatId, userId, {
                can_send_messages: true,
                can_send_media_messages: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
            });

            // 📩 Send welcome/verification message
            const verificationMsg = await bot.sendMessage(
                chatId,
                `👋 *Yo welcome* [${firstName}](tg://user?id=${userId})!\n\n` +
                `I *know you're human* 😂 but to avoid scams MF, reply _this message_ with:\n\n` +
                `\`${VERIFICATION_PHRASE}\`\n\n` +
                `❗ *You can't message the group until you verify*\nIf you don't... well, *RIP buddy 💀*`,
                { parse_mode: 'Markdown' }
            );

            // Track user & the message to be replied to
            if (!PENDING_VERIFICATION[chatId]) PENDING_VERIFICATION[chatId] = {};
            PENDING_VERIFICATION[chatId][userId] = {
                welcomeMessageId: verificationMsg.message_id
            };

        } catch (err) {
            console.error(`❌ Error handling new member ${userId}:`, err.message);
        }
    }
});

// --- On Reply for Verification ---
bot.on('message', async (msg) => {
    if (!msg.reply_to_message || !msg.text) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userMessage = msg.text;
    const replyMsgId = msg.reply_to_message.message_id;

    // Check if the user is pending verification and replying to the right message
    const userPending = PENDING_VERIFICATION[chatId]?.[userId];
    if (!userPending || userPending.welcomeMessageId !== replyMsgId) return;

    try {
        if (userMessage.trim().toLowerCase() === VERIFICATION_PHRASE) {
            // ✅ Verified
            await bot.restrictChatMember(chatId, userId, {
                can_send_messages: true,
                can_send_media_messages: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true,
            });

            const confirm = await bot.sendMessage(chatId, `✅ Welcome to the *CWS Family*, [${msg.from.first_name}](tg://user?id=${userId})! 🎉`, {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.message_id
            });

            // Auto-delete messages after 5 sec
            setTimeout(() => {
                bot.deleteMessage(chatId, msg.message_id).catch(() => {});
                bot.deleteMessage(chatId, userPending.welcomeMessageId).catch(() => {});
                bot.deleteMessage(chatId, confirm.message_id).catch(() => {});
            }, 5000);

            delete PENDING_VERIFICATION[chatId][userId];
        } else {
            // ❌ Wrong message
            await bot.deleteMessage(chatId, msg.message_id);
        }
    } catch (err) {
        console.error(`❌ Error during verification:`, err.message);
    }
});

console.log("🚀 CWS BOT is running and watching for new users...");
