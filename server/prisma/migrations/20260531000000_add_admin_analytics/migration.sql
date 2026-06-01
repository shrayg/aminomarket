CREATE TABLE "AnalyticsSession" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "entryPath" TEXT NOT NULL,
    "source" TEXT,
    "referrer" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "engaged" BOOLEAN NOT NULL DEFAULT false,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "checkoutStarted" BOOLEAN NOT NULL DEFAULT false,
    "converted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "productSlug" TEXT,
    "query" TEXT,
    "source" TEXT,
    "referrer" TEXT,
    "value" DOUBLE PRECISION,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FulfillmentRecord" (
    "stripeSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unfulfilled',
    "trackingNumber" TEXT,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FulfillmentRecord_pkey" PRIMARY KEY ("stripeSessionId")
);

CREATE INDEX "AnalyticsSession_startedAt_idx" ON "AnalyticsSession"("startedAt");
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

ALTER TABLE "AnalyticsEvent"
ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
