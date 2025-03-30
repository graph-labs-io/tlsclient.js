import { Delays, Options, Response } from 'got'
import { createAdapter, DEFAULT_CLIENT_ID } from './helpers/adapter.js'

interface TLSClientConfiguration extends Options {
  proxy?: string | any
  tlsClientIdentifier?: string
  customTlsClient?: any
  tlsLibPath?: string
  forceHttp1?: boolean
  followRedirects: boolean
  insecureSkipVerify?: boolean
  withRandomTLSExtensionOrder?: boolean
  timeout: Delays
  defaultHeaders?: any
  headerOrder?: string[]
}

/**
 * Create a TLS client.
 *
 * Extra/Modified options available in config (and per request, except tlsLibPath):
 * - `proxy` - The proxy to use. (e.g. http://user:pass@host:port)
 * - `tlsClientIdentifier` - Choose the desired TLS client.
 * - `customTlsClient` - Use a custom TLS client instead of the default one.
 * - `tlsLibPath` - Specify path for the TLS library (.dll, .dylib, .so) (optional).
 * - `forceHttp1` - Force HTTP/1.
 * - `followRedirects` - Follow redirects.
 * - `insecureSkipVerify` - Skip TLS certificate verification.
 * - `withRandomTLSExtensionOrder` - Randomize the order of TLS extensions.
 * - `timeout` - Request timeout.
 * - `defaultHeaders` - Default headers to use (usually the browser default headers).
 * - `headerOrder` - The order of the headers.
 */
function createTLSClient(config?: TLSClientConfiguration) {
  const requestHandler = createAdapter(config)

  const client = {
    request: async (url: string, options: TLSClientConfiguration) => {
      const finalConfig = { ...config, ...options, url }
      const res = (await requestHandler(finalConfig)) as Response
      // Convert the adapter response to a got-like response object
      return {
        body: res.body,
        statusCode: res.statusCode,
        headers: res.headers,
        url: res.request.requestUrl,
        request: res.request,
      }
    },
    get: async (url: string, options?: TLSClientConfiguration) => {
      return await client.request(url, {
        ...options,
        method: 'GET',
      } as TLSClientConfiguration)
    },
    post: async (url: string, options?: TLSClientConfiguration) => {
      return await client.request(url, {
        ...options,
        method: 'POST',
      } as TLSClientConfiguration)
    },
    put: async (url: string, options?: TLSClientConfiguration) => {
      return await client.request(url, {
        ...options,
        method: 'PUT',
      } as TLSClientConfiguration)
    },
    patch: async (url: string, options?: TLSClientConfiguration) => {
      return await client.request(url, {
        ...options,
        method: 'PATCH',
      } as TLSClientConfiguration)
    },
    delete: async (url: string, options?: TLSClientConfiguration) => {
      return await client.request(url, {
        ...options,
        method: 'DELETE',
      } as TLSClientConfiguration)
    },
  }

  return client
}

export default createTLSClient

export { DEFAULT_CLIENT_ID, createTLSClient }
