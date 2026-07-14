# Vitala Backend API

Healthcare nursing application backend built with Node.js, Express, and MongoDB.

## Features

- ✅ User Authentication (JWT-based)
  - Patient & Nurse registration
  - Login/Logout
  - OTP verification
  - Forgot password / Password reset
  - Token refresh

- ✅ User Management
  - Profile management
  - Medical profile (for patients)
  - Location management
  - Settings management

- ✅ Appointments
  - Create/Read/Update/Delete appointments
  - Emergency appointments
  - Status tracking (pending, confirmed, on-the-way, in-progress, completed)
  - Accept/Decline by nurse

- ✅ Notifications
  - Push notifications
  - Email notifications
  - Mark as read/unread
  - Filter by type

- ✅ Real-time Features (Socket.IO)
  - Live nurse location tracking
  - Real-time appointment updates

- ✅ File Upload
  - Profile pictures
  - ID documents
  - Selfie verification
  - Cloudinary integration

## Installation

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and other credentials

4. Create uploads directory:

```bash
mkdir uploads
```

5. Run the server:

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## Environment Variables

See `.env.example` for required environment variables.

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register/patient` - Register patient
- `POST /api/auth/register/nurse` - Register nurse (with file upload)
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/medical-profile` - Update medical profile
- `POST /api/users/profile-picture` - Upload profile picture
- `PUT /api/users/change-password` - Change password
- `GET /api/users/locations` - Get user locations
- `POST /api/users/locations` - Add location
- `DELETE /api/users/locations/:id` - Delete location
- `PUT /api/users/settings` - Update settings

### Appointment Endpoints

- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update status
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/accept` - Accept appointment (nurse)
- `PUT /api/appointments/:id/decline` - Decline appointment (nurse)

### Notification Endpoints

- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Database Models

- **User** - Patient, Nurse, and Admin users
- **Appointment** - Appointment bookings
- **Service** - Healthcare services
- **Payment** - Payment transactions
- **Notification** - User notifications
- **Review** - Nurse reviews and ratings
- **EmergencyContact** - Emergency contact information

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Request sanitization
- Rate limiting
- Helmet for security headers
- CORS configuration
- File upload validation

## TODO

Additional features to implement:

- Payment processing (Stripe integration)
- Services management
- Reviews and ratings
- Emergency services
- Admin panel
- Analytics and reporting
- SMS integration (Twilio)

## License

ISC
