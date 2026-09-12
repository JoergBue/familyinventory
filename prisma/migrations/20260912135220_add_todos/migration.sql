-- CreateTable
CREATE TABLE "TodoArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TodoArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TodoArea_name_key" ON "TodoArea"("name");

-- CreateIndex
CREATE INDEX "Todo_areaId_idx" ON "Todo"("areaId");

-- CreateIndex
CREATE INDEX "Todo_done_idx" ON "Todo"("done");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "TodoArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
