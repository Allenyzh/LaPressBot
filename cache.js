let cachedFinanceNews = "";
let cachedMontrealNews = "";
let cachedFaitsDivers = "";
let lastFetchTime = 0;
const cacheDuration = 10 * 60 * 1000; // 缓存时间为10分钟

const getCachedNews = (type) => {
  const now = Date.now();
  if (now - lastFetchTime > cacheDuration) {
    return null;
  }
  if (type === "finance") return cachedFinanceNews;
  if (type === "montreal") return cachedMontrealNews;
  if (type === "faitsdivers") return cachedFaitsDivers;
  return null;
};

const setCachedNews = (type, news) => {
  lastFetchTime = Date.now();
  if (type === "finance") cachedFinanceNews = news;
  if (type === "montreal") cachedMontrealNews = news;
  if (type === "faitsdivers") cachedFaitsDivers = news;
};

module.exports = {
  getCachedNews,
  setCachedNews,
};
