import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PaletteIcon from '@mui/icons-material/Palette'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import AspectRatioOutlinedIcon from '@mui/icons-material/AspectRatioOutlined'
import AddToDriveOutlinedIcon from '@mui/icons-material/AddToDriveOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'

import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard,
  selectCurrentActiveCardId
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI } from '~/apis'
import { updateCardInBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import MemberManagement from './MemberManagement'
import { useState, useMemo } from 'react'

import { styled } from '@mui/material/styles'
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

/**
 * Note: Modal là một low-component mà bọn MUI sử dụng bên trong những thứ như Dialog, Drawer, Menu, Popover. Ở đây dĩ nhiên chúng ta có thể sử dụng Dialog cũng không thành vấn đề gì, nhưng sẽ sử dụng Modal để dễ linh hoạt tùy biến giao diện từ con số 0 cho phù hợp với mọi nhu cầu nhé.
 */
function ActiveCard() {
  const dispatch = useDispatch()
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentActiveCardId = useSelector(selectCurrentActiveCardId)
  const currentUser = useSelector(selectCurrentUser)

  const [memberAnchorEl, setMemberAnchorEl] = useState(null)
  const [colorAnchorEl, setColorAnchorEl] = useState(null)
  const [coverOptionsAnchorEl, setCoverOptionsAnchorEl] = useState(null)

  // 10 màu tĩnh để người dùng chọn
  const colorOptions = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'
  ]

  // Tìm card tương ứng trong board dựa vào Id
  const activeCard = useMemo(() => {
    if (!activeBoard || !currentActiveCardId) return null
    // Tìm trong tất cả các column của board
    for (const column of activeBoard.columns) {
      const card = column.cards.find(c => c._id === currentActiveCardId)
      if (card) return card
    }
    return null // Không tìm thấy card
  }, [activeBoard, currentActiveCardId])

  // Kiểm tra nếu cover là URL ảnh hay mã màu
  const isCoverImage = () => {
    return activeCard?.cover && (activeCard.cover.startsWith('http') || activeCard.cover.startsWith('data:image'))
  }

  const isCoverColor = () => {
    return activeCard?.cover && activeCard.cover.startsWith('#')
  }

  const handleOpenMemberPopover = (event) => {
    setMemberAnchorEl(event.currentTarget)
  }

  const handleCloseMemberPopover = () => {
    setMemberAnchorEl(null)
  }

  const handleOpenColorPopover = (event) => {
    setColorAnchorEl(event.currentTarget)
    setCoverOptionsAnchorEl(null)
  }

  const handleCloseColorPopover = () => {
    setColorAnchorEl(null)
  }

  const handleOpenCoverOptions = (event) => {
    setCoverOptionsAnchorEl(event.currentTarget)
  }

  const handleCloseCoverOptions = () => {
    setCoverOptionsAnchorEl(null)
  }

  const openMemberPopover = Boolean(memberAnchorEl)
  const openColorPopover = Boolean(colorAnchorEl)
  const openCoverOptionsPopover = Boolean(coverOptionsAnchorEl)

  const handleCloseModal = () => {
    dispatch(clearAndHideCurrentActiveCard())
  }

  const callApiUpdateCard = async (updateData) => {
    if (!activeCard?._id) {
      toast.error('Card not found or not active.')
      return
    }
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)
    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardInBoard(updatedCard))
    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUploadCardCover = (event) => {
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])
    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating cover...' }
    )
  }

  const onRemoveCardCover = () => {
    toast.promise(
      callApiUpdateCard({ cover: null }),
      { 
        pending: 'Removing cover...',
        success: 'Cover removed!'
      }
    )
  }

  const onSelectColorCover = (color) => {
    toast.promise(
      callApiUpdateCard({ cover: color }),
      { 
        pending: 'Updating cover color...',
        success: 'Cover color updated!'
      }
    )
    handleCloseColorPopover()
  }

  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const handleMemberUpdate = async (userId, action) => {
    const actionText = action === CARD_MEMBER_ACTIONS.ADD ? 'Adding member...' : 'Removing member...'
    const successText = action === CARD_MEMBER_ACTIONS.ADD ? 'Member added!' : 'Member removed!'
    
    toast.promise(
      callApiUpdateCard({ incomingMemberInfo: { userId, action } }),
      {
        pending: actionText,
        success: successText,
        error: 'Failed to update members!'
      }
    )
    if (action === CARD_MEMBER_ACTIONS.ADD) {
      // Có thể không cần đóng popover khi thêm, để user thêm nhiều người
    } else {
      // Đóng popover khi xóa member từ MemberManagement (nếu cần)
      // handleCloseMemberPopover() // Tùy theo UX mong muốn
    }
  }

  if (!activeCard) {
    return null;
  }

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 900,
        maxWidth: 900,
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: '40px 20px 20px',
        margin: '50px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {activeCard?.cover && (
          <Box sx={{ position: 'relative', mb: 4 }}>
            {isCoverImage() && (
              <img
                style={{ width: '100%', height: '320px', borderRadius: '6px', objectFit: 'cover' }}
                src={activeCard.cover}
                alt="card-cover"
              />
            )}
            {isCoverColor() && (
              <Box
                sx={{
                  width: '100%', 
                  height: '120px', 
                  borderRadius: '6px',
                  backgroundColor: activeCard.cover
                }}
              />
            )}
            <Box
              onClick={onRemoveCardCover}
              sx={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />

          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} sm={9}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>

              <CardUserGroup members={activeCard?.members} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
              </Box>

              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={onUpdateCardDescription}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
              </Box>

              <CardActivitySection
                cardComments={activeCard?.comments}
                onAddCardComment={onAddCardComment}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={3}>
            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add To Card</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem onClick={handleOpenMemberPopover}>
                <PeopleAltOutlinedIcon fontSize="small" />
                Members
              </SidebarItem>
              <MemberManagement
                anchorEl={memberAnchorEl}
                open={openMemberPopover}
                onClose={handleCloseMemberPopover}
                cardMembers={activeCard?.members || []}
                boardUsers={activeBoard?.FE_allUsers || []}
                onAddMember={(userId) => handleMemberUpdate(userId, CARD_MEMBER_ACTIONS.ADD)}
                onRemoveMember={(userId) => handleMemberUpdate(userId, CARD_MEMBER_ACTIONS.REMOVE)}
              />

              {activeCard?.members?.some(member => member._id === currentUser._id)
                ? <SidebarItem
                  sx={{ color: 'error.light', '&:hover': { color: 'error.main' } }}
                  onClick={() => handleMemberUpdate(currentUser._id, CARD_MEMBER_ACTIONS.REMOVE)}
                >
                  <ExitToAppIcon fontSize="small" />
                  Leave Card
                </SidebarItem>
                : <SidebarItem
                  className="active"
                  onClick={() => handleMemberUpdate(currentUser._id, CARD_MEMBER_ACTIONS.ADD)}
                >
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                      <span>Join Card</span>
                    </Box>
                  </Box>
                </SidebarItem>
              }

              <SidebarItem 
                onClick={handleOpenCoverOptions}
                className="active"
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageOutlinedIcon fontSize="small" />
                    <span>Cover</span>
                  </Box>
                </Box>
              </SidebarItem>
              
              <Popover
                open={openCoverOptionsPopover}
                anchorEl={coverOptionsAnchorEl}
                onClose={handleCloseCoverOptions}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                sx={{ ml: 1 }}
              >
                <Box sx={{ p: 2, width: 200 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Tùy chọn Cover</Typography>
                  
                  <SidebarItem 
                    onClick={handleOpenColorPopover}
                    sx={{ mb: 1 }}
                  >
                    <PaletteIcon fontSize="small" />
                    Cover Color
                  </SidebarItem>
                  
                  <SidebarItem component="label">
                    <ImageOutlinedIcon fontSize="small" />
                    Upload Cover
                    <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
                  </SidebarItem>
                </Box>
              </Popover>
              
              <Popover
                open={openColorPopover}
                anchorEl={colorAnchorEl}
                onClose={handleCloseColorPopover}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                sx={{ ml: 1 }}
              >
                <Box sx={{ p: 2, width: 240 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Chọn màu cover</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {colorOptions.map((color, index) => (
                      <Box
                        key={index}
                        onClick={() => onSelectColorCover(color)}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: color,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Popover>

              <SidebarItem><AttachFileOutlinedIcon fontSize="small" />Attachment</SidebarItem>
              <SidebarItem><LocalOfferOutlinedIcon fontSize="small" />Labels</SidebarItem>
              <SidebarItem><TaskAltOutlinedIcon fontSize="small" />Checklist</SidebarItem>
              <SidebarItem><WatchLaterOutlinedIcon fontSize="small" />Dates</SidebarItem>
              <SidebarItem><AutoFixHighOutlinedIcon fontSize="small" />Custom Fields</SidebarItem>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Power-Ups</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><AspectRatioOutlinedIcon fontSize="small" />Card Size</SidebarItem>
              <SidebarItem><AddToDriveOutlinedIcon fontSize="small" />Google Drive</SidebarItem>
              <SidebarItem><AddOutlinedIcon fontSize="small" />Add Power-Ups</SidebarItem>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Actions</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><ArrowForwardOutlinedIcon fontSize="small" />Move</SidebarItem>
              <SidebarItem><ContentCopyOutlinedIcon fontSize="small" />Copy</SidebarItem>
              <SidebarItem><AutoAwesomeOutlinedIcon fontSize="small" />Make Template</SidebarItem>
              <SidebarItem><ArchiveOutlinedIcon fontSize="small" />Archive</SidebarItem>
              <SidebarItem><ShareOutlinedIcon fontSize="small" />Share</SidebarItem>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default ActiveCard
