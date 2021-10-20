import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import ErrorIcon from '@material-ui/icons/Error';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles({
  root: {
    width: '100%',
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginTop: 10,
    marginBottom: 12,
    marginRight: 50,
    marginLeft: 50
  }
});

export const CertificateCard = (props) => {
  const classes = useStyles();

  return (
    <React.Fragment>
    {props.certificate.state === '' && <CircularProgress color="primary" />}
    {
      props.certificate.state !== '' && 
    
      <Card className={`${classes.root} ${props.classes}`} variant="outlined">
        <CardContent className={classes.root}>
          {
            props.certificate.state === 'valid' && (
              <React.Fragment>
                <Typography variant="h5" color="textSecondary">
                  <VerifiedUserIcon color="primary"/> Valid Certificate
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  {`Serial Number: ${props.certificate.serial}`}
                </Typography>
              </React.Fragment>
            )
          }
          {
            props.certificate.state === 'invalid' && (
              <React.Fragment>
                <Typography variant="h5" color="textSecondary">
                  <ErrorIcon color="primary"/> No Valid Certificate Found
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  A valid certificate is required for deployment. Please create one using the button below.
                </Typography>
              </React.Fragment>
            )
          }
        </CardContent>
        <CardActions>
          {
            props.certificate.state === 'valid' && (
              <Button size="large" variant="contained" color="primary" onClick={() => { props.revoke(props.certificate.serial) }} disabled={props.buttonBusy}>
                {!props.buttonBusy && "Revoke"}
                {props.buttonBusy && <CircularProgress color="primary" size={30}/>}
              </Button>
            )
          }
          {
            props.certificate.state === 'invalid' && (
              <Button size="large" variant="contained" color="primary" onClick={props.create} disabled={props.buttonBusy}>
                {!props.buttonBusy && "Create"}
                {props.buttonBusy && <CircularProgress color="primary" size={30}/>}
              </Button>
            )
          }
        </CardActions>
      </Card>
    }
    </React.Fragment>
  );
};