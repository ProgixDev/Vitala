# Vitala Backend - Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

## Installation Steps

### 1. Install Dependencies

```powershell
cd server
npm install
```

### 2. Environment Setup

The `.env` file has been pre-configured with your MongoDB connection string. Update the following services as needed:

**Email Service (Nodemailer):**

- Update `EMAIL_USER` and `EMAIL_PASSWORD` with your Gmail app password
- [How to get Gmail app password](https://support.google.com/accounts/answer/185833)

**SMS Service (Twilio) - Optional:**

- Sign up at [twilio.com](https://www.twilio.com)
- Update `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`

**File Upload (Cloudinary) - Optional:**

- Sign up at [cloudinary.com](https://cloudinary.com)
- Update `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`

**Payment (Stripe) - Optional:**

- Sign up at [stripe.com](https://stripe.com)
- Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

### 3. Create Uploads Directory

```powershell
mkdir uploads
```

### 4. Run the Server

**Development mode (with auto-restart):**

```powershell
npm run dev
```

**Production mode:**

```powershell
npm start
```

The server will run on `http://localhost:5000`

### 5. Test the API

**Health Check:**

```powershell
curl http://localhost:5000/api/health
```

Or open in browser: http://localhost:5000/api/health

## API Endpoints

### Authentication

- POST `/api/auth/register/patient` - Register patient
- POST `/api/auth/register/nurse` - Register nurse
- POST `/api/auth/login` - Login
- POST `/api/auth/verify-otp` - Verify OTP
- POST `/api/auth/forgot-password` - Forgot password
- POST `/api/auth/reset-password/:token` - Reset password
- POST `/api/auth/refresh-token` - Refresh token
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user

### Users

- GET `/api/users/profile` - Get profile
- PUT `/api/users/profile` - Update profile
- PUT `/api/users/medical-profile` - Update medical profile
- POST `/api/users/profile-picture` - Upload profile picture
- PUT `/api/users/change-password` - Change password
- GET `/api/users/locations` - Get locations
- POST `/api/users/locations` - Add location
- DELETE `/api/users/locations/:id` - Delete location
- PUT `/api/users/settings` - Update settings

### Appointments

- GET `/api/appointments` - Get appointments
- POST `/api/appointments` - Create appointment
- GET `/api/appointments/:id` - Get appointment
- PUT `/api/appointments/:id/status` - Update status
- PUT `/api/appointments/:id/cancel` - Cancel
- PUT `/api/appointments/:id/accept` - Accept (nurse)
- PUT `/api/appointments/:id/decline` - Decline (nurse)

### Notifications

- GET `/api/notifications` - Get notifications
- PUT `/api/notifications/:id/read` - Mark as read
- PUT `/api/notifications/read-all` - Mark all as read
- DELETE `/api/notifications/:id` - Delete

## Testing with Postman/Thunder Client

### 1. Register a Patient

**POST** `http://localhost:5000/api/auth/register/patient`

**Body (JSON):**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "password": "password123",
  "medicalProfile": {
    "gender": "male",
    "bloodType": "O+",
    "allergies": ["Penicillin"],
    "chronicIllnesses": []
  }
}
```

### 2. Login

**POST** `http://localhost:5000/api/auth/login`

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

### 3. Use Token for Protected Routes

Add to request headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Database

MongoDB Atlas connection is already configured in `.env`:

```
MONGODB_URI=mongodb+srv://msideneche_db_user:mohamed2003@cluster0.6m1j1ty.mongodb.net/vitala
```

Database name: `vitala`

## Socket.IO Events

Real-time features are available via Socket.IO:

**Client connection:**

```javascript
const socket = io("http://localhost:5000");

// Join user room
socket.emit("join", userId);

// Join appointment room
socket.emit("joinAppointment", appointmentId);

// Update nurse location
socket.emit("updateLocation", { appointmentId, location });

// Listen for location updates
socket.on("locationUpdate", (location) => {
  console.log("Nurse location:", location);
});
```

## Troubleshooting

### MongoDB Connection Issues

- Check if IP is whitelisted in MongoDB Atlas
- Verify credentials in `.env`

### Port Already in Use

```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Module Not Found

```powershell
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Integrate with Frontend:**
   - Update frontend API calls to point to `http://localhost:5000/api`
   - Use the token from login response for authenticated requests

2. **Configure Email:**
   - Set up Gmail app password for OTP and notifications

3. **Add Services:**
   - Create healthcare services in the database
   - Implement service management endpoints

4. **Payment Integration:**
   - Set up Stripe account
   - Test payment flows

## Support

For issues or questions, check:

- Server logs in terminal
- MongoDB Atlas logs
- `.env` configuration
