const Notification = require("../models/Notification");
const { sendEmail } = require("./emailService");

const defaultTitles = {
  USER_REGISTERED: "Welcome to Book Corner",
  USER_LOGIN: "New login detected",
  ORDER_PLACED: "Order placed successfully",
  ORDER_STATUS_CHANGED: "Order status updated",
  BOOK_CREATED: "New book added",
  BOOK_UPDATED: "Book information updated",
};

const defaultMessages = {
  USER_REGISTERED: "Your account has been created successfully.",
  USER_LOGIN: "Your account was accessed successfully.",
  ORDER_PLACED: "Your order has been created. We will update you soon.",
  ORDER_STATUS_CHANGED: "Your order status has changed. Check your order page.",
  BOOK_CREATED: "A new book is now available in the catalog.",
  BOOK_UPDATED: "Book details were updated in the catalog.",
};

async function processEvent(event, correlationId) {
  const channels =
    event.channels && event.channels.length > 0
      ? event.channels
      : ["in-app", "email"];

  const title = event.title || defaultTitles[event.eventType] || "Notification";
  const message =
    event.message ||
    defaultMessages[event.eventType] ||
    "You have a new notification.";

  const results = [];

  if (channels.includes("in-app")) {
    const doc = await Notification.create({
      userId: event.userId,
      type: event.eventType,
      title,
      message,
      metadata: event.metadata || {},
      channel: "in-app",
      status: "created",
    });

    results.push({
      channel: "in-app",
      status: "created",
      id: doc._id.toString(),
    });
  }

  if (channels.includes("email") && event.email) {
    const emailResult = await sendEmail({
      to: event.email,
      subject: title,
      text: message,
      correlationId,
    });

    results.push({
      channel: "email",
      status: emailResult.sent ? "sent" : "failed",
      detail: emailResult.reason || emailResult.messageId,
    });
  }

  return results;
}

async function getUserNotifications(userId, { page, limit, unreadOnly }) {
  const query = { userId };

  if (unreadOnly) {
    query.readAt = null;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Notification.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

async function markAsRead(notificationId, userId) {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    {
      $set: {
        readAt: new Date(),
        status: "read",
      },
    },
    { new: true },
  );

  return updated;
}

module.exports = {
  processEvent,
  getUserNotifications,
  markAsRead,
};
