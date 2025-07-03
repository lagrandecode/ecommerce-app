# Admin and Cashier Setup Guide

## Quick Login Credentials

### Admin Account
- **Email**: `admin@admin.com`
- **Password**: `123456`
- **Role**: Admin (full access)

### Cashier Account  
- **Email**: `cashier@cashier.com`
- **Password**: `123456`
- **Role**: Cashier (view purchases and user activities)

## Features Implemented

### Admin Dashboard (`/admin`)
- ✅ View all users and manage roles
- ✅ Create new cashier accounts
- ✅ Delete users
- ✅ View all purchases and user activities
- ✅ Full product CRUD operations
- ✅ User activity monitoring

### Cashier Dashboard (`/cashier`)
- ✅ View all purchases made by users
- ✅ Search and filter orders
- ✅ View detailed order information
- ✅ Monitor customer activities
- ✅ View order status and totals

## How to Test

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Login as Admin:**
   - Go to http://localhost:3000/login
   - Email: `admin@admin.com`
   - Password: `123456`
   - Access admin dashboard at `/admin`

3. **Login as Cashier:**
   - Go to http://localhost:3000/login
   - Email: `cashier@cashier.com`
   - Password: `123456`
   - Access cashier dashboard at `/cashier`

4. **Test Admin Features:**
   - Create new cashier accounts
   - View all users
   - Manage user roles
   - View purchase analytics

5. **Test Cashier Features:**
   - View all purchases
   - Search orders
   - View order details
   - Monitor customer activity

## Navigation

- **Admin users** will see "Admin" link in navbar
- **Cashier users** will see "Cashier" link in navbar
- Both roles have access to their respective dashboards
- Regular users cannot access admin or cashier areas

## Security

- Role-based access control implemented
- Predefined accounts are protected from modification
- Only admins can create new cashier accounts
- Cashiers can only view data, not modify user roles

## Next Steps

1. Set up Firebase (follow FIREBASE_SETUP.md)
2. Create environment files
3. Test the login functionality
4. Explore admin and cashier dashboards

Your admin and cashier system is ready! 🎉 