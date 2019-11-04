import React from 'react';
import styles from './index.module.less';
import data from './data.json';

const { useState } = React;

const Home = props => {
  const [count, setCount] = useState(0);
  const { data = [] } = props;
  const handleClick = () => {
    setCount(count => count + 1);
  };
  return (
    <div className={styles.wrapper}>
      <h1>Hello UmiJS SSR Styles</h1>
      {Array.isArray(data) && data.length > 0 && (
        <ul>
          {data.map((item, i) => (
            <li key={i.toString()}>
              <p>{item.name}</p>
              <p>{item.title}</p>
              <p>{item.description}</p>
              <a target="_blank" href={item.url}>
                {item.name}
              </a>
              <span>{item.language}</span>
              <span>{item.stars}</span>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleClick}>{count}</button>
    </div>
  );
};

Home.getInitialProps = async ({ route, isServer }) => {
  return Promise.resolve({
    data,
  });
};

export default Home;
