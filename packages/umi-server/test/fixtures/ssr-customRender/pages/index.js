import React from 'react';
import styles from './index.module.less';

const mockRequest = async () => {
  return Promise.resolve({
    list: [{ name: 'Alice' }, { name: 'Jack' }, { name: 'Tony' }],
  });
};

class Home extends React.Component {
  state = {
    list: [],
  };
  // will deprecated
  async componentWillMount() {
    const { list } = await mockRequest();
    this.setState({
      list,
    });
  }
  render() {
    const { list } = this.state;
    return (
      <div className={styles.wrapper}>
        <h1>Hello UmiJS SSR Styles</h1>
        {Array.isArray(list) && list.length > 0 && (
          <ul>
            {list.map((item, i) => (
              <li key={i.toString()}>{item.name}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default Home;
