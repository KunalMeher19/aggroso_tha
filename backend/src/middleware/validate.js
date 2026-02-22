const { z } = require('zod');

const urlSchema = z
    .string()
    .url({ message: 'Must be a valid URL (include https://)' })
    .optional()
    .or(z.literal(''));

const createCompetitorSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name too long')
        .trim(),
    urls: z
        .object({
            pricing: urlSchema,
            docs: urlSchema,
            changelog: urlSchema,
        })
        .refine(
            (u) => u.pricing || u.docs || u.changelog,
            { message: 'At least one URL (pricing, docs, or changelog) is required' }
        ),
    tags: z.array(z.string().trim().max(30)).max(10).optional().default([]),
    alertEmail: z.string().email().optional().or(z.literal('')),
    alertOnChangeScore: z.number().min(0).max(100).optional().default(0),
});

const updateCompetitorSchema = createCompetitorSchema.partial();

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }
    req.body = result.data;
    next();
};

module.exports = { validate, createCompetitorSchema, updateCompetitorSchema };
