import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { Navigate } from 'react-router-dom';

type Props = {
  children: React.ReactElement;
};

export default function ProtectedRoute({ children }: Props) {
  const auth = useSelector((s: RootState) => s.auth);
  // while app is initializing (trying refresh), avoid redirecting
  if (!auth.initialized) return null;
  const isAuthed = Boolean(auth.accessToken);
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}
