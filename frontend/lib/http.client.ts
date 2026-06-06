import { apiConfig } from './api.config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

class HttpClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = apiConfig.getEndpoint(endpoint);
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || data?.title || 'Request failed',
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data: data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        statusCode: 500,
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile(endpoint: string, formData: FormData): Promise<ApiResponse> {
    const url = apiConfig.getEndpoint(endpoint);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || 'Upload failed',
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data: data,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload error',
        statusCode: 500,
      };
    }
  }
}

export const httpClient = new HttpClient();