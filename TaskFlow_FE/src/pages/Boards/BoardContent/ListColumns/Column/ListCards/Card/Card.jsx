import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch } from 'react-redux'
import { showModalActiveCard } from '~/redux/activeCard/activeCardSlice'

function Card({ card }) {
  const dispatch = useDispatch()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    opacity: isDragging ? 0 : 1,
    border: isDragging ? '1px solid #2ecc71' : undefined,
    boxShadow: undefined,
    filter: 'none'
  }

  const shouldShowCardActions = () => {
    return !!card?.members?.length || !!card?.comments?.length || !!card?.attachments?.length
  }

  const setActiveCard = () => {
    dispatch(showModalActiveCard(card._id))
  }

  // Function to determine if we should show card labels
  const shouldShowCardLabels = () => {
    return card?.labels && card.labels.length > 0
  }

  // Kiểm tra nếu cover là URL ảnh hay mã màu
  const isCoverImage = () => {
    return card?.cover && (card.cover.startsWith('http') || card.cover.startsWith('data:image'))
  }

  const isCoverColor = () => {
    return card?.cover && card.cover.startsWith('#')
  }

  return (
    <MuiCard
      id={card._id}
      onClick={setActiveCard}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        border: '1px solid transparent',
        borderRadius: '6px',
        '&:hover': { 
          borderColor: (theme) => theme.palette.primary.main,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        },
        transition: 'all 0.2s ease',
        mb: 1.5
      }}
    >
      {shouldShowCardLabels() && (
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          flexWrap: 'wrap',
          pt: 1,
          px: 1
        }}>
          {card.labels.map((label, index) => (
            <Chip
              key={index}
              size="small"
              label={label.name}
              sx={{ 
                height: '6px',
                width: '40px',
                bgcolor: label.color || 'primary.main',
                borderRadius: '4px',
                '.MuiChip-label': { display: 'none' }
              }}
            />
          ))}
        </Box>
      )}
      
      {isCoverImage() && (
        <CardMedia 
          sx={{ 
            height: 140,
            borderRadius: '4px',
            mt: 1,
            mx: 1,
            width: 'calc(100% - 16px)'
          }} 
          image={card.cover} 
        /> 
      )}
      
      {isCoverColor() && (
        <Box 
          sx={{ 
            height: 40,
            borderRadius: '4px',
            mt: 1,
            mx: 1,
            width: 'calc(100% - 16px)',
            backgroundColor: card.cover
          }} 
        />
      )}
      
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Typography sx={{ 
          fontSize: '0.9rem',
          fontWeight: 500,
          lineHeight: 1.5,
          wordBreak: 'break-word',
          fontFamily: 'Roboto, sans-serif',
          letterSpacing: '0.01em',
          color: (theme) => theme.palette.mode === 'dark' ? '#f8f9fa' : '#2d3436'
        }}>
          {card?.title}
        </Typography>
      </CardContent>
      
      {shouldShowCardActions() &&
        <CardActions sx={{ p: '0 8px 8px 8px', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!!card?.comments?.length &&
              <Tooltip title="Comments">
                <Button 
                  size="small" 
                  startIcon={<CommentIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{ 
                    fontSize: '0.75rem', 
                    p: '2px 6px',
                    minWidth: 'auto',
                    color: 'text.secondary'
                  }}
                >
                  {card?.comments?.length}
                </Button>
              </Tooltip>
            }
            {!!card?.attachments?.length &&
              <Tooltip title="Attachments">
                <Button 
                  size="small" 
                  startIcon={<AttachmentIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{ 
                    fontSize: '0.75rem', 
                    p: '2px 6px',
                    minWidth: 'auto',
                    color: 'text.secondary'
                  }}
                >
                  {card?.attachments?.length}
                </Button>
              </Tooltip>
            }
          </Box>
          
          {!!card?.members?.length &&
            <Tooltip title="Members">
              <AvatarGroup 
                max={4} 
                sx={{
                  gap: '6px',
                  '& .MuiAvatar-root': {
                    width: 24,
                    height: 24,
                    fontSize: '0.8rem',
                    border: 'none'
                  },
                  justifyContent: 'flex-end'
                }}
              >
                {card.members.map(member => (
                  <Avatar 
                    key={member._id} 
                    alt={member.displayName}
                    src={member.avatar}
                    sx={{ width: 24, height: 24 }}
                  />
                ))}
              </AvatarGroup>
            </Tooltip>
          }
        </CardActions>
      }
    </MuiCard>
  )
}

export default Card
