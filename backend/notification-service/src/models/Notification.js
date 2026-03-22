const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "USER_REGISTERED",
        "USER_LOGIN",
        "ORDER_PLACED",
        "ORDER_STATUS_CHANGED",
        "BOOK_CREATED",
        "BOOK_UPDATED",
      ],
    },
    title: {
      type: String,
      required: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      maxlength: 800,
    },
    metadata: {
      type: Object,
      default: {},
    },
    channel: {
      type: String,
      enum: ["in-app", "email"],
      default: "in-app",
    },
    status: {
      type: String,
      enum: ["created", "sent", "failed", "read"],
      default: "created",
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", NotificationSchema);
