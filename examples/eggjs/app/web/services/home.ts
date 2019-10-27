import request from '@/utils/request';

export const queryRestaurantData = params => request('/restapi/shopping/v3/restaurants', {
    params,
  })
