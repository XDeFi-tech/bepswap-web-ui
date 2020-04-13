import React from 'react';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';

import { util } from 'asgardex-common';
import AppHolder from '../../../../AppStyle';
import { defaultTheme } from '../../../../settings';

import TokenCard from './tokenCard';

storiesOf('Components/Tokens/TokenCard', module).add('default', () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <AppHolder>
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '800px' }}
        >
          <TokenCard
            title="You are swapping"
            inputTitle="swap amount"
            asset="bnb"
            assetData={[
              {
                asset: 'rune',
                price: 100,
              },
              {
                asset: 'tomo',
                price: 100,
              },
            ]}
            amount={util.bn(1.354)}
            price={util.bn(600)}
            withSelection
            priceIndex={{
              RUNE: 1,
            }}
          />
        </div>
      </AppHolder>
    </ThemeProvider>
  );
});
