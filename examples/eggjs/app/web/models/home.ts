import { Model } from 'dva';
import { queryRestaurantData } from '@/services/home';

const HomeModel: Model = {
  namespace: 'home',
  state: {
    rank_id: '',
    coords: {
      latitude: '30.274151',
      longitude: '120.155151',
    },
    rests: [],
  },
  effects: {
    *queryRests({ payload, location }, { put, call, select }) {
      const coords = yield select(({ home }) => home.coords);
      const res = yield call(queryRestaurantData, {
        ...payload,
        ...coords,
      });
      if (res) {
        yield put({
          type: 'saveRests',
          payload: res || {},
          location,
        });
      }
    },
  },
  reducers: {
    saveRests(state, { payload, location }) {
      return {
        rests: payload.items || [],
        rank_id: payload.meta.rank_id || '',
        location,
      };
    },
    changeCoords(state, { payload }) {
      return {
        coords: payload,
      };
    },
  },
};

export default HomeModel;
