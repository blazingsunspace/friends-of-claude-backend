/*
  Warnings:

  - You are about to drop the column `jobTitle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authorId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blocked` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockedBy` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profilePicture` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountActivationExpires` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountActivationToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isUploaded` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastTimeLogged` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordResetExpires` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordResetToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueUrlForLogin` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'CONTRIBUTOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('red', 'greeen', 'blue', 'orange');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "bgImageId" VARCHAR(30),
ADD COLUMN     "bgImageVersion" VARCHAR(60),
ADD COLUMN     "blocked" JSON NOT NULL,
ADD COLUMN     "blockedBy" JSON NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "firstName" VARCHAR(60),
ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastName" VARCHAR(60),
ADD COLUMN     "location" TEXT DEFAULT '',
ADD COLUMN     "middleName" VARCHAR(60),
ADD COLUMN     "postsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profilePicture" VARCHAR(255) NOT NULL,
ADD COLUMN     "quote" TEXT DEFAULT '',
ADD COLUMN     "school" TEXT DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "work" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "jobTitle",
DROP COLUMN "name",
ADD COLUMN     "accountActivationExpires" BIGINT NOT NULL,
ADD COLUMN     "accountActivationToken" VARCHAR(60) NOT NULL,
ADD COLUMN     "activatedByEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedByAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "avatarColor" "Color" NOT NULL DEFAULT 'orange',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "imStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isUploaded" JSON NOT NULL,
ADD COLUMN     "lastTimeLogged" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "listMeInDirectory" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "listMyTestemonials" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nottifyMeIfUsedInDocumentary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" CHAR(128) NOT NULL,
ADD COLUMN     "passwordResetExpires" BIGINT NOT NULL,
ADD COLUMN     "passwordResetToken" VARCHAR(60) NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "setPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uniqueUrlForLogin" VARCHAR(60) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" VARCHAR(128) NOT NULL;

-- CreateTable
CREATE TABLE "Social" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "facebook" TEXT DEFAULT '',
    "instagram" TEXT DEFAULT '',
    "youttwitterube" TEXT DEFAULT '',
    "youtube" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileNotifications" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "messages" BOOLEAN NOT NULL DEFAULT true,
    "reactions" BOOLEAN NOT NULL DEFAULT true,
    "comments" BOOLEAN NOT NULL DEFAULT true,
    "follows" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProfileNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Social_profileId_key" ON "Social"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileNotifications_profileId_key" ON "ProfileNotifications"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_authorId_key" ON "Profile"("authorId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileNotifications" ADD CONSTRAINT "ProfileNotifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
