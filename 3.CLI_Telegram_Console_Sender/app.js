import TelegramBot from "node-telegram-bot-api";
import { Command } from "commander";
import 'dotenv/config'

process.env["NTBA_FIX_350"] = 1;
const { TOKEN } = process.env;
const bot = new TelegramBot(TOKEN, { polling: true });
const program = new Command();

const getChatId = async() => {
  try {
    const [updates] = await bot.getUpdates();
    if (updates) {
      const { message: { chat: { id: chatId } } } = updates;
      return chatId;
    }
    console.log('No updates found');
    process.exit();
  } catch (err) {
    console.log(err)
  }
}

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

