/*
  Warnings:

  - You are about to drop the column `category` on the `Risk` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `Risk` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Risk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Risk" ("band", "createdAt", "description", "id", "impact", "likelihood", "severity", "status", "title", "updatedAt") SELECT "band", "createdAt", "description", "id", "impact", "likelihood", "severity", "status", "title", "updatedAt" FROM "Risk";
DROP TABLE "Risk";
ALTER TABLE "new_Risk" RENAME TO "Risk";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
