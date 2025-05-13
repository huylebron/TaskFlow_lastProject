/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'

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

    if (cardCoverFile) {
      // Xử lý upload file ảnh làm cover
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else if (reqBody.cover !== undefined) {
      // Xử lý cập nhật cover là URL, mã màu hoặc null (xóa cover)
      await cardModel.update(cardId, { cover: reqBody.cover })
    } else if (updateData.commentToAdd) {
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email,
        userAvatar: userInfo.avatar || null,
        userDisplayName: userInfo.displayName || userInfo.username
      }
      await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      const { userId: userIdToUpdate, action } = updateData.incomingMemberInfo

      const currentCard = await cardModel.findOneById(cardId)
      if (!currentCard) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
      }

      const boardContainingCard = await boardModel.findOneById(currentCard.boardId)
      if (!boardContainingCard) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
      }

      const userToUpdateInfo = await userModel.findOneById(userIdToUpdate)
      if (!userToUpdateInfo) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User to update not found!')
      }

      const isUserInBoard = boardContainingCard.ownerIds.map(id => id.toString()).includes(userToUpdateInfo._id.toString()) ||
                            boardContainingCard.memberIds.map(id => id.toString()).includes(userToUpdateInfo._id.toString())
      if (!isUserInBoard) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'User is not a member or owner of this board.')
      }

      const isUserAlreadyMemberOfCard = currentCard.memberIds.map(id => id.toString()).includes(userToUpdateInfo._id.toString())

      if (action === CARD_MEMBER_ACTIONS.ADD) {
        if (isUserAlreadyMemberOfCard) {
          throw new ApiError(StatusCodes.CONFLICT, 'User is already a member of this card.')
        }
        await cardModel.updateMembers(cardId, { userId: userIdToUpdate, action: CARD_MEMBER_ACTIONS.ADD })
      } else if (action === CARD_MEMBER_ACTIONS.REMOVE) {
        if (!isUserAlreadyMemberOfCard) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'User is not a member of this card, cannot remove.')
        }
        await cardModel.updateMembers(cardId, { userId: userIdToUpdate, action: CARD_MEMBER_ACTIONS.REMOVE })
      } else {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid member action.')
      }
    } else {
      // Xử lý các trường dữ liệu khác
      const fieldsToUpdate = { ...updateData }
      delete fieldsToUpdate.updatedAt
      if (Object.keys(fieldsToUpdate).length > 0) {
        await cardModel.update(cardId, updateData)
      }
    }

    const finalUpdatedCard = await cardModel.getCardDetails(cardId)
    return finalUpdatedCard

  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
