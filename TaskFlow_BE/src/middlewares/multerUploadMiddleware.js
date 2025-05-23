import multer from 'multer'
import { 
  LIMIT_COMMON_FILE_SIZE, 
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_ATTACHMENT_FILE_SIZE,
  ALLOW_ATTACHMENT_FILE_TYPES 
} from '~/utils/validators'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

/** Hầu hết những thứ bên dưới đều có ở docs của multer, chỉ là anh tổ chức lại sao cho khoa học và gọn gàng nhất có thể
* https://www.npmjs.com/package/multer
*/

// Function Kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  // console.log('Multer File: ', file)

  // Đối với thằng multer, kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  // Nếu như kiểu file hợp lệ:
  return callback(null, true)
}

// Function kiểm tra loại file attachment được chấp nhận
const attachmentFileFilter = (req, file, callback) => {
  // Kiểm tra kiểu file cho attachment
  if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'Attachment file type is invalid. Only accept jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx, txt, csv'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  // Nếu như kiểu file hợp lệ:
  return callback(null, true)
}

// Khởi tạo function upload được bọc bởi thằng multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

// Khởi tạo function uploadAttachment cho tệp đính kèm
const uploadAttachment = multer({
  limits: { fileSize: LIMIT_ATTACHMENT_FILE_SIZE },
  fileFilter: attachmentFileFilter
})

export const multerUploadMiddleware = { upload, uploadAttachment }
