import React, { useEffect, useState } from 'react';
import { useAccount } from '../utils/AccountContext';
import { SDL, loadPEMBlocks } from 'akashjs';
import { getS3Keys } from '../utils/s3keys';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
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
import { getNotebookDeployments, setNotebookDeployments } from '../utils/deployments';

const useStyles = makeStyles((theme) => ({
  marginTop: {
    marginTop: theme.spacing(2),
  },
  marginBottom: {
    marginBottom: theme.spacing(2),
  },
  marginRight: {
    marginRight: theme.spacing(2),
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
    marginRight: theme.spacing(2),
    borderWidth: theme.spacing(0.5)
  },
  baseImageCardSelected: {
    borderColor: theme.palette.primary.dark,
  },
  media: {
    height: 180
  },
}));

export const NotebookCreate = (props) => {
  const account = useAccount();
  const akash = account.akash;
  const classes = useStyles();

  const [values, setValues] = useState({
    project: '',
    password: '',
    showPassword: false,
    baseImage: -1,
    gpu: 'TBA!',
    cpu: 2,
    memory: 4,
    storage: 10
  });

  const [open, setOpen] = useState(false);
  const [certAlert, setCertAlert] = useState(false);
  const [s3KeysAlert, setS3KeysAlert] = useState(false);
  const [formAlert, setFormAlert] = useState(false);
  const [dismissable, setDismissable] = useState(false);
  const [s3Config, setS3Config] = useState(false);

  useEffect(() => {
    const updateS3Config = async () => setS3Config(await getS3Keys(account.address));
    updateS3Config();
  }, [account]);

  const handleClickOpen = async () => {
    const cert = await loadPEMBlocks(account.address).catch((e) => console.log(e));
    if (!cert) {
      setCertAlert(true);
    } else if (!s3Config) {
      setS3KeysAlert(true);
    } else if (
         values.project === ''
      || values.password === ''
      || values.baseImage === -1
      || values.cpu === '' || values.cpu <= 0
      || values.memory === '' || values.memory <= 0
      || values.storage === '' || values.storage <= 0) {
      setFormAlert(true)
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCertAlert(false);
    setS3KeysAlert(false);
    setFormAlert(false);
  };

  const handleBack = () => {
    handleClose();
    props.handleBack();
  };

  const generateSDLString = () => {
    const sdl = (
`---
version: "2.0"

services:
  web:
    image: ghcr.io/spacepotahto/jupyter-s3-tensorflow-notebook:0.1.0
    env:
      - AWS_ACCESS_KEY_ID=${s3Config.rKey}
      - AWS_SECRET_ACCESS_KEY=${s3Config.rSecret}
      - ROOT_BUCKET=${s3Config.bucket}
      - PROJECT_DIR=${values.project.replace(' ', '-')}
      - JUPYTER_PASSWORD=${values.password}
    expose:
      - port: 8888
        as: 80
        to:
          - global: true
      - port: 6006
        as: 6006
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: ${values.cpu}
        memory:
          size: ${values.memory}Gi
        storage:
          size: ${values.storage}Gi
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
    return sdl;
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleDeploymentEnd = async (deployment) => {
    const deployments = await getNotebookDeployments(account.address);
    deployments.push(deployment);
    await setNotebookDeployments(account.address, deployments.slice());
  };
  
  return (
    <>
      <TextField className={`${classes.marginBottom} ${classes.marginRight}`}
        id="project-name-input"
        label="Project Name"
        variant="outlined"
        value={values.project}
        onChange={handleChange('project')}
      />
      <FormControl variant="outlined">
        <InputLabel htmlFor="password-input">Password</InputLabel>
        <OutlinedInput
          id="password-input"
          label="Password"
          type={values.showPassword ? 'text' : 'password'}
          value={values.password}
          onChange={handleChange('password')}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {values.showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          labelWidth={70}
        />
      </FormControl>
      <Card className={classes.section} variant="outlined">
        <CardContent>
          <Typography variant="h5" className={classes.marginBottom}>
            Base Image
          </Typography>
          <div className={classes.baseImages}>
          <Card className={`${classes.baseImageCard} ${values.baseImage === 0 ? classes.baseImageCardSelected : ''}`} variant="outlined">
            <CardActionArea onClick={() => setValues({ ...values, "baseImage": 0 })}>
            <CardMedia
              className={classes.media}
              image={TFLogo}
              title="TensorFlow Base Image"
            />
            <CardContent color="primary">
              <Typography gutterBottom variant="h6" component="h2">
                TensorFlow
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                TensorFlow + Jupyter Environment
              </Typography>
            </CardContent>
            </CardActionArea>
          </Card>
          <Card className={classes.baseImageCard} variant="outlined">
            <CardActionArea style={{height: "100%"}} onClick={() => setValues({ ...values, "baseImage": -1 })}>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Others TBA
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Future support: R, Pytorch, Fast.ai, custom images, etc.
              </Typography>
            </CardContent>
            </CardActionArea>
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
                disabled
                id="gpu-input"
                label="GPU Units"
                value={values.gpu}
                onChange={handleChange('gpu')}
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
                id="cpu-input"
                label="CPU Units"
                type="number"
                value={values.cpu}
                onChange={handleChange('cpu')}
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
                value={values.memory}
                onChange={handleChange('memory')}
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
                value={values.storage}
                onChange={handleChange('storage')}
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
      {s3Config && <Dialog
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
              handleDeploymentEnd={handleDeploymentEnd}
              payload={values}
            ></DeployStepper>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBack} variant="contained" color="secondary" disabled={!dismissable}>
            Notebooks List
          </Button>
        </DialogActions>
      </Dialog>
      }
      <Dialog open={certAlert}>
        <DialogContent>
          <DialogContentText>
            No valid certificate found. A valid certificate is required for deployments. Please go to "Keys & Certs" tab to create one.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={s3KeysAlert}>
        <DialogContent>
          <DialogContentText>
            No Filebase access keys and bucket found. Please go to "Keys & Certs" tab to specify them.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={formAlert}>
        <DialogContent>
          <DialogContentText>
            Please complete the form with valid values.
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