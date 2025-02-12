const {
  getAnalyticsService,
  getTopicAnalyticsService,
  getOverallAnalyticsService,
} = require("../services/AnalyticsService.services");
const urlModel = require("../models/UrlModel.model");

module.exports.getAnalytics = () => {
  return async (req, res) => {
    const { alias } = req.params;
    try {
      const result = await getAnalyticsService(alias);
      if (!result) {
        return res
          .status(404)
          .send("The specified short URL alias does not exist");
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};

module.exports.getTopicAnalytics = () => {
  return async (req, res) => {
    const { topic } = req.params;
    try {
      const urls = await urlModel.find({ topic });

      if (!urls || urls.length === 0) {
        return res.status(404).send("No URLs found for this topic.");
      }

      const result = await getTopicAnalyticsService(urls);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};

module.exports.getOverallAnalytics = () => {
  return async (req, res) => {
    try {
      let result = await getOverallAnalyticsService(req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};
