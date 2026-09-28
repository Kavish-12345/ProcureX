-- CreateIndex
CREATE INDEX "Order_retailerId_createdAt_idx" ON "Order"("retailerId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_supplierId_createdAt_idx" ON "Order"("supplierId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "Product_supplierId_createdAt_idx" ON "Product"("supplierId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplierRetailerConnection_retailerId_idx" ON "SupplierRetailerConnection"("retailerId");
