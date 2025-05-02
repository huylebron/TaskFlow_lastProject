import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Avatar, Tooltip, Typography } from '@mui/material'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  paddingX: '10px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  transition: 'all 0.2s ease'
}

function BoardBar({ board }) {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      background: (theme) => (
        theme.palette.mode === 'dark' 
          ? 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)' 
          : 'linear-gradient(90deg, #0078d7 0%, #0091ea 100%)'
      ),
      boxShadow: '0 1px 8px rgba(0,0,0,0.15)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 30, 
                height: 30, 
                bgcolor: 'primary.dark',
                fontSize: '16px',
                fontWeight: 'bold' 
              }}
            >
              {board?.title?.charAt(0)?.toUpperCase() || 'B'}
            </Avatar>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              fontSize: '1rem'
            }}>
              {board?.title}
            </Typography>
          </Box>
        </Tooltip>
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add To Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Xử lý mời user vào làm thành viên của board */}
        <InviteBoardUser boardId={board._id} />

        {/* Xử lý hiển thị danh sách thành viên của board */}
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>
    </Box>
  )
}

export default BoardBar
