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

const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  {
    field: 'name',
    headerName: 'Model Name',
    flex: 1,
    headerAlign: 'start',
    align: 'start'
  },
  {
    field: 'location',
    headerName: 'Location',
    flex: 3,
    headerAlign: 'start',
    align: 'start'
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
    align: 'center',
    renderCell: (params) => (
      <Button
        variant="contained"
        color="secondary"
        size="small"
        style={{ marginRight: 6 }}
        startIcon={<RocketLaunch />}
      >
        Deploy Model
      </Button>
    ),
  },
];

const rows = [
  { id: 1, name: 'MNIST CNN', location: 'sia://AADtZEdkxRHg35Tz6n6tp72wxrJE4i75Rp7r8-graMU-Uw', action: '' }
];

export const ModelsTable = (props) => {
  const account = useAccount();
  const akash = account.akash;
  const classes = useStyles();
  
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
    <Card className={classes.section + ' ' + classes.marginTop} variant="outlined">
      <CardContent style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <form autoComplete="off">
          <Container style={{display: 'flex', justifyContent: 'space-around'}}>
            <TextField
              id="model-id"
              label="ID"
              variant="outlined"
            />
            <TextField
              id="model-name"
              label="Model Name"
              variant="outlined"
            />
            <TextField
              id="model-location"
              label="Location"
              variant="outlined"
            />
          </Container>
        </form>
        <Button variant="contained" className={classes.marginTop}
          onClick={() => null}
          color="primary" size="large">
          <span>Save Model</span>
        </Button>
      </CardContent>
    </Card>
    </>
  );
};