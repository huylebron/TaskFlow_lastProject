import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'

import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision,
  rectIntersection
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'

import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

// Define shake keyframes (can be done here or imported)
import { keyframes } from '@mui/system';
import GlobalStyles from '@mui/material/GlobalStyles'

const shakeAnimation = keyframes`
  0%, 100% { transform: rotate(2deg) translateX(4px); }
  25% { transform: rotate(-1deg) translateX(-2px); } // Adjust shake intensity
  75% { transform: rotate(4deg) translateX(6px); } // Adjust shake intensity
`;

// Define intense shake keyframes for drop
const dropShakeAnimation = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0) rotate(1deg); }
  20%, 80% { transform: translate3d(2px, 0, 0) rotate(-1deg); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0) rotate(1deg); }
  40%, 60% { transform: translate3d(3px, 0, 0) rotate(-1deg); }
  100% { transform: translate3d(0, 0, 0); } 
`;

// Define global styles for the drop shake class
const DropShakeStyles = () => (
  <GlobalStyles styles={{
    '.item-dropped-shake': {
      animation: `${dropShakeAnimation} 0.6s cubic-bezier(.36,.07,.19,.97) both`,
      backfaceVisibility: 'hidden',
      perspective: '1000px'
    }
  }} />
);

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn
}) {
  // https://docs.dndkit.com/api-documentation/sensors
  // Nếu dùng PointerSensor mặc định thì phải kết hợp thuộc tính CSS touch-action: none ở những phần tử kéo thả - nhưng mà còn bug
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // Better mouse sensor settings for smooth experience
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // Improved touch sensor for mobile devices
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm trên mobile tốt nhất, không bị bug.
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // Cùng một thời điểm chỉ có một phần tử đang được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng trước đó (xử lý thuật toán phát hiện va chạm, video 37)
  const lastOverId = useRef(null)

  useEffect(() => {
    // Columns đã được sắp xếp ở component cha cao nhất (boards/_id.jsx) (Video 71 đã giải thích lý do)
    setOrderedColumns(board.columns)
  }, [board])

  // Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới.
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Move card between different columns with improved animation smoothness
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns(prevColumns => {
      // Find index of target card in destination column
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Improved positioning logic for better visual feedback
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // Clone columns state for updating
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // Source column update
      if (nextActiveColumn) {
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Handle empty column with placeholder card
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // Destination column update
      if (nextOverColumn) {
        // Remove card if it already exists in target column
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Update the card with new column ID
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        
        // Insert card at calculated position
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // Remove placeholder card if it exists
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        // Update card order IDs
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      // API call to persist changes when drag ends
      if (triggerFrom === 'handleDragEnd') {
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }

      return nextColumns
    })
  }

  // Drag start handler with improved feedback
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // Save original column for cards
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Drag over handler with improved smoothness
  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const { active, over } = event

    if (!active || !over) return

    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    const { id: overCardId } = over

    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    if (!activeColumn || !overColumn) return

    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  // Drag end handler with improved cleanup
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!active || !over) return

    // Store the ID before resetting state
    const droppedItemId = active.id;

    // Handle card drag end
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id: overCardId } = over

      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) return

      // Moving between columns
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        // Moving within the same column
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        // Only update if position changed
        if (oldCardIndex !== newCardIndex) {
          const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
          const dndOrderedCardIds = dndOrderedCards.map(card => card._id)

          setOrderedColumns(prevColumns => {
            const nextColumns = cloneDeep(prevColumns)
            const targetColumn = nextColumns.find(column => column._id === overColumn._id)
            targetColumn.cards = dndOrderedCards
            targetColumn.cardOrderIds = dndOrderedCardIds
            return nextColumns
          })

          moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
        }
      }
    }

    // Handle column drag end
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)

        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        setOrderedColumns(dndOrderedColumns)
        moveColumns(dndOrderedColumns)
      }
    }

    // Trigger drop animation *after* potential state updates settle
    // Use setTimeout to ensure element exists at its new position in the DOM
    setTimeout(() => {
      const element = document.getElementById(droppedItemId);
      if (element) {
        element.classList.add('item-dropped-shake');
        setTimeout(() => {
          element.classList.remove('item-dropped-shake');
        }, 600); // Match animation duration
      }
    }, 0);

    // Reset all drag state
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // Subtle Overlay Style with Blur
  const overlayStyle = {
    opacity: 0.95, // Mostly opaque
    transform: 'scale(1.02) rotate(2deg) translateY(-4px)', // Slight scale, tilt, and lift
    filter: 'blur(4px)', // Apply blur
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)', // Subtle shadow
  };

  // Use default drop animation but apply our custom style to the overlay item
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: overlayStyle // Apply the refined overlay style
      }
    })
  }

  // Improved collision detection strategy
  const collisionDetectionStrategy = useCallback((args) => {
    // Use closestCorners for column dragging
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // Get pointer intersections for cards
    const pointerIntersections = pointerWithin(args)
    
    if (!pointerIntersections?.length) return []

    // Find first collision
    let overId = getFirstCollision(pointerIntersections, 'id')
    
    if (overId) {
      // If over a column, find the closest card within it
      const checkColumn = orderedColumns.find(column => column._id === overId)
      
      if (checkColumn) {
        // Find closest card within the column
        const closestCards = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })

        if (closestCards.length > 0) {
          overId = closestCards[0].id
        }
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    return []
  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <DropShakeStyles />
      <Box sx={{
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#282c34' : '#eaeff2'),
        backgroundImage: (theme) => (
          theme.palette.mode === 'dark' 
            ? 'url(https://trello-backgrounds.s3.amazonaws.com/SharedBackground/1280x1920/8762848be9c01d6c1f93a3f9a5743dcf/photo-1697553503408-29134dec102b.jpg)' 
            : 'url(https://trello-backgrounds.s3.amazonaws.com/SharedBackground/1280x1920/1f0ace4f1922c53d0ad5f075fd5150b8/photo-1696632203959-3e82f08a4a68.jpg)'
        ),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
