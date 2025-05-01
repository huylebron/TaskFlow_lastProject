// TrungQuanDev: https://youtube.com/@trungquandev
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import { useForm } from 'react-hook-form'
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE,
  EMAIL_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useDispatch } from 'react-redux'
import { loginUserAPI } from '~/redux/user/userSlice'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ReactComponent as TaskFlowLogo } from '~/assets/taskflow-logo.svg'
import InputAdornment from '@mui/material/InputAdornment'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import FacebookIcon from '@mui/icons-material/Facebook'
import GoogleIcon from '@mui/icons-material/Google'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useState } from 'react'

function LoginForm({ onSwitchForm }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()
  let [searchParams] = useSearchParams()
  const registeredEmail = searchParams.get('registeredEmail')
  const verifiedEmail = searchParams.get('verifiedEmail')

  const submitLogIn = (data) => {
    const { email, password } = data
    toast.promise(
      dispatch(loginUserAPI({ email, password })),
      { pending: 'Logging in...' }
    ).then(res => {
      if (!res.error) navigate('/')
    })
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: '#fff'
    }}>
      {/* Left panel - Login form */}
      <Box 
        component="form"
        onSubmit={handleSubmit(submitLogIn)}
        sx={{ 
          width: '60%', 
          padding: '40px', 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: '#fff',
          borderRight: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h4" sx={{ 
          textAlign: 'center',
          fontWeight: 700,
          color: '#2c3e50',
          mb: 3,
          fontSize: '2rem'
        }}>
          Sign In
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          mb: 3 
        }}>
          <IconButton sx={{ 
            border: '1px solid #e0e0e0',
            width: '45px',
            height: '45px',
            '&:hover': { 
              backgroundColor: '#f5f5f5',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <FacebookIcon sx={{ color: '#1976d2', fontSize: '24px' }} />
          </IconButton>
          <IconButton sx={{ 
            border: '1px solid #e0e0e0',
            width: '45px',
            height: '45px',
            '&:hover': { 
              backgroundColor: '#f5f5f5',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <GoogleIcon sx={{ color: '#db4437', fontSize: '24px' }} />
          </IconButton>
          <IconButton sx={{ 
            border: '1px solid #e0e0e0',
            width: '45px',
            height: '45px',
            '&:hover': { 
              backgroundColor: '#f5f5f5',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <LinkedInIcon sx={{ color: '#0077b5', fontSize: '24px' }} />
          </IconButton>
        </Box>

        <Typography variant="body1" sx={{ 
          textAlign: 'center',
          color: '#7f8c8d',
          mb: 3,
          fontSize: '1rem',
          fontWeight: 500
        }}>
          or use your account
        </Typography>

        {verifiedEmail &&
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
              '& .MuiAlert-icon': {
                color: '#1565c0'
              }
            }}
          >
            Your email <strong>{verifiedEmail}</strong> has been verified. Now you can login!
          </Alert>
        }

        {registeredEmail &&
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              backgroundColor: '#f3e5f5',
              color: '#7b1fa2',
              '& .MuiAlert-icon': {
                color: '#7b1fa2'
              }
            }}
          >
            An email has been sent to <strong>{registeredEmail}</strong>
            <br />Please check and verify your account before logging in!
          </Alert>
        }

        <TextField
          fullWidth
          placeholder="Email"
          type="email"
          error={!!errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: '#7f8c8d' }} />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '12px',
              backgroundColor: '#f8f9fa',
              height: '50px',
              '& .MuiOutlinedInput-input': {
                color: '#2c3e50',
                fontSize: '1rem'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#7f8c8d'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2c3e50',
                borderWidth: '1px'
              }
            }
          }}
          {...register('email', {
            required: FIELD_REQUIRED_MESSAGE,
            pattern: {
              value: EMAIL_RULE,
              message: EMAIL_RULE_MESSAGE
            }
          })}
        />
        <FieldErrorAlert errors={errors} fieldName="email" />

        <TextField
          fullWidth
          placeholder="Password"
          type={showPassword ? 'text' : 'password'}
          error={!!errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#7f8c8d' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ color: '#7f8c8d' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '12px',
              backgroundColor: '#f8f9fa',
              height: '50px',
              '& .MuiOutlinedInput-input': {
                color: '#2c3e50',
                fontSize: '1rem'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#7f8c8d'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2c3e50',
                borderWidth: '1px'
              }
            }
          }}
          {...register('password', {
            required: FIELD_REQUIRED_MESSAGE,
            pattern: {
              value: PASSWORD_RULE,
              message: PASSWORD_RULE_MESSAGE
            }
          })}
        />
        <FieldErrorAlert errors={errors} fieldName="password" />

        <Typography 
          variant="body2" 
          sx={{ 
            alignSelf: 'flex-end', 
            color: '#7f8c8d',
            cursor: 'pointer',
            fontWeight: 500,
            '&:hover': { 
              color: '#2c3e50', 
              textDecoration: 'underline' 
            }
          }}
        >
          Forgot your password?
        </Typography>

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ 
            mt: 3,
            borderRadius: '12px', 
            padding: '12px 45px',
            backgroundColor: '#2c3e50',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '1px',
            alignSelf: 'center',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(44, 62, 80, 0.15)',
            '&:hover': {
              backgroundColor: '#34495e',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 15px rgba(44, 62, 80, 0.2)'
            }
          }}
        >
          Sign In
        </Button>
      </Box>

      {/* Right panel - Welcome */}
      <Box sx={{ 
        width: '40%', 
        backgroundColor: '#2c3e50',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <Box sx={{ mb: 4 }}>
          <TaskFlowLogo width="90px" height="90px" fill="white" />
        </Box>

        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          mb: 3,
          fontSize: '2rem'
        }}>
          Hello, Friend!
        </Typography>

        <Typography variant="body1" sx={{ 
          mb: 6, 
          px: 3,
          fontSize: '1.1rem',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          Enter your personal details and start journey with us
        </Typography>

        <Button
          variant="outlined"
          size="large"
          onClick={onSwitchForm}
          sx={{ 
            borderRadius: '12px', 
            borderColor: 'white',
            borderWidth: '2px',
            color: 'white',
            padding: '12px 45px',
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          Sign Up
        </Button>
      </Box>
    </Box>
  )
}

export default LoginForm
