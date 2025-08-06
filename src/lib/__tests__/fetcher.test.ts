import { fetcher, ApiError } from '../fetcher';
import { API_BASE_URL } from '../constants';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiError', () => {
  it('creates an error with status and info', () => {
    const error = new ApiError('Test error', 404, { detail: 'Not found' });

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(404);
    expect(error.info).toEqual({ detail: 'Not found' });
  });

  it('creates an error without info', () => {
    const error = new ApiError('Test error', 500);

    expect(error.status).toBe(500);
    expect(error.info).toBeUndefined();
  });
});

describe('fetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variable
    delete process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  });

  it('fetches data successfully from Next.js API route', async () => {
    const mockData = { coins: ['bitcoin', 'ethereum'] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetcher('/api/coins');

    expect(fetch).toHaveBeenCalledWith('/api/coins', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('fetches data from external URL with http prefix', async () => {
    const mockData = { price: 50000 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetcher('https://api.example.com/data');

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('prepends API_BASE_URL for relative paths', async () => {
    const mockData = { market_cap: 1000000 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetcher('/coins/markets');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/coins/markets`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('adds API key header for non-proxy routes when available', async () => {
    process.env.NEXT_PUBLIC_COINGECKO_API_KEY = 'test-api-key';

    const mockData = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await fetcher('/coins/bitcoin');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/coins/bitcoin`, {
      headers: {
        'Content-Type': 'application/json',
        'x-cg-demo-api-key': 'test-api-key',
      },
    });
  });

  it('does not add API key for /api routes', async () => {
    process.env.NEXT_PUBLIC_COINGECKO_API_KEY = 'test-api-key';

    const mockData = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await fetcher('/api/coins');

    expect(fetch).toHaveBeenCalledWith('/api/coins', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const headers = (fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers['x-cg-demo-api-key']).toBeUndefined();
  });

  it('throws ApiError on non-ok response with JSON error', async () => {
    const errorInfo = { message: 'Invalid request', code: 'INVALID' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => errorInfo,
    });

    let thrownError: any;
    try {
      await fetcher('/api/error');
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError).toBeInstanceOf(ApiError);
    expect(thrownError.message).toBe('Invalid request');
    expect(thrownError.status).toBe(400);
    expect(thrownError.info).toEqual(errorInfo);
  });

  it('throws ApiError with statusText when JSON parsing fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    let thrownError: any;
    try {
      await fetcher('/api/error');
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError).toBeInstanceOf(ApiError);
    expect(thrownError.message).toBe('Internal Server Error');
    expect(thrownError.status).toBe(500);
    expect(thrownError.info).toEqual({ message: 'Internal Server Error' });
  });

  it('throws ApiError with default message when no error message available', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}), // Empty error object
    });

    let thrownError: any;
    try {
      await fetcher('/api/notfound');
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError).toBeInstanceOf(ApiError);
    expect(thrownError.message).toBe('HTTP 404: Not Found');
    expect(thrownError.status).toBe(404);
  });

  it('handles network errors', async () => {
    const networkError = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(fetcher('/api/data')).rejects.toThrow('Network error');
  });

  it('returns parsed JSON data on successful response', async () => {
    const mockData = {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 50000,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetcher('/api/coins/bitcoin');

    expect(result).toEqual(mockData);
  });
});
