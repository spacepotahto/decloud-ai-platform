import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useAccount } from '../utils/AccountContext';
import { CertificateCard } from './CertificateCard';
import { S3KeysCard } from './S3KeysCard';
import { loadPEMBlocks } from 'akashjs';
import { getS3Keys, setS3Keys, delS3Keys } from '../utils/s3keys';

const useStyles = makeStyles((theme) => ({
  marginTop: {
    marginTop: theme.spacing(2),
  },
  marginBottom: {
    marginBottom: theme.spacing(8),
  },
}));

export const ManageKeys = (props) => {
  const account = useAccount();
  const akash = account.akash;
  const classes = useStyles();
  
  const [certificate, setCertificate] = useState({
    serial: '',
    state: ''
  });

  const [busy, setBusy] = useState(false);

  const getCertificate = async () => {
    if (!akash) {
      return;
    }

    const cert = await loadPEMBlocks(account.address).catch((e) => console.log(e));
    let isValid = false;
    if (cert) {
      const certResponse = await akash.query.cert.list.params({
        owner: account.address,
        serial: cert.serialNumber.toString()
      });
      if (certResponse.certificates.length > 0) {
        const onChainCertificate = certResponse.certificates[0];
        const state = onChainCertificate.certificate?.state;
        isValid = state === 1;
      } else {
        isValid = false;
      }
    }
    setCertificate({
      serial: cert ? cert.serialNumber.toString() : '',
      state: isValid ? 'valid' : 'invalid'
    });
  };

  const revoke = async (serial) => {
    if (!akash) {
      return;
    }
    setBusy(true);
    const response = await akash.tx.cert.revoke.params({ serial: serial }).catch((e) => {
      setBusy(false);
    });
    await getCertificate();
    setBusy(false);
    console.log(response);
    props.updateBalance();
    return response;
  };

  const create = async () => {
    if (!akash) {
      return;
    }
    setBusy(true);
    const response = await akash.tx.cert.create.client.params().catch((e) => {
      setBusy(false);
    });
    await getCertificate();
    setBusy(false);
    console.log(response);
    props.updateBalance();
    return response;
  };

  const [accessKeysExist, setAccessKeysExist] = useState(false);

  const checkAccessKeys = async () => {
    const keys = await getS3Keys(account.address);
    setAccessKeysExist(keys != null);
  };

  const setAccessKeys = async (rKey, rSecret, bucket) => {
    if (rKey === '' || rSecret === '' || bucket === '') {
      return;
    }
    await setS3Keys(account.address, { rKey, rSecret, bucket });
    setAccessKeysExist(true);
  };

  const removeAccessKeys = async () => {
    await delS3Keys(account.address);
    setAccessKeysExist(false);
  };

  useEffect(() => {
    getCertificate();
    checkAccessKeys();
  }, [account]);

  return (
    <>
    <Typography variant="h5" noWrap>
      Akash Deploy Certificate
    </Typography>
    <CertificateCard classes={`${classes.marginTop} ${classes.marginBottom}`} certificate={certificate} revoke={revoke} create={create} buttonBusy={busy}/>
    <Typography variant="h5" noWrap>
      Filebase Access Keys and Bucket
    </Typography>
    <S3KeysCard classes={`${classes.marginTop} ${classes.marginBottom}`} accessKeysExist={accessKeysExist} setAccessKeys={setAccessKeys} removeAccessKeys={removeAccessKeys}/>
    </>
  );
};