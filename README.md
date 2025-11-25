# Mühendis Berber - Barber Booking & Management System

Mühendis Berber is a modern, full-stack web application designed to streamline barber shop operations. It provides a seamless booking experience for customers and a powerful management dashboard for barbers and business owners to track appointments, earnings, and expenses.

## 🚀 Key Features

### For Customers
- **Easy Booking:** Intuitive interface to book appointments with preferred barbers.
- **Mobile Responsive:** Optimized experience on all devices.

### For Barbers & Business Owners
- **Dashboard:** Comprehensive view of upcoming appointments and daily schedule.
- **Financial Management:**
  - **Personal View:** Track individual earnings and performance.
  - **Business View:** Aggregate view of total business earnings, expenses, and net profit.
- **Expense Tracking:**
  - Simplified expense entry system.
  - All expenses are automatically categorized as business expenses.
  - Real-time profit calculation (Earnings - Expenses).
- **Secure Authentication:** Robust login and registration system using JWT.

## 🛠 Technology Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **UI Components:** React Icons, React Toastify

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express 5](https://expressjs.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Validation:** [Zod](https://zod.dev/)
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer

### Tools & DevOps
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Monorepo Management:** pnpm workspaces
- **Development:** Concurrently (running client & server together)
- **Testing:** Vitest (Client), Jest (Server)

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

# Email Configuration (Optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
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
│   │   ├── modules/        # Feature-based modules (Auth, Booking, Financial, etc.)
│   │   ├── store/          # Redux store configuration
│   │   └── ...
│   └── ...
├── server/                 # Backend Express Application
│   ├── src/
│   │   ├── config/         # App configuration (Supabase, etc.)
│   │   ├── modules/        # Feature-based modules (Controllers, Services, Routes)
│   │   ├── middlewares/    # Express middlewares
│   │   └── ...
│   └── ...
├── package.json            # Root package.json (scripts & workspaces)
└── pnpm-workspace.yaml     # pnpm workspace configuration
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License.
