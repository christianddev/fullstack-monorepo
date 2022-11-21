import React from 'react'
import { Button, DialogActions, DialogContent, Slide } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import { TransitionProps } from '@mui/material/transitions'
import { useAppDispatch, useAppSelector } from 'src/shared/store'
import { patch } from '../app'
import Login from './Login'
import Register from './Register'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: JSX.Element
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function OnboardingDialog() {
  const dispatch = useAppDispatch()
  const requested = useAppSelector(state => state.app.dialog)
  const [show, setShow] = React.useState('login')
  const open = requested?.includes('onboard')
  const handleClose = React.useCallback(() => {
    dispatch(patch({ dialog: undefined }))
  }, [dispatch])

  React.useEffect(() => {
    setShow(requested?.split('.')[1] || 'login')
  }, [requested, setShow])

  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={Transition}>
      <DialogContent>
        <Login sx={show === 'login' ? {} : { display: 'none' }} />
        <Register sx={show === 'register' ? {} : { display: 'none' }} />
        <DialogActions>
          <Button onClick={() => setShow('login')}>Login</Button>
          <Button onClick={() => setShow('register')}>Register</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
