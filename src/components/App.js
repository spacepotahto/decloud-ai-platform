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
import VpnKey from '@material-ui/icons/VpnKey';
import NotebookMultiple from 'mdi-material-ui/NotebookMultiple';
import Graph from 'mdi-material-ui/Graph';
import DecloudLogo from '../assets/akash-filebase.png';
import { WalletDisplay } from './WalletDisplay';
import { useAccount } from '../utils/AccountContext';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Help from '@material-ui/icons/Help';
import SvgIcon from '@material-ui/core/SvgIcon';
import Fab from '@material-ui/core/Fab';
import { ManageKeys } from './ManageKeys';
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
    alignItems: 'center',
    padding: theme.spacing(2),
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
  bottomRightFixed: {
    position: 'fixed',
    bottom: '0px',
    right: '0px'
  }
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
      {/* <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.appToolbar}>
          <IconButton color="primary" aria-label="more information" component="span"
            onClick={() => { window.open('https://forum.akash.network/t/akash-filebase-ai-ml-decloud-platform/2588', '_blank'); }}>
            <Help fontSize="large" />
          </IconButton>
        </Toolbar>
      </AppBar> */}
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
              DeCloud ML
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
        <ListItem button key="Keys" selected={view === 'Keys'} onClick={() => setView('Keys')}>
          <ListItemIcon><VpnKey /></ListItemIcon>
          <ListItemText primary="Keys & Certs" />
        </ListItem>
        </List>
        <div className={classes.walletContainer}>
          <WalletDisplay balance={balance}/>
        </div>
      </Drawer>
      <main className={classes.content}>
        {/* <div className={classes.toolbar} /> */}
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
          view === 'Keys' && (
            <Container >
              <ManageKeys updateBalance={updateBalance}/>
            </Container>
          )
        }
        <div className={classes.bottomRightFixed}>
        <IconButton color="primary" aria-label="more information" component="span"
          onClick={() => { window.open('https://forum.akash.network/t/akash-filebase-ai-ml-decloud-platform/2588', '_blank'); }}>
          <Help fontSize="large" />
        </IconButton>
        </div>
      </main>
    </div>
  );
}