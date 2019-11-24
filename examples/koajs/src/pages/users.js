/**
 * title: Users
 */
import { useEffect, useState } from 'react';
import styles from './users.css';

function Page(props) {
  const [list, setList] = useState(props.list || []);
  useEffect(() => {
    // TODO bug not trigger getInit when change route
    if (Array.isArray(props.list) && !props.list.length) {
      setList(['foo', 'bar']);
    }
  }, []);
  return (
    <div className={styles.normal}>
      <h1>Page users</h1>
      <h2>users</h2>
      <ul>
        {(list || []).map(user => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
}

Page.getInitialProps = async () =>
  // console.log('Users getInitialProps');
  Promise.resolve({
    list: ['foo', 'bar'],
  });
export default Page;
