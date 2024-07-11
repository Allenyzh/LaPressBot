const axios = require("axios");
const cheerio = require("cheerio");
const TelegramBot = require("node-telegram-bot-api");
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

// 创建一个 Telegram 机器人实例
const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (error) =>
  console.error(`Polling error: ${error.message}`)
);

// 设置命令菜单
bot.setMyCommands([
  { command: "/financenews", description: "获取LaPress财经新闻" },
  { command: "/montrealnews", description: "获取LaPress蒙特利尔新闻" },
]);

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
    return news || "没有找到财经新闻。";
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
    return news || "没有找到蒙特利尔的新闻。";
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

  if (msg.text) {
    const text = msg.text.toLowerCase();
    if (text === "/financenews") {
      const news = await fetchFinanceNews();
      await sendChunkedMessage(chatId, news);
    } else if (text === "/montrealnews") {
      const news = await fetchGrandMontrealNews();
      await sendChunkedMessage(chatId, news);
    } else if (text === "/start" || text === "/help") {
      bot.sendMessage(
        chatId,
        "发送 /financenews 或者 /montrealnews 以获取相关新闻。",
        {
          reply_markup: {
            keyboard: [[{ text: "/financenews" }, { text: "/montrealnews" }]],
            resize_keyboard: true,
            one_time_keyboard: false,
          },
        }
      );
    } else {
      bot.sendMessage(
        chatId,
        "发送 /financenews 或者 /montrealnews 以获取相关新闻。"
      );
    }
  }
});

console.log("Telegram bot is running...");
