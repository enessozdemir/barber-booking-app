import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { Navigate } from 'react-router-dom';

type Props = {
  children: React.ReactElement;
};

export default function ProtectedRoute({ children }: Props) {
  const auth = useSelector((s: RootState) => s.auth);
  const isAuthed = Boolean(auth.user && auth.accessToken);
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}
