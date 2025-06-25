import { createTheme } from '@mui/material/styles';

// Create a light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#303f9f',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Create a dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#000',
    },
    secondary: {
      main: '#f48fb1',
      light: '#f8bbd0',
      dark: '#c2185b',
      contrastText: '#000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Common styles used across components
export const commonStyles = {
  // Layout
  container: {
    padding: '1rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  // Editor
  editorContainer: {
    width: '100%',
    height: 'calc(100vh - 64px)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  
  editor: {
    width: '100%',
    height: '100%',
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '14px',
  },
  
  // Forms
  form: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
  
  formField: {
    marginBottom: '1rem',
  },
  
  // Cards
  card: {
    margin: '1rem 0',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    },
  },
  
  // Loading
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
};

const themeUtils = {
  lightTheme,
  darkTheme,
  commonStyles,
};

export default themeUtils;
