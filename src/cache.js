const cache = {
  finance: { news: "", lastFetchTime: 0 },
  actualites: { news: "", lastFetchTime: 0 },
  faitsdivers: { news: "", lastFetchTime: 0 },
  soccer: { news: "", lastFetchTime: 0 },
};

const cacheDuration = 10 * 60 * 1000; // 缓存时间为10分钟

const getCachedNews = (type) => {
  const now = Date.now();
  if (now - cache[type].lastFetchTime > cacheDuration) {
    return null;
  }
  return cache[type].news;
};

const setCachedNews = (type, news) => {
  cache[type].lastFetchTime = Date.now();
  cache[type].news = news;
};

module.exports = {
  getCachedNews,
  setCachedNews,
};
