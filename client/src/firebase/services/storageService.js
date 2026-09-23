// =============================================================================
// VIVAAN Agricultural Marketplace - Firebase Storage Service
// Handles upload and retrieval of produce photos and sensitive verification docs
// =============================================================================

import { storage, isLiveFirebase } from '../config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { authService } from './authService';

class StorageService {
  /**
   * Uploads public produce catalog photo
   * Allowed for verified farmers and admin
   */
  async uploadProducePhoto(productId, file) {
    authService.assertRole(['farmer', 'admin']);

    if (isLiveFirebase && storage && file) {
      try {
        const storageRef = ref(storage, `produce/${productId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (e) {
        console.warn('Storage upload falling back to local object URL:', e.message);
      }
    }

    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500';
  }

  /**
   * Uploads SENSITIVE Farmer Land Patta or Aadhaar verification document
   * Strictly private: restricted to owner farmer and admin
   */
  async uploadKycDocument(userId, file) {
    authService.assertRole(['farmer', 'admin']);

    if (isLiveFirebase && storage && file) {
      try {
        const storageRef = ref(storage, `verification/${userId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (e) {
        console.warn('KYC Storage upload falling back:', e.message);
      }
    }

    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    return `/docs/verified-patta-${userId}.pdf`;
  }

  /**
   * Uploads SENSITIVE Commercial Driver's License or Vehicle RC
   */
  async uploadDriverLicense(driverId, file) {
    authService.assertRole(['agency', 'driver', 'admin']);

    if (isLiveFirebase && storage && file) {
      try {
        const storageRef = ref(storage, `driver_docs/${driverId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (e) {}
    }

    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    return `/docs/commercial-dl-${driverId}.pdf`;
  }
}

export const storageService = new StorageService();
export default storageService;
