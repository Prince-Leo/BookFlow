const logAction = async (action, entityType, entityId, details, userId = null, ipAddress = null) => {
  try {
    const { SystemLog } = require('../models');
    await SystemLog.create({
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

module.exports = { logAction };
