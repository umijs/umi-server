import styles from './index.css';

function Page(props) {
  return <div className={styles.normal}>{props.children}</div>;
}

export default Page;
