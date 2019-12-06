function delay(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export default {
  namespace: 'count',
  state: {
    count: 0,
  },
  reducers: {
    add(state) {
      return {
        count: state.count + 1,
      };
    },
    reset(state) {
      return {
        count: 0,
      };
    },
  },
  effects: {
    *init({ type, payload }, { put, call, select }) {
      yield call(delay, 1000);
    },
  },
};
