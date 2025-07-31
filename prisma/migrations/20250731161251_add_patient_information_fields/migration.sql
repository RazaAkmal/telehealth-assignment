/*
  Warnings:

  - The `queue_status` column on the `bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled', 'pre_booked');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('pending', 'confirmed', 'intake', 'ready_for_provider', 'provider', 'ready_for_discharge', 'discharged', 'no_show', 'cancelled', 'checked_in', 'in_consultation', 'completed');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "chief_complaint" TEXT,
ADD COLUMN     "is_adhoc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "patient_status" "PatientStatus" NOT NULL DEFAULT 'pending',
DROP COLUMN "queue_status",
ADD COLUMN     "queue_status" "QueueStatus" NOT NULL DEFAULT 'pending';
