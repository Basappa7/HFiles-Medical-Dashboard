export class ApiConfig {
  private static instance: ApiConfig;
  private baseURL: string;

  private constructor() {
    this.baseURL = this.determineBaseURL();
  }

  static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  private determineBaseURL(): string {
    if (typeof window !== 'undefined') {
      const customUrl = localStorage.getItem('api_url');
      if (customUrl) return customUrl;
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    if (process.env.NODE_ENV === 'production') {
      // For production, you would put your actual backend URL
      return 'https://your-production-api.com';
    }

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const possiblePorts = [7027, 7001, 5000, 5001, 8080, 3001];
      
      return `https://${hostname}:7027`;
    }

    return 'https://localhost:7027';
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  setBaseURL(url: string) {
    this.baseURL = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_url', url);
    }
  }

  getEndpoint(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
  }
}

export const apiConfig = ApiConfig.getInstance();