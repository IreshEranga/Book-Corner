const express = require("express");
const mongoose = require("mongoose");
const authUser = require("../middleware/authUser");
const {
  getUserNotifications,
  markAsRead,
} = require("../services/notificationService");

const router = express.Router();

router.get("/me", authUser, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = "false" } = req.query;

    const result = await getUserNotifications(req.user.id, {
      page,
      limit,
      unreadOnly: unreadOnly === "true",
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/read", authUser, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const updated = await markAsRead(req.params.id, req.user.id);

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({
      message: "Notification marked as read",
      notification: updated,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
