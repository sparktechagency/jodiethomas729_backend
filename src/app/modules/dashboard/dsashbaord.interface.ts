import { Schema, Types } from "mongoose";

export type ISubscriptions = {
  name: string;
  duration: string;
  fee: Number;
  description: string
};

export interface INutritional {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
  saturated_fat: number;
  sodium: number;
}

export interface IRecipe extends Document {
  name: string;
  creator: Types.ObjectId;
  duration: string;
  ingredients: string[];
  instructions: string;
  nutritional: INutritional;
  category: string;
  image: string[];
  meal_type: string;
  temperature: string;
  flavor_type: string;
  cuisine_profiles: string;
  kid_approved: boolean;
  no_weekend_prep: boolean;
  time: string;
  serving_size: number;
  ratting: number;
  favorites: Types.ObjectId[];
  holiday_recipes: string;
  oils: string;
  serving_temperature: string;
  flavor: string;
  weight_and_muscle: string;
  whole_food_type: string;
  prep_time: number
  recipe_tips: string;
}

export interface IReview extends Document {
  userId: Types.ObjectId;
  review: number;
  feedback: string;
}


export interface IComment extends Document {
  userId: Types.ObjectId;
  replay: Types.ObjectId;
  text: string;
}

export type IAdds = {
  image: string;
  url: string;
};

export type IContactSupport = {
  name: string;
  email: string;
  subject: string;
  message: string;
  user: Types.ObjectId;
}

// export interface IComment extends Document {
//   userId: Types.ObjectId;
//   replay: Types.ObjectId;
//   text: string;
// } 