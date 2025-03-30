import workerpool from 'workerpool'
import path from 'node:path'
import { getTLSDependencyPath } from './tlspath.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

let { TLS_LIB_PATH } = getTLSDependencyPath()

const DEFAULT_CLIENT_ID = 'chrome_133'
const DEFAULT_HEADERS = {
  accept: '*/*',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en-US,en;q=0.9',
  'sec-ch-ua': `"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"`,
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
}
const DEFAULT_HEADER_ORDER = [
  'host',
  'x-real-ip',
  'x-forwarded-for',
  'connection',
  'content-length',
  'cache-control',
  'sec-ch-ua',
  'accept-datetime',
  'dnt',
  'x-csrf-token',
  'if-unmodified-since',
  'authorization',
  'x-requested-with',
  'if-modified-since',
  'max-forwards',
  'x-http-method-override',
  'x-request-id',
  'sec-ch-ua-platform',
  'pragma',
  'upgrade-insecure-requests',
  'sec-ch-ua-mobile',
  'user-agent',
  'content-type',
  'if-none-match',
  'if-match',
  'if-range',
  'range',
  'accept',
  'origin',
  'sec-fetch-site',
  'sec-fetch-mode',
  'sec-fetch-dest',
  'referer',
  'accept-encoding',
  'accept-language',
]

function settle(resolve: any, reject: any, response: any) {
  const validateStatus = response.config.validateStatus
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response)
  } else {
    const error = new Error(
      'Request failed with status code ' + response.status
    )
    ;(error as any).response = response
    reject(error)
  }
}

export function createAdapter(_config: any) {
  if (_config?.tlsLibPath) {
    TLS_LIB_PATH = _config.tlsLibPath
  }

  const pool = workerpool.pool(
    require.resolve('tlsclient.js/lib/helpers/tls.js'),
    {
      workerThreadOpts: {
        env: {
          TLS_LIB_PATH,
        },
      },
    }
  )
  return function (config: any) {
    return new Promise(async (resolve, reject) => {
      const requestPayload = {
        tlsClientIdentifier: config.tlsClientIdentifier || DEFAULT_CLIENT_ID,
        followRedirects: config.followRedirects || false,
        insecureSkipVerify: config.insecureSkipVerify || true,
        withoutCookieJar: true,
        withDefaultCookieJar: false,
        isByteRequest: false,
        catchPanics: false,
        withDebug: false,
        forceHttp1: config.forceHttp1 || false,
        withRandomTLSExtensionOrder: config.withRandomTLSExtensionOrder || true,
        timeoutSeconds: (config.timeout && config.timeout / 1000) || 30,
        timeoutMilliseconds: 0,
        sessionId: config.sessionId || undefined,
        isRotatingProxy: false,
        proxyUrl: config.proxy || '',
        customTlsClient: config.customTlsClient || undefined,
        certificatePinningHosts: {},
        headers: {
          ...(config.defaultHeaders || DEFAULT_HEADERS),
          ...config.headers,
        },
        headerOrder: config.headerOrder || DEFAULT_HEADER_ORDER,
        requestUrl: config.url,
        requestMethod: (config.method || 'GET').toUpperCase(),
        requestBody: config.data,
      }
      let res = await pool.exec('request', [JSON.stringify(requestPayload)])
      const resJSON = JSON.parse(res)
      let resHeaders: any = {}
      Object.keys(resJSON.headers).forEach(key => {
        resHeaders[key] =
          resJSON.headers[key].length === 1
            ? resJSON.headers[key][0]
            : resJSON.headers[key]
      })
      const response = {
        body: resJSON.body,
        statusCode: resJSON.status,
        headers: resHeaders,
        config,
        request: {
          requestUrl: encodeURI(
            resJSON.headers && resJSON.headers.Location
              ? resJSON.headers.Location[0]
              : resJSON.target
          ),
        },
      }

      settle(resolve, reject, response)
    })
  }
}

export { DEFAULT_CLIENT_ID, DEFAULT_HEADERS, DEFAULT_HEADER_ORDER }
