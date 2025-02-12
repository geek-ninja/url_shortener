const urlModel = require("../models/UrlModel.model");
const {
  urlShortnerService,
  getShortenUrlService,
} = require("../services/UrlService.services");
const client = require("../config/Redis.config");

module.exports.urlShortner = () => {
  return async (req, res) => {
    const { longUrl, customAlias, topic } = req.body;
    try {
      const uniqueCustomAlias = await urlShortnerService(customAlias);
      await client.set(uniqueCustomAlias, longUrl); //store in redis for single string value for a key
      const shortnerUrl = await urlModel.create({
        longUrl,
        customAlias: uniqueCustomAlias,
        topic,
        userId: req.user._id,
      });
      res.status(200).json({
        shortUrl: `${process.env.BASE_SHORTEN_URL}/${uniqueCustomAlias}`,
        createdAt: shortnerUrl.createdAt,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports.getShortenUrl = () => {
  return async (req, res) => {
    const { alias } = req.params;
    let userAgentString = req.headers["user-agent"]; // Get user agent from request ex 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
    const userIp = req.ip;
    try {
      const result = await getShortenUrlService(alias, userAgentString, userIp);
      res.status(200).json({
        redirectUrl: result,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
