import React, { useEffect, useState } from 'react';
import { useAccount } from '../utils/AccountContext';
import Button from '@material-ui/core/Button';
import { DataGrid } from '@material-ui/data-grid';
import RocketLaunch from 'mdi-material-ui/RocketLaunch'
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { SDL, loadPEMBlocks } from 'akashjs';
import { getS3Keys } from '../utils/s3keys';

import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import Cpu64Bit from 'mdi-material-ui/Cpu64Bit';
import Memory from 'mdi-material-ui/Memory';
import Database from 'mdi-material-ui/Database';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DeployStepper from './DeployStepper';
import Info from '@material-ui/icons/Info';
import CircularProgress from '@material-ui/core/CircularProgress';
import DeleteIcon from '@material-ui/icons/Delete';
import { getModelDeployments, setModelDeployments } from '../utils/deployments';

const useStyles = makeStyles((theme) => ({
  marginTop: {
    marginTop: theme.spacing(2),
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  section: {
    width: '100%'
  }
}));

export const ModelsTable = (props) => {
  const account = useAccount();
  const akash = account.akash;

  const [closeBusyDseq, setCloseBusyDseq] = useState(-1);

  const columns = [
    {
      field: 'id',
      headerName: 'DSEQ',
      flex: 0.5
    },
    {
      field: 'name',
      headerName: 'Project',
      flex: 2
    },
    {
      field: 'info',
      headerName: 'Deployment Info',
      flex: 1,
      align: 'center',
      renderCell: (params) => (
        <>
        <IconButton color="secondary" aria-label="more information" component="span"
          onClick={() => { setDeploymentInfo(params.row.info) }}>
          <Info fontSize="medium" />
        </IconButton>
        </>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      align: 'center',
      renderCell: (params) => (
        <>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => closeDeployment(params.row.id)}
          startIcon={closeBusyDseq === params.row.id ? <CircularProgress color="primary" size={18}/> : <DeleteIcon />}
        >
          Close
        </Button>
        </>
      ),
    },
  ];

  const closeDeployment = async (dseq) => {
    if (!akash) {
      return;
    }
    setCloseBusyDseq(dseq);
    const response = await akash.tx.deployment.close.params({
      dseq: dseq
    }).then(() => {
      setCloseBusyDseq(-1);
      return getModelDeployments(account.address);
    }).then((deployments) => {
      const newDeployments = deployments.filter((r) => r.id !== dseq);
      setRows(newDeployments);
      return setModelDeployments(account.address, newDeployments);
    }).catch((e) => {
      console.log(e);
      setCloseBusyDseq(-1);
    });
    console.log(response);
    props.updateBalance();
    return response;
  };

  const [rows, setRows] = useState([]);
  const [deploymentInfo, setDeploymentInfo] = useState(null);

  useEffect(() => {
    const updateS3Config = async () => setS3Config(await getS3Keys(account.address));
    updateS3Config();
    const setDeployments = async () => {
      setRows((await getModelDeployments(account.address)) || []);
    };
    setDeployments();
  }, [account]);

  const handleClose = () => {
    setDeploymentInfo(null);
  };

  const classes = useStyles();

  const [values, setValues] = useState({
    project: '',
    modelname: '',
    gpu: 'TBA!',
    cpu: 2,
    memory: 4,
    storage: 10
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const [open, setOpen] = useState(false);
  const [certAlert, setCertAlert] = useState(false);
  const [s3KeysAlert, setS3KeysAlert] = useState(false);
  const [formAlert, setFormAlert] = useState(false);
  const [dismissable, setDismissable] = useState(false);
  const [s3Config, setS3Config] = useState(false);

  const handleClickOpen = async () => {
    const cert = await loadPEMBlocks(account.address).catch((e) => console.log(e));
    if (!cert) {
      setCertAlert(true);
    } else if (!s3Config) {
      setS3KeysAlert(true);
    } else if (
         values.project === ''
      || values.modelname === ''
      || values.cpu === '' || values.cpu <= 0
      || values.memory === '' || values.memory <= 0
      || values.storage === '' || values.storage <= 0) {
      setFormAlert(true)
    } else {
      setOpen(true);
    }
  };

  const handleAlertClose = () => {
    setOpen(false);
    setCertAlert(false);
    setS3KeysAlert(false);
    setFormAlert(false);
  };

  const handleDeploymentEnd = async (deployment) => {
    const deployments = await getModelDeployments(account.address);
    deployments.push(deployment);
    setRows(deployments);
    await setModelDeployments(account.address, deployments.slice());
  };

  const generateSDLString = () => {
    const sdl = (
`---
version: "2.0"

services:
  model:
    image: ghcr.io/spacepotahto/tensorflow-serving-s3:0.1.0
    env:
      - AWS_ACCESS_KEY_ID=${s3Config.rKey}
      - AWS_SECRET_ACCESS_KEY=${s3Config.rSecret}
      - S3_ENDPOINT=https://s3.filebase.com
      - S3_URI=s3://${s3Config.bucket}/${values.project.replace(' ', '-')}/models/${values.modelname}
      - MODEL_NAME=${values.modelname}
    expose:
      - port: 8501
        as: 80
        to:
          - global: true

profiles:
  compute:
    model:
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
        model: 
          denom: uakt
          amount: 1000

deployment:
  model:
    westcoast:
      profile: model
      count: 1`
    )
    return sdl;
  };
  
  return (
    <>
    <div style={{ height: 'calc(100vh - 300px)', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={25}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
    <Card className={classes.marginTop} variant="outlined">
    <CardContent style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <form autoComplete="off">
        <Container style={{display: 'flex', justifyContent: 'center'}}>
          <TextField
            id="project-name"
            label="Project Name"
            variant="outlined"
            value={values.project}
            onChange={handleChange('project')}
          />
          <TextField
            id="model-name"
            label="Model Name"
            variant="outlined"
            value={values.modelname}
            onChange={handleChange('modelname')}
          />
        </Container>
      </form>
      <br></br>
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
      <Button
        variant="contained"
        className={classes.marginTop}
        color="secondary"
        size="large"
        onClick={handleClickOpen}
        style={{ marginRight: 6 }}
        startIcon={<RocketLaunch />}
      >
        Deploy Model
      </Button>
    </CardContent>
  </Card>
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
              handleDialogClose={handleAlertClose}
              handleSetDismissable={setDismissable}
              updateBalance={props.updateBalance}
              handleDeploymentEnd={handleDeploymentEnd}
              payload={values}
            ></DeployStepper>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose} variant="contained" color="secondary" disabled={!dismissable}>
            Close
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
          <Button onClick={handleAlertClose} variant="contained" color="secondary">
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
          <Button onClick={handleAlertClose} variant="contained" color="secondary">
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
          <Button onClick={handleAlertClose} variant="contained" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deploymentInfo}>
        <DialogContent>
          <DialogContentText>
            <pre style={ { fontSize: "0.75rem" } }>
              {JSON.stringify(deploymentInfo, null, 2)}
            </pre>
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