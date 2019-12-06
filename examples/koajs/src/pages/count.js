/**
 * title: Count
 */
import React from 'react';
import { Button } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import styles from './count.css';

function Page(props) {
  React.useEffect(
    () => () => {
      props.dispatch({
        type: 'count/reset',
      });
    },
    [],
  );
  return (
    <div className={styles.normal}>
      <h1>Page count</h1>
      <DocumentTitle title="计数页面 - 标题" />
      <h2>count {props.count}</h2>
      <Button
        type="primary"
        onClick={() => {
          props.dispatch({
            type: 'count/add',
          });
        }}
      >
        Add
      </Button>
    </div>
  );
}

export default connect(state => ({
  count: state.count.count,
}))(Page);
