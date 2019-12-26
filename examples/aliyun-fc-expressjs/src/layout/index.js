import { Menu } from 'antd';
import { Link } from 'umi';
import styles from './index.css';

function Page(props) {
  const { search } = props.location;
  return (
    <div className={styles.normal}>
      <Menu selectedKeys={[props.location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to={`/${search}`}>Home</Link>
        </Menu.Item>
        <Menu.Item key="/users">
          <Link to={`/users${search}`}>Users</Link>
        </Menu.Item>
        <Menu.Item key="/count">
          <Link to={`/count${search}`}>Count</Link>
        </Menu.Item>
      </Menu>
      {props.children}
    </div>
  );
}

export default Page;
