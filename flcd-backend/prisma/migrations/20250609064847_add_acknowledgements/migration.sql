-- CreateEnum
CREATE TYPE "AcknowledgementType" AS ENUM ('VISA', 'SIM', 'EQUIPMENT', 'TRAINING', 'OTHER');

-- CreateTable
CREATE TABLE "acknowledgements" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "type" "AcknowledgementType" NOT NULL,
    "acknowledgement_description" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "isPreSigned" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acknowledgements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
