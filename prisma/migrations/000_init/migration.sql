CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TYPE "UserRole" AS ENUM ('customer', 'expert', 'admin', 'superadmin');
CREATE TYPE "UserStatus" AS ENUM ('active', 'disabled', 'deleted');
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE "CaseStatus" AS ENUM ('open', 'waiting_for_expert', 'in_chat', 'answered', 'closed', 'escalated');
CREATE TYPE "MessageType" AS ENUM ('text', 'attachment', 'system');
CREATE TYPE "Priority" AS ENUM ('normal', 'high');

CREATE TABLE "User" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" citext NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'customer',
  "status" "UserStatus" NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "lastLogin" timestamp
);

CREATE TABLE "Profile" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "name" text,
  "phone" text,
  "locale" text DEFAULT 'de',
  "avatarUrl" text
);

CREATE TABLE "Expert" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "bio" text,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'pending',
  "ratingAvg" double precision NOT NULL DEFAULT 0,
  "answeredCount" integer NOT NULL DEFAULT 0,
  "responseTimeAvg" integer NOT NULL DEFAULT 0
);

CREATE TABLE "Category" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "parentId" uuid REFERENCES "Category"("id") ON DELETE SET NULL,
  "isActive" boolean NOT NULL DEFAULT true
);

CREATE TABLE "ExpertSkill" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "expertId" uuid NOT NULL REFERENCES "Expert"("id") ON DELETE CASCADE,
  "categoryId" uuid NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
  "proficiencyLevel" integer NOT NULL DEFAULT 3
);

CREATE TABLE "Case" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customerId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "categoryId" uuid NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "status" "CaseStatus" NOT NULL DEFAULT 'waiting_for_expert',
  "priority" "Priority" NOT NULL DEFAULT 'normal',
  "assignedExpertId" uuid REFERENCES "User"("id"),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "closedAt" timestamp
);

CREATE TABLE "Message" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "caseId" uuid NOT NULL REFERENCES "Case"("id") ON DELETE CASCADE,
  "senderUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" "MessageType" NOT NULL DEFAULT 'text',
  "content" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "Attachment" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "ownerUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "caseId" uuid REFERENCES "Case"("id") ON DELETE CASCADE,
  "messageId" uuid REFERENCES "Message"("id") ON DELETE CASCADE,
  "fileUrl" text NOT NULL,
  "mimeType" text NOT NULL,
  "size" integer NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "Rating" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "caseId" uuid NOT NULL REFERENCES "Case"("id") ON DELETE CASCADE,
  "customerId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expertId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "stars" integer NOT NULL,
  "comment" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "VerificationDocument" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "expertId" uuid NOT NULL REFERENCES "Expert"("id") ON DELETE CASCADE,
  "fileUrl" text NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
  "reviewedByAdminId" uuid,
  "reviewedAt" timestamp
);

CREATE TABLE "Notification" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "payloadJson" jsonb NOT NULL,
  "readAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "AuditLog" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "actorUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "action" text NOT NULL,
  "targetType" text NOT NULL,
  "targetId" text NOT NULL,
  "metaJson" jsonb NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "PaymentIntent" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "caseId" uuid NOT NULL UNIQUE REFERENCES "Case"("id") ON DELETE CASCADE,
  "customerId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "status" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text NOT NULL
);
