const createTelegraphPage = require("./createTelegraphPage");
const fetchDetails = require("./fetchDetails");

const sendChunkedMessageWithPhoto = async (bot, chatId, news) => {
  for (const article of news) {
    const details = await fetchDetails(article.link);
    if (details) {
      const pageUrl = await createTelegraphPage(
        article.title,
        details.author,
        article.link,
        details.summary,
        details.content,
        article.image
      );
      const formattedMessage = `[${article.title}](${article.link})\n${article.time}\n\n${article.summary}\n\n[Read more](${pageUrl})`;

      if (article.image) {
        await bot.sendPhoto(chatId, article.image, {
          caption: formattedMessage,
          parse_mode: "Markdown",
        });
      } else {
        await bot.sendMessage(chatId, formattedMessage, {
          parse_mode: "Markdown",
        });
      }
    } else {
      console.error(`无法获取 ${article.link} 的详细内容`);
    }
  }
};

module.exports = sendChunkedMessageWithPhoto;
