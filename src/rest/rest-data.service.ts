import ky, { type KyInstance, type Options } from 'ky';
import { inject, injectable } from 'tsyringe';
import { LoggerService } from '../logger/logger.service.ts';

@injectable()
export class RestDataService {
  private readonly client: KyInstance;

  constructor(
    @inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.client = ky.create({
      timeout: 10_000,
      retry: {
        limit: 2,
        methods: ['get'],
      },
      hooks: {
        beforeRequest: [
          (request: any) => {
            this.logger.debug(`[RestDataService] ${request.method} ${request.url}`);
          },
        ],
        afterResponse: [
          (response: any) => {
            this.logger.debug(
              `[RestDataService] Response status: ${response.status}`
            );
            return response;
          },
        ],
        beforeError: [
          (error) => {
            const { request } = error;
            this.logger.error(
              `[RestDataService] Request failed: ${request.method} ${request.url}`,
              error
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
