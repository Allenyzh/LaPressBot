const axios = require("axios");
const cheerio = require("cheerio");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

// 使用环境变量存储 API 令牌和频道 ID
const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

// 创建一个 Telegram 机器人实例
const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (error) =>
  console.error(`Polling error: ${error.message}`)
);

let cachedFinanceNews = "";
let cachedMontrealNews = "";
let lastFetchTime = 0;
const cacheDuration = 10 * 60 * 1000; // 缓存时间为10分钟

// 爬取财经信息的函数
const fetchFinanceNews = async () => {
  const url = "https://www.lapresse.ca/affaires/economie/";
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let news = "";
    $("article.storyCard").each((index, element) => {
      const title = $(element).find("span.title").text().trim();
      const link = $(element).find("a").attr("href");
      const summary = $(element).find("p.articleDetail__lead").text().trim();
      const fullLink = `https://www.lapresse.ca${link}`;
      if (title && link) {
        news += `标题: ${title}\n链接: ${fullLink}\n摘要: ${summary}\n\n`;
      }
    });
    cachedFinanceNews = news || "没有找到财经新闻。";
    lastFetchTime = Date.now();
    return cachedFinanceNews;
  } catch (error) {
    console.error(`无法获取页面内容: ${error}`);
    return "获取财经新闻时出错。";
  }
};

const fetchGrandMontrealNews = async () => {
  const url = "https://www.lapresse.ca/actualites/grand-montreal/";
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let news = "";
    $("article.storyCard").each((index, element) => {
      const title = $(element).find("span.title").text().trim();
      const link = $(element).find("a").attr("href");
      const summary = $(element).find("p.articleDetail__lead").text().trim();
      const fullLink = `https://www.lapresse.ca${link}`;
      if (title && link) {
        news += `标题: ${title}\n链接: ${fullLink}\n摘要: ${summary}\n\n`;
      }
    });
    cachedMontrealNews = news || "没有找到蒙特利尔的新闻。";
    lastFetchTime = Date.now();
    return cachedMontrealNews;
  } catch (error) {
    console.error(`无法获取页面内容: ${error}`);
    return "获取新闻时出错。";
  }
};

// 分块发送消息的函数
const sendChunkedMessage = async (chatId, message) => {
  const maxLength = 4096; // Telegram 消息的最大长度
  for (let i = 0; i < message.length; i += maxLength) {
    const chunk = message.substring(i, i + maxLength);
    await bot.sendMessage(chatId, chunk);
  }
};

// 监听 Telegram 消息
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text.toLowerCase() === "/financenews") {
    const now = Date.now();
    if (now - lastFetchTime > cacheDuration || !cachedFinanceNews) {
      await fetchFinanceNews();
      sendFinanceNewsToChannel();
    }
    await sendChunkedMessage(chatId, cachedFinanceNews);
  } else if (msg.text.toLowerCase() === "/montrealnews") {
    const now = Date.now();
    if (now - lastFetchTime > cacheDuration || !cachedMontrealNews) {
      await fetchGrandMontrealNews();
      sendMontrealNewsToChannel();
    }
    await sendChunkedMessage(chatId, cachedMontrealNews);
  } else {
    bot.sendMessage(
      chatId,
      "发送 /financenews 或者 /montrealnews 以获取相关新闻。"
    );
  }
});

// 发送财经新闻到频道的函数
const sendFinanceNewsToChannel = async () => {
  const now = Date.now();
  if (now - lastFetchTime > cacheDuration || !cachedFinanceNews) {
    await fetchFinanceNews();
  }
  await sendChunkedMessage(channelId, cachedFinanceNews);
};

// 发送蒙特利尔新闻到频道的函数
const sendMontrealNewsToChannel = async () => {
  const now = Date.now();
  if (now - lastFetchTime > cacheDuration || !cachedMontrealNews) {
    await fetchGrandMontrealNews();
  }
  await sendChunkedMessage(channelId, cachedMontrealNews);
};


console.log("Telegram bot is running...");
