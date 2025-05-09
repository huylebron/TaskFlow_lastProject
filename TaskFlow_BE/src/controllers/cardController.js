/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfo = req.jwtDecoded
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

// Thêm phương thức addAttachment
const addAttachment = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const attachmentFile = req.file
    const userInfo = req.jwtDecoded
    
    // Gọi service để thêm attachment
    const updatedCard = await cardService.addAttachment(cardId, attachmentFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

// Thêm phương thức removeAttachment
const removeAttachment = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const attachmentId = req.params.attachmentId
    
    // Gọi service để xóa attachment
    const updatedCard = await cardService.removeAttachment(cardId, attachmentId)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

// Thêm phương thức getAttachments để lấy danh sách attachments của một card
const getAttachments = async (req, res, next) => {
  try {
    const cardId = req.params.id
    
    // Gọi service để lấy attachments
    const attachments = await cardService.getAttachments(cardId)

    res.status(StatusCodes.OK).json(attachments)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update,
  addAttachment,
  removeAttachment,
  getAttachments
}
