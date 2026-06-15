const Notification = require("../Moddel/NotificationSchema");

async function getNotificationsController(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function markNotificationReadController(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function markAllNotificationsReadController(req, res) {
  try {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
};
