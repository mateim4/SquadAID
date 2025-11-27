import { z } from 'zod';

const ArchitectureComponentSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  status: z.enum(['active', 'inactive', 'error']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const ArchitectureConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  active: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const ArchitectureDiagramSchema = z.object({
  version: z.string(),
  components: z.array(ArchitectureComponentSchema),
  connections: z.array(ArchitectureConnectionSchema),
  mermaid: z.string(),
  lastUpdated: z.string().datetime(),
});

export function validateArchitecture(data: unknown): { success: boolean; error?: z.ZodError } {
  return ArchitectureDiagramSchema.safeParse(data);
}
