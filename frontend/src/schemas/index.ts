import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().max(1000).optional(),
  domain: z.string().min(2, 'Please select a research domain')
});

export const newResearchSchema = z.object({
  projectId: z.string().uuid().optional(),
  projectTitle: z.string().min(3, 'Title is required').max(150),
  researchQuestion: z.string().min(5, 'Research question must be at least 5 characters').max(2000),
  domain: z.string().min(2, 'Please select a domain'),
  scope: z.enum([
    'Exploratory',
    'Comparative',
    'Systematic-style evidence review',
    'Literature review',
    'Technical investigation',
    'Trend analysis',
    'Methodology analysis'
  ]).default('Exploratory'),
  maxSources: z.number().min(5).max(100).default(30),
  includeWebResearch: z.boolean().default(true),
  includePreprints: z.boolean().default(true)
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  preferredLanguage: z.string().min(2).max(10)
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type NewResearchFormValues = z.infer<typeof newResearchSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

