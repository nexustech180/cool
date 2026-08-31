-- AlterTable
ALTER TABLE "School" ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "paystackCustomerCode" TEXT,
ADD COLUMN     "paystackPlanCode" TEXT,
ADD COLUMN     "paystackSubscriptionCode" TEXT,
ADD COLUMN     "subscriptionInterval" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "School_paystackCustomerCode_key" ON "School"("paystackCustomerCode");

