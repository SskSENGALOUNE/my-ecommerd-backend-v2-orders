-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "BankType" AS ENUM ('BCEL', 'JDB', 'LDB');

-- CreateTable
CREATE TABLE "ex_table" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "ex_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "merchant_name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "post_request" TEXT NOT NULL,
    "bank_request" TEXT NOT NULL,
    "bank_response" TEXT NOT NULL,
    "bank_type" "BankType" NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
