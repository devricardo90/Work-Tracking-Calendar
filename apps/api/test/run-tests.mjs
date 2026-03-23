import assert from "node:assert/strict";

process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5499/worker_hours";
process.env.BETTER_AUTH_SECRET ??= "change-this-secret-to-a-long-random-string";
process.env.CORS_ORIGIN ??= "http://localhost:3000";

const { formatDayString, getMonthRange, parseDayString } = await import("../dist/src/lib/dates.js");
const { handleRouteError } = await import("../dist/src/lib/http-errors.js");
const { MailerConfigurationError } = await import("../dist/src/lib/mailer.js");
const { ReportRateLimitError } = await import("../dist/src/lib/report-rate-limit.js");
const { AuthenticationError } = await import("../dist/src/modules/auth/auth-session.js");
const { EntryConflictError, EntryNotFoundError } = await import("../dist/src/modules/entries/entry.service.js");
const { getProfile, updateProfile } = await import("../dist/src/modules/profile/profile.service.js");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function createReplyMock() {
  return {
    statusCode: undefined,
    payload: undefined,
    log: {
      error() {},
    },
    code(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    send(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test("dates: valid day and month parsing", () => {
  const parsed = parseDayString("2026-03-23");
  assert.equal(parsed.toISOString(), "2026-03-23T00:00:00.000Z");
  assert.equal(formatDayString(parsed), "2026-03-23");

  const range = getMonthRange("2026-03");
  assert.equal(range.start.toISOString(), "2026-03-01T00:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-04-01T00:00:00.000Z");
});

test("dates: invalid dates are rejected", () => {
  assert.throws(() => parseDayString("2026-02-30"), /valid calendar date/);
  assert.throws(() => parseDayString("03-23-2026"), /YYYY-MM-DD/);
});

test("http-errors: auth and entry errors map to stable API responses", () => {
  const authReply = createReplyMock();
  handleRouteError(authReply, new AuthenticationError("Authentication required"));
  assert.equal(authReply.statusCode, 401);
  assert.equal(authReply.payload.code, "AUTHENTICATION_REQUIRED");

  const conflictReply = createReplyMock();
  handleRouteError(conflictReply, new EntryConflictError("An entry already exists for this date"));
  assert.equal(conflictReply.statusCode, 409);
  assert.equal(conflictReply.payload.code, "ENTRY_CONFLICT");

  const missingReply = createReplyMock();
  handleRouteError(missingReply, new EntryNotFoundError("Entry not found"));
  assert.equal(missingReply.statusCode, 404);
  assert.equal(missingReply.payload.code, "ENTRY_NOT_FOUND");
});

test("http-errors: report delivery errors map to operational status codes", () => {
  const mailReply = createReplyMock();
  handleRouteError(mailReply, new MailerConfigurationError("Email delivery is not configured"));
  assert.equal(mailReply.statusCode, 503);
  assert.equal(mailReply.payload.code, "EMAIL_NOT_CONFIGURED");

  const rateReply = createReplyMock();
  handleRouteError(rateReply, new ReportRateLimitError("Too many report requests. Please try again later."));
  assert.equal(rateReply.statusCode, 429);
  assert.equal(rateReply.payload.code, "REPORT_RATE_LIMITED");
});

test("profile: getProfile maps prisma user data to response payload", async () => {
  const prisma = {
    user: {
      findUniqueOrThrow: async () => ({
        name: "Alex Worker",
        email: "alex@example.com",
        language: "en",
        savedLocations: [{ name: "Berlin Site" }, { name: "Munich Yard" }],
      }),
    },
  };

  const profile = await getProfile(prisma, "user-1");
  assert.deepEqual(profile, {
    name: "Alex Worker",
    email: "alex@example.com",
    language: "en",
    savedLocations: ["Berlin Site", "Munich Yard"],
  });
});

test("profile: updateProfile trims, deduplicates and replaces saved locations", async () => {
  const operations = [];
  const prisma = {
    user: {
      update: async ({ data }) => {
        operations.push({ type: "user.update", data });
      },
      findUniqueOrThrow: async () => ({
        name: "Alex Worker",
        email: "alex@example.com",
        language: "pt-BR",
        savedLocations: [{ name: "Berlin Site" }, { name: "Munich Yard" }],
      }),
    },
    savedLocation: {
      deleteMany: ({ where }) => ({ action: "deleteMany", where }),
      createMany: ({ data }) => ({ action: "createMany", data }),
    },
    $transaction: async (steps) => {
      operations.push({ type: "transaction", steps });
    },
  };

  const result = await updateProfile(prisma, "user-1", {
    name: "Alex Worker",
    language: "pt-BR",
    savedLocations: [" Berlin Site ", "Munich Yard", "Berlin Site", " "],
  });

  assert.deepEqual(operations[0], {
    type: "user.update",
    data: { name: "Alex Worker", language: "pt-BR" },
  });
  assert.deepEqual(operations[1], {
    type: "transaction",
    steps: [
      { action: "deleteMany", where: { userId: "user-1" } },
      {
        action: "createMany",
        data: [
          { userId: "user-1", name: "Berlin Site" },
          { userId: "user-1", name: "Munich Yard" },
        ],
      },
    ],
  });
  assert.deepEqual(result.savedLocations, ["Berlin Site", "Munich Yard"]);
});

let failures = 0;

for (const { name, fn } of tests) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} automated API checks passed.`);
}
