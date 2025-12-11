# 🔐 Clerk Authentication Setup

## Quick Setup

1. **Create a Clerk Account**
   - Go to [clerk.com](https://clerk.com)
   - Sign up for a free account
   - Create a new application

2. **Get Your Publishable Key**
   - In your Clerk dashboard, go to **API Keys**
   - Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)

3. **Add to `.env.local`**
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

4. **Restart the app**
   ```bash
   npm start
   ```

## Features Enabled

✅ **User Authentication** - Sign in/Sign up with email, Google, etc.
✅ **User Profile** - View and manage user profile
✅ **Saved Stories** - Save favorite stories to revisit later
✅ **Listening History** - Track all stories you've listened to
✅ **Personalized Experience** - Stories saved per user

## How It Works

### Sign In/Sign Up
- Click the **Profile** button in the top-right corner
- Choose your preferred sign-in method
- Your profile is automatically created

### Save Stories
- While listening to a story, click the **Bookmark** icon
- Story is saved to your profile
- Access saved stories from your profile modal

### View Saved Stories
- Click your profile picture/name in the top-right
- Navigate to **Saved Stories** tab
- Click any story to replay it

## Profile Features

- **Saved Stories Tab**: All your bookmarked stories
- **History Tab**: Complete listening history (coming soon)
- **User Info**: Name, email, profile picture
- **Quick Access**: One-click access to saved content

## Privacy & Security

- All authentication handled by Clerk (SOC 2 Type II certified)
- Stories saved locally per user ID
- No sensitive data stored in localStorage
- Secure session management

## Troubleshooting

**"Missing Clerk Publishable Key" warning?**
- Make sure you've added `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local`
- Restart the development server

**Can't see the sign-in button?**
- Check that `@clerk/clerk-react` is installed
- Verify the ClerkProvider is wrapping your app in `main.tsx`

**Saved stories not persisting?**
- Make sure you're signed in
- Check browser localStorage is enabled
- Stories are saved per user ID

## Next Steps

Want to add more features?
- Enable social login (Google, GitHub, etc.) in Clerk dashboard
- Add email notifications for saved stories
- Implement story sharing between users
- Add collections/playlists of stories
