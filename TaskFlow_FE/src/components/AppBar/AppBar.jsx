import Box from '@mui/material/Box'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import AppsIcon from '@mui/icons-material/Apps'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'

import Profiles from './Menus/Profiles'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'

function AppBar() {
    return (
        <Box sx={{
            width: '100%',
            height: (theme) => theme.trello.appBarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            paddingX: 2,
            overflowX: 'auto',
            background: (theme) => (
                theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)'
                    : 'linear-gradient(90deg, #0062ff 0%, #00a2ff 100%)'
            ),
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
            {/* Left section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Link to="/boards">
                    <Tooltip title="Board List">
                        <AppsIcon sx={{ color: 'white', verticalAlign: 'middle' }} />
                    </Tooltip>
                </Link>

                <Link to="/">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AssignmentIcon sx={{ color: 'white' }} />
                        <Typography variant="span" sx={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: 'white',
                            fontFamily: 'Poppins, sans-serif',
                            letterSpacing: '0.5px'
                        }}>TaskFlow</Typography>
                    </Box>
                </Link>

                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>

                </Box>
            </Box>

            {/* Center section with search */}
            <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                <AutoCompleteSearchBoard />
            </Box>

            {/* Right section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
                {/* Dark - Light - System modes */}
                <ModeSelect />

                {/* Notifications */}
                <Notifications />

                <Tooltip title="Help">
                    <HelpOutlineIcon sx={{ cursor: 'pointer', color: 'white' }} />
                </Tooltip>

                <Profiles />
            </Box>
        </Box>
    )
}

export default AppBar
