import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import ErrorIcon from '@material-ui/icons/Error';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';

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

export const S3KeysCard = (props) => {
  const classes = useStyles();

  const [values, setValues] = React.useState({
    rKey: '',
    rSecret: '',
    showPassword: false,
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <Card className={`${classes.root} ${props.classes}`} variant="outlined">
        <CardContent className={classes.root}>
          {
            props.accessKeysExist && (
                <Typography variant="h5" color="textSecondary">
                  <VerifiedUserIcon color="secondary"/> Access Keys Exist
                </Typography>
            )
          }
          {
            !props.accessKeysExist && (
              <React.Fragment>
                <Typography variant="h5" color="textSecondary">
                  <ErrorIcon color="secondary"/> No Access Keys Found
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Access keys are required to interact with Filebase. Please specify them below.
                </Typography>
              </React.Fragment>
            )
          }
        </CardContent>
        <CardActions>
          {
            props.accessKeysExist && (
              <Button size="large" variant="contained" color="secondary"
                onClick={() => {
                  props.removeAccessKeys();
                  setValues({ rKey: '', rSecret: '', showPassword: false });
                }}>
                Remove
              </Button>
            )
          }
          {
            !props.accessKeysExist && (
              <>
              <FormControl color="secondary" variant="outlined">
                <InputLabel htmlFor="password-input">Key</InputLabel>
                <OutlinedInput
                  id="rKey-input"
                  label="Key"
                  type={values.showPassword ? 'text' : 'password'}
                  value={values.rKey}
                  onChange={handleChange('rKey')}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle key visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {values.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  labelWidth={100}
                />
              </FormControl>
              <FormControl color="secondary" variant="outlined">
                <InputLabel htmlFor="password-input">Secret</InputLabel>
                <OutlinedInput
                  id="rSecret-input"
                  label="Secret"
                  type={values.showPassword ? 'text' : 'password'}
                  value={values.rSecret}
                  onChange={handleChange('rSecret')}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle key visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {values.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  labelWidth={100}
                />
              </FormControl>
              <Button size="large" variant="contained" color="secondary" onClick={() => props.setAccessKeys(values.rKey, values.rSecret)}>
                Save
              </Button>
              </>
            )
          }
        </CardActions>
      </Card>
    </React.Fragment>
  );
};