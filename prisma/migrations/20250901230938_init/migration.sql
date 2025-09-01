-- CreateTable
CREATE TABLE "public"."Risk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);
