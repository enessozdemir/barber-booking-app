# Mühendis Berber - Client Application

Modern, full-stack randevu yönetim sistemi için React + TypeScript + Vite tabanlı client uygulaması.

## 🚀 Özellikler

### Kullanıcı Rolleri
- **Müşteri (Customer)**: Berber seçimi, randevu oluşturma, randevu yönetimi
- **Berber (Barber)**: Günlük çizelge görüntüleme, randevu yönetimi, fiyatlandırma

### Temel Özellikler
- ✅ Role-based routing ve dashboardlar
- ✅ JWT token authentication (HttpOnly cookies)
- ✅ Automatic token refresh
- ✅ Real-time slot availability
- ✅ Responsive design (Tailwind CSS)
- ✅ Dark theme UI
- ✅ Türkçe hata mesajları
- ✅ Toast notifications

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Notifications**: React Toastify
- **Form Handling**: Custom hooks

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## 🏗️ Project Structure

```
client/
├── src/
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── components/    # Login, Register, etc.
│   │   │   ├── hooks/         # useAuth, useLoginForm, etc.
│   │   │   └── store/         # Auth Redux slice
│   │   ├── booking/           # Booking module
│   │   │   ├── components/    # Booking-related components
│   │   │   ├── hooks/         # useBooking hook
│   │   │   ├── pages/         # CustomerDashboard, BarberDashboard
│   │   │   └── store/         # Booking Redux slice
│   │   ├── home/              # Home module
│   │   │   └── components/    # RoleBasedHome
│   │   └── app/               # App-level config
│   │       └── store/         # Redux store configuration
│   ├── shared/
│   │   ├── components/        # Header, etc.
│   │   └── hooks/             # useErrorHandler
│   ├── config/
│   │   ├── setupAxios.ts      # Axios interceptors
│   │   └── errorMessages.ts   # Turkish error messages
│   └── App.tsx                # Main app component
```

## 🔐 Authentication Flow

1. **Login/Register**: User credentials → JWT access token + HttpOnly refresh token
2. **Token Storage**: Access token in Redux, refresh token in HttpOnly cookie
3. **Auto Refresh**: Axios interceptor catches 401 errors and refreshes token
4. **Session Persistence**: AppInitializer attempts token refresh on app load

## 📱 User Flows

### Customer Flow
1. Login → Customer Dashboard
2. Select barber from list
3. Choose date
4. Select available time slot (red = booked, green = available)
5. Add optional note
6. Create booking
7. View "My Bookings"
8. Cancel pending bookings

### Barber Flow
1. Login → Barber Dashboard
2. Select date to view schedule
3. Click booking to open detail modal
4. Update booking status (pending → completed)
5. Add price for completed bookings
6. Delete bookings if needed

## 🎨 UI Components

### Header
- Logo: "Mühendis Berber"
- User avatar with initials
- Dropdown menu (name + logout)

### Customer Dashboard
- Tab navigation (Book Appointment / My Bookings)
- Barber cards (clickable)
- Date picker
- Time slot grid (2 columns, responsive)
- Booking cards with status colors

### Barber Dashboard
- Date selector
- Daily schedule view
- Booking cards (clickable)
- Detail modal with:
  - Customer info
  - Date & time range
  - Notes
  - Status dropdown
  - Price input
  - Delete button

## 🔧 Configuration

### Environment Variables
Create `.env` file in client directory:

```env
VITE_API_URL=http://localhost:3000
```

### Axios Setup
Global Axios configuration in `src/config/setupAxios.ts`:
- Base URL from environment
- Credentials included
- Request interceptor: Add auth token
- Response interceptor: Handle 401 and refresh token

## 🎯 Key Features

### Slot Management
- 8:00 - 20:00 time range
- 30-minute intervals
- Display format: "08:00 - 08:30"
- Booked slots: Red + disabled
- Available slots: Green + clickable
- Cancelled bookings don't block slots

### Error Handling
- Centralized error messages in Turkish
- `useErrorHandler` hook
- Toast notifications for all errors
- Axios error code mapping

### State Management
- Redux Toolkit for global state
- Auth state: user, token, isAuthenticated
- Booking state: barbers, slots, bookings
- Custom hooks for API calls

## 🚦 Routes

```
/login              - Login page
/register           - Registration page
/forgot-password    - Forgot password
/reset-password/:id/:token - Reset password
/home               - Role-based dashboard (protected)
```

## 📝 Scripts

```bash
# Development
pnpm run dev        # Start dev server (http://localhost:5173)

# Build
pnpm run build      # Build for production
pnpm run preview    # Preview production build

# Linting
pnpm run lint       # Run ESLint
```

## 🔍 Development Notes

### React Compiler
React Compiler is enabled for optimized performance. See [React Compiler docs](https://react.dev/learn/react-compiler).

### TypeScript
Strict mode enabled with path aliases:
- `@/` → `src/`

### Tailwind CSS
Custom configuration with dark theme and gradient backgrounds.

### Redux DevTools
Redux DevTools extension supported for debugging.

## 🐛 Troubleshooting

### Token Issues
- Check browser cookies for `refreshToken`
- Verify `setupAxios()` is called in `App.tsx`
- Check Redux state for `accessToken`

### Slot Display Issues
- Verify date format (YYYY-MM-DD)
- Check backend response for available slots
- Ensure cancelled bookings are excluded

### Barber Not Found
- Verify user has `role: 'barber'`
- Check `barbers` table has record with `id = user.id`
- Ensure `active = true` in barbers table

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Private project - All rights reserved
