import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CertificateOutline from 'mdi-material-ui/CertificateOutline';
import NotebookMultiple from 'mdi-material-ui/NotebookMultiple';
import Graph from 'mdi-material-ui/Graph';
import DecloudLogo from '../assets/decloud-logo.png';
import { WalletDisplay } from './WalletDisplay';
import { useAccount } from '../utils/AccountContext';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ManageCertificate } from './ManageCertificate';
import { NotebooksTable } from './NotebooksTable';
import { NotebookCreate } from './NotebookCreate';
import { ModelsTable } from './ModelsTable';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    backgroundColor: theme.palette.background.default,
    boxShadow: 'none'
  },
  appToolbar: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#332940',
    paddingTop: '1.5rem',
    paddingBottom: '3rem'
  },
  walletContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  containerCenter: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
}));

export const App = () => {
  const account = useAccount();
  const classes = useStyles();
  const akash = account.akash;
  const [balance, setBalance] = useState(0);
  const [view, setView] = useState('Notebooks');

  const updateBalance = async () => {
    if (!akash) {
      return;
    }
    const b = await akash.query.bank.balance(account.address, 'uakt');
    setBalance(Number(b.amount));
  };

  useEffect(() => {
    updateBalance();
  }, [account]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.appToolbar}>
        <Button variant="contained" color="secondary"
          startIcon={
            <SvgIcon viewBox='0 0 128 128'>
              <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,128.000000) scale(0.100000,-0.100000)" fill="#000" stroke="none">
              <path d="M0 640 l0 -640 640 0 640 0 0 640 0 640 -640 0 -640 0 0 -640z m785 545 c101 -26 184 -74 260 -150 113 -113 165 -237 165 -395 0 -75 -3 -90 -25 -123 -33 -48 -72 -67 -135 -67 -39 0 -52 -4 -56 -17 -11 -37 -22 -48 -48 -51 -21 -3 -26 -7 -21 -20 27 -66 28 -136 3 -187 -37 -72 -126 -105 -282 -105 -170 0 -286 47 -401 164 -116 117 -165 237 -165 402 0 49 7 114 15 144 51 193 212 354 405 404 73 19 211 20 285 1z m265 -785 c0 -5 -5 -10 -11 -10 -5 0 -7 5 -4 10 3 6 8 10 11 10 2 0 4 -4 4 -10z"/>
              <path d="M561 1079 c-233 -46 -404 -289 -362 -516 43 -235 253 -400 481 -380 102 10 136 23 150 58 17 39 5 75 -33 103 -26 20 -43 21 -243 24 -249 4 -241 0 -231 108 10 104 39 142 141 184 l53 22 -17 37 c-54 114 -21 259 71 306 16 9 55 15 92 15 55 0 70 -4 104 -29 24 -18 46 -45 57 -70 22 -57 21 -164 -3 -217 l-19 -41 52 -22 c28 -11 73 -39 100 -61 79 -65 146 -48 146 37 0 159 -106 326 -254 398 -103 51 -186 64 -285 44z"/>
              <path d="M628 926 c-58 -29 -62 -135 -7 -186 27 -24 30 -32 27 -81 l-3 -54 -85 -27 c-56 -18 -93 -36 -107 -53 -47 -54 -44 -55 212 -55 129 0 235 2 235 5 0 3 -7 17 -17 31 -19 29 -66 55 -142 78 -71 21 -81 31 -81 80 0 34 6 48 30 71 35 33 53 88 44 133 -11 52 -61 80 -106 58z"/>
              </g>
            </SvgIcon>
          }>
          <span>SkyID Sign In</span>
        </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.toolbar} >
          <Container className={classes.logo}>
            <Box width='60%'>
              <img src={DecloudLogo} style={{ width: '100%' }} alt="decloud" />
            </Box>
            <Typography variant="h5" noWrap>
              AI Platform
            </Typography>
          </Container>
        </div>
        <List>
        <ListItem button key="Notebooks" selected={view === 'Notebooks'} onClick={() => setView('Notebooks')}>
          <ListItemIcon><NotebookMultiple /></ListItemIcon>
          <ListItemText primary="Notebooks" />
        </ListItem>
        <ListItem button key="Models" selected={view === 'Models'} onClick={() => setView('Models')}>
          <ListItemIcon><Graph /></ListItemIcon>
          <ListItemText primary="Models" />
        </ListItem>
        <ListItem button key="Certificates" selected={view === 'Certificates'} onClick={() => setView('Certificates')}>
          <ListItemIcon><CertificateOutline /></ListItemIcon>
          <ListItemText primary="Certificates" />
        </ListItem>
        </List>
        <div className={classes.walletContainer}>
          <WalletDisplay balance={balance}/>
        </div>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {
          view === 'Notebooks' && (
            <Container className={classes.containerCenter}>
              <NotebooksTable />
              <Button variant="contained" onClick={() => setView('NotebookCreate')}
                color="primary" size="large" className={classes.marginTop}>
                <span>Create Notebook</span>
              </Button>
            </Container>
          )
        }
        {
          view === 'NotebookCreate' && (
            <NotebookCreate updateBalance={updateBalance}/>
          )
        }
        {
          view === 'Models' && (
            <Container className={classes.containerCenter}>
              <ModelsTable />
            </Container>
          )
        }
        {
          view === 'Certificates' && (
            <Container className={classes.containerCenter}>
              <ManageCertificate updateBalance={updateBalance}/>
            </Container>
          )
        }
      </main>
    </div>
  );
}