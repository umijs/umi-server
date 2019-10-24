/**
 * title: Github Trending using umi ssr
 */
import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import styles from './index.less';

import { List, Avatar, Tag, Icon } from 'antd';
import fetch from 'umi-request';

function Page(props) {
  const [data, setData] = useState(props.data || []);
  const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
  const { search } = props.location;
  useEffect(() => {
    if (!isEqual(data, props.data)) {
      (async () => {
        const res = await fetch(`https://github-trending-api.now.sh/repositories${search}`);
        setData(res);
      })();
    }
  }, [search, data]);
  return (
    <div className={styles.normal}>
      <h1>Github Trending</h1>

      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={<p className={styles.title}>
                <a target="_blank" href={item.url}>{item.name}</a>
                <Tag style={{ marginRight: 8 }} color={item.languageColor}>{item.language}</Tag>
                <span className={styles.star}><Icon theme="filled" type="star" />{item.stars}</span>
              </p>}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </div>
  );
}

Page.getInitialProps = async ({ store, route, isServer, req }) => {
  // console.log('Home getInitialProps', store, route, isServer);
  const res = await fetch(`https://github-trending-api.now.sh/repositories${req.url || ''}`);
  return {
    data: res
  };
};

export default Page;
