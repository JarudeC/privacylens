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

  constructor(baseURL: string = 'https://privacylens-1.onrender.com') {
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

    try {
      console.log('📤 Starting upload:', {
        url,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [
          key, 
          value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
        ])
      });
      
      // Visible debugging for phone
      if (typeof alert !== 'undefined') {
        alert(`Starting upload to: ${url}`);
      }
      
      // First test if backend is reachable with simple GET request
      try {
        const testResponse = await fetch(this.baseURL, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        console.log('Backend reachability test:', testResponse.status, testResponse.statusText);
      } catch (testError) {
        console.error('❌ Backend connectivity test failed:', {
          url: this.baseURL,
          error: testError,
          message: (testError as Error).message,
          name: (testError as Error).name,
          stack: (testError as Error).stack
        });
        
        // Visible debugging for phone
        if (typeof alert !== 'undefined') {
          alert(`❌ Cannot reach backend: ${(testError as Error).message}`);
        }
        
        throw new APIError(`Cannot reach backend at ${this.baseURL}: ${(testError as Error).message}`);
      }
      
      // Use fetch API for React Native compatibility
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let the browser/RN handle it
          'Accept': 'application/json',
        },
        signal,
      });

      console.log('📥 Upload response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('❌ Server error response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          try {
            const errorText = await response.text();
            console.error('❌ Raw error response:', errorText);
          } catch {
            console.error('❌ Could not read error response body');
          }
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
      console.error('❌ Upload failed:', error);
      
      // Visible debugging for phone
      if (typeof alert !== 'undefined') {
        alert(`❌ Upload failed: ${(error as Error)?.message || 'Unknown error'}`);
      }
      
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