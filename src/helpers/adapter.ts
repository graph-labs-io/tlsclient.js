import workerpool from 'workerpool'
import { getTLSDependencyPath } from './tlspath.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

let { TLS_LIB_PATH } = getTLSDependencyPath()

const DEFAULT_CLIENT_ID = 'chrome_133'

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
          ...(config.defaultHeaders || {}),
          ...config.headers,
        },
        headerOrder: config.headerOrder || [],
        requestUrl: config.url,
        requestMethod: (config.method || 'GET').toUpperCase(),
        requestBody: config.body,
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

export { DEFAULT_CLIENT_ID }
