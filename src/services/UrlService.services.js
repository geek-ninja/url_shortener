// import client from "../config/redis.js";
const urlModel = require("../models/UrlModel.model");
const analyticsModel = require("../models/AnalyticsModel.model");
const DeviceDetector = require("device-detector-js");
const crypto = require("crypto");
const client = require("../config/Redis.config");

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const urlShortnerService = async (customAlias) => {
  try {
    // If customAlias is not provided, generate an alias
    if (!customAlias) {
      let isUnique = false;
      while (!isUnique) {
        customAlias = crypto.randomBytes(3).toString("hex"); // Generates alias
        const existingAlias = await urlModel.findOne({ customAlias });
        if (!existingAlias) isUnique = true; // Ensure uniqueness
      }
    } else {
      // Check if customAlias already exists
      const existingAlias = await urlModel.findOne({ customAlias });
      if (existingAlias) {
        throw new Error("Custom alias already exists");
      }
    }
    return customAlias;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getShortenUrlService = async (customAlias, userAgentString, userIp) => {
  try {
    const deviceDetector = new DeviceDetector();
    let longUrl = await client.get(customAlias);
    if (!longUrl) {
      let urlData = await urlModel.findOne({ customAlias });
      if (!urlData) {
        throw new Error("URL does not exist");
      }
      longUrl = urlData.longUrl;
      await client.set(customAlias, longUrl); //set the data in redis for new entry
    }

    let analytics = await analyticsModel.findOneAndUpdate(
      { alias: customAlias },
      { $inc: { totalClicks: 1 } },
      { new: true, upsert: true }
    );

    const todayDate = getTodayDate();

    const existingDay = analytics.clicksByDate.find((item) => {
      const dbDate = item.date.toISOString().split("T")[0];
      return dbDate === todayDate;
    });

    if (existingDay) {
      existingDay.clickCount += 1;
    } else {
      analytics.clicksByDate.push({ date: todayDate, clickCount: 1 });
    }
    analytics.clicksByDate.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (analytics.clicksByDate.length > 7) {
      analytics.clicksByDate.pop();
    }

    const device = deviceDetector.parse(userAgentString);

    await updateOsTypeAnalytics(analytics, device, userIp);
    await updateDeviceTypeAnalytics(analytics, device, userIp);

    const existIps = await client.sIsMember(userIp, customAlias);
    if (!existIps) {
      await client.sAdd(userIp, customAlias);
      analytics.uniqueUsers += 1;
    }

    await analytics.save();

    return longUrl;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateOsTypeAnalytics = async (analytics, device, userIp) => {
  const osIndex = analytics.osType.findIndex(
    (item) =>
      item.osName.toLocaleLowerCase() === device.os.name.toLocaleLowerCase()
  );

  if (osIndex !== -1) {
    analytics.osType[osIndex].uniqueClicks += 1;
  } else {
    analytics.osType.push({
      osName: device.os.name,
      uniqueClicks: 1,
      uniqueUsers: 1,
    });
  }

  const existsOsByIp = await client.sIsMember(
    userIp,
    device.os.name.toLowerCase()
  );
  if (!existsOsByIp) {
    if (osIndex !== -1) {
      analytics.osType[osIndex].uniqueUsers += 1;
    }
    await client.sAdd(userIp, device.os.name.toLowerCase());
  }
};

const updateDeviceTypeAnalytics = async (analytics, device, userIp) => {
  const deviceIndex = analytics.deviceType.findIndex(
    (item) => item.deviceName.toLowerCase() === device.device.type.toLowerCase()
  );

  if (deviceIndex !== -1) {
    analytics.deviceType[deviceIndex].uniqueClicks += 1;
  } else {
    analytics.deviceType.push({
      deviceName: device.device.type,
      uniqueClicks: 1,
      uniqueUsers: 1,
    });
  }

  const existsDeviceByIp = await client.sIsMember(
    userIp,
    device.device.type.toLowerCase()
  );
  if (!existsDeviceByIp) {
    if (deviceIndex !== -1) {
      analytics.deviceType[deviceIndex].uniqueUsers += 1;
    }
    await client.sAdd(userIp, device.device.type.toLowerCase());
  }
};

module.exports = { urlShortnerService, getShortenUrlService };
