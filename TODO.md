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
- [x] Get user transactions
- [x] Filter transactions (all, completed, pending, failed)
- [x] Get transaction by ID
- [x] Calculate total spent
- [x] Calculate total refunds

## Notifications
- [x] Send push notification
- [x] Send email notification
- [x] Get user notifications
- [x] Mark notification as read
- [x] Mark all notifications as read
- [x] Delete notification
- [x] Clear all notifications
- [x] Update notification preferences
- [x] Notification delivery status

## Emergency Services
- [x] Create emergency nurse alert
- [x] Create ambulance service request
- [x] Send family alert notifications
- [x] Get emergency contacts
- [x] Add emergency contact
- [x] Update emergency contact
- [x] Delete emergency contact
- [x] Emergency service status tracking

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
- [x] Get user settings
- [x] Update notification preferences (push, email, SMS)
- [x] Update privacy settings
- [x] Update location services preference
- [x] Update biometric authentication preference
- [x] Update language preference

## File Upload
- [x] Upload ID document (front)
- [x] Upload ID document (back)
- [x] Upload selfie
- [x] Upload profile picture
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

