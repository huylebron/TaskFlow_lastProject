// TrungQuanDev: https://youtube.com/@trungquandev
import { useLocation, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'
  const [animationDirection, setAnimationDirection] = useState('right')
  
  useEffect(() => {
    setAnimationDirection(isLogin ? 'right' : 'left')
  }, [isLogin])

  const handleSwitchForm = (path) => {
    setAnimationDirection(path === '/login' ? 'right' : 'left')
    setTimeout(() => navigate(path), 300)
  }

  const currentUser = useSelector(selectCurrentUser)
  if (currentUser) {
    return <Navigate to='/' replace={true} />
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%)',
        opacity: 0.8,
        zIndex: 0
      }
    }}>
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '900px',
          height: '600px',
          display: 'flex',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s ease-in-out',
            transform: isLogin ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          {isLogin && <LoginForm onSwitchForm={() => handleSwitchForm('/register')} />}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '100%',
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s ease-in-out',
            transform: !isLogin ? 'translateX(-100%)' : 'translateX(0)',
          }}
        >
          {!isLogin && <RegisterForm onSwitchForm={() => handleSwitchForm('/login')} />}
        </Box>
      </Box>
    </Box>
  )
}

export default Auth
