# Vitala - Healthcare App 🏥

This is an [Expo](https://expo.dev) project for a healthcare application connecting patients with nurses.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- MongoDB (configured in backend)

## Get started

### 1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure API Connection

**Option A: Automatic Setup (Recommended)**
```bash
npm run setup
```
This script automatically detects your local IP address and updates the `.env` file.

**Option B: Manual Setup**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Find your local IP address:
   - **Windows**: Run `ipconfig` and look for IPv4 Address
   - **Mac/Linux**: Run `ifconfig` or `ip addr`
3. Update `EXPO_PUBLIC_API_URL` in `.env` with your IP:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5000
   ```

**Different Development Scenarios:**
- **Physical Device (Same Network)**: Use your machine's local IP (e.g., `http://192.168.1.176:5000`)
- **Android Emulator**: Use `http://10.0.2.2:5000`
- **iOS Simulator**: Use `http://localhost:5000`
- **Production**: Use your deployed backend URL (e.g., `https://api.yourdomain.com`)

### 3. Start the Backend Server

```bash
cd server
npm start
```

The server will run on `http://0.0.0.0:5000` and be accessible via your local IP.

### 4. Start the Expo App

In a new terminal:

```bash
npm run dev
```

Or if you already ran setup:

```bash
npm start
```

### 5. Open the App

- Scan the QR code with Expo Go (Android) or Camera app (iOS)
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Troubleshooting Network Issues

### "Network request failed" error

This usually means the app can't reach the backend server. Try these solutions:

1. **Verify backend is running**:
   ```bash
   cd server && npm start
   ```

2. **Re-run setup** to update your IP (do this when switching WiFi networks):
   ```bash
   npm run setup
   ```

3. **Clear Expo cache and restart**:
   ```bash
   npx expo start -c
   ```

4. **Check firewall settings**: Ensure port 5000 is not blocked by your firewall

5. **Verify device/emulator is on the same network** as your development machine

### Switching Networks

When you connect to a different WiFi network, your IP address changes:
1. Run `npm run setup` to auto-update your IP
2. Restart Expo with `npx expo start -c`

## Project Structure

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
