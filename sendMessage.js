const sendChunkedMessageWithPhoto = async (bot, chatId, news) => {
    for (const article of news) {
      const formattedMessage = `[${article.title}](${article.link})\n\n${article.time}\n\n${article.summary}`;
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
    }
  };
  
  module.exports = sendChunkedMessageWithPhoto;
  