import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Row, Col, Icon } from 'antd';

import Drag from '../../../components/uielements/drag';
import CoinCard from '../../../components/uielements/coins/coinCard';
import Coin from '../../../components/uielements/coins/coin';
import Status from '../../../components/uielements/status';
import Slider from '../../../components/uielements/slider';
import TxTimer from '../../../components/uielements/txTimer';
import CoinData from '../../../components/uielements/coins/coinData';
import Label from '../../../components/uielements/label';

import { blackArrowIcon } from '../../../components/icons';

import {
  ContentWrapper,
  TradeModalContent,
  TradeModal,
} from './TradeDetail.style';

import { getPair } from '../../../helpers/stringHelper';
import { tradeData } from './data';

import appActions from '../../../redux/app/actions';

const {
  setTxTimerType,
  setTxTimerModal,
  setTxTimerStatus,
  setTxTimerValue,
  resetTxStatus,
} = appActions;

class TradeDetail extends Component {
  static propTypes = {
    info: PropTypes.string,
    view: PropTypes.string.isRequired,
    txStatus: PropTypes.object.isRequired,
    setTxTimerType: PropTypes.func.isRequired,
    setTxTimerModal: PropTypes.func.isRequired,
    setTxTimerStatus: PropTypes.func.isRequired,
    setTxTimerValue: PropTypes.func.isRequired,
    resetTxStatus: PropTypes.func.isRequired,
  };

  static defaultProps = {
    info: '',
  };

  state = {
    dragReset: true,
  };

  handleDrag = () => {
    this.setState({
      dragReset: false,
    });
  };

  handleEndDrag = () => {
    const { setTxTimerModal, setTxTimerType, setTxTimerStatus } = this.props;

    setTxTimerType('trade');
    setTxTimerModal(true);
    setTxTimerStatus(true);
  };

  handleConfirm = () => {
    this.handleCloseModal();
  };

  handleCloseModal = () => {
    const {
      txStatus: { status },
      setTxTimerModal,
      resetTxStatus,
    } = this.props;

    if (!status) resetTxStatus();
    else setTxTimerModal(false);
  };

  handleChangeTxValue = value => {
    const { setTxTimerValue } = this.props;

    setTxTimerValue(value);
  };

  handleEndTxTimer = () => {
    const { setTxTimerStatus } = this.props;

    setTxTimerStatus(false);
    this.setState({
      dragReset: true,
    });
  };

  renderTradeModalContent = pair => {
    const {
      txStatus: { status, value },
    } = this.props;
    const { source, target } = pair;

    const transactionLabels = [
      'sending transaction',
      'processing transaction',
      'signing transaction',
      'finishing transaction',
      'complete',
    ];

    const completed = value !== null && !status;
    const tradeText = !completed ? 'YOU ARE TRADING' : 'YOU TRADED';
    const receiveText = !completed ? 'YOU SHOULD RECEIVE' : 'YOU RECEIVED';
    const expectation = !completed
      ? 'EXPECTED FEES & SLIP'
      : 'FINAL FEES & SLIP';

    return (
      <TradeModalContent>
        <div className="left-container">
          <Label weight="bold">{tradeText}</Label>
          <CoinData asset={source} assetValue={2.49274} price={217.92} />
        </div>
        <div className="center-container">
          <TxTimer
            reset={status}
            value={value}
            onChange={this.handleChangeTxValue}
            onEnd={this.handleEndTxTimer}
          />
          {value !== 0 && (
            <Label weight="bold">{transactionLabels[value - 1]}</Label>
          )}
          {completed && <Label weight="bold">complete</Label>}
        </div>
        <div className="right-container">
          <Label weight="bold">{receiveText}</Label>
          <CoinData asset={target} assetValue={2.49274} price={217.92} />
          <Label weight="bold">{expectation}</Label>
          <div className="expected-status">
            <div className="status-item">
              <Status title="FEES" value="1.234 RUNE" />
              <Label className="price-label" size="normal" color="gray">
                $USD 110
              </Label>
            </div>
            <div className="status-item">
              <Status title="SLIP" value="0.3%" />
            </div>
          </div>
        </div>
      </TradeModalContent>
    );
  };

  render() {
    const { info, txStatus } = this.props;
    const { dragReset } = this.state;
    const pair = getPair(info);

    if (!pair) {
      return '';
    }

    const { source, target } = pair;

    const dragTitle = 'Drag to trade';
    const poolStatus = `${source}:${target}`;

    const openTradeModal = txStatus.type === 'trade' ? txStatus.modal : false;
    const coinCloseIconType = txStatus.status ? 'fullscreen-exit' : 'close';

    return (
      <ContentWrapper className="trade-detail-wrapper">
        <Row className="trade-asset-status-row">
          <Coin type={source} over={target} />
          <Status title="Pool" value={poolStatus} />
          {tradeData.map(info => (
            <Status {...info} />
          ))}
        </Row>
        <Row className="trade-detail-row">
          <Col className="trade-detail-panel" span={16}>
            <div className="trade-asset-card-wrapper">
              <div className="trade-asset-card">
                <CoinCard
                  title="You are selling"
                  asset={source}
                  amount={13.54}
                  price={2300}
                  slip={2}
                />
                <Slider className="trade-asset-slider" defaultValue={50} />
              </div>
              <img src={blackArrowIcon} alt="blackarrow-icon" />
              <div className="trade-asset-card">
                <CoinCard
                  title="You will receive"
                  asset={target}
                  amount={46000}
                  price={2530}
                  slip={2}
                />
              </div>
            </div>
            <div className="drag-confirm-wrapper">
              <Drag
                title={dragTitle}
                source={source}
                target={target}
                reset={dragReset}
                onConfirm={this.handleEndDrag}
                onDrag={this.handleDrag}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className="trade-info-wrapper">
              <Status title="Current Pool Price" value="$1.20" />
              <Status title="Pool Price After Trade" value="$1.00" />
              <Status title="Potential Reward" value="$120.03" />
            </div>
          </Col>
        </Row>
        <TradeModal
          title="TRADE CONFIRMATION"
          closeIcon={
            <Icon type={coinCloseIconType} style={{ color: '#33CCFF' }} />
          }
          visible={openTradeModal}
          footer={null}
          onCancel={this.handleCloseModal}
        >
          {this.renderTradeModalContent(pair)}
        </TradeModal>
      </ContentWrapper>
    );
  }
}

export default compose(
  connect(
    state => ({
      txStatus: state.App.txStatus,
    }),
    {
      setTxTimerType,
      setTxTimerModal,
      setTxTimerStatus,
      setTxTimerValue,
      resetTxStatus,
    },
  ),
  withRouter,
)(TradeDetail);