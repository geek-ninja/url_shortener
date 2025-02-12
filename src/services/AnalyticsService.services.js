const urlModel = require("../models/UrlModel.model");
const analyticsModel = require("../models/AnalyticsModel.model.js");

const getAnalyticsService = async (alias) => {
  try {
    const existingAlias = await analyticsModel.findOne({ alias });
    return existingAlias;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getTopicAnalyticsService = async (urls) => {
  try {
    let totalClicks = 0;
    let uniqueUsers = 0;
    let clicksByDate = [];
    let urlsAnalytics = [];

    for (const url of urls) {
      const shortUrl = url.customAlias;
      const urlAnalytics = await analyticsModel.findOne({ alias: shortUrl });

      if (urlAnalytics) {
        totalClicks += urlAnalytics.totalClicks;
        uniqueUsers += urlAnalytics.uniqueUsers;

        urlAnalytics.clicksByDate.forEach((dateData) => {
          const existingDate = clicksByDate.find(
            (item) =>
              item.date.toISOString().split("T")[0] ===
              dateData.date.toISOString().split("T")[0]
          );
          if (existingDate) {
            existingDate.clickCount += dateData.clickCount;
          } else {
            clicksByDate.push({
              date: dateData.date,
              clickCount: dateData.clickCount,
            });
          }
        });

        urlsAnalytics.push({
          shortUrl: `${process.env.BASE_SHORTEN_URL}${url.customAlias}`,
          totalClicks: urlAnalytics.totalClicks,
          uniqueUsers: urlAnalytics.uniqueUsers,
        });
      }
    }

    clicksByDate.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      totalClicks,
      uniqueUsers,
      clicksByDate,
      urls: urlsAnalytics,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOverallAnalyticsService = async (user) => {
  try {
    const allUrls = await urlModel.find({ userId: user._id });
    const aliases = allUrls.map((url) => url.customAlias);

    if (aliases.length === 0) {
      return {
        totalUrls: 0,
        totalClicks: 0,
        uniqueUsers: 0,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
    }

    const analyticsData = await analyticsModel
      .find({ alias: { $in: aliases } })
      .lean();

    // Initialize merged result
    const mergedResult = {
      totalUrls: aliases.length,
      totalClicks: 0,
      uniqueUsers: 0,
      clicksByDate: {},
      osType: {},
      deviceType: {},
    };

    analyticsData.forEach((entry) => {
      mergedResult.totalClicks += entry.totalClicks || 0;
      mergedResult.uniqueUsers += entry.uniqueUsers || 0;

      if (entry.clicksByDate) {
        entry.clicksByDate.forEach(({ date, clickCount }) => {
          const dateStr = new Date(date).toISOString().split("T")[0]; // Format date as YYYY-MM-DD
          mergedResult.clicksByDate[dateStr] =
            (mergedResult.clicksByDate[dateStr] || 0) + clickCount;
        });
      }

      if (entry.osType) {
        entry.osType.forEach(({ osName, uniqueClicks, uniqueUsers }) => {
          if (!mergedResult.osType[osName]) {
            mergedResult.osType[osName] = { uniqueClicks: 0, uniqueUsers: 0 };
          }
          mergedResult.osType[osName].uniqueClicks += uniqueClicks;
          mergedResult.osType[osName].uniqueUsers += uniqueUsers;
        });
      }

      if (entry.deviceType) {
        entry.deviceType.forEach(
          ({ deviceName, uniqueClicks, uniqueUsers }) => {
            if (!mergedResult.deviceType[deviceName]) {
              mergedResult.deviceType[deviceName] = {
                uniqueClicks: 0,
                uniqueUsers: 0,
              };
            }
            mergedResult.deviceType[deviceName].uniqueClicks += uniqueClicks;
            mergedResult.deviceType[deviceName].uniqueUsers += uniqueUsers;
          }
        );
      }
    });

    mergedResult.clicksByDate = Object.entries(mergedResult.clicksByDate).map(
      ([date, clickCount]) => ({ date, clickCount })
    );
    mergedResult.osType = Object.entries(mergedResult.osType).map(
      ([osName, data]) => ({ osName, ...data })
    );
    mergedResult.deviceType = Object.entries(mergedResult.deviceType).map(
      ([deviceName, data]) => ({ deviceName, ...data })
    );

    return mergedResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAnalyticsService,
  getTopicAnalyticsService,
  getOverallAnalyticsService,
};
