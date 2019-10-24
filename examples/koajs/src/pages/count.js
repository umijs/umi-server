/**
 * title: Count
 */
import React from 'react';
import { Button } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import styles from './count.css';

function Page(props) {
  React.useEffect(() => {
    return () => {
      props.dispatch({
        type: 'count/reset',
      })
    }
  }, []);
  return (
    <div className={styles.normal}>
      <h1>Page count</h1>
      <DocumentTitle title="计数页面 - 标题" />
      <h2>count {props.count}</h2>
      <Button type="primary" onClick={() => {
        props.dispatch({
          type: 'count/add',
        });
      }}>Add</Button>
    </div>
  );
}

Page.getInitialProps = async ({ store, route, isServer }) => {
  // console.log('Count getInitialProps', store, route, isServer);
  await store.dispatch({
    type: 'count/reset',
  });
  await store.dispatch({
    type: 'count/init',
  });
};

export default connect(state => {
  return {
    count: state.count,
  }
})(Page);
