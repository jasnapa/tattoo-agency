# Authentication System

## Overview
Simple JWT-based authentication with access and refresh tokens, managed by Zustand.

## Key Features

### 1. Token Management
- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token to get new access tokens
- Automatic token refresh on 401 errors

### 2. State Management (Zustand)
- Persisted auth state in localStorage
- User information and token storage

### 3. Protected Routes
- Automatic redirect to login for unauthenticated users
- Session persistence across page refreshes

## Usage

### Login/Register
```tsx
import { useAuthStore } from '../store/authStore';

const setAuth = useAuthStore((state) => state.setAuth);
setAuth(user, accessToken, refreshToken);
```

### Logout
```tsx
import { useAuth } from '../hooks/useAuth';

const { logout } = useAuth();
logout();
```

### Protected Routes
```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### API Calls
```tsx
import axiosInstance from '../lib/axios';

const response = await axiosInstance.get('/api/endpoint');
```

## Token Refresh Flow
1. Request fails with 401
2. Calls `/token/refresh/` with refresh token
3. Updates access token
4. Retries original request
5. If refresh fails, redirects to login
