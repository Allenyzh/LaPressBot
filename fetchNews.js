const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

const fetchNews = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let news = [];
    $("article.storyCard").each((index, element) => {
      const title = $(element).find("span.title").text().trim();
      const link = $(element).find("a").attr("href");
      const summary = $(element).find("p.articleDetail__lead").text().trim();
      const time = $(element).find("time").attr("datetime");
      const formattedTime = moment(time).format("YYYY-MM-DD HH:mm");
      const image = $(element)
        .find("picture source[type='image/jpeg']")
        .attr("srcset");
      const fullLink = `${link}`;
      if (title && link) {
        news.push({
          title,
          time: formattedTime,
          link: fullLink,
          summary,
          image,
        });
      }
    });
    return news.length ? news : [{ title: "没有找到新闻。" }];
  } catch (error) {
    console.error(`无法获取页面内容: ${error}`);
    return [{ title: "获取新闻时出错。" }];
  }
};

module.exports = fetchNews;
