/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import mongoose, { Document, Model } from 'mongoose';

export type IAdmin = Document & {
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  profile_image?: string | null;
  company_name: string;
  division?: string | null;
  contact?: string | null;
  address?: string | null;
}