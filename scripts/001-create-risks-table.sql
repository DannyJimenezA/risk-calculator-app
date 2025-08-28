-- Create risks table with proper constraints
CREATE TABLE IF NOT EXISTS "Risk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(40) NOT NULL,
    "owner" VARCHAR(80) NOT NULL,
    "likelihood" INTEGER NOT NULL CHECK ("likelihood" >= 1 AND "likelihood" <= 5),
    "impact" INTEGER NOT NULL CHECK ("impact" >= 1 AND "impact" <= 5),
    "severity" INTEGER NOT NULL,
    "band" TEXT NOT NULL CHECK ("band" IN ('Low', 'Moderate', 'High', 'Critical')),
    "status" TEXT NOT NULL DEFAULT 'Open' CHECK ("status" IN ('Open', 'Monitoring', 'Closed')),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Risk_severity_idx" ON "Risk"("severity");
CREATE INDEX IF NOT EXISTS "Risk_band_idx" ON "Risk"("band");
CREATE INDEX IF NOT EXISTS "Risk_status_idx" ON "Risk"("status");
CREATE INDEX IF NOT EXISTS "Risk_category_idx" ON "Risk"("category");
CREATE INDEX IF NOT EXISTS "Risk_owner_idx" ON "Risk"("owner");
CREATE INDEX IF NOT EXISTS "Risk_updatedAt_idx" ON "Risk"("updatedAt");
