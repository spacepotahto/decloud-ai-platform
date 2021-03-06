import React, { useContext, useEffect, useState } from 'react';
import { Akash } from 'akashjs';
import { CHAIN_ID, RPC } from '../common/constants';

const AccountContext = React.createContext({ address: '', name: '' });
const AccountUpdateContext = React.createContext(() => {});

const useAccount = () => useContext(AccountContext);
const useAccountUpdate = () => useContext(AccountUpdateContext);

const AccountProvider = ({ children }) => {
  const [account, setAccount] = useState({ address: '', name: ''});
  
  const changeAccount = (account) => {
    setAccount(account);
  };

  useEffect(() => {
    const setupAccount = async () => {
      if (!window.keplr) {
        return;
      }

      await window.keplr.enable(CHAIN_ID);
      const key = await window.keplr.getKey(CHAIN_ID);
      // getOfflineSigner must be defined if window.keplr defined.
      const offlineSigner = window.getOfflineSigner(CHAIN_ID);
      const akash = await Akash.connect(RPC, offlineSigner);
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;
      setAccount({ address: address, name: key.name, akash: akash });
    }
    setupAccount();

    const keystoreChangeHandler = () => {
      setupAccount();
    };

    window.addEventListener("keplr_keystorechange", keystoreChangeHandler);

    return () => {
      window.removeEventListener("keplr_keystorechange", keystoreChangeHandler);
    }
  }, []);

  return (
    <AccountContext.Provider value={account}>
      <AccountUpdateContext.Provider value={changeAccount}>
        {children}
      </AccountUpdateContext.Provider>
    </AccountContext.Provider>
  );
};

export { AccountProvider, useAccount, useAccountUpdate };