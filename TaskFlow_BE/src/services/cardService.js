/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ObjectId } from 'mongodb'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else if (updateData.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào Database, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      // Trường hợp ADD hoặc REMOVE thành viên ra khỏi Card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      // Các trường hợp update chung như title, description
      updatedCard = await cardModel.update(cardId, updateData)
    }


    return updatedCard
  } catch (error) { throw error }
}

// Thêm attachment vào card
const addAttachment = async (cardId, attachmentFile, userInfo) => {
  try {
    if (!attachmentFile) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Please upload a file')
    }

    // Upload file lên Cloudinary với folder riêng cho attachments
    const uploadResult = await CloudinaryProvider.streamUpload(attachmentFile.buffer, 'card-attachments')

    // Tạo dữ liệu attachment
    const attachmentData = {
      fileName: attachmentFile.originalname,
      fileUrl: uploadResult.secure_url,
      fileSize: attachmentFile.size,
      fileType: attachmentFile.mimetype,
      uploadedAt: Date.now(),
      userId: userInfo._id,
      userEmail: userInfo.email,
      publicId: uploadResult.public_id // Lưu public_id để tiện cho việc xóa sau này
    }

    // Thêm attachment vào card
    const result = await cardModel.pushAttachment(cardId, attachmentData)
    return result
  } catch (error) { throw error }
}

// Xóa attachment từ card
const removeAttachment = async (cardId, attachmentId) => {
  try {
    // Lấy thông tin card trước khi xóa để có thông tin publicId của file trên Cloudinary
    const card = await cardModel.findOneById(cardId)
    
    // Tìm attachment cần xóa
    const attachmentToRemove = card.attachments.find(att => att._id.toString() === attachmentId)
    
    if (!attachmentToRemove) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Attachment not found')
    }

    // Xóa file từ Cloudinary nếu có publicId
    if (attachmentToRemove.publicId) {
      await CloudinaryProvider.deleteResource(attachmentToRemove.publicId)
    }

    // Xóa attachment khỏi card
    const result = await cardModel.pullAttachment(cardId, attachmentId)
    return result
  } catch (error) { throw error }
}

// Lấy danh sách attachments của một card
const getAttachments = async (cardId) => {
  try {
    const card = await cardModel.findOneById(cardId)
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found')
    }
    return card.attachments || []
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update,
  addAttachment,
  removeAttachment,
  getAttachments
}
