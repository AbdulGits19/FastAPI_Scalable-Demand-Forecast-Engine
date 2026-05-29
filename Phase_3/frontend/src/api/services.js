import axiosInstance from './axios';

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================
export const authService = {
  login: async (username, password) => {
    // FastAPI OAuth2PasswordRequestForm expects multi-part form data
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axiosInstance.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // Expected output: { access_token: "...", token_type: "bearer" }
  },
  
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};

// ==========================================
// 2. ANALYTICS & DATASETS MODULE
// ==========================================
export const dataService = {
  getDatasetsList: async () => {
    const response = await axiosInstance.get('/datasets/list');
    return response.data;
  },
  
  getProducts: async (datasetName) => {
    const response = await axiosInstance.get(`/datasets/${datasetName}/products`);
    return response.data;
  },
  
  getDashboardSummary: async (datasetName = '') => {
    const url = datasetName ? `/analytics/summary?dataset_name=${datasetName}` : '/analytics/summary';
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

// ==========================================
// 3. ADVANCED MACHINE LEARNING FORECASTS
// ==========================================
export const forecastService = {
  executeForecast: async (productName, days = 7, modelType = 'linear') => {
    const response = await axiosInstance.get(`/forecast/${productName}?days=${days}&model_type=${modelType}`);
    return response.data;
  },
  
  getAccuracyComparison: async (productName) => {
    const response = await axiosInstance.get(`/forecast/compare?product_name=${productName}`);
    return response.data; // Expected output: { best_model: "...", comparison: [...] }
  },
  
  getPaginatedHistory: async (page = 1, size = 10) => {
    const response = await axiosInstance.get(`/forecast/history?page=${page}&size=${size}`);
    return response.data;
  },
  
  getProductActualTimeline: async (productName, startDate, endDate) => {
    const response = await axiosInstance.get(`/forecast/product-history?product_name=${productName}&start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  },
};

// ==========================================
// 4. PRIVILEGED SYSTEM ADMIN OPERATIONS
// ==========================================
export const adminService = {
  getSystemKpis: async () => {
    const response = await axiosInstance.get('/admin/dashboard-stats');
    return response.data;
  },
  
  getSystemActivityLogs: async () => {
    const response = await axiosInstance.get('/admin/system-activity');
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },
  
  grantAdmin: async (userId) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/grant-admin`);
    return response.data;
  },
  
  revokeAdmin: async (userId) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/revoke-admin`);
    return response.data;
  },
};