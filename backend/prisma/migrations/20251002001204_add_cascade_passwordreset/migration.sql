-- DropForeignKey
ALTER TABLE "public"."PasswordReset" DROP CONSTRAINT "PasswordReset_usuId_fkey";

-- AddForeignKey
ALTER TABLE "public"."PasswordReset" ADD CONSTRAINT "PasswordReset_usuId_fkey" FOREIGN KEY ("usuId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
