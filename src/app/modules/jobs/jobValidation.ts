import { z } from 'zod';
import { Types } from 'mongoose';

export const jobValidationSchema = z.object({
    authId: z
        .string()
        .refine(val => Types.ObjectId.isValid(val), {
            message: 'authId must be a valid MongoDB ObjectId',
        })
        .optional(),

    title: z
        .string({ required_error: 'Title is required' })
        .min(1, 'Title cannot be empty')
        .optional(),

    category: z
        .string({ required_error: 'Category is required' })
        .refine(val => Types.ObjectId.isValid(val), {
            message: 'Category must be a valid MongoDB ObjectId',
        })
        .optional(),

    salary: z
        .number({ invalid_type_error: 'Salary must be a number' })
        .optional(),

    experience: z
        .enum(
            [
                'freshers', '1_2_years', '2_4_years', '4_6_years',
                '6_8_years', '8_10_years', '10_12_years',
                '12_14_years', '15_years',
            ],
            { errorMap: () => ({ message: 'Invalid education level selected' }) }
        )
        .optional(),

    types: z
        .enum(
            [
                'full_time', 'part_time', 'internship',
                'remote', 'temporary', 'contract_base',
            ],
            { errorMap: () => ({ message: 'Invalid job type selected' }) }
        )
        .optional(),

    education: z
        .enum(
            [
                'high_school', 'intermediate', 'bachelor_degree',
                'graduation', 'master_degree',
            ],
            { errorMap: () => ({ message: 'Invalid experience level selected' }) }
        )
        .optional(),

    skill: z
        .array(z.string({ invalid_type_error: 'Skill must be a string' }))
        .optional(),

    vacancies: z
        .number({ invalid_type_error: 'Vacancies must be a number' })
        .optional(),

    application_dateline: z
        .coerce.date({ invalid_type_error: 'Application deadline must be a valid date' })
        .optional(),

    locations: z
        .string({ invalid_type_error: 'Locations must be a string' })
        .optional(),

    descriptions: z
        .string({ required_error: 'Job description is required' })
        .min(10, 'Description must be at least 10 characters long'),

    availabilities: z
        .string({ invalid_type_error: 'Availabilities must be a string' })
        .optional(),
});
