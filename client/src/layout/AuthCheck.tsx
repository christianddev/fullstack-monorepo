import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Paths } from 'src/shared/routes'
import { useAppSelector } from '../shared/store'

export default function AuthCheck({
  children,
  secure,
}: {
  children: React.ReactNode
  secure?: boolean
}) {
  const token = useAppSelector((state) => state.app.token)
  const navigate = useNavigate()
  React.useEffect(() => {
    if (secure && !token) {
      //to allow full url returns use href, state sec might be needed
      const fullPath = window.location.href.replace(window.location.origin, '')
      navigate(Paths.Login + '?returnTo=' + fullPath, {
        replace: true,
      })
    }
  }, [location, navigate, secure, token])
  return children as JSX.Element
}
