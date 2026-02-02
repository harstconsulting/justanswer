import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "expert"]).default("customer")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const caseCreateSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(4),
  description: z.string().min(10),
  priority: z.enum(["normal", "high"]).default("normal")
});

export const messageCreateSchema = z.object({
  content: z.string().min(1),
  type: z.enum(["text", "attachment", "system"]).default("text")
});

export const expertProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(3).max(40).optional().nullable(),
  locale: z.string().min(2).max(10).optional(),
  avatarUrl: z.string().max(500).optional().nullable()
});

export const expertSkillsSchema = z.array(
  z.object({
    categoryId: z.string().uuid(),
    proficiencyLevel: z.number().min(1).max(5)
  })
);

export const verificationDocumentSchema = z.object({
  fileUrl: z.string().url()
});

export const accountProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(3).max(40).optional().nullable(),
  locale: z.string().min(2).max(10).optional(),
  avatarUrl: z.string().max(500).optional().nullable()
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});
