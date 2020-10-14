import { RemoteData } from '@devexperts/remote-data-ts';
import { TokenAmount } from '@thorchain/asgardex-token';
import { FixmeType, Maybe, Address } from '../../types/bepswap';

export type WalletType = 'keystore' | 'walletconnect' | 'ledger' | 'xdefi';

export interface User {
  /**
   * Users wallet address
   * */
  type: WalletType;
  wallet: Address;
  keystore?: FixmeType;
  ledger?: FixmeType;
  hdPath?: number [];
  walletConnector?: FixmeType;
  xdefiBinanceDexConnector?: FixmeType; // TODO: add the external sdk
}

export type EmptyUser = {};

export interface AssetData {
  asset: string;
  assetValue: TokenAmount;
}

export type StakeDataListLoadingState = RemoteData<Error, AssetData[]>;

export interface State {
  readonly user: Maybe<User>;
  readonly assetData: AssetData[];
  readonly stakeData: StakeDataListLoadingState;
  readonly loadingAssets: boolean;
  readonly error: Maybe<Error>;
}
