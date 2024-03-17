

import { Schema ,model } from 'mongoose';
export const subCategorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    slug: {
        type: string,
        unique: true,
        required: true,
        lowercase: true
    },
    image: {
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    , 
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }

}, { timestamps: true });

export const subCategoryModel = model('subCategory', subCategorySchema);