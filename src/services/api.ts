export interface ApiError {
  code: string;
  message: string;
  details?: any[];
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('ecocollect_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorData: { error?: ApiError } = {};
      try {
        errorData = await res.json();
      } catch (e) {
        // Non-JSON response
      }

      const error: ApiError = errorData.error || {
        code: `HTTP_${res.status}`,
        message: res.statusText || 'An error occurred while connecting to the server.',
        details: [],
      };

      // If token expired or unauthorized
      if (res.status === 401) {
        localStorage.removeItem('ecocollect_token');
        localStorage.removeItem('ecocollect_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      throw error;
    }

    return res.json();
  }

  async get<T>(url: string): Promise<T> {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(res);
    } catch (err: any) {
      if (!navigator.onLine) {
        throw {
          code: 'OFFLINE',
          message: 'You are currently offline. Please check your internet connection.',
          details: [],
        };
      }
      throw err;
    }
  }

  async post<T>(url: string, body?: any): Promise<T> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse<T>(res);
    } catch (err: any) {
      if (!navigator.onLine) {
        throw {
          code: 'OFFLINE',
          message: 'You are currently offline. Please check your internet connection.',
          details: [],
        };
      }
      throw err;
    }
  }

  async put<T>(url: string, body?: any): Promise<T> {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse<T>(res);
    } catch (err: any) {
      if (!navigator.onLine) {
        throw {
          code: 'OFFLINE',
          message: 'You are currently offline. Please check your internet connection.',
          details: [],
        };
      }
      throw err;
    }
  }

  async patch<T>(url: string, body?: any): Promise<T> {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse<T>(res);
    } catch (err: any) {
      if (!navigator.onLine) {
        throw {
          code: 'OFFLINE',
          message: 'You are currently offline. Please check your internet connection.',
          details: [],
        };
      }
      throw err;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(res);
    } catch (err: any) {
      if (!navigator.onLine) {
        throw {
          code: 'OFFLINE',
          message: 'You are currently offline. Please check your internet connection.',
          details: [],
        };
      }
      throw err;
    }
  }
}

export const api = new ApiService();
