-- AlterTable
ALTER TABLE "User" ALTER COLUMN "accountActivationExpires" DROP NOT NULL,
ALTER COLUMN "accountActivationToken" DROP NOT NULL,
ALTER COLUMN "passwordResetExpires" DROP NOT NULL,
ALTER COLUMN "passwordResetToken" DROP NOT NULL,
ALTER COLUMN "uniqueUrlForLogin" DROP NOT NULL;
