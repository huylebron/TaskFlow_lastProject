/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    // Thêm validation cho cover: chấp nhận URL, mã màu hex hoặc null
    cover: Joi.alternatives().try(
      Joi.string().uri(), // URL hợp lệ
      Joi.string().pattern(/^#([a-fA-F0-9]{6})$/).message('Cover color must be a valid hex color code (e.g. #ffffff)'),
      Joi.allow(null)
    ),
    // Validation cho commentToAdd
    commentToAdd: Joi.object({
      content: Joi.string().required().min(1).trim().strict()
    }).optional(),
    // Validation cho incomingMemberInfo
    incomingMemberInfo: Joi.object({
      userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      action: Joi.string().required().valid(CARD_MEMBER_ACTIONS.ADD, CARD_MEMBER_ACTIONS.REMOVE)
    }).optional()
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

// Thêm validation cho việc thêm attachment vào card
const addAttachment = async (req, res, next) => {
  // Kiểm tra xem file đã được upload hay chưa
  if (!req.file) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Please upload a file'))
  }
  
  // Nếu đã có file được upload qua middleware, thì tiếp tục
  next()
}

export const cardValidation = {
  createNew,
  update,
  addAttachment
}
