const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserRepository = require("../repositories/UserRepository");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// COLLAB-SAFE: Notification service integration config.
const NOTIFICATION_EVENTS_API =
  process.env.NOTIFICATION_EVENTS_API || "http://localhost:3004/api/events";

// COLLAB-SAFE: Build service auth header for notification calls.
const buildServiceAuthHeader = () => {
  if (process.env.NOTIFICATION_SERVICE_TOKEN) {
    return `Bearer ${process.env.NOTIFICATION_SERVICE_TOKEN}`;
  }

  if (process.env.INTERNAL_JWT_SECRET) {
    const token = jwt.sign(
      { service: "user-auth-service", scope: "internal" },
      process.env.INTERNAL_JWT_SECRET,
      { expiresIn: "5m" },
    );
    return `Bearer ${token}`;
  }

  return null;
};

// COLLAB-SAFE: Fire-and-forget event emit so auth flow is never blocked.
const emitNotificationEvent = async (eventPayload) => {
  const authHeader = buildServiceAuthHeader();

  if (!authHeader) {
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    await fetch(NOTIFICATION_EVENTS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "x-correlation-id": `auth-${Date.now()}`,
      },
      body: JSON.stringify(eventPayload),
      signal: controller.signal,
    });
  } catch (error) {
    console.warn("Notification emit failed:", error.message);
  } finally {
    clearTimeout(timeoutId);
  }
};

// ===================== REGISTER =====================
router.post("/register", async (req, res) => {
  const { username, email, password, role = "customer" } = req.body;

  try {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await UserRepository.create({
      username,
      email,
      password,
      role,
    });

    // COLLAB-SAFE: Emit user registration notification event.
    emitNotificationEvent({
      eventType: "USER_REGISTERED",
      userId: newUser._id.toString(),
      email: newUser.email,
      metadata: {
        username: newUser.username,
        role: newUser.role,
      },
      channels: ["in-app", "email"],
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id.toString(), // MongoDB uses _id
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // COLLAB-SAFE: Emit user login notification event.
    emitNotificationEvent({
      eventType: "USER_LOGIN",
      userId: user._id.toString(),
      email: user.email,
      metadata: {
        username: user.username,
        role: user.role,
      },
      channels: ["in-app"],
    });

    res.json({
      token,
      role: user.role,
      userId: user._id.toString(),
      username: user.username,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== GET CURRENT USER (protected) =====================
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await UserRepository.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toPublicJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== PUBLIC ENDPOINT (other microservices) =====================
router.get("/users/:id", verifyToken, async (req, res) => {
  try {
    const user = await UserRepository.getPublicUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
