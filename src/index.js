import React from 'react';
import ReactDOM from 'react-dom';
import { AccountProvider } from './utils/AccountContext';
import { App } from './components/App';

import { createTheme, ThemeProvider } from '@material-ui/core/styles';

const darkTheme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#BB86FC',
    },
    secondary: {
      main: '#03DAC5',
    },
  },
  typography: {
    fontFamily: "'JetBrains Mono', monospace;"
  }
});

// Ensure Keplr is attached to window before app loads.
// https://docs.keplr.app/api/#how-to-detect-keplr suggests
// readyState "complete", so we can render on "load" to achieve
// the same effect.
window.addEventListener('load', (event) => {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
        <AccountProvider>
          <App />
        </AccountProvider>
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
});
