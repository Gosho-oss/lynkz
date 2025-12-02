# Lynkz - Setup & Feature Guide

## 🎨 New Features

### 1. Orange & Yellow Theme
The entire app now uses an orange and yellow color scheme matching your logo:
- Primary color: Orange (#FF8800 / HSL: 35 100% 50%)
- All UI elements updated with the new color scheme
- Consistent branding across light and dark modes

### 2. Admin Dashboard
A complete admin panel with user management capabilities.

#### Admin Credentials
**Email:** `petkovwork11@gmail.com`  
**Password:** `gR8$kN1!wH5^bV3@qT7Zp0#LxF2mEy`  
**Admin Panel Password:** `u#9FZ!3pQm^T2x@L7v$eR1k&G0hYWc8Sjd4NPa5XqVbEr`

#### Admin Features
- **Switch to Admin Mode**: Click the "Admin Mode" button in the dashboard header
- **View All Users**: See complete list of registered users
- **Manage Subscriptions**: Change users between Free, Starter, and Premium tiers
- **View User Details**: See user profiles, links, and activity
- **Track Last Login**: Monitor when users last accessed the platform
- **Delete Users**: Remove user accounts (except your own admin account)
- **View Dashboards**: Access any user's dashboard as admin

### 3. Subscription Tiers
Three subscription levels with different features:

#### Free Tier
- Basic link management
- Standard themes
- Profile customization

#### Starter Tier
- Everything in Free
- Enhanced features (managed by admin)
- Starter badge display

#### Premium Tier
- Everything in Starter
- All premium themes
- Advanced analytics (coming soon)
- Priority support
- Crown badge display
- Remove branding (coming soon)

**Upgrade Button**: Free users see an "Upgrade to Premium" button with Stripe placeholder

### 4. QR Code Generation
Generate QR codes for user profiles:
- Click "QR Code" button in dashboard header
- Download QR code as PNG
- Share profile link directly
- 400x400px high-quality QR codes

### 5. Stripe Integration Placeholders
Ready for premium payment integration:
- Upgrade button in sidebar for free users
- Placeholder alert showing premium features
- Backend infrastructure ready for Stripe webhooks

## 🚀 Setup Instructions

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push
```

### 2. Create Admin Account
```bash
# 1. First, register an account using the admin email
#    Go to: http://localhost:5000/register
#    Email: petkovwork11@gmail.com
#    Password: gR8$kN1!wH5^bV3@qT7Zp0#LxF2mEy
#    Username: your choice

# 2. Run the admin setup script
npm run admin:setup
```

This will:
- Set your account role to "admin"
- Upgrade subscription to "premium"
- Display your admin credentials

### 3. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📱 Using Admin Features

### Accessing Admin Mode
1. Log in with admin email: `petkovwork11@gmail.com`
2. Click "Admin Mode" button in dashboard header
3. Enter admin password: `u#9FZ!3pQm^T2x@L7v$eR1k&G0hYWc8Sjd4NPa5XqVbEr`
4. Access admin dashboard

### Managing Users
- **View Users**: See all registered users in a table
- **Change Subscription**: Use dropdown to change user tier (Free/Starter/Premium)
- **View Profile**: Click eye icon to see user details and links
- **Delete User**: Click trash icon to remove a user
- **Last Login**: Monitor user activity

### QR Code Feature
1. Click "QR Code" button in dashboard
2. QR code generates automatically
3. Share or download as needed

## 🎨 Theme Colors Reference

### Light Mode
- Primary: `hsl(35 100% 50%)` - Orange
- Primary (light): `hsl(35 100% 50% / 0.1)` - Light orange background
- Accent: Orange to Yellow gradient

### Dark Mode
- Primary: `hsl(35 100% 50%)` - Orange (same)
- Muted: `hsl(35 6% 16%)` - Dark orange tint
- Accent: `hsl(35 10% 14%)` - Dark orange accent

### Premium Gradient
```css
bg-gradient-to-r from-orange-500 to-yellow-500
```

## 🔒 Security Notes

### Admin Password
The admin panel password is separate from the login password for extra security:
- Login password: Used for Firebase authentication
- Admin panel password: Required to access admin features
- Both passwords are hardcoded as specified

### Password Storage
- User passwords: Managed by Firebase Authentication (secure)
- Admin panel password: Validated server-side
- All admin routes protected by middleware

## 📊 Database Schema Updates

New fields added to `users` table:
```typescript
- role: string (default: "user") // "user" | "admin"
- subscriptionTier: string (default: "free") // "free" | "starter" | "premium"
- lastLoginAt: timestamp // Updated on each login
```

## 🎯 Next Steps

### To Enable Stripe Integration:
1. Get Stripe API keys
2. Update environment variables
3. Replace placeholder alerts with Stripe checkout
4. Add webhook handlers for subscription events

### Recommended Enhancements:
- Email notifications for admin actions
- Analytics dashboard for admins
- Bulk user management
- Export user data
- Advanced filtering and search

## 📝 API Endpoints

### Admin Routes
```
POST   /api/admin/verify           - Verify admin password
GET    /api/admin/users            - Get all users
GET    /api/admin/users/:id        - Get user details
PATCH  /api/admin/users/:id/subscription - Update subscription
DELETE /api/admin/users/:id        - Delete user
```

### QR Code
```
GET    /api/qr/:username           - Generate QR code for profile
```

All admin routes require:
- Firebase authentication token (Bearer)
- Admin password (x-admin-password header)

## 🐛 Troubleshooting

### Admin setup script fails
- Make sure you've registered with the admin email first
- Check database connection
- Verify environment variables

### Admin mode doesn't activate
- Clear browser cache
- Check admin password is correct
- Verify user role in database

### QR codes not generating
- Check qrcode package is installed
- Verify username exists
- Check server logs for errors

## 🎉 All Features Implemented

✅ Orange/Yellow color theme  
✅ Admin dashboard with user management  
✅ Subscription tiers (Free/Starter/Premium)  
✅ Last login tracking  
✅ QR code generation  
✅ Stripe placeholders  
✅ Premium badges and UI  
✅ Admin authentication  
✅ User deletion  
✅ Subscription management

Enjoy your new features! 🚀
