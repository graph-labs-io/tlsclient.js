import { randomUUID } from 'node:crypto'
import { createTLSClient } from './src'

const sessionId = randomUUID()

const tlsclient = createTLSClient()
tlsclient
  .get('https://tls.peet.ws/api/all', {
    sessionId: sessionId as string,
  })
  .then(res => {
    console.log(res)

    tlsclient.destroySession(sessionId).then(res => {
      console.log(res)
    })
  })
