const axios = require("axios");

const createTelegraphPage = async (
  title,
  authorName,
  authorUrl,
  summary,
  content,
  imageUrl
) => {
  const accessToken = process.env.TELEGRAPH_ACCESS_TOKEN;
  try {
    const response = await axios.post("https://api.telegra.ph/createPage", {
      access_token: accessToken,
      title,
      author_name: authorName,
      author_url: authorUrl,
      content: JSON.stringify([
        {
          tag: "img",
          attrs: {
            src: imageUrl,
            alt: "",
            class: "photoModule__visual",
            itemprop: "contentUrl url",
          },
        },
        { tag: "p", children: [{ tag: "strong", children: [summary] }] },
        { tag: "p", children: [content] },
      ]),
      return_content: true,
    });
    return response.data.result.url;
  } catch (error) {
    console.error(`Error creating Telegraph page: ${error}`);
    return null;
  }
};

module.exports = createTelegraphPage;
