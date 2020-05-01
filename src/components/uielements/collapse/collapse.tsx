import React from 'react';
import { Collapse as AntdCollapse } from 'antd';
import { CollapseProps } from 'antd/lib/collapse';

import { CollapseWrapper } from './collapse.style';
import Label from '../label';
import { Faq } from './data';

const { Panel } = AntdCollapse;

export type ComponentProps = {
  data: Faq[];
  className?: string;
};

export type Props = ComponentProps & CollapseProps;

const Collapse: React.FC<Props> = (props: Props): JSX.Element => {
  const { data, className = '', ...otherProps } = props;

  return (
    <CollapseWrapper
      className={`collapse-wrapper ${className}`}
      bordered={false}
      {...otherProps}
    >
      {data.map((value, index) => {
        const { question, answer } = value;

        return (
          <Panel
            header={question}
            className="collapse-panel-wrapper"
            key={index}
          >
            <Label size="big" color="normal">
              {answer}
            </Label>
          </Panel>
        );
      })}
    </CollapseWrapper>
  );
};

export default Collapse;