import api from '../api/axios';

export const authAPI = {
  login: async (credentials) => {
    // Note: FastAPI expects OAuth2 password flow (FormData)
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};