import React, { useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import gray from '@material-ui/core/colors/grey';
import { useAccount } from '../utils/AccountContext';
import Box from '@material-ui/core/Box';

import { findDeploymentSequence } from 'akashjs';
import BidsForm from './BidsForm';
import { PROVIDER_GATEWAY } from '../common/constants';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
    icon:{
      color: gray[200],
      "&$activeIcon": {
        color: gray[400]
      },
      "&$completedIcon": {
        color: theme.palette.secondary.main
      }
    },
    activeIcon: {},
    completedIcon: {}
  }),
);

function wait(s) {
  return new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });
};

function getSteps() {
  return [
    'Create a Deployment',
    'Choose your Provider',
    'Create a Lease'
  ];
}

export default function DeployStepper(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  const [createDeploymentResult, setCreateDeploymentResult] = React.useState({});
  const [bidsList, setBidsList] = React.useState([]);
  const [winProvider, setWinProvider] = React.useState('');
  const [leaseStatusResult, setLeaseStatusResult] = React.useState({});
  const [cancelDisabled, setCancelDisabled] = React.useState(true);
  const [progressText, setProgressText] = React.useState('Awaiting "create deployment" transaction...');

  const steps = getSteps();

  const account = useAccount();
  const akash = account.akash;

  const handleSetDismissable = props.handleSetDismissable;

  const createDeployment = async () => {
    if (!akash) {
      return;
    }
    console.log("Create a Deployment (tx deployment create)");
    const sdl = props.sdl;
    const createDeploymentPromise = akash.tx.deployment.create.params({
      sdl: sdl
    });
    createDeploymentPromise.catch((e) => setCancelDisabled(false))
    const createDeploymentResult = await createDeploymentPromise;
    console.log(createDeploymentResult);
    const {
      dseq, gseq, oseq
    } = findDeploymentSequence(createDeploymentResult);

    console.log(dseq, gseq, oseq);
    props.updateBalance();

    setProgressText("Waiting for bids...");
    await wait(5);

    let haveBids = false;
    let queryMarketBidResult;
    while(!haveBids) {
      console.log("Query Bids");
      queryMarketBidResult = await akash.query.market.bid.list.params({
        owner: account.address,
        dseq: dseq
      });
      console.log(queryMarketBidResult);
      console.log("");
      haveBids = queryMarketBidResult.bids.length > 0
      await wait(2);
    }
    
    return { dseq, gseq, oseq, queryMarketBidResult };
  };

  const createLease = async () => {
    if (!akash) {
      return;
    }
    const sdl = props.sdl;
    const { dseq, gseq, oseq } = createDeploymentResult;
    const provider = winProvider;

    setProgressText('Awaiting "create lease" transaction...');
    console.log("Create a Lease");
    const marketLeaseCreate = await akash.tx.market.lease.create.params({
      dseq: dseq,
      oseq: oseq,
      gseq: gseq,
      provider: provider
    });
    console.log(marketLeaseCreate);
    console.log("");
    props.updateBalance();

    setProgressText("Confirming the lease...");
    await wait(1);
    console.log("Confirm the Lease");
    const marketLeaseList = await akash.query.market.lease.list.params({
      owner: account.address,
      dseq: dseq
    });
    console.log(marketLeaseList);
    console.log("");

    setProgressText("Querying the provider...");
    await wait(1);
    console.log("Query Provider");
    const providerGet = await akash.query.provider.get.params({
      provider: provider
    });
    console.log(providerGet);
    console.log("");

    setProgressText("Sending the manifest...");
    await wait(5);

    console.log("Send the Manifest");
    const providerSendManifest = await akash.provider.sendManifest.params({
      sdl: sdl,
      dseq: dseq,
      provider: provider,
      proxy: PROVIDER_GATEWAY
    });
    console.log(providerSendManifest);
    console.log("");


    setProgressText("Querying lease status...");
    await wait(5);

    console.log("Provider Lease Status");
    const leaseStatus = await akash.provider.leaseStatus.params({
      dseq: dseq, oseq: oseq, gseq: gseq, provider: provider, proxy: PROVIDER_GATEWAY
    });
    console.log(leaseStatus);
    console.log("");

    return leaseStatus;
  }


  useEffect(() => {
    createDeployment().then((result) => {
      handleNext();
      setCreateDeploymentResult(result);
    });
  }, []);

  useEffect(() => {
    if (createDeploymentResult.dseq != null) {
      const bids = createDeploymentResult.queryMarketBidResult.bids;
      setBidsList(bids);
    }
  }, [createDeploymentResult]);

  useEffect(() => {
    if (winProvider !== '') {
      createLease().then((leaseStatus) => {
        handleNext();
        props.handleDeploymentEnd({
          id: createDeploymentResult.dseq,
          name: props.payload.project,
          modelName: props.payload.modelname,
          info: Object.assign({
            CPU: props.payload.cpu,
            Memory: props.payload.memory,
            Storage: props.payload.storage
          }, leaseStatus)
        });
        setLeaseStatusResult(leaseStatus);
      });
    }
  }, [winProvider]);

  useEffect(() => {
    if (activeStep === steps.length) {
      handleSetDismissable(true);
    }
  }, [activeStep, steps, handleSetDismissable]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const getStepContent = (step, handleCloseDialog) => {
    switch (step) {
      case 0:
        return (
          <React.Fragment>
            <Typography gutterBottom>
              {`Submit your deployment to the blockchain via Keplr. This generates an order on the Akash marketplace.`}
            </Typography>
            <Typography variant="subtitle2" color="secondary">
              {progressText}
            </Typography>
            <Button
              onClick={handleCloseDialog}
              color="secondary"
              className={classes.button}
              disabled={cancelDisabled}
            >
              Cancel
            </Button>
          </React.Fragment>
        );
      case 1:
        return (
          <React.Fragment>
            <Typography gutterBottom>
              {'The following providers bid on your order. Choose one:'}
            </Typography>
            <BidsForm
              bidsList={bidsList}
              handleChooseProvider={(provider) => {
                handleNext();
                setWinProvider(provider);
              }}
            />
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <Typography gutterBottom>
              {`Create a lease for the bid from the chosen provider via Keplr. Once created, your deployment manifest will be submitted to the provider.`}
            </Typography>
            <Typography variant="subtitle2" color="secondary">
              {progressText}
            </Typography>
          </React.Fragment>
        )
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconProps={{ classes:{ root: classes.icon, active: classes.activeIcon, completed: classes.completedIcon } }}
            >{label}
            {
              activeStep === index &&
              <Box component="span" p={1}>
                <CircularProgress color="secondary" size={15}/>
              </Box>
            }
            </StepLabel>
            <StepContent>
              {getStepContent(index, props.handleDialogClose)}
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>The provider has executed your workload! Your access details:</Typography>
          <div>
            <pre style={ { fontSize: "0.75rem" } }>
              {JSON.stringify(leaseStatusResult, null, 2)}
            </pre>
          </div>
        </Paper>
      )}
    </div>
  );
}