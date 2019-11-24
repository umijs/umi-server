import * as React from 'react';
import { connect } from 'dva';
import { Button } from 'antd-mobile';
import { Button as AntdButton } from 'antd';
import router from 'umi/router';

const News: React.SFC<{}> = props => {
  const { id, name, count, dispatch } = props || {};

  const handleClick = () => {
    dispatch({
      type: 'news/addCount',
    });
  };

  React.useEffect(
    () => () => {
      dispatch({
        type: 'news/resetCount',
      });
    },
    [],
  );
  return (
    <div>
      <AntdButton>antd Button</AntdButton>
      <p>
        {id}-{name}
      </p>
      <Button onClick={() => router.push('/profile')}>Back</Button>
      <p>---{count}---</p>
      <Button type="primary" onClick={handleClick}>
        Add
      </Button>
    </div>
  );
};

(News as any).getInitialProps = async ({ route, store, isServer }) => {
  const { id } = route.params;
  const data = [
    {
      id: 0,
      name: 'zero',
    },
    {
      id: 1,
      name: 'hello',
    },
    {
      id: 2,
      name: 'world',
    },
  ];
  return Promise.resolve(data[id] || data[0]);
};

export default connect(({ news }) => ({
  count: news.count,
}))(News);
