/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.update,
    cardController.update
  )

// Thêm route cho các thao tác attachment
Router.route('/:id/attachments')
  // Lấy danh sách attachments của một card
  .get(
    authMiddleware.isAuthorized,
    cardController.getAttachments
  )
  // Thêm attachment vào card
  .post(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.uploadAttachment.single('attachment'),
    cardValidation.addAttachment,
    cardController.addAttachment
  )

// Xóa attachment từ card
Router.route('/:id/attachments/:attachmentId')
  .delete(
    authMiddleware.isAuthorized,
    cardController.removeAttachment
  )

export const cardRoute = Router
