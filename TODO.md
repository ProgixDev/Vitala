# Backend Functionalities TODO List

## Authentication & Authorization
- [x] User login (email/password authentication)
- [x] Patient sign up (full name, email, phone number)
- [x] Patient password creation and validation
- [x] Patient medical profile creation (gender, DOB, blood type, allergies, chronic illnesses, height, weight)
- [x] Patient email verification
- [x] Nurse sign up (full name, email, phone number)
- [x] Nurse password creation and validation
- [x] Nurse ID document upload (front and back)
- [x] Nurse selfie verification upload
- [x] Nurse verification review and approval/rejection
- [x] Forgot password functionality
- [x] Password reset via email
- [x] User logout
- [x] Session management
- [x] Token refresh

## User Management
- [x] Get current user profile
- [x] Update user profile (name, email, phone)
- [x] Update medical profile
- [x] Upload profile picture
- [x] Change password
- [x] Delete user account
- [x] Get user by email/ID
- [x] Get all users (admin)
- [x] User role management

## Location Management
- [x] Save user location (coordinate, address, label)
- [x] Get user locations
- [x] Update location
- [x] Delete location
- [x] Geocoding (address to coordinates)
- [x] Reverse geocoding (coordinates to address)

## Appointments
- [x] Create appointment (normal booking)
- [x] Create emergency appointment
- [x] Get user appointments (patient)
- [x] Get nurse appointments
- [x] Get appointment by ID
- [x] Update appointment status (pending, confirmed, on-the-way, in-progress, completed)
- [x] Assign nurse to appointment
- [x] Accept appointment request (nurse)
- [x] Decline appointment request (nurse)
- [x] Cancel appointment
- [x] Delete appointment
- [x] Get available time slots
- [x] Check nurse availability
- [x] Appointment notifications

## Payment Processing
- [x] Process payment (credit card, PayPal) - Mock implementation
- [x] Save payment method - Mock implementation
- [x] Get saved payment methods - Mock implementation
- [x] Set default payment method - Mock implementation
- [x] Delete payment method - Mock implementation
- [x] Update payment status
- [x] Get payment by appointment ID
- [x] Generate payment receipt
- [x] Download receipt PDF - Mock implementation
- [x] Payment webhook handling - Not implemented (mock system)
- [x] Refund processing

## Transaction History
- [ ] Get user transactions
- [ ] Filter transactions (all, completed, pending, failed)
- [ ] Get transaction by ID
- [ ] Calculate total spent
- [ ] Calculate total refunds

## Notifications
- [ ] Send push notification
- [ ] Send email notification
- [ ] Send SMS notification
- [ ] Get user notifications
- [ ] Mark notification as read
- [ ] Mark all notifications as read
- [ ] Delete notification
- [ ] Clear all notifications
- [ ] Update notification preferences
- [ ] Notification delivery status

## Emergency Services
- [ ] Create emergency nurse alert
- [ ] Create ambulance service request
- [ ] Send family alert notifications
- [ ] Get emergency contacts
- [ ] Add emergency contact
- [ ] Update emergency contact
- [ ] Delete emergency contact
- [ ] Emergency service status tracking

## Nurse Management
- [ ] Get nurse profile
- [ ] Update nurse profile
- [ ] Get nurse availability
- [ ] Get nurse schedule
- [ ] Update nurse schedule
- [ ] Get nurse ratings
- [ ] Get nurse reviews
- [ ] Get nurse specializations
- [ ] Search nurses
- [ ] Filter nurses by location/service
- [ ] Get nearby nurses

## Services
- [ ] Get all services
- [ ] Get service by ID
- [ ] Search services
- [ ] Filter services
- [ ] Get service pricing
- [ ] Get service availability

## Ratings & Reviews
- [ ] Submit rating for nurse
- [ ] Submit review for nurse
- [ ] Get nurse ratings
- [ ] Get nurse reviews
- [ ] Update review
- [ ] Delete review
- [ ] Report inappropriate review

## Settings
- [ ] Get user settings
- [ ] Update notification preferences (push, email, SMS)
- [ ] Update privacy settings
- [ ] Update location services preference
- [ ] Update biometric authentication preference
- [ ] Update language preference

## File Upload
- [ ] Upload ID document (front)
- [ ] Upload ID document (back)
- [ ] Upload selfie
- [ ] Upload profile picture
- [ ] Delete uploaded files

## Admin Functions
- [ ] Admin login
- [ ] Verify nurse account
- [ ] Reject nurse account
- [ ] Get all pending nurse verifications
- [ ] Get all users
- [ ] Get all appointments
- [ ] Get system statistics
- [ ] Manage services

## Real-time Features
- [ ] Real-time appointment status updates
- [ ] Real-time nurse location tracking
- [ ] Real-time chat between patient and nurse
- [ ] Real-time notifications

## Analytics & Reporting
- [ ] Appointment analytics
- [ ] User analytics
- [ ] Revenue analytics
- [ ] Service popularity metrics
- [ ] Nurse performance metrics

