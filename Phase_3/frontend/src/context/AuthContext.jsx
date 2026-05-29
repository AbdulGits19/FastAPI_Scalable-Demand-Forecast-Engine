import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Will hold: { username, email, role }
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // 1. Check validation on page refresh or mount
    useEffect(() => {
        const hydrateUserSession = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // Hits your newly updated Phase 3 /me endpoint
                const response = await axios.get('http://127.0.0.1:8000/auth/me');
                setUser(response.data); 
            } catch (error) {
                console.error("❌ Session hydration failed. Token invalid.");
                logout();
            } finally {
                setLoading(false);
            }
        };

        hydrateUserSession();
    }, [token]);

    // 2. Login Logic Handlers
    const login = async (username, password) => {
        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post('http://127.0.0.1:8000/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token, user: profileData } = response.data;

            localStorage.setItem('token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            setToken(access_token);
            setUser(profileData); // Receives all-caps role e.g., 'VIEWER' or 'SUPER_ADMIN'

            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.detail || "Authentication validation failed." 
            };
        } finally {
            setLoading(false);
        }
    };

    // 3. Logout Logic Handlers
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    // Role state utilities for clean ternary layout toggles in UI
    const isSuperAdmin = () => user?.role === 'SUPER_ADMIN';
    const isAnalyst = () => user?.role === 'ANALYST' || user?.role === 'SUPER_ADMIN';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isSuperAdmin, isAnalyst }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);