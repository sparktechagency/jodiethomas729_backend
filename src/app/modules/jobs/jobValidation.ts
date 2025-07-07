import { z } from 'zod';
import { Types } from 'mongoose';

export const jobValidationSchema = z.object({

    title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty'),

    category: z
        .string({ required_error: 'Category is required' })
        .refine(val => Types.ObjectId.isValid(val), {
            message: 'Category must be a valid MongoDB ObjectId',
        }),

    salary: z.number({ invalid_type_error: 'Salary must be a number' }).optional(),

    experience: z.enum(
        [
            'freshers', '1_2_years', '2_4_years',
            '4_6_years', '6_8_years', '8_10_years', '10plus', "n/a",
        ],
        { errorMap: () => ({ message: 'Invalid experience level selected' }) }
    ),
    types: z.enum(
        [
            'full_time', 'part_time', 'internship',
            'remote_hybrid', 'temporary', 'fixedterm_contract',
            'apprenticeship', 'graduate_entrylevel'
        ],
        { errorMap: () => ({ message: 'Invalid job type selected' }) }
    ),

    education: z.enum(
        ["gcse_or_equivalent", "apprenticeship", "hnc_hnd", "degree", "other"],
        { errorMap: () => ({ message: 'Invalid education level selected' }) }
    ),

    skill: z.array(z.string({ invalid_type_error: 'Skill must be a string' })).optional(),

    vacancies: z.number({ invalid_type_error: 'Vacancies must be a number' }).optional(),

    application_dateline: z.coerce.date({ invalid_type_error: 'Application deadline must be a valid date' }).optional(),

    location: z.object({
        longitude: z.number({ invalid_type_error: 'Longitude must be a number' }),
        latitude: z.number({ invalid_type_error: 'Latitude must be a number' }),
    }),

    descriptions: z
        .string({ required_error: 'Job description is required' })
        .min(10, 'Description must be at least 10 characters long'),

    availabilities: z.string({ invalid_type_error: 'Availabilities must be a string' }).optional(),

    rate: z.enum(['par_hour', 'par_day', 'par_year']).optional(),

    job_pattern: z.enum(['day_shift', 'evening_shift', 'days', 'hours', 'flexibility']).optional(),

    address: z.string({ required_error: 'Address is required' }).min(2, 'Address is too short'),
});
