import React, { useEffect, useState } from 'react';
import { useAccount } from '../utils/AccountContext';
import Button from '@material-ui/core/Button';
import { DataGrid } from '@material-ui/data-grid';
import DeleteIcon from '@material-ui/icons/Delete';
import Info from '@material-ui/icons/Info';
import LaunchIcon from '@material-ui/icons/Launch';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getNotebookDeployments, setNotebookDeployments } from '../utils/deployments';


export const NotebooksTable = (props) => {
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
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => { window.open(`http://${params.row.info.services.web.uris[0]}`, '_blank'); }}
          style={{ marginRight: 6 }}
          startIcon={<LaunchIcon />}
        >
          Open
        </Button>
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
      return getNotebookDeployments(account.address);
    }).then((deployments) => {
      const newDeployments = deployments.filter((r) => r.id !== dseq);
      setRows(newDeployments);
      return setNotebookDeployments(account.address, newDeployments);
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
    const setDeployments = async () => {
      setRows(await getNotebookDeployments(account.address) || []);
    };
    setDeployments();
  }, [account]);

  const handleClose = () => {
    setDeploymentInfo(null);
  };
  
  return (
    <>
    <div style={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={25}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
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