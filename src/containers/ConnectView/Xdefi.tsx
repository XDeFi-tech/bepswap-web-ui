import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import XDEFIBinanceDex from '@xdefi/binancedex-provider';

import { ContentWrapper } from './ConnectView.style';

import * as walletActions from '../../redux/wallet/actions';
import Label from '../../components/uielements/label';
import { RootState } from '../../redux/store';
import showNotification from '../../components/uielements/notification';

type Props = {
  saveWallet: typeof walletActions.saveWallet;
};

const Xdefi = (props: Props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [xdefiInjected, setxdefiInjected] = useState(false);
  const [xdefiAccounts, setxdefiAccounts] = useState<Array<string>>([]);

  const user = useSelector((state: RootState) => state.Wallet.user);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    console.log('onMount', dispatch, history, props);
    if (window?.xfi?.binance) {
      setxdefiInjected(true);
      console.log('XDEFI BinanceDex Provider detected', window.xfi.binance);

      const xdefiProvider = new XDEFIBinanceDex(window.xfi.binance);

      xdefiProvider
        .getAccounts()
        .then((accounts: any) => {
          setxdefiAccounts(accounts.filter((a: any) => a));
        })
        .catch(err => {
          console.error('err', err);
        });
    }
  }, []);

  const onAccountClickHandler = (address: any) => {
    window.xfi.binance.on('disconnect', (error: Error) => {
      if (error) {
        console.log('XDEFI binanceprovider disconnect error: ', error);

        throw error;
      }

      const user = userRef.current;

      if (user?.type === 'xdefi' && user?.wallet) {
        showNotification({
          type: 'info',
          message: 'Wallet Disconnected',
          description: 'XDEFI is disconnected in your app',
        });

        // forget wallet and redirect to connect page
        dispatch(walletActions.forgetWallet());
        history.push('/connect');
      }
    });

    props.saveWallet({
      type: 'xdefi',
      wallet: address,
    });

    // redirect to previous page
    history.goBack();
  };

  return (
    <ContentWrapper>
      {xdefiInjected && (
        <Row style={{ bottom: 5 }}>
          <Label>Please select the account</Label>
          <br />
          {xdefiAccounts.map(acc => {
            return (
              <div key={acc} onClick={() => onAccountClickHandler(acc)}>
                {acc}
              </div>
            );
          })}
        </Row>
      )}
      {!xdefiInjected && (
        <Row style={{ bottom: 5 }}>
          <div>XDEFI not detected</div>
        </Row>
      )}
    </ContentWrapper>
  );
};

Xdefi.propTypes = {
  saveWallet: PropTypes.func.isRequired,
};

export default Xdefi;
