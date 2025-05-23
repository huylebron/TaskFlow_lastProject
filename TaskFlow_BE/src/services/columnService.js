/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newColumn = {
      ...reqBody
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // Xử lý cấu trúc data ở đây trước khi trả dữ liệu về
      getNewColumn.cards = []

      // Cập nhật mảng columnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) { throw error }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    // Lấy danh sách tất cả các card trong column
    const cards = await cardModel.findByColumnId(columnId)

    // Xóa tất cả các attachments trên Cloudinary
    for (const card of cards) {
      const publicIds = await cardModel.getAttachmentsPublicIds(card._id.toString())
      for (const publicId of publicIds) {
        if (publicId) {
          await CloudinaryProvider.deleteResource(publicId)
        }
      }
    }

    // Xóa Column
    await columnModel.deleteOneById(columnId)

    // Xóa toàn bộ Cards thuộc cái Column trên
    await cardModel.deleteManyByColumnId(columnId)

    // Xoá columnId trong mảng columnOrderIds của cái Board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Column and its Cards deleted successfully!' }
  } catch (error) { throw error }
}

const updateColor = async (columnId, reqBody) => {
  try {
    // reqBody ở đây được mong đợi là { color: 'newColorValue' }
    // Validation đã được thực hiện ở tầng validation, nên ở đây chỉ cần lấy color
    const { color } = reqBody

    // Gọi tới model để cập nhật cột với màu mới
    const updatedColumn = await columnModel.update(columnId, { color: color, updatedAt: Date.now() })

    if (!updatedColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found or color update failed.')
    }

    return updatedColumn
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem,
  updateColor
}
