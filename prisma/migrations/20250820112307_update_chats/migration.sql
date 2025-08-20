/*
  Warnings:

  - You are about to drop the column `description` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `ConnectedUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JoinedRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ConnectedUser" DROP CONSTRAINT "ConnectedUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JoinedRoom" DROP CONSTRAINT "JoinedRoom_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JoinedRoom" DROP CONSTRAINT "JoinedRoom_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "description";

-- DropTable
DROP TABLE "public"."ConnectedUser";

-- DropTable
DROP TABLE "public"."JoinedRoom";
