import { WS } from '@thorchain/asgardex-binance';
import { bn } from '@thorchain/asgardex-util';
import { tokenAmount, baseAmount } from '@thorchain/asgardex-token';
import {
  AssetDetailMap,
  PriceDataIndex,
} from '../../redux/midgard/types';
import { RUNE_SYMBOL } from '../../settings/assetData';
import {
  withdrawResult,
  getAvailableTokensToCreate,
  getPoolData,
} from './poolUtils';
import { PoolData } from './types';
import { AssetData } from '../../redux/wallet/types';
import {
  PoolDetail,
  PoolDetailStatusEnum,
} from '../../types/generated/midgard';

const assets: AssetDetailMap = {
  BNB: {
    asset: 'BNB.BNB',
    dateCreated: 1597628327,
    priceRune: '26.496460693841062',
  },
  'FSN-F1B': {
    asset: 'BNB.FSN-F1B',
    dateCreated: 1597628327,
    priceRune: '26.496460693841062',
  },
};

describe('pool/utils/', () => {
  describe('witdrawResult', () => {
    it('should validate a withdraw transfer', () => {
      const tx: WS.TransferEvent = {
        stream: 'transfers',
        data: {
          e: 'outboundTransferInfo',
          E: 62498151,
          H: '1A4C9EB6438CC87B9DD67707770DE662F6212B68A93A5ABCE2DA0AC09B3FDCE1',
          M:
            'OUTBOUND:0C48D82F045B5AABD02663551D19CE18D2266E966ABD3A4D5ACBD3762C8EC692',
          f: 'tbnb1nhftlnunw3h6c9wsamfyf8dzmmwm8c9xfjaxmp',
          t: [
            {
              o: 'tbnb13egw96d95lldrhwu56dttrpn2fth6cs0axzaad',
              c: [
                {
                  a: 'TUSDB-000',
                  A: '0.79146284',
                },
              ],
            },
          ],
        },
      };
      const result = withdrawResult({
        tx,
        symbol: 'TUSDB-000',
        address: 'tbnb13egw96d95lldrhwu56dttrpn2fth6cs0axzaad',
      });
      expect(result).toBeTruthy();
    });
  });

  describe('getAvailableTokensToCreate', () => {
    it('should filter pool assets and the asset with small amount ', () => {
      const assetA: AssetData = {
        asset: 'A',
        assetValue: tokenAmount(1),
      };
      const assetB: AssetData = {
        asset: 'B',
        assetValue: tokenAmount(1),
      };
      const assetWithSmallAmount: AssetData = {
        asset: 'C',
        assetValue: tokenAmount(0.005),
      };
      const assets: AssetData[] = [assetA, assetB, assetWithSmallAmount];
      const pools: string[] = ['A.A'];
      const result = getAvailableTokensToCreate(assets, pools);
      const expected = [assetB];
      expect(result).toEqual(expected);
    });
    it('should exclude `RUNE`  asset', () => {
      const assetA: AssetData = {
        asset: 'RUNE',
        assetValue: tokenAmount(1),
      };
      const assetB: AssetData = {
        asset: 'RUNE',
        assetValue: tokenAmount(1),
      };
      const assetC: AssetData = {
        asset: 'C',
        assetValue: tokenAmount(1),
      };
      const assets: AssetData[] = [assetA, assetB, assetC];
      const pools: string[] = ['A.A'];
      const result = getAvailableTokensToCreate(assets, pools);
      const expected = [assetC];
      expect(result).toEqual(expected);
    });
  });
  describe('getPoolData', () => {
    const bnbPoolDetail: PoolDetail = {
      asset: 'BNB.BNB',
      assetDepth: '611339',
      assetROI: '-0.4442372727272727',
      assetStakedTotal: '1100000',
      buyAssetCount: '1',
      buyFeeAverage: '199600',
      buyFeesTotal: '199600',
      buySlipAverage: '1002000',
      buyTxAverage: '32387',
      buyVolume: '32387',
      poolDepth: '399999598',
      poolEarned: '1000000000',
      poolFeeAverage: '99800',
      poolFeesTotal: '199600',
      poolROI: '999.2768763636363',
      poolROI12: '1000.2778813636363',
      poolSlipAverage: '501000',
      poolStakedTotal: '359965441',
      poolTxAverage: '16193',
      poolUnits: '47400323',
      poolVolume: '32387',
      poolVolume24hr: '0',
      price: '327.15040100500704',
      runeDepth: '199999799',
      runeROI: '1998.99799',
      runeStakedTotal: '12865427860',
      sellAssetCount: '0',
      sellFeeAverage: '0',
      sellFeesTotal: '0',
      sellSlipAverage: '0',
      sellTxAverage: '0',
      sellVolume: '0',
      stakeTxCount: '3',
      stakersCount: '1',
      stakingTxCount: '4',
      status: PoolDetailStatusEnum.Enabled,
      swappersCount: '1',
      swappingTxCount: '1',
      withdrawTxCount: '1',
    };

    const fsnPoolDetail: PoolDetail = {
      asset: 'BNB.FSN-F1B',
      assetDepth: '100000',
      assetROI: '0',
      assetStakedTotal: '100000',
      buyAssetCount: '0',
      buyFeeAverage: '0',
      buyFeesTotal: '0',
      buySlipAverage: '0',
      buyTxAverage: '0',
      buyVolume: '0',
      poolDepth: '400000',
      poolEarned: '1000000',
      poolFeeAverage: '0',
      poolFeesTotal: '0',
      poolROI: '0.5',
      poolROI12: '0.5',
      poolSlipAverage: '0',
      poolStakedTotal: '300000',
      poolTxAverage: '0',
      poolUnits: '87500',
      poolVolume: '0',
      poolVolume24hr: '0',
      price: '2',
      runeDepth: '200000',
      runeROI: '1',
      runeStakedTotal: '12865427860',
      sellAssetCount: '0',
      sellFeeAverage: '0',
      sellFeesTotal: '0',
      sellSlipAverage: '0',
      sellTxAverage: '0',
      sellVolume: '0',
      stakeTxCount: '2',
      stakersCount: '1',
      stakingTxCount: '2',
      status: PoolDetailStatusEnum.Enabled,
      swappersCount: '0',
      swappingTxCount: '0',
      withdrawTxCount: '0',
    };
    const priceIndex: PriceDataIndex = {
      [RUNE_SYMBOL]: bn(1),
      'FSN-F1B': bn(2),
    };

    // set the current time manually
    Date.now = () => 1597668345000;

    it('returns PoolData for a FSN based pool', () => {
      const expected: PoolData = {
        asset: 'RUNE',
        target: 'FSN',
        pool: {
          asset: 'RUNE',
          target: 'FSN',
        },
        depth: baseAmount(200000),
        volume24: baseAmount(0),
        volumeAT: baseAmount(0),
        transaction: baseAmount(0),
        liqFee: baseAmount(0),
        runeStakedTotal: baseAmount(12865427860),
        roi: 250,
        apy: 197011.34,
        poolROI12: bn(250),
        totalSwaps: 0,
        totalStakers: 1,
        poolPrice: bn(1),
        values: {
          pool: {
            asset: 'RUNE',
            target: 'FSN',
          },
          target: 'FSN',
          symbol: 'FSN-F1B',
          depth: '0.00',
          volume24: '0.00',
          transaction: '0.00',
          liqFee: '0.00',
          roi: '250%',
          apy: '197011.34% APY',
          runeStakedTotal: '128.65',
          poolPrice: '2.000',
        },
      };
      const result = getPoolData(
        'FSN-F1B',
        fsnPoolDetail,
        assets['FSN-F1B'],
        priceIndex,
      );

      expect(result.asset).toEqual(expected.asset);
      expect(result.target).toEqual(expected.target);
      expect(result.depth.amount()).toEqual(expected.depth.amount());
      expect(result.volume24.amount()).toEqual(expected.volume24.amount());
      expect(result.transaction.amount()).toEqual(
        expected.transaction.amount(),
      );
      expect(result.runeStakedTotal.amount()).toEqual(
        expected.runeStakedTotal.amount(),
      );
      expect(result.liqFee.amount()).toEqual(expected.liqFee.amount());
      expect(result.roi).toEqual(expected.roi);
      expect(result.apy).toEqual(expected.apy);
      expect(result.totalSwaps).toEqual(expected.totalSwaps);
      expect(result.totalStakers).toEqual(expected.totalStakers);
      expect(result.values).toEqual(expected.values);

      expect(result.depth.amount()).toEqual(expected.depth.amount());
      expect(result.volume24.amount()).toEqual(expected.volume24.amount());
      expect(result.transaction.amount()).toEqual(
        expected.transaction.amount(),
      );
      expect(result.liqFee.amount()).toEqual(expected.liqFee.amount());
      expect(result.roi).toEqual(expected.roi);
      // Unsafe, just to test all props again (in case we might forget to test a new property in the future)
      expect(result.toString()).toEqual(expected.toString());
    });
    it('returns PoolData for a BNB based pool', () => {
      const expected: PoolData = {
        asset: 'RUNE',
        target: 'BNB',
        pool: {
          asset: 'RUNE',
          target: 'BNB',
        },
        depth: baseAmount(199999799),
        volume24: baseAmount(0),
        volumeAT: baseAmount(32387),
        transaction: baseAmount(16193),
        liqFee: baseAmount(99800),
        runeStakedTotal: baseAmount(12865427860),
        roi: 250,
        apy: 197011.34,
        poolROI12: bn(50),
        totalSwaps: 1,
        totalStakers: 1,
        poolPrice: bn(0.09),
        values: {
          pool: {
            asset: 'RUNE',
            target: 'BNB',
          },
          target: 'BNB',
          symbol: 'BNB',
          depth: '2.00',
          volume24: '0.00',
          transaction: '0.00',
          liqFee: '0.00',
          roi: '250%',
          apy: '197011.34% APY',
          runeStakedTotal: '128.65',
          poolPrice: '0.000',
        },
      };
      const result = getPoolData('BNB', bnbPoolDetail, assets.BNB, priceIndex);

      expect(result.asset).toEqual(expected.asset);
      expect(result.target).toEqual(expected.target);
      expect(result.depth.amount()).toEqual(expected.depth.amount());
      expect(result.volume24.amount()).toEqual(expected.volume24.amount());
      expect(result.transaction.amount()).toEqual(
        expected.transaction.amount(),
      );
      expect(result.liqFee.amount()).toEqual(expected.liqFee.amount());
      expect(result.runeStakedTotal.amount()).toEqual(
        expected.runeStakedTotal.amount(),
      );
      expect(result.roi).toEqual(expected.roi);
      expect(result.apy).toEqual(expected.apy);
      expect(result.totalSwaps).toEqual(expected.totalSwaps);
      expect(result.totalStakers).toEqual(expected.totalStakers);
      expect(result.values).toEqual(expected.values);

      expect(result.depth.amount()).toEqual(expected.depth.amount());
      expect(result.volume24.amount()).toEqual(expected.volume24.amount());
      expect(result.transaction.amount()).toEqual(
        expected.transaction.amount(),
      );
      expect(result.liqFee.amount()).toEqual(expected.liqFee.amount());
      expect(result.roi).toEqual(expected.roi);
      // Unsafe, just to test all props again (in case we might forget to test a new property in the future)
      expect(result.toString()).toEqual(expected.toString());
    });
  });
});
