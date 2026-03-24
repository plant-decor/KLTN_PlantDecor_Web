#!/usr/bin/env node

// Test script to verify API configuration
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7180/api';
const apiUrl2 = process.env.API_URL || 'https://localhost:7180/api';

console.log('=== API Configuration Debug ===\n');
console.log('Environment Variables:');
console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('  API_URL:', process.env.API_URL);
console.log('  NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('  API_BASE_URL:', process.env.API_BASE_URL);
console.log('\nResolved URLs:');
console.log('  Public API URL:', apiUrl);
console.log('  Server API URL:', apiUrl2);
console.log('\nLogin Endpoint:');
console.log('  Full URL:', `${apiUrl2}/Authentication/login`);
console.log('\nExpected Backend:');
console.log('  https://localhost:7180/api/Authentication/login');
