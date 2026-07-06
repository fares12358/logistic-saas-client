import api from '../config/axios';

export const expenseTypesService = {
  list:    (params)               => api.get('/expense-types', { params }),
  getById: (id)                   => api.get(`/expense-types/${id}`),
  create:  (data)                 => api.post('/expense-types', data),
  update:  (id, data)             => api.put(`/expense-types/${id}`, data),
  remove:  (id)                   => api.delete(`/expense-types/${id}`),
  export:  (filters, selectedIds) => api.post('/export/excel', { module: 'expenseTypes', filters, selectedIds }, { responseType: 'blob' }),
};
