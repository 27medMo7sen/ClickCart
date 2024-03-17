import Joi from 'joi';
export const createCategorySchema = {
    body: Joi.object({
        name: Joi.string().min(3).max(10),
    }).required().options({ presence: 'required' })

}
export const updateCategorySchema = {
    body: Joi.object({
        name: Joi.string().min(3).max(30).optional(),
    }).required()
}