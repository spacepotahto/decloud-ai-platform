import React, { useEffect, useState } from 'react';
import { useAccount } from '../utils/AccountContext';
import Button from '@material-ui/core/Button';
import { DataGrid } from '@material-ui/data-grid';
import DeleteIcon from '@material-ui/icons/Delete';
import LaunchIcon from '@material-ui/icons/Launch';

const columns = [
  { field: 'id', headerName: 'DSEQ', flex: 1 },
  {
    field: 'cpu',
    headerName: 'CPU',
    type: 'number',
    flex: 1,
    headerAlign: 'start',
    align: 'start'
  },
  {
    field: 'memory',
    headerName: 'Memory',
    type: 'number',
    flex: 1,
    headerAlign: 'start',
    align: 'start'
  },
  {
    field: 'tempStorage',
    headerName: 'Storage (Temp)',
    type: 'number',
    flex: 1.25,
    headerAlign: 'start',
    align: 'start'
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    headerAlign: 'start',
    align: 'start'
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
    align: 'center',
    renderCell: (params) => (
      <>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        style={{ marginRight: 6 }}
        startIcon={<LaunchIcon />}
      >
        Open
      </Button>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<DeleteIcon />}
      >
        Close
      </Button>
      </>
    ),
  },
];

const rows = [
  { id: 123456, cpu: 0.5, memory: '1Gi', tempStorage: '3Gi', age: 35, status: 'Running', action: '' }
];

export const NotebooksTable = (props) => {
  const account = useAccount();
  const akash = account.akash;
  
  return (
    <div style={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={25}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
};