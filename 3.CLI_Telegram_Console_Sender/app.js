import TelegramBot from "node-telegram-bot-api";
import { Command } from "commander";

process.env["NTBA_FIX_350"] = 1;

const token = '5809605633:AAF3vM7qkFqZZ45c5OJ3TdQBq12-cxeek6A';

const bot = new TelegramBot(token, {polling:true});
const program = new Command();
let id = await getChatId();

program
  .command('message <text>')
  .description('Send a message to the Speakers bot')
  .alias('m')
  .action(async (text) => {
        await bot.sendMessage(id, text);
        console.log('Message sent successfully!');
        process.exit();
  });

program
  .command('photo <path>')
  .description('Send a photo to the Speakers bot')
  .alias('p')
  .action(async (path) => {
        await bot.sendPhoto(id, path);
        console.log('Photo sent successfully!');
        process.exit();
  });

program.parse();

async function getChatId() {
    const updates = await bot.getUpdates();
    if (updates.length > 0) {
        const chatId = updates[0].message.chat.id;
        return chatId;
    } else {
        console.log('No updates found');
        process.exit();
    }
}