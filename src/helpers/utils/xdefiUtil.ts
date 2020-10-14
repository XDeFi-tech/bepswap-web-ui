import {
  TokenAmount,
  BaseAmount,
  tokenAmount,
  tokenToBase,
} from '@thorchain/asgardex-token';
import { crypto, Transaction } from '@binance-chain/javascript-sdk';
import {
  Coin,
  SendMsg,
  StdSignMsg,
} from '@binance-chain/javascript-sdk/lib/types';
import base64js from 'base64-js';

import { getSwapMemo, getWithdrawMemo, getStakeMemo } from '../memoHelper';
import { FixmeType, Maybe } from '../../types/bepswap';
import { CHAIN_ID } from '../../env';
import { BncResponse } from './types';

// TODO: implement the exact types and remove all FixmeTypes

// const NETWORK_ID = 714;
const RUNE = 'RUNE-B1A'; // RUNE symbol in the mainnet

type SendTrustSignedTxParams = {
  xdefiBinanceDexConnector: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  sendOrder: Maybe<SendMsg>;
  memo: string;
};

/** Reference link
 * https://developer.trustwallet.com/wallet-connect/dapp#sign-transaction
 * https://github.com/trustwallet/wallet-core/blob/master/src/proto/Binance.proto
 * https://docs.binance.org/guides/concepts/encoding/amino-example.html#transfer
 * https://github.com/binance-chain/javascript-sdk/blob/master/src/tx/index.ts
 * https://github.com/binance-chain/javascript-sdk/blob/master/src/types/msg/send.ts
 */
/**
 * Sign the Tx by trustwallet and send raw transaction using binance sdk
 * @param xdefiBinanceDexConnector wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param sendOrder     Order to be signed by trustwallet
 * @param memo          memo for tx
 */
export const sendXdefiSignedTx = ({
  xdefiBinanceDexConnector = window.xfi.binance,
  bncClient,
  walletAddress,
  sendOrder,
  memo = '',
}: SendTrustSignedTxParams) => {
  return new Promise((resolve, reject) => {
    if (xdefiBinanceDexConnector && bncClient && sendOrder && walletAddress) {
      bncClient
        .getAccount(walletAddress)
        .then((response: BncResponse) => {
          if (!response) {
            reject(Error('binance client getAccount error!'));
            return;
          }

          const account = response?.result;
          console.log('AccountInfo:', account);
          const data: StdSignMsg = {
            accountNumber: parseInt(account.account_number, 10),
            chainId: CHAIN_ID,
            sequence: parseInt(account.sequence, 10),
            memo,
            source: 1,
            baseMsg: sendOrder,
          };
          const tx: Transaction = new Transaction(data);

          //   chainId: string;
          //   accountNumber: number;
          //   sequence: number;
          //   baseMsg?: BaseMsg;
          //   msg?: Msg;
          //   memo: string;
          //   source: number;
          //   data?: Buffer | null | string;

          xdefiBinanceDexConnector.request(
            {
              method: 1,
              params: [
                {
                  from: walletAddress,
                  signBytes: tx.getSignBytes(),
                },
              ],
            },
            (err: Error, resp: any) => {
              console.log('xdefiBinanceDexConnector result', resp);
              console.error(err);
              if (err) {
                console.error('error signing xefiSignTransaction', err);
                return reject(err);
              }

              console.log(resp);

              const { pubKey, sig } = resp;
              console.log(pubKey);
              console.log(sig);
              const pubKeyPoint = crypto.getPublicKey(pubKey);
              tx.addSignature(pubKeyPoint, Buffer.from(sig, 'hex'));

              console.log('tx', tx);
              console.log('tx', tx.serialize());

              bncClient
                .sendRawTransaction(tx.serialize(), true)
                .then((response: BncResponse) => {
                  console.log('Response', response);
                  resolve(response);
                })
                .catch((error: Error) => {
                  console.log('sendRawTransaction error: ', error);
                  reject(error);
                });
            },
          );
          //   .trustSignTransaction(NETWORK_ID, tx)
          //   .then((result: FixmeType) => {
          //     console.log('Successfully signed stake tx msg:', result);
          //   bncClient
          //     .sendRawTransaction(result, true)
          //     .then((response: BncResponse) => {
          //       console.log('Response', response);
          //       resolve(response);
          //     })
          //     .catch((error: Error) => {
          //       console.log('sendRawTransaction error: ', error);
          //       reject(error);
          //     });
          //   })
          //   .catch((error: Error) => {
          //     console.log('trustSignTransaction error: ', error);

          //     reject(error);
          //   });
        })
        .catch((error: Error) => {
          console.log('getAccount error: ', error);

          reject(error);
        });
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(Error('Transaction Error'));
    }
  });
};

/** Reference
 * https://github.com/binance-chain/javascript-sdk/blob/aa1947b696/src/client/index.ts#L440
 */
export type GetSendOrderMsgParam = {
  fromAddress: string;
  toAddress: string;
  coins: Coin[];
};

const getByteArrayFromAddress = (address: string) => {
  return base64js.fromByteArray(crypto.decodeAddress(address));
};
console.log(getByteArrayFromAddress);

export const getSendOrderMsg = ({
  fromAddress,
  toAddress,
  coins: Coin,
}: GetSendOrderMsgParam) => {
  // 1. sort denoms by alphabet order
  // 2. validate coins with zero amounts
  const coins: Coin[] = Coin.sort((a, b) =>
    a.denom.localeCompare(b.denom),
  ).filter(data => {
    return data.amount > 0;
  });

  // if coin data is invalid, return null
  if (!coins.length) {
    return null;
  }

  const msg = new SendMsg(fromAddress, [
    {
      address: toAddress,
      coins,
    },
  ]);

  return msg;
};

export type WithdrawRequestParam = {
  xdefiBinanceDexConnector: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  poolAddress: string;
  symbol: string;
  percent: number;
};

/**
 * Send Withdraw tx signed by trustwallet
 * @param xdefiBinanceDexConnector wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param poolAddress   RUNE, TOKEN Pool address
 * @param symbol        SYMBOL of token to withdraw
 * @param percent       Percentage of tokens to withdraw from the pool
 */
export const withdrawRequestUsingXdefi = ({
  xdefiBinanceDexConnector = window.xfi.binance,
  bncClient,
  walletAddress,
  poolAddress,
  symbol,
  percent,
}: WithdrawRequestParam) => {
  // Minimum amount to send memo on-chain
  const amount = tokenToBase(tokenAmount(0.00000001))
    .amount()
    .toNumber();

  const memo = getWithdrawMemo(symbol, percent * 100);

  // send 0.00000001 amount of BNB
  const coins: Coin[] = [
    {
      denom: 'BNB',
      amount,
    },
  ];

  const sendOrder = getSendOrderMsg({
    fromAddress: walletAddress,
    toAddress: poolAddress,
    coins,
  });

  return sendXdefiSignedTx({
    xdefiBinanceDexConnector,
    bncClient,
    walletAddress,
    sendOrder,
    memo,
  });
};

type StakeRequestParam = {
  xdefiBinanceDexConnector: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  runeAmount: TokenAmount;
  assetAmount: TokenAmount;
  poolAddress: string;
  symbol: string;
};

/**
 * Send stake tx signed by trustwallet
 * @param xdefiBinanceDexConnector wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param runeAmount    RUNE Amount to stake
 * @param assetAmount   TOKEN Amount to stake
 * @param poolAddress   RUNE, TOKEN Pool address
 * @param symbol        SYMBOL of token to stake
 */
export const stakeRequestUsingXdefi = ({
  xdefiBinanceDexConnector = window.xfi.binance,
  bncClient,
  walletAddress,
  runeAmount,
  assetAmount,
  poolAddress,
  symbol,
}: StakeRequestParam) => {
  const memo = getStakeMemo(symbol);

  const runeAmountNumber = tokenToBase(runeAmount)
    .amount()
    .toNumber();
  const tokenAmountNumber = tokenToBase(assetAmount)
    .amount()
    .toNumber();

  const coins = [
    {
      denom: RUNE,
      amount: runeAmountNumber,
    },
    {
      denom: symbol,
      amount: tokenAmountNumber,
    },
  ];

  const sendOrder = getSendOrderMsg({
    fromAddress: walletAddress,
    toAddress: poolAddress,
    coins,
  });

  return sendXdefiSignedTx({
    xdefiBinanceDexConnector,
    bncClient,
    walletAddress,
    sendOrder,
    memo,
  });
};

type SwapRequestParam = {
  xdefiBinanceDexConnector: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  source: string;
  target: string;
  amount: TokenAmount;
  protectSlip: boolean;
  limit: BaseAmount;
  poolAddress: string;
  targetAddress: string;
};

/**
 * Send stake tx signed by trustwallet
 * @param xdefiBinanceDexConnector wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param source        symbol of source token
 * @param target        symbol of target token
 * @param amount        Token Amount to swap
 * @param protectSlip   slip protect value
 * @param limit         slip limit
 * @param poolAddress   RUNE, TOKEN Pool address
 * @param targetAddress target wallet address
 */
export const swapRequestUsingXdefi = ({
  xdefiBinanceDexConnector = window.xfi.binance,
  bncClient,
  walletAddress,
  source,
  target,
  amount,
  protectSlip,
  limit,
  poolAddress,
  targetAddress = '',
}: SwapRequestParam) => {
  const limitValue = protectSlip && limit ? limit.amount().toString() : '';
  const memo = getSwapMemo(target, targetAddress, limitValue);
  const sourceAmount = tokenToBase(amount)
    .amount()
    .toNumber();

  const coins = [
    {
      denom: source,
      amount: sourceAmount,
    },
  ];

  const sendOrder = getSendOrderMsg({
    fromAddress: walletAddress,
    toAddress: poolAddress,
    coins,
  });

  return sendXdefiSignedTx({
    xdefiBinanceDexConnector,
    bncClient,
    walletAddress,
    sendOrder,
    memo,
  });
};
