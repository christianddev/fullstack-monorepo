/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import AdbIcon from '@mui/icons-material/Adb'
import { config } from '../../shared/config'
import { useAppDispatch, useAppSelector } from '../../shared/store'
import { patch } from '../app/slice'
import { Link as RouterLink } from 'react-router-dom'
import routes, { AppRoute } from '../../shared/routes'
import { logoutAsync } from '../app/thunks'
import { Badge, Link } from '@mui/material'
import { prompt } from '../profile/GoogleOneTap'
import { ShoppingBag, ShoppingCart, ShoppingCartCheckout, Warning } from '@mui/icons-material'
import { hasRole } from 'src/shared/auth'

const links = routes.filter(route => route.link)
const profileLinks = routes.filter(route => route.profile)

export default function HeaderNavBar() {
  const maintenance = useAppSelector(state => state.app.settings?.system?.disable)
  const backgroundColor = maintenance ? 'error.dark' : 'primary.main'
  const items = useAppSelector(state => state.shop.items)
  const enableAuth = useAppSelector(state => state.app.settings?.system?.enableAuth)
  const enableRegistrations = useAppSelector(
    state => state.app.settings?.system?.enableRegistration,
  )
  const enableStore = useAppSelector(state => state.app.settings?.system?.enableStore)

  const dispatch = useAppDispatch()
  const authenticated = useAppSelector(state => state.app.token)
  const user = useAppSelector(state => state.app.user)
  const darkTheme = useAppSelector(state => state.app.darkMode)
  const drawerRightOpen = useAppSelector(state => state.app.drawerRightOpen)
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = (r?: AppRoute) => {
    if (r?.dialog) {
      dispatch(patch({ dialog: r.dialog }))
    }
    setAnchorElUser(null)
  }

  const handleCheckout = () => {
    dispatch(patch({ dialog: 'checkout' }))
  }

  const handleThemeToggle = () => {
    dispatch(patch({ darkMode: !darkTheme }))
  }

  const handleMenuToggle = () => {
    dispatch(patch({ drawerRightOpen: !drawerRightOpen }))
  }

  const handleLogout = () => {
    dispatch(logoutAsync())
  }

  return (
    <AppBar
      position="static"
      enableColorOnDark
      color="primary"
      sx={{ maxHeight: '4rem', backgroundColor }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {config.defaultTitle}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {links.map(route => (
                <MenuItem key={route.path}>
                  <Link component={RouterLink} to={route.path} underline="none">
                    {route.title}
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {config.defaultTitle}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {links.map(route => (
              <Button
                key={route.path}
                onClick={handleCloseNavMenu}
                component={RouterLink}
                to={route.path}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {route.title}
              </Button>
            ))}
          </Box>

          {maintenance && (
            <Tooltip title="Maintenance Mode - Only Admins" color="warning">
              <Warning />
            </Tooltip>
          )}
          {enableStore && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Shopping">
                <Badge
                  color="secondary"
                  badgeContent={items
                    .map(i => i.quantity)
                    .reduce((prev, curr) => {
                      return prev + curr
                    }, 0)}
                >
                  <IconButton onClick={handleCheckout}>
                    <ShoppingCartCheckout />
                  </IconButton>
                </Badge>
              </Tooltip>
            </Box>
          )}
          <Box sx={{ flexGrow: 0, ml: 1 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar src={user?.picture} alt={user?.firstName} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-profile"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={() => handleCloseUserMenu()}
            >
              {profileLinks
                .filter(r => (r.secure ? authenticated : authenticated ? !r.anon : true))
                .filter(route => (route.roles ? route.roles.every(r => hasRole(r)) : true))
                .filter(r =>
                  !enableAuth || !enableRegistrations ? !['/register'].includes(r.path) : true,
                )
                .map(setting => (
                  <MenuItem
                    key={setting.path}
                    onClick={() => handleCloseUserMenu(setting)}
                    component={RouterLink}
                    to={setting.dialog ? '#' : setting.path.replace('/*', '')}
                  >
                    <Typography textAlign="center">{setting.title}</Typography>
                  </MenuItem>
                ))}
              <MenuItem onClick={handleMenuToggle}>
                <Typography textAlign="center">Drawer</Typography>
              </MenuItem>
              <MenuItem onClick={handleThemeToggle}>
                <Typography textAlign="center">Theme</Typography>
              </MenuItem>
              {authenticated && (
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
