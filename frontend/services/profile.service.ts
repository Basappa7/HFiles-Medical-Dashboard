import { httpClient } from '@/lib/http.client';

export interface ProfileData {
  email: string;
  gender: string;
  phoneNumber: string;
  profileImage?: string | null;
}

class ProfileService {
  async updateProfile(data: ProfileData) {
    return httpClient.put('/api/Profile/profile', data);
  }

  async uploadImage(formData: FormData) {
    return httpClient.uploadFile('/api/Profile/upload-image', formData);
  }
}

export const profileService = new ProfileService();