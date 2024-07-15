const axios = require("axios");
const cheerio = require("cheerio");

const fetchDetails = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const author = $("span.name.authorModule__name[itemprop='name']").text().trim();
    const summary = $("p.lead.textModule.textModule--type-lead").text().trim();
    const content = [];
    $("p.paragraph.textModule.textModule--type-paragraph").each((index, element) => {
      content.push($(element).text().trim());
    });

    return {
      author,
      summary,
      content: content.join("\n\n")
    };
  } catch (error) {
    console.error(`无法获取详细页面内容: ${error}`);
    return null;
  }
};

module.exports = fetchDetails;
