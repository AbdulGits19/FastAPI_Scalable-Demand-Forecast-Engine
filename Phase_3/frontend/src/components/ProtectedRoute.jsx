import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// 1. Global Session Guard: Verifies if a user is logged in at all
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#07020d]">
        <Loader2 className="animate-spin text-purple-500" size={32} />
        <p className="text-xs font-bold text-purple-300/40 mt-2 uppercase tracking-widest">Verifying security clearances...</p>
      </div>
    );
  }

  if (!user) {
    // No session token -> Kick back to public ingestion gate
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. 🛑 RESTRICTED ADMINISTRATIVE ROLE GUARD (Supports Multi-Tier RBAC strings)
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#07020d]">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  const currentRole = user?.role || "Viewer";
  
  // ✅ PHASE 3 ADVANCED STRING PARSING GATEWAY:
  // Permits entry if the user's role text includes "admin" OR "analyst" matching your backend schemas!
  const hasClearance = currentRole.toLowerCase().includes('admin') || 
                       currentRole.toLowerCase().includes('analyst');

  if (!user || !hasClearance) {
    // Lacks operational role authority -> Safely drop back to the main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};