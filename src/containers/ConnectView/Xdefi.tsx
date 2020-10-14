import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
// import { crypto } from '@binance-chain/javascript-sdk';
import { Row } from 'antd';
// import WalletConnect, { IAccount } from '@trustwallet/walletconnect';
// import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';

import { ContentWrapper } from './ConnectView.style';

import * as walletActions from '../../redux/wallet/actions';
import Label from '../../components/uielements/label';
// import { Maybe } from '../../types/bepswap';
// import showNotification from '../../components/uielements/notification';
import { RootState } from '../../redux/store';
// import showNotification from '../../components/uielements/notification';

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
      window.xfi.binance.request(
        {
          method: 0,
          params: [],
        },
        (err: Error, accounts: string[]) => {
          if (err) {
            console.error('err', err);
          }
          const resp = accounts.filter(acc => acc);
          setxdefiAccounts(resp);
        },
      );
    }
  }, []);

//   window.xfi.binance.on('disconnect', (error: any) => {
//     if (error) {
//       console.log('binanceDexConnector disconnect error: ', error);

//       throw error;
//     }

//     const user = userRef.current;

//     if (user?.type === 'xdefi' && user?.wallet) {
//       showNotification({
//         type: 'info',
//         message: 'Wallet Disconnected',
//         description: 'Xdefi is disconnected in your app',
//       });

//       // forget wallet and redirect to connect page
//       dispatch(walletActions.forgetWallet());
//       history.push('/connect');
//     }
//   });

  //   const walletConnect = async () => {
  //     const qrcodeModalOptions = {
  //       mobileLinks: ['trust'],
  //     };

  //     const walletConnector = new WalletConnect({
  //       bridge: 'https://bridge.walletconnect.org', // Required
  //       qrcodeModal: WalletConnectQRCodeModal,
  //       qrcodeModalOptions,
  //     });

  //     walletConnector.killSession();

  //     // Check if connection is already established
  //     if (!walletConnector.connected) {
  //       // create new session

  //       walletConnector.createSession().then(() => {
  //         // get uri for QR Code modal
  //         const uri = walletConnector.uri;
  //         // display QR Code modal OR MobileLink for trustwallet
  //         WalletConnectQRCodeModal.open(uri, () => {}, qrcodeModalOptions);
  //       });
  //     }

  //     // Subscribe to connection events
  //     walletConnector.on('connect', error => {
  //       if (error) {
  //         console.log('walletConnector connect error: ', error);
  //         throw error;
  //       }

  //       // Close QR Code Modal
  //       WalletConnectQRCodeModal.close();

  //       // Get provided accounts and chainId
  //       // const { accounts, chainId } = payload.params[0];

  //       walletConnector
  //         .getAccounts()
  //         .then((result: IAccount[]) => {
  //           // Returns the accounts
  //           const account: Maybe<IAccount> = result.find(
  //             (account: IAccount) => account.network === 714,
  //           );
  //           // const address = crypto.decodeAddress(account.address);
  //           const address = account?.address ?? '';

  //           props.saveWallet({
  //             type: 'walletconnect',
  //             wallet: address,
  //             walletConnector,
  //           });

  //           // redirect to previous page
  //           history.goBack();
  //         })
  //         .catch(error => {
  //           // Error returned when rejected
  //           console.error('walletConnector getAccount error!', error);
  //         });
  //     });

  //     walletConnector.on('session_update', error => {
  //       if (error) {
  //         console.log('walletConnector session_update error: ', error);

  //         throw error;
  //       }

  //       // Get updated accounts and chainId
  //       // const { accounts, chainId } = payload.params[0];
  //     });

  //     walletConnector.on('disconnect', error => {
  //       if (error) {
  //         console.log('walletConnector disconnect error: ', error);

  //         throw error;
  //       }

  //       const user = userRef.current;

  //       if (user?.type === 'walletconnect' && user?.wallet) {
  //         showNotification({
  //           type: 'info',
  //           message: 'Wallet Disconnected',
  //           description: 'Walletconnect is disconnected in your app',
  //         });

  //         // forget wallet and redirect to connect page
  //         dispatch(walletActions.forgetWallet());
  //         history.push('/connect');
  //       }
  //     });
  //   };

  const onAccountClickHandler = (address: any) => {
    props.saveWallet({
      type: 'xdefi',
      wallet: address,
      //   xdefiBinanceDexConnector: window.xfi.binance, // TODO: pass "xdefi-dapps-sdk/binancedex" instead of the the provider itself
      //   walletConnector, // TODO: pass binancedexprovider
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
