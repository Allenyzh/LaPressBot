const TelegramBot = require("node-telegram-bot-api");
const fetchNews = require("./fetchNews");
const sendChunkedMessageWithPhoto = require("./sendMessage");
const { getCachedNews, setCachedNews } = require("./cache");
const createTelegraphPage = require("./createTelegraphPage");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (error) =>
  console.error(`Polling error: ${error.message}`)
);

bot.setMyCommands([
  { command: "/financenews", description: "获取财经新闻" },
  { command: "/montrealnews", description: "获取蒙特利尔新闻" },
  { command: "/faitsdivers", description: "获取蒙特利尔社会新闻" },
  { command: "/soccer", description: "获取体育新闻" },
]);

const newsUrls = {
  finance: "https://www.lapresse.ca/affaires/economie/",
  montreal: "https://www.lapresse.ca/actualites/grand-montreal/",
  faitsdivers: "https://www.lapresse.ca/actualites/justice-et-faits-divers/",
  soccer: "https://www.lapresse.ca/sports/soccer/",
};

bot.on("message", async (msg) => {
  // Ensure msg and msg.text are defined
  if (!msg || !msg.text) {
    return;
  }

  const chatId = msg.chat.id;
  const command = msg.text.toLowerCase();
  const newsTypes = {
    "/financenews": "finance",
    "/montrealnews": "montreal",
    "/faitsdivers": "faitsdivers",
    "/soccer": "soccer",
  };

  if (newsTypes[command]) {
    const newsType = newsTypes[command];
    let news = getCachedNews(newsType);
    if (!news) {
      news = await fetchNews(newsUrls[newsType]);
      setCachedNews(newsType, news);
    }
    await sendChunkedMessageWithPhoto(bot, chatId, news);
  } else {
    bot.sendMessage(
      chatId,
      "发送 /financenews /montrealnews /faitsdivers /soccer 以获取相关新闻。"
    );
  }
});
console.log("Telegram bot is running...");
// const sendFinanceNewsToChannel = async () => {
//   let news = getCachedNews("finance");
//   if (!news) {
//     news = await fetchNews(newsUrls.finance);
//     setCachedNews("finance", news);
//   }
//   await sendChunkedMessageWithPhoto(bot, channelId, news);
// };

// const sendMontrealNewsToChannel = async () => {
//   let news = getCachedNews("montreal");
//   if (!news) {
//     news = await fetchNews(newsUrls.montreal);
//     setCachedNews("montreal", news);
//   }
//   await sendChunkedMessageWithPhoto(bot, channelId, news);
// };
