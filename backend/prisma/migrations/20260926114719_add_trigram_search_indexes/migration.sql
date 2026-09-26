-- gin_trgm_ops comes from the pg_trgm extension, which Prisma won't create for
-- us because we deliberately don't use the postgresqlExtensions preview feature.
-- Must run before the indexes below, on every database this migration touches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "User_businessName_idx" ON "User" USING GIN ("businessName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User" USING GIN ("email" gin_trgm_ops);
