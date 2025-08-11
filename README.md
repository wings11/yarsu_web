# YarSu Frontend

A modern, mobile-first React application for the YarSu platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure login/signup with Supabase Auth
- 💬 **Real-time Chat**: Facebook Messenger-style chat with Socket.io
- 📱 **Mobile-First**: Responsive design optimized for mobile devices
- 🎨 **Modern UI**: Clean interface with Tailwind CSS
- ⚡ **Fast**: Built with Next.js and TanStack Query for optimal performance
- 🏨 **Content Management**: Browse hotels, restaurants, jobs, courses, and more
- 👥 **Role-based Access**: Different interfaces for users and admins

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Authentication**: Supabase Auth
- **Real-time**: Socket.io
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project
- Backend API (deployed on Render)

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.local.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

   Update the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=your_backend_api_url
   NEXT_PUBLIC_SOCKET_URL=your_backend_api_url
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat page
│   ├── hotels/            # Hotels listing
│   ├── restaurants/       # Restaurants listing
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat interface components
│   ├── content/           # Content listing components
│   ├── ui/                # Reusable UI components
│   └── Layout.tsx         # Main layout component
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── ChatContext.tsx    # Chat state and Socket.io
├── hooks/                 # Custom React hooks
│   └── useApi.ts          # API hooks with TanStack Query
├── lib/                   # Utility libraries
│   ├── api.ts             # API service
│   ├── auth.ts            # Authentication service
│   ├── supabase.ts        # Supabase configuration
│   └── utils.ts           # Utility functions
└── styles/                # Global styles
    └── globals.css        # Tailwind CSS imports
```

## Key Features

### Authentication Flow
- User registration and login via Supabase
- Automatic session management
- Protected routes for authenticated users
- Role-based access (member, admin, superadmin)

### Chat System
- **For Users**: Simple, WhatsApp-style interface
- **For Admins**: Facebook Messenger-style with conversation list
- Real-time messaging with Socket.io
- Message persistence via API
- Online status indicators

### Mobile Optimization
- Touch-friendly interface
- Responsive grid layouts
- Mobile-first navigation
- Optimized for tablets and phones
- Bottom navigation bar on mobile

### Content Management
- Browse hotels with amenities and ratings
- Restaurant listings with popular dishes
- Job postings with filters
- Course information
- Travel destinations
- Document management
- Useful links collection

## API Integration

The frontend integrates with your backend API deployed on Render:

- **REST API**: For data fetching and mutations
- **Socket.io**: For real-time chat functionality
- **Supabase**: For authentication and user management

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_API_URL` | Your backend API URL | `https://your-app.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `https://your-app.onrender.com` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile and desktop
5. Submit a pull request

## License

This project is proprietary software for YarSu platform.

## Support

For technical support or questions about the YarSu platform, please contact the development team.
# yarsu_web
