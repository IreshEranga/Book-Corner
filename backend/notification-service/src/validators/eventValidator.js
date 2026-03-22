const { z } = require("zod");

const EventTypeEnum = z.enum([
  "USER_REGISTERED",
  "USER_LOGIN",
  "ORDER_PLACED",
  "ORDER_STATUS_CHANGED",
  "BOOK_CREATED",
  "BOOK_UPDATED",
]);

const EventSchema = z.object({
  eventType: EventTypeEnum,
  userId: z.string().min(1).max(128),
  email: z.string().email().optional(),
  title: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(800).optional(),
  channels: z.array(z.enum(["in-app", "email"])).optional(),
  metadata: z.record(z.any()).optional(),
});

function sanitizeText(text) {
  return text.replace(/[<>]/g, "").trim();
}

function validateEventPayload(payload) {
  const parsed = EventSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten(),
    };
  }

  const clean = parsed.data;

  if (clean.title) {
    clean.title = sanitizeText(clean.title);
  }
  if (clean.message) {
    clean.message = sanitizeText(clean.message);
  }

  return {
    ok: true,
    data: clean,
  };
}

module.exports = {
  validateEventPayload,
};
