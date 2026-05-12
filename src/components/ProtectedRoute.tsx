import React from 'react';
import { Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  // Authentication is now bypassed for demo mode
  return children ? <>{children}</> : <Outlet />;
}
