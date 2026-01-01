const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Get the local IP address of the machine
 * @returns {string} Local IP address
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  
  // Priority order: Wi-Fi, Ethernet, then others
  const priorityOrder = ['Wi-Fi', 'WLAN', 'Ethernet', 'en0', 'eth0'];
  
  // First try priority interfaces
  for (const interfaceName of priorityOrder) {
    const networkInterface = interfaces[interfaceName];
    if (networkInterface) {
      for (const details of networkInterface) {
        // Look for IPv4 addresses that are not internal
        if (details.family === 'IPv4' && !details.internal) {
          return details.address;
        }
      }
    }
  }
  
  // Fallback: find any non-internal IPv4 address
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    for (const details of networkInterface) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  
  return 'localhost';
}

/**
 * Update .env file with current IP address
 */
function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const localIp = getLocalIpAddress();
  const apiUrl = `http://${localIp}:5000`;
  
  console.log(`🔍 Detected local IP: ${localIp}`);
  
  // Read existing .env file or create new content
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add EXPO_PUBLIC_API_URL
  const apiUrlPattern = /^EXPO_PUBLIC_API_URL=.*/m;
  if (apiUrlPattern.test(envContent)) {
    envContent = envContent.replace(apiUrlPattern, `EXPO_PUBLIC_API_URL=${apiUrl}`);
    console.log(`✅ Updated EXPO_PUBLIC_API_URL to: ${apiUrl}`);
  } else {
    const header = envContent.includes('# Vitala App Configuration') 
      ? '' 
      : '# Vitala App Configuration\n# DO NOT commit this file to version control\n\n';
    envContent = `${header}# Backend API URL - Auto-updated by setup-env.js\nEXPO_PUBLIC_API_URL=${apiUrl}\n${envContent}`;
    console.log(`✅ Added EXPO_PUBLIC_API_URL: ${apiUrl}`);
  }
  
  // Write updated content
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n📝 Updated .env file at: ${envPath}`);
  console.log(`\n💡 Your API is configured to: ${apiUrl}`);
  console.log(`\n🚀 Now run: npm start (or npx expo start -c to clear cache)`);
}

// Run the update
try {
  updateEnvFile();
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
  process.exit(1);
}
