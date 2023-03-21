
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: false});

export function sendMessage(message) {
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
}