const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.INTERNAL_JWT_SECRET = "internal-test-secret";
process.env.USER_JWT_SECRET = "user-test-secret";

jest.mock("../src/services/notificationService", () => ({
  processEvent: jest.fn(async () => [
    { channel: "in-app", status: "created", id: "test-id" },
  ]),
  getUserNotifications: jest.fn(async () => ({
    items: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  })),
  markAsRead: jest.fn(async () => null),
}));

const app = require("../src/app");

describe("notification-service", () => {
  test("GET /health should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /api/events should reject when token missing", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ eventType: "USER_LOGIN", userId: "1" });
    expect(res.status).toBe(401);
  });

  test("POST /api/events should accept valid payload with service token", async () => {
    const token = jwt.sign(
      { service: "auth-service" },
      process.env.INTERNAL_JWT_SECRET,
    );

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({ eventType: "USER_LOGIN", userId: "u1" });

    expect(res.status).toBe(202);
    expect(res.body.message).toBe("Event accepted");
  });

  test("GET /api/notifications/me should reject when token missing", async () => {
    const res = await request(app).get("/api/notifications/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/notifications/me should return data with user token", async () => {
    const token = jwt.sign(
      { id: "u1", role: "customer" },
      process.env.USER_JWT_SECRET,
    );

    const res = await request(app)
      .get("/api/notifications/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
