import api from '../config/axios';

const BASE = '/bookings';

export const bookingsService = {
  list:            (params)      => api.get(BASE, { params }),
  getById:         (id)          => api.get(`${BASE}/${id}`),
  create:          (data)        => api.post(BASE, data),
  update:          (id, data)    => api.put(`${BASE}/${id}`, data),
  remove:          (id)          => api.delete(`${BASE}/${id}`),
  getVoyagePorts:  (voyageId)    => api.get(`${BASE}/voyage-ports/${voyageId}`),
};
