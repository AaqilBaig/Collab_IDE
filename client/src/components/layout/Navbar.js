import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CodeIcon from '@mui/icons-material/Code';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };
  const guestLinks = [
    <Button
      key="login"
      component={Link}
      to="/login"
      sx={{
        my: 2,
        color: 'white',
        display: 'block',
        textTransform: 'none'
      }}
    >
      Login
    </Button>,
    <Button
      key="register"
      component={Link}
      to="/register"
      sx={{
        my: 2,
        color: 'white',
        display: 'block',
        textTransform: 'none'
      }}
    >
      Register
    </Button>
  ];
  const authLinks = [
    <Tooltip key="user-tooltip" title="Open user menu">
      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>        <Avatar
          alt={user?.name || 'User'}
          sx={{ bgcolor: theme.palette.secondary.main }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
      </IconButton>
    </Tooltip>,
    <Menu
      key="user-menu"
      sx={{ mt: '45px' }}
      id="menu-appbar"
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
        onClose={handleCloseUserMenu}
      >
        <MenuItem component={Link} to="/dashboard" onClick={handleCloseUserMenu}>
          <Typography textAlign="center">Dashboard</Typography>
        </MenuItem>        <MenuItem onClick={handleLogout}>
          <Typography textAlign="center">Logout</Typography>
        </MenuItem>
      </Menu>
    ]
  ;

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <CodeIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
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
            CollabIDE
          </Typography>

          {/* Mobile Menu */}
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
              {isAuthenticated ? (
                <MenuItem component={Link} to="/dashboard" onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">Dashboard</Typography>
                </MenuItem>              ) : (
                [
                  <MenuItem key="login" component={Link} to="/login" onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">Login</Typography>
                  </MenuItem>,
                  <MenuItem key="register" component={Link} to="/register" onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">Register</Typography>
                  </MenuItem>
                ]
              )}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <CodeIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CollabIDE
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated && (
              <Button
                component={Link}
                to="/dashboard"
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block', textTransform: 'none' }}
              >
                Dashboard
              </Button>
            )}
          </Box>

          {/* Auth Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? authLinks : guestLinks}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
