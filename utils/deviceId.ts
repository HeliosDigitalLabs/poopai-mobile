/**
 * Device Identification Utility
 * 
 * This utility provides functions to get the official device ID
 * for authentication and user identification purposes.
 */

import * as Device from 'expo-device';
import * as Application from 'expo-application';

/**
 * Gets the official device ID for the current device
 * 
 * This function attempts to get a unique, unspoofable device identifier
 * that can be used for authentication and determining user permissions.
 * 
 * @returns Promise<string> - The device ID
 * @throws Error if unable to get device ID
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get the most secure device identifier available
    let deviceId: string | null = null;

    // For iOS, use identifierForVendor (resets on app uninstall but more secure)
    if (Device.osName === 'iOS') {
      deviceId = await Application.getIosIdForVendorAsync();
    }
    
    // For Android, use Android ID (persistent across app installs)
    if (Device.osName === 'Android') {
      deviceId = await Application.getAndroidId();
    }

    // Fallback to installation time as a unique identifier if other methods fail
    if (!deviceId) {
      const installTime = await Application.getInstallationTimeAsync();
      deviceId = installTime.getTime().toString();
    }

    if (!deviceId) {
      throw new Error('Unable to retrieve device ID');
    }

    console.log('Device ID retrieved:', deviceId.substring(0, 8) + '...');
    return deviceId;

  } catch (error) {
    console.error('Error getting device ID:', error);
    throw new Error('Failed to get device ID for authentication');
  }
}

/**
 * Gets basic device information for debugging/logging purposes
 */
export function getDeviceInfo() {
  return {
    osName: Device.osName,
    osVersion: Device.osVersion,
    modelName: Device.modelName,
    brand: Device.brand,
    deviceType: Device.deviceType,
  };
}
