import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import CustomerDashboard from '../../booking/pages/CustomerDashboard';
import BarberDashboard from '../../booking/pages/BarberDashboard';

export default function RoleBasedHome() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return null;
  }

  // Check if user is a barber
  if (user.role === 'barber') {
    return <BarberDashboard />;
  }

  // Default to customer dashboard
  return <CustomerDashboard />;
}
