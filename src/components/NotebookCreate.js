import React, { useEffect, useState } from 'react';
import { useAccount } from '../utils/AccountContext';
import { SDL, loadPEMBlocks } from 'akashjs';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import Cpu64Bit from 'mdi-material-ui/Cpu64Bit';
import Memory from 'mdi-material-ui/Memory';
import Database from 'mdi-material-ui/Database';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import RocketLaunch from 'mdi-material-ui/RocketLaunch';
import TFLogo from '../assets/tf-logo-card.png';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DeployStepper from './DeployStepper';

const useStyles = makeStyles((theme) => ({
  marginTop: {
    marginTop: theme.spacing(2),
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  containerCenter: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  section: {
    backgroundColor: 'transparent'
  },
  baseImages: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  baseImageCard: {
    width: 345,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  media: {
    height: 180,
  },
}));

export const NotebookCreate = (props) => {
  const account = useAccount();
  const akash = account.akash;
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [alert, setAlert] = React.useState(false);
  const [dismissable, setDismissable] = React.useState(false);

  const handleClickOpen = async () => {
    const cert = await loadPEMBlocks(account.address).catch((e) => console.log(e));
    if (!cert) {
      setAlert(true);
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAlert(false);
  };

  const generateSDLString = () => {
    return (
`---
  version: "2.0"
  
  services:
    web:
      image: ovrclk/lunie-light
      expose:
        - port: 3000
          as: 80
          to:
            - global: true
  
  profiles:
    compute:
      web:
        resources:
          cpu:
            units: 0.1
          memory:
            size: 512Mi
          storage:
            size: 512Mi
    placement:
      westcoast:
        attributes:
          host: akash
        signedBy:
          anyOf:
            - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
        pricing:
          web: 
            denom: uakt
            amount: 1000
  
  deployment:
    web:
      westcoast:
        profile: web
        count: 1`
    )
  };
  
  return (
    <>
      <Card className={classes.section} variant="outlined">
        <CardContent>
          <Typography variant="h5" className={classes.marginBottom}>
            Base Image
          </Typography>
          <div className={classes.baseImages}>
          <Card className={classes.baseImageCard} variant="outlined">
            <CardMedia
              className={classes.media}
              image={TFLogo}
              title="TensorFlow Base Image"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                TensorFlow
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                TensorFlow + Jupyter Environment
              </Typography>
            </CardContent>
          </Card>
          <Card className={classes.baseImageCard} variant="outlined">
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                Others TBA
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Future support: Pytorch, Fast.ai, etc.
              </Typography>
            </CardContent>
          </Card>
          </div>
        </CardContent>
      </Card>
      <Card className={classes.marginTop} variant="outlined">
        <CardContent>
          <Typography variant="h5" className={classes.marginBottom}>
            Resources
          </Typography>
          <form autoComplete="off">
            <Container style={{display: 'flex', justifyContent: 'space-around'}}>
              <TextField
                id="cpu-input"
                label="CPU Units"
                type="number"
                defaultValue="0.5"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Cpu64Bit />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
              <TextField
                id="memory-input"
                label="Memory (Gi)"
                type="number"
                defaultValue="1"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Memory />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
              <TextField
                id="storage-input"
                label="Ephemeral Storage (Gi)"
                type="number"
                defaultValue="3"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Database />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Container>
          </form>
        </CardContent>
      </Card>
      <Container className={classes.containerCenter}>
      <Button variant="contained"
          color="primary" size="large" className={classes.marginTop}
          onClick={handleClickOpen}
          startIcon={<RocketLaunch />}>
          <span>Deploy Notebook</span>
        </Button>
      </Container>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            setOpen(false);
          }
        }}
        aria-describedby="deploy-dialog-stepper"
      >
        <DialogContent>
          <DialogContentText id="deploy-dialog-stepper">
            <DeployStepper
              sdl={new SDL(generateSDLString())}
              handleDialogClose={handleClose}
              handleSetDismissable={setDismissable}
              updateBalance={props.updateBalance}
            ></DeployStepper>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary" disabled={!dismissable}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={alert}>
        <DialogContent>
          <DialogContentText>
            No valid certificate found. A valid certificate is required for deployments. Please go to "Certificate" tab to create one.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};