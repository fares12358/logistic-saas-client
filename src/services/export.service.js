import api from '../config/axios';

const BASE = '/export';

export const exportService = {
  /**
   * Download a single module as Excel.
   * @param {string} module
   * @param {object} filters   – current list filters
   * @param {string[]} selectedIds – empty = export all matching filters
   */
  exportExcel: ({ module, filters = {}, selectedIds = [] }) =>
    api.post(`${BASE}/excel`, { module, filters, selectedIds }, { responseType: 'blob' }),

  /**
   * Download multiple modules as a ZIP containing one Excel per module.
   * @param {Array<{module, filters, selectedIds}>} exports
   */
  exportZip: (exports) =>
    api.post(`${BASE}/zip`, { exports }, { responseType: 'blob' }),
};
