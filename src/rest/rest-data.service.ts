import ky, { type KyInstance, type Options } from 'ky';
import { injectable } from 'tsyringe';

@injectable()
export class RestDataService {
  private readonly client: KyInstance;

  constructor() {
    this.client = ky.create({
      timeout: 10_000,
      retry: {
        limit: 2,
        methods: ['get'],
      },
      hooks: {
        beforeRequest: [
          (request: any) => {
            console.debug(`[RestDataService] ${request.method} ${request.url}`);
          },
        ],
        afterResponse: [
          (response: any) => {
            console.debug(
              `[RestDataService] Response status: ${response.status}`
            );
            return response;
          },
        ],
        beforeError: [
          (error) => {
            const { request } = error;
            console.error(
              `[RestDataService] Request failed: ${request.method} ${request.url}`
            );
            return error.error;
          },
        ],
      },
    });
  }

  /**
   * Performs a GET request and returns the parsed JSON response.
   */
  async get<T>(url: string, options?: Options): Promise<T> {
    return this.client.get(url, options).json<T>();
  }

  /**
   * Performs a POST request with a JSON body and returns the parsed JSON response.
   */
  async post<T>(url: string, body: unknown, options?: Options): Promise<T> {
    return this.client.post(url, { json: body, ...options }).json<T>();
  }

  /**
   * Performs a PUT request with a JSON body and returns the parsed JSON response.
   */
  async put<T>(url: string, body: unknown, options?: Options): Promise<T> {
    return this.client.put(url, { json: body, ...options }).json<T>();
  }

  /**
   * Performs a PATCH request with a JSON body and returns the parsed JSON response.
   */
  async patch<T>(url: string, body: unknown, options?: Options): Promise<T> {
    return this.client.patch(url, { json: body, ...options }).json<T>();
  }

  /**
   * Performs a DELETE request and returns the parsed JSON response.
   */
  async delete<T>(url: string, options?: Options): Promise<T> {
    return this.client.delete(url, options).json<T>();
  }

  /**
   * Returns the raw ky instance for advanced use cases.
   */
  get instance(): KyInstance {
    return this.client;
  }
}
