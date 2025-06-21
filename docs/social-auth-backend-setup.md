# Social Authentication Backend Setup Guide

This guide explains how to set up the backend endpoints for Google and Apple authentication.

## Required Endpoints

### 1. Google Authentication Endpoint

```
POST /api/auth/google
```

**Request Body:**

```json
{
  "idToken": "string", // Google ID token
  "deviceId": "string" // Optional device ID for account linking
}
```

**Response:**

```json
{
  "token": "string", // Your app's JWT token
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
    // ... other user data
  }
}
```

### 2. Apple Authentication Endpoint

```
POST /api/auth/apple
```

**Request Body:**

```json
{
  "idToken": "string", // Apple identity token
  "deviceId": "string", // Optional device ID for account linking
  "email": "string", // Optional - only provided on first sign-in
  "fullName": {
    // Optional - only provided on first sign-in
    "givenName": "string",
    "familyName": "string"
  }
}
```

**Response:**

```json
{
  "token": "string", // Your app's JWT token
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
    // ... other user data
  }
}
```

## Implementation Notes

### Google Authentication Flow

1. Frontend gets Google ID token using Google Sign-In SDK
2. Frontend sends ID token to your backend
3. Backend verifies the ID token with Google's servers
4. Backend creates/finds user in your database
5. Backend returns your app's JWT token

### Apple Authentication Flow

1. Frontend gets Apple identity token using Apple Sign-In
2. Frontend sends identity token (and optional user info) to your backend
3. Backend verifies the identity token with Apple's servers
4. Backend creates/finds user in your database
5. Backend returns your app's JWT token

### Backend Verification

**Google ID Token Verification:**

- Use Google's token verification API
- Verify the token signature and claims
- Extract user info (email, name, etc.)

**Apple Identity Token Verification:**

- Verify the JWT signature using Apple's public keys
- Validate the token claims (audience, issuer, etc.)
- Extract user identifier (sub claim)

### Database Considerations

- Link social accounts to existing users by email if available
- Store social provider IDs for future sign-ins
- Handle cases where email is not provided (especially Apple)
- Consider device linking for anonymous users upgrading to authenticated

### Security Notes

- Always verify tokens on the backend, never trust frontend claims
- Use HTTPS for all authentication endpoints
- Implement rate limiting for authentication attempts
- Log authentication events for security monitoring
