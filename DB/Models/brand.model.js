
import { Schema ,model } from 'mongoose';
export const brandSchema = new Schema({
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
    logo: {
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
        ref: 'subCategory'
    }

}, { timestamps: true });

export const brandModel = model('Brand', brandSchema);