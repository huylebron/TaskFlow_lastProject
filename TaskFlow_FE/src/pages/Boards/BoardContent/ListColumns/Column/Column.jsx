import { useState } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { useConfirm } from 'material-ui-confirm'
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from '~/apis'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import PaletteIcon from '@mui/icons-material/Palette'
import { updateColumnColorAPI } from '~/apis'
import { COLUMN_COLORS } from '~/utils/constants'

function Column({ column }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })
  const dndKitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    height: '100%',
    opacity: isDragging ? 0 : 1,
    filter: 'none',
    boxShadow: undefined
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // Cards đã được sắp xếp ở component cha cao nhất (boards/_id.jsx) (Video 71 đã giải thích lý do)
  const orderedCards = column.cards

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card Title!', { position: 'bottom-right' })
      return
    }

    // Tạo dữ liệu Card để gọi API
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }

    // Gọi API tạo mới Card và làm lại dữ liệu State Board
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    // Cập nhật state board
    // Phía Front-end chúng ta phải tự làm đúng lại state data board (thay vì phải gọi lại api fetchBoardDetailsAPI)
    // Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ Board dù đây có là api tạo Column hay Card đi chăng nữa. => Lúc này FE sẽ nhàn hơn.

    // Tương tự hàm createNewColumn nên chỗ này dùng cloneDeep
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      // Nếu column rỗng: bản chất là đang chứa một cái Placeholder card (Nhớ lại video 37.2, hiện tại là video 69)
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        // Ngược lại Column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Đóng trạng thái thêm Card mới & Clear Input
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  // Xử lý xóa một Column và Cards bên trong nó
  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: 'Delete Column?',
      description: 'This action will permanently delete your Column and its Cards! Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
      // buttonOrder: ['confirm', 'cancel']
      // content: 'test content hehe',
      // allowClose: false,
      // dialogProps: { maxWidth: 'lg' },
      // cancellationButtonProps: { color: 'primary' },
      // confirmationButtonProps: { color: 'success', variant: 'outlined' },
      // description: 'Phải nhập chữ trungquandev thì mới được Confirm =))',
      // confirmationKeyword: 'trungquandev'
    }).then(() => {
      // Update cho chuẩn dữ liệu state Board

      // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))

      // Gọi API xử lý phía BE
      deleteColumnDetailsAPI(column._id).then(res => {
        toast.success(res?.deleteResult)
      })
    }).catch(() => {})
  }

  const onUpdateColumnTitle = (newTitle) => {
    // Gọi API update Column và xử lý dữ liệu board trong redux
    updateColumnDetailsAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => c._id === column._id)
      if (columnToUpdate) columnToUpdate.title = newTitle

      dispatch(updateCurrentActiveBoard(newBoard))
    })
  }

  // Hàm xử lý khi chọn một màu mới
  const handleSelectColor = async (newColor) => {
    handleCloseColorMenu(); // Đóng menu chọn màu
    handleClose(); // Đóng menu chính

    if (column.color === newColor) return; // Không làm gì nếu màu không đổi

    try {
      const updatedColumnData = await updateColumnColorAPI(column._id, { color: newColor });

      // Cập nhật state board trong Redux
      const newBoard = cloneDeep(board);
      const columnToUpdate = newBoard.columns.find(c => c._id === updatedColumnData._id);
      if (columnToUpdate) {
        columnToUpdate.color = updatedColumnData.color;
        if (updatedColumnData.updatedAt) { // Cập nhật updatedAt nếu có
          columnToUpdate.updatedAt = updatedColumnData.updatedAt;
        }
      }
      dispatch(updateCurrentActiveBoard(newBoard));
      toast.success('Column color updated!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update column color');
    }
  };

  const [anchorElColorMenu, setAnchorElColorMenu] = useState(null)
  const openColorMenu = Boolean(anchorElColorMenu)
  const handleClickColorMenu = (event) => setAnchorElColorMenu(event.currentTarget)
  const handleCloseColorMenu = () => setAnchorElColorMenu(null)

  // Phải bọc div ở đây vì vấn đề chiều cao của column khi kéo thả sẽ có bug kiểu kiểu flickering (video 32)
  return (
    <div id={column._id} ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: column.color || ((theme) => (theme.palette.mode === 'dark' ? '#383B47' : '#f0f2f5')), // Sử dụng column.color nếu có
          ml: 2,
          borderRadius: '8px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          },
          transition: 'all 0.2s ease',
        }}
      >
        {/* Box Column Header */}
        <Box sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#4a5568' : '#e0e3e7'}`
        }}>
          <ToggleFocusInput
            value={column?.title}
            onChangedValue={onUpdateColumnTitle}
            data-no-dnd="true"
            inputProps={{
              sx: {
                fontWeight: '600',
                fontSize: '0.95rem',
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '0.01em',
                '&.MuiInputBase-input': {
                  p: '6px 10px',
                  borderRadius: '4px'
                },
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                },
                '&:focus': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                }
              }
            }}
          />

          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{ 
                  color: 'text.primary', 
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
            >
              <MenuItem
                onClick={() => {
                  toggleOpenNewCardForm();
                  handleClose(); // Đóng menu chính khi click
                }}
                sx={{
                  '&:hover': {
                    color: 'success.light',
                    '& .add-card-icon': { color: 'success.light' }
                  }
                }}
              >
                <ListItemIcon><AddCardIcon className="add-card-icon" fontSize="small" /></ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={(event) => {
                  console.log('Open color menu clicked'); 
                  handleClickColorMenu(event); // Mở menu màu, giả sử hàm này đã được định nghĩa
                  // Không đóng menu chính ở đây
                }}
                sx={{
                  '&:hover': {
                    color: 'info.light',
                    '& .palette-icon': { color: 'info.light' }
                  }
                }}
              >
                <ListItemIcon><PaletteIcon className="palette-icon" fontSize="small" /></ListItemIcon>
                <ListItemText>Change Color</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                handleClose(); // Đóng menu chính
                // Xử lý Cut (nếu có)
                console.log('Cut clicked');
              }}>
                <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                handleClose();
                console.log('Copy clicked');
              }}>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                handleClose();
                console.log('Paste clicked');
              }}>
                <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleDeleteColumn(); // Giả sử hàm này gọi handleClose() bên trong hoặc sau khi confirm
                }}
                sx={{
                  '&:hover': {
                    color: 'warning.dark',
                    '& .delete-forever-icon': { color: 'warning.dark' }
                  }
                }}
              >
                <ListItemIcon><DeleteForeverIcon className="delete-forever-icon" fontSize="small" /></ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Archive clicked'); }}>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
            {/* Menu chọn màu */}
            <Menu
              id="basic-menu-color-picker"
              anchorEl={anchorElColorMenu}
              open={openColorMenu}
              onClose={handleCloseColorMenu}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown',
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: '180px',
                  p: 0.5
                }
              }}
            >
              {COLUMN_COLORS.map((color) => (
                <MenuItem
                  key={color}
                  onClick={() => handleSelectColor(color)} // Gọi hàm xử lý chính
                  sx={{
                    m: 0.5,
                    p: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    minWidth: 'auto',
                    bgcolor: color,
                    border: column?.color === color ? '2px solid #0079bf' : '1px solid rgba(0,0,0,0.2)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      border: column?.color === color ? '2px solid #00529B' : '2px solid rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.1s ease-in-out'
                  }}
                >
                  {/* No child Box needed as bgcolor is on MenuItem itself */}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {/* List Cards */}
        <ListCards cards={orderedCards} />

        {/* Box Column Footer */}
        <Box sx={{
          height: (theme) => theme.trello.columnFooterHeight,
          p: 2
        }}>
          {!openNewCardForm
            ? <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Button 
                startIcon={<AddCardIcon />} 
                onClick={toggleOpenNewCardForm}
                sx={{
                  color: 'text.secondary',
                  bgcolor: 'transparent',
                  '&:hover': { 
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.05)',
                    color: 'primary.main'
                  },
                  textTransform: 'none',
                  fontSize: '0.9rem'
                }}
              >
                Add new card
              </Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon sx={{ 
                  cursor: 'pointer',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }} />
              </Tooltip>
            </Box>
            : <Box sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}>
              <TextField
                label="Enter card title..."
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                multiline
                maxRows={3}
                data-no-dnd="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    addNewCard()
                  }
                }}
                sx={{
                  '& label': { color: 'text.secondary' },
                  '& input': {
                    color: 'text.primary',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'white')
                  },
                  '& textarea': {
                    color: 'text.primary',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'white')
                  },
                  '& label.Mui-focused': { color: 'primary.main' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                  },
                  '& .MuiOutlinedInput-input': {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  className="interceptor-loading"
                  onClick={addNewCard}
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2563eb' : '#0078d7',
                    color: 'white',
                    boxShadow: 'none',
                    textTransform: 'none',
                    '&:hover': { 
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1d4ed8' : '#0063b1',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  Add card
                </Button>
                <CloseIcon
                  fontSize="small"
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    p: 0.5,
                    borderRadius: '50%',
                    '&:hover': { 
                      color: 'error.light',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }
                  }}
                  onClick={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Column
