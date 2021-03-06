import React, { useMemo } from 'react';

import { CoinWrapper, CoinsWrapper } from './coin.style';
import CoinIcon from '../coinIcon';
import DynamicCoin from '../dynamicCoin';
import { CoinSize } from './types';
import { Nothing, Maybe } from '../../../../types/bepswap';
import { coinGroup } from '../../../../settings';
import { coinIconsFromTrustWallet } from '../../../../settings/logoData';
import { getTickerFormat } from '../../../../helpers/stringHelper';

type Props = {
  type: string;
  over?: Maybe<string>;
  size?: CoinSize;
  className?: string;
};

const Coin: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    type: coinType,
    size = 'big',
    over = Nothing,
    className = '',
    ...otherProps
  } = props;
  const type = getTickerFormat(coinType);

  const isDynamicIcon = useMemo(
    () =>
      !coinGroup.includes(type.toLowerCase()) &&
      !Object.keys(coinIconsFromTrustWallet).includes(type.toUpperCase()),
    [type],
  );

  if (over) {
    const isDynamicIconOver =
      !coinGroup.includes(over.toLowerCase()) &&
      !Object.keys(coinIconsFromTrustWallet).includes(type.toUpperCase());

    return (
      <CoinsWrapper
        size={size}
        className={`coin-wrapper ${className}`}
        {...otherProps}
      >
        {isDynamicIcon && (
          <DynamicCoin className="dynamic-bottom" type={type} size={size} />
        )}
        {!isDynamicIcon && (
          <div className="coin-bottom">
            <CoinIcon type={type} size={size} />
          </div>
        )}
        {isDynamicIconOver && (
          <DynamicCoin className="dynamic-over" type={over} size={size} />
        )}
        {!isDynamicIconOver && (
          <div className="coin-over">
            <CoinIcon type={over} size={size} />
          </div>
        )}
      </CoinsWrapper>
    );
  }
  if (isDynamicIcon) {
    return <DynamicCoin type={type} size={size} />;
  }
  return (
    <CoinWrapper
      size={size}
      className={`coin-wrapper ${className}`}
      {...otherProps}
    >
      <CoinIcon type={type} size={size} />
    </CoinWrapper>
  );
};

export default Coin;
