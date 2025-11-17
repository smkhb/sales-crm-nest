-- CreateEnum
CREATE TYPE "SalespersonRole" AS ENUM ('saleperson', 'manager');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('lead', 'active', 'inactive');

-- CreateTable
CREATE TABLE "salespersons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "SalespersonRole" NOT NULL DEFAULT 'saleperson',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salespersons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'lead',
    "sales_rep_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salespersons_email_key" ON "salespersons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_sales_rep_id_fkey" FOREIGN KEY ("sales_rep_id") REFERENCES "salespersons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
