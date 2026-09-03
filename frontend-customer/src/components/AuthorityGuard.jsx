import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AuthorityGuard ensures that only authenticated users
 * with the specified roles can access the protected routes.
 * 
 * @param {Array<string>} allowedRoles - e.g. ['customer'], ['worker'], ['coop_admin']
 */
export default function AuthorityGuard({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Verifying authority...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not allowed, redirect to unauthorized page with context
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          currentRole: user.role,
          allowedRoles,
          from: location.pathname
        }}
        replace
      />
    );
  }

  return children;
}
