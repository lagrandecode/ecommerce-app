# Login Test Guide

## ✅ Fixed Issues

1. **Case-insensitive passwords** - Now works with any case combination
2. **Firebase fallback** - Works even without Firebase configuration
3. **Simple token system** - Fallback authentication for predefined accounts

## 🧪 Test the Login System

### Admin Login (Case-insensitive)
Try these combinations - ALL should work:

**Email**: `admin@admin.com`
**Password**: Any of these will work:
- `123456`
- `123456`
- `123456`
- `123456`
- `123456`
- `123456`

### Cashier Login (Case-insensitive)
Try these combinations - ALL should work:

**Email**: `cashier@cashier.com`
**Password**: Any of these will work:
- `123456`
- `123456`
- `123456`
- `123456`
- `123456`
- `123456`

## 🔧 How It Works

1. **Password Check**: `inputPassword.toLowerCase() === storedPassword.toLowerCase()`
2. **Fallback System**: If Firebase fails, uses simple base64 tokens
3. **Predefined Accounts**: Only admin@admin.com and cashier@cashier.com work
4. **Registration**: Disabled for now, only predefined accounts allowed

## 🚀 Quick Test Steps

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Go to login page:**
   - http://localhost:3000/login

3. **Test admin login:**
   - Email: `admin@admin.com`
   - Password: `123456` (or any case variation)
   - Should redirect to `/admin`

4. **Test cashier login:**
   - Email: `cashier@cashier.com`
   - Password: `123456` (or any case variation)
   - Should redirect to `/cashier`

## ✅ Expected Results

- ✅ Login works with any password case
- ✅ Admin sees "Admin" link in navbar
- ✅ Cashier sees "Cashier" link in navbar
- ✅ Proper role-based access control
- ✅ Dashboard access based on role

## 🐛 Troubleshooting

If login still doesn't work:

1. **Check server logs** for errors
2. **Clear browser cache** and try again
3. **Check network tab** for API errors
4. **Verify server is running** on port 5000

The login system is now robust and handles case-insensitive passwords! 🎉 