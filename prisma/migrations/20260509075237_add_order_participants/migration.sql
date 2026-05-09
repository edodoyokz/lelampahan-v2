-- CreateTable
CREATE TABLE "OrderParticipant" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderParticipant" ADD CONSTRAINT "OrderParticipant_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
