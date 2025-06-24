# CRM Knotsync Internal

A comprehensive **Customer Relationship Management (CRM)** and **Immigration Services Platform** built with Next.js 14, TypeScript, MongoDB, and modern UI components. This production-ready application includes advanced features like AI-powered analytics, client portals, compliance tracking, lead scoring, and robust CRUD operations.

## 🚀 Features

### Core CRM Functionality
- **Customer Management**: Complete CRUD operations with status tracking, assignment, and notes
- **Employee Management**: Role-based access control (Admin/Employee), user creation, and status management
- **Lead Management**: Lead capture, scoring, conversion tracking, and pipeline management
- **Follow-up Reminders**: Automated reminder system with notifications and scheduling

### Immigration Services
- **Client Portal**: Secure document upload, timeline tracking, payment processing
- **Compliance Checker**: Immigration law compliance verification and tracking
- **Document Management**: AI-powered document processing and organization
- **Visa Timeline Tracker**: Real-time visa application status and milestone tracking
- **Revenue Analytics**: Financial reporting and revenue forecasting

### Advanced Features
- **AI Integration**: Performance summaries, lead scoring, and predictive analytics
- **Real-time Notifications**: System-wide notification center with status updates
- **Dashboard Analytics**: Comprehensive reporting with charts and KPIs
- **Authentication System**: Secure login with role-based permissions
- **Responsive Design**: Mobile-first UI with dark/light theme support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB with proper indexing and aggregation
- **Authentication**: Custom authentication system
- **AI/ML**: Google Genkit for AI workflows
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Charts**: Recharts for data visualization

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CRM-Knotsync-Internal
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm-database?retryWrites=true&w=majority

# Application Settings
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: AI Features
GOOGLE_GENAI_API_KEY=your-google-ai-key
```

### 4. Database Setup
The application will automatically create the necessary collections and indexes on first run. Ensure your MongoDB instance is accessible.

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Initial Admin
On first launch, navigate to `/login` and use the "Create Initial Admin" option to set up your first administrator account.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected app routes
│   │   ├── admin/         # Admin-only pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── employee/      # Employee management
│   │   └── immigration/   # Immigration services
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── customers/     # Customer CRUD
│   │   ├── employees/     # Employee CRUD
│   │   ├── leads/         # Lead management
│   │   └── follow-up-reminders/ # Reminder system
│   └── client-portal/     # Public client portal
├── components/            # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── employee/         # Employee dashboard components
│   ├── immigration/      # Immigration service components
│   ├── layout/           # Layout components
│   ├── providers/        # React context providers
│   ├── shared/           # Shared components
│   └── ui/               # Base UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── actions/          # Server actions
│   ├── services/         # Business logic
│   └── startup/          # App initialization
└── ai/                   # AI workflows and integrations
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/create-initial-admin` - Create first admin user

### Customers
- `GET /api/customers` - Fetch all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer
- `DELETE /api/customers` - Delete all customers

### Employees/Users
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `GET /api/employees` - Fetch employees only

### Leads
- `GET /api/leads` - Fetch all leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead (supports soft delete)

### Follow-up Reminders
- `GET /api/follow-up-reminders` - Fetch reminders
- `POST /api/follow-up-reminders` - Create reminder
- `PUT /api/follow-up-reminders/[id]/status` - Update status
- `DELETE /api/follow-up-reminders/[id]` - Delete reminder
- `GET /api/follow-up-reminders/due` - Get due reminders

### Notifications
- `GET /api/notifications` - Fetch notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/[id]/read` - Mark as read

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, user management, system configuration
- **Employee**: Customer management, lead handling, limited admin functions

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- Role-based route protection
- API endpoint security
- Input validation and sanitization

## 📊 Database Schema

### Collections

#### Customers
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phoneNumber?: string,
  category?: string,
  status: 'active' | 'inactive' | 'prospect' | 'converted',
  assignedTo?: string,
  notes: string,
  createdAt: string,
  lastContacted: string
}
```

#### Users (Employees)
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // hashed
  role: 'admin' | 'employee',
  status: 'active' | 'suspended',
  phoneNumber?: string,
  department?: string,
  createdAt: string
}
```

#### Leads
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phoneNumber?: string,
  source: string,
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost',
  score?: number,
  assignedTo?: string,
  notes: string,
  createdAt: string,
  convertedAt?: string
}
```

#### Follow-up Reminders
```typescript
{
  _id: ObjectId,
  customerId: string,
  customerName: string,
  createdBy: string,
  createdByName: string,
  title: string,
  description?: string,
  scheduledFor: string,
  status: 'pending' | 'completed' | 'overdue',
  priority: 'low' | 'medium' | 'high',
  createdAt: string
}
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_SECRET=strong-production-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Deployment Platforms
- **Vercel**: Native Next.js deployment with automatic builds
- **Railway**: Container-based deployment with MongoDB integration
- **Google Cloud**: App Engine or Cloud Run deployment
- **AWS**: EC2, ECS, or Lambda deployment options

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Code Style
- ESLint configuration for consistent code style
- Prettier integration for automatic formatting
- TypeScript strict mode enabled
- Tailwind CSS for styling consistency

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Verify network access in MongoDB Atlas
# Whitelist your IP address or use 0.0.0.0/0 for development
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set in environment variables
- Check MongoDB user collection exists and has proper admin user
- Ensure password hashing is working correctly

#### API Errors
- Check browser Network tab for specific error responses
- Verify MongoDB connection in server logs
- Ensure proper error handling in API routes

### Development Tips
- Use MongoDB Compass for database visualization
- Enable Next.js dev tools for debugging
- Use React Developer Tools for component inspection
- Monitor browser console for client-side errors
- Check terminal output for server-side errors

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ for Knotsync Internal Operations**
