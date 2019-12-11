/**
 * title: Count
 */
import React from 'react';
import { Button } from 'antd';
import DocumentTitle from 'react-document-title';
import { useModel } from 'umi';
import styles from './index.css';

function Page(props) {
  const fullRet = useModel('counter');
  const partialRet = useModel('counter', c => c.counter);

  return (
    <div className={styles.normal}>
      <h1>Page count</h1>
      <DocumentTitle title="计数页面 - 标题" />
      <h2>count {partialRet}</h2>
      <Button
        type="primary"
        onClick={fullRet.increment}
        style={{
          marginRight: 8,
        }}
      >
        Add
      </Button>
      <Button onClick={fullRet.decrement}>Minus</Button>
    </div>
  );
}

export default Page;
