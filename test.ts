import { createTLSClient } from './src'

const tlsclient = createTLSClient()
tlsclient.get('https://tls.peet.ws/api/all').then(res => {
  console.log(res)
})
