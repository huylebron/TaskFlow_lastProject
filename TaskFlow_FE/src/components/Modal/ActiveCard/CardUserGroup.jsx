import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import PropTypes from 'prop-types'

function CardUserGroup({ members = [] }) {
  if (!members || members.length === 0) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {members.map((member) =>
        <Tooltip title={member?.displayName} key={member._id}>
          <Avatar
            sx={{ width: 34, height: 34, cursor: 'default' }}
            alt={member?.displayName}
            src={member?.avatar}
          />
        </Tooltip>
      )}
    </Box>
  )
}

CardUserGroup.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    avatar: PropTypes.string
  }))
}

export default CardUserGroup
