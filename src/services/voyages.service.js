import api from '../config/axios';

const BASE = '/voyages';

export const voyagesService = {
  list:    (params)      => api.get(BASE, { params }),
  getById: (id)          => api.get(`${BASE}/${id}`),
  update:  (id, data)    => api.put(`${BASE}/${id}`, data),
};
