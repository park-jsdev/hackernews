# Migration `20200811161502-init`

This migration has been generated by Terry Junsoo Park at 8/11/2020, 9:15:02 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "Link" (
"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
"description" TEXT NOT NULL,
"url" TEXT NOT NULL)

PRAGMA foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200811161502-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,24 @@
+// Prisma has a schema, think of it as a database schema (its like an ORM)
+// It has: 
+// 1. Data source: Specifies your database connection.
+// 2. Generator: Indicates that you want to genenerate Prisma Client.
+// 3. Data model: Defines your application models. Each model will be mapped to a table in the underlying database.
+
+// Data source: Tells Prisma you’ll be using SQLite for your database connection.
+datasource db {
+  provider = "sqlite" 
+  url = "***"
+}
+
+// Generator: Indicates that you want to genenerate Prisma Client.
+generator client {
+  provider = "prisma-client-js"
+}
+
+// Data model: Here, we have written out our Link as a model.
+model Link {
+  id          Int      @id @default(autoincrement())
+  createdAt   DateTime @default(now())
+  description String
+  url         String
+}
```

