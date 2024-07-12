const TelegramBot = require("node-telegram-bot-api");
const fetchNews = require("./fetchNews");
const sendChunkedMessageWithPhoto = require("./sendMessage");
const { getCachedNews, setCachedNews } = require("./cache");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (error) => console.error(`Polling error: ${error.message}`));

bot.setMyCommands([
  { command: "/financenews", description: "获取财经新闻" },
  { command: "/montrealnews", description: "获取蒙特利尔新闻" },
  { command: "/faitsdivers", description: "获取蒙特利尔社会新闻" },
]);

const newsUrls = {
  finance: "https://www.lapresse.ca/affaires/economie/",
  montreal: "https://www.lapresse.ca/actualites/grand-montreal/",
  faitsdivers: "https://www.lapresse.ca/actualites/justice-et-faits-divers/",
};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const now = Date.now();

  if (msg.text.toLowerCase() === "/financenews") {
    let news = getCachedNews("finance");
    if (!news) {
      news = await fetchNews(newsUrls.finance);
      setCachedNews("finance", news);
    }
    await sendChunkedMessageWithPhoto(bot, chatId, news);
  } else if (msg.text.toLowerCase() === "/montrealnews") {
    let news = getCachedNews("montreal");
    if (!news) {
      news = await fetchNews(newsUrls.montreal);
      setCachedNews("montreal", news);
    }
    await sendChunkedMessageWithPhoto(bot, chatId, news);
  } else if (msg.text.toLowerCase() === "/faitsdivers") {
    let news = getCachedNews("faitsdivers");
    if (!news) {
      news = await fetchNews(newsUrls.faitsdivers);
      setCachedNews("faitsdivers", news);
    }
    await sendChunkedMessageWithPhoto(bot, chatId, news);
  } else {
    bot.sendMessage(chatId, "发送 /financenews /montrealnews /faitsdivers 以获取相关新闻。");
  }
});

const sendFinanceNewsToChannel = async () => {
  let news = getCachedNews("finance");
  if (!news) {
    news = await fetchNews(newsUrls.finance);
    setCachedNews("finance", news);
  }
  await sendChunkedMessageWithPhoto(bot, channelId, news);
};

const sendMontrealNewsToChannel = async () => {
  let news = getCachedNews("montreal");
  if (!news) {
    news = await fetchNews(newsUrls.montreal);
    setCachedNews("montreal", news);
  }
  await sendChunkedMessageWithPhoto(bot, channelId, news);
};

console.log("Telegram bot is running...");
