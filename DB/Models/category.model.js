

import { Schema ,model } from 'mongoose';
export const categorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    slug: {
        type: String,
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
    },
    customId: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const categoryModel = model('Category', categorySchema);