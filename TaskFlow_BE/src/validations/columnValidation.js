/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { COLUMN_COLORS } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  // Lưu ý không dùng hàm required() trong trường hợp Update
  const correctCondition = Joi.object({
    // Nếu cần làm tính năng di chuyển Column sang Board khác thì mới thêm validate boardId
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    // Thêm validation cho color
    color: Joi.string().valid(...COLUMN_COLORS).optional().messages({
      'any.only': '{{#label}} must be one of the allowed colors'
    })
  })

  try {
    // Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi (video 52)
    // Đối với trường hợp update, cho phép Unknown để không cần đẩy một số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })

    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const deleteItem = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })
  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateColor = async (req, res, next) => {
  const correctCondition = Joi.object({
    color: Joi.string().required().valid(...COLUMN_COLORS).messages({
      'any.required': 'Color is required.',
      'any.only': '{{#label}} must be one of the allowed colors. Please refer to the documentation for available colors.'
    })
  })

  try {
    // Chỉ validate req.body vì columnId đã được route xử lý (là một ObjectId hợp lệ)
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    // Nếu có lỗi từ Joi, trả về lỗi UNPROCESSABLE_ENTITY
    const errorMessage = new Error(error).message
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const columnValidation = {
  createNew,
  update,
  deleteItem,
  updateColor
}
