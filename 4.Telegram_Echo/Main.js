import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import "dotenv/config";

process.env["NTBA_FIX_350"] = 1;
const { TOKEN, PICSUM_LINK } = process.env;
const bot = new TelegramBot(TOKEN, { polling: true });

const logger = (nameFirst, nameSecond, message) =>{
    console.log(`User ${nameFirst ?? ''} ${nameSecond ?? ''} wrote: ${message}`);
}

console.log("\nFunction 'Telegram Echo' is active:\n");
bot.on("message", async (msg) => {
    const {
        chat: { id },
        text: message,
        from: { first_name: nameFirst, last_name: nameSecond }
    } = msg;

    if (message === "photo") {
        const {data} = await axios.get(PICSUM_LINK, {responseType: 'stream'});
        await bot.sendPhoto(id, data);
        logger(nameFirst, nameSecond, "photo(got random picture)");
        return
    }
    bot.sendMessage(`${id} You wrote: ${message}.`);
    logger(nameFirst, nameSecond, message);
})