class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(baseURL: string = 'https://privacylens-n4te.onrender.com') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Apply request interceptors
    const finalConfig = await this.applyRequestInterceptors(config);
    
    // Prepare headers
    const headers = {
      ...this.defaultHeaders,
      ...finalConfig.headers,
    };

    // Prepare body
    let body: string | FormData | undefined;
    if (finalConfig.body) {
      if (finalConfig.body instanceof FormData) {
        body = finalConfig.body;
        // Remove Content-Type header for FormData (let browser set it)
        delete headers['Content-Type'];
      } else if (typeof finalConfig.body === 'object') {
        body = JSON.stringify(finalConfig.body);
      } else {
        body = finalConfig.body;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = finalConfig.timeout 
      ? setTimeout(() => controller.abort(), finalConfig.timeout)
      : null;

    try {
      const fetchSignal = finalConfig.signal 
        ? AbortSignal.any([finalConfig.signal, controller.signal])
        : controller.signal;

      const response = await fetch(url, {
        method: finalConfig.method || 'GET',
        headers,
        body,
        signal: fetchSignal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Apply response interceptors
      const finalResponse = await this.applyResponseInterceptors(response);

      if (!finalResponse.ok) {
        let errorMessage = `HTTP ${finalResponse.status}: ${finalResponse.statusText}`;
        let errorCode = undefined;
        
        try {
          const errorData = await finalResponse.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
          errorCode = errorData.code;
        } catch {
          // If response body is not JSON, use the default error message
        }
        
        throw new APIError(errorMessage, finalResponse.status, errorCode);
      }

      // Handle empty responses
      const contentType = finalResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await finalResponse.json();
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (error instanceof APIError) {
        throw error;
      }

      if ((error as any)?.name === 'AbortError') {
        throw new APIError('Request timeout');
      }

      throw new APIError(`Network error: ${(error as Error).message}`);
    }
  }

  async get<T>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Upload with progress tracking - React Native compatible
  async uploadWithProgress<T>(
    endpoint: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();

    try {
        // Add timeout for Render's 30s limit
        const timeoutSignal = AbortSignal.timeout(29000); // 29s to be safe
        const combinedSignal = signal 
            ? AbortSignal.any([signal, timeoutSignal])
            : timeoutSignal;

        console.log('Starting upload, size:', formData.get('video')?.size);
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            signal: combinedSignal
        });

        console.log('Upload took:', (Date.now() - startTime)/1000, 'seconds');

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.log('Error response:', errorData);
            errorMessage = errorData.message || errorData.detail || errorMessage;
          } catch {
            // Use default error message
          }
          throw new APIError(errorMessage, response.status);
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return {} as T;
        }

        const result = await response.json();
        console.log('Upload success:', result);
        return result;
    } catch (error) {
        console.log('Upload failed after:', (Date.now() - startTime)/1000, 'seconds');
        
        if (error instanceof APIError) {
          throw error;
        }

        if ((error as any)?.name === 'AbortError') {
          throw new APIError('Request timeout');
        }

        throw new APIError(`Network error during upload: ${(error as Error).message}`);
    }
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export types and error class
export { APIClient, APIError };
export type { RequestConfig };