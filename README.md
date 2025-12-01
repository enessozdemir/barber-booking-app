# Mühendis Berber - Barber Booking & Management System

Mühendis Berber is a modern, full-stack web application designed to streamline barber shop operations. It provides a seamless booking experience for customers and a powerful management dashboard for barbers and business owners to track appointments, earnings, and expenses.

## 🚀 Key Features

### For Customers
- **Easy Booking:** Intuitive interface to book appointments with preferred barbers
- **Appointment Management:** View, modify, and cancel upcoming appointments
- **Booking History:** Track past appointments and services
- **Profile Management:** Update personal information and contact details
- **Secure Password Change:** 6-digit PIN system with enhanced security validations
- **Mobile Responsive:** Optimized experience on all devices

### For Barbers & Business Owners
- **Dashboard:** Comprehensive view of upcoming appointments and daily schedule
- **Financial Management:**
  - **Personal View:** Track individual earnings and performance
  - **Business View:** Aggregate view of total business earnings, expenses, and net profit
  - **Walk-in Customer Recording:** Quick entry for customers without appointments
- **Expense Tracking:**
  - Simplified expense entry system
  - All expenses are automatically categorized as business expenses
  - Real-time profit calculation (Earnings - Expenses)
- **Profile Management:**
  - Upload and manage profile photos
  - Update business information
- **Secure Authentication:** Robust login and registration system using JWT with refresh token rotation

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication with automatic refresh
- **Password Security:**
  - 6-digit PIN system
  - Sequential number detection (prevents 123456, 654321, etc.)
  - Old password reuse prevention
  - Bcrypt password hashing
- **Token Management:** Automatic token rotation and HttpOnly cookies
- **Rate Limiting:** Protection against brute force attacks
- **Security Headers:** Helmet middleware for enhanced security
- **Input Validation:** Zod schema validation for all API inputs

## 🛠 Technology Stack

### Frontend
- **Framework:** [React 19.1.1](https://react.dev/)
- **Build Tool:** [Vite 7.1.7](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4.1.16](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit 2.10.1](https://redux-toolkit.js.org/)
- **Routing:** [React Router 7.9.5](https://reactrouter.com/)
- **HTTP Client:** [Axios 1.13.2](https://axios-http.com/)
- **UI Components:** 
  - React Icons 5.5.0
  - React Toastify 11.0.5
  - React OTP Input 3.1.1

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express 5.1.0](https://expressjs.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Language:** [TypeScript 5.9.3](https://www.typescriptlang.org/)
- **Validation:** [Zod 4.1.12](https://zod.dev/)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **Email:** Nodemailer 7.0.10
- **File Upload:** Multer 2.0.2
- **Logging:** Winston 3.18.3
- **Security:**
  - Helmet 8.1.0
  - CORS 2.8.5
  - Express Rate Limit 8.2.1

### Tools & DevOps
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Monorepo Management:** pnpm workspaces
- **Development:** Concurrently (running client & server together)
- **Testing:** Vitest 4.0.13 (Client), Jest 30.2.0 (Server)

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `GET /auth/reset-password/:id/:token` - Verify reset token
- `POST /auth/reset-password/:id/:token` - Reset password
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change password (6-digit PIN)

### Bookings
- `GET /bookings` - List user bookings
- `POST /bookings` - Create new booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Financial
- `GET /earnings` - List earnings
- `POST /earnings/walk-in` - Record walk-in customer
- `DELETE /earnings/:id` - Delete earning record
- `GET /expenses` - List expenses
- `POST /expenses` - Add new expense
- `DELETE /expenses/:id` - Delete expense

### Barber
- `GET /barbers/:id` - Get barber information
- `POST /barbers/avatar` - Upload profile photo
- `DELETE /barbers/avatar` - Delete profile photo

## 🧪 Testing

### Client-Side Testing
We use [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for client-side testing.

To run client tests:
```bash
cd client
pnpm test
```

### Server-Side Testing
We use [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest) for server-side testing.

To run server tests:
```bash
cd server
pnpm test
```

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (`npm install -g pnpm`)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd muhendis-berber
```

### 2. Install Dependencies
Install dependencies for both client and server from the root directory:
```bash
pnpm install
```

### 3. Environment Variables

#### Server (`server/.env`)
Create a `.env` file in the `server` directory with the following variables:
```env
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# Client URL (for password reset emails)
CLIENT_URL=http://localhost:5173

# Email Configuration (for password reset)
GM_EMAIL=your_gmail@gmail.com
GM_PASSWORD=your_gmail_app_password
```

#### Client (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Running the Application
Start both client and server in development mode with a single command:
```bash
pnpm run dev
```
- **Client:** http://localhost:5173
- **Server:** http://localhost:3000

## 📂 Project Structure

```
muhendis-berber/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   ├── modules/        # Feature-based modules
│   │   │   ├── auth/       # Authentication (login, register, password reset)
│   │   │   ├── booking/    # Appointment management
│   │   │   ├── financial/  # Financial dashboard & reporting
│   │   │   ├── profile/    # User profile management
│   │   │   ├── home/       # Role-based home routing
│   │   │   └── app/        # Redux store & global state
│   │   ├── config/         # Axios setup & configuration
│   │   └── shared/         # Shared utilities & hooks
│   └── ...
├── server/                 # Backend Express Application
│   ├── src/
│   │   ├── config/         # App configuration (Supabase, etc.)
│   │   ├── modules/        # Feature-based modules
│   │   │   ├── auth/       # Authentication services
│   │   │   ├── booking/    # Booking CRUD operations
│   │   │   ├── barber/     # Barber profile management
│   │   │   ├── earnings/   # Income tracking
│   │   │   ├── expenses/   # Expense management
│   │   │   └── financial/  # Financial reporting
│   │   ├── middlewares/    # Express middlewares
│   │   └── utils/          # Utilities & helpers
│   └── ...
├── package.json            # Root package.json (scripts & workspaces)
└── pnpm-workspace.yaml     # pnpm workspace configuration
```

## ✨ Recent Updates

- ✅ Password change feature with 6-digit PIN system
- ✅ Enhanced password security (sequential number detection, old password check)
- ✅ Token refresh error fixes
- ✅ Role switching loop prevention
- ✅ Profile photo upload/delete functionality
- ✅ Walk-in customer recording
- ✅ Comprehensive financial tracking and reporting

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License.
