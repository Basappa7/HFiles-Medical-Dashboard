import { httpClient } from '@/lib/http.client';

export interface MedicalFile {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadDate: string;
}

class FileService {
  async uploadFile(formData: FormData) {
    return httpClient.uploadFile('/api/File/upload', formData);
  }

  async getMyFiles() {
    return httpClient.get<MedicalFile[]>('/api/File/my-files');
  }

  async deleteFile(id: number) {
    return httpClient.delete(`/api/File/${id}`);
  }

  async downloadFile(id: number): Promise<Blob | null> {
    const url = apiConfig.getEndpoint(`/api/File/download/${id}`);
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }
}

export const fileService = new FileService();