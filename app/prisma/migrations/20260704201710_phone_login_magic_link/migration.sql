-- DropTable
DROP TABLE "PhoneOtp";

-- CreateTable
CREATE TABLE "PhoneLoginToken" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneLoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneLoginToken_token_key" ON "PhoneLoginToken"("token");

-- CreateIndex
CREATE INDEX "PhoneLoginToken_phone_idx" ON "PhoneLoginToken"("phone");

