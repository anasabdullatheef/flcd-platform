/*
  Warnings:

  - You are about to drop the column `emergencyContact` on the `riders` table. All the data in the column will be lost.
  - You are about to drop the column `partnerCode` on the `riders` table. All the data in the column will be lost.
  - You are about to drop the column `partnerName` on the `riders` table. All the data in the column will be lost.
  - You are about to drop the column `visaNumber` on the `riders` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'WORK_PERMIT';
ALTER TYPE "DocumentType" ADD VALUE 'INSURANCE';
ALTER TYPE "DocumentType" ADD VALUE 'OTHER_DOCUMENT';

-- AlterTable
ALTER TABLE "riders" DROP COLUMN "emergencyContact",
DROP COLUMN "partnerCode",
DROP COLUMN "partnerName",
DROP COLUMN "visaNumber",
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "cityOfWork" TEXT,
ADD COLUMN     "companySim" TEXT,
ADD COLUMN     "deliveryPartner" TEXT,
ADD COLUMN     "deliveryPartnerId" TEXT,
ADD COLUMN     "emiratesIdExpiry" TIMESTAMP(3),
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "healthNotes" TEXT,
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3),
ADD COLUMN     "insurancePartner" TEXT,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "languageSpoken" TEXT,
ADD COLUMN     "passportExpiry" TIMESTAMP(3),
ADD COLUMN     "profilePicture" TEXT;
