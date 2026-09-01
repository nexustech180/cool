-- AlterTable
ALTER TABLE "School"
  ADD COLUMN "paystackAuthCode"      TEXT,
  ADD COLUMN "paystackCustomerEmail" TEXT,
  ADD COLUMN "subscriptionExpiresAt" TIMESTAMP(3);
