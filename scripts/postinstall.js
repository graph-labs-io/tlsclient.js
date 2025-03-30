import fs from 'fs'
import got from 'got'
import { getTLSDependencyPath } from './tlspath.js'

function downloadFile(url, destination) {
  const file = fs.createWriteStream(destination)
  const downloadStream = got.stream(url)

  downloadStream.pipe(file)

  downloadStream.on('error', err => {
    console.error('Error downloading tls dependencies.', err)
    process.exit(1)
  })

  file.on('finish', () => {
    console.log('Downloaded tls dependencies.')
  })

  file.on('error', err => {
    console.error('Error writing tls dependencies.', err)
    process.exit(1)
  })
}

let { DOWNLOAD_PATH, TLS_LIB_PATH } = getTLSDependencyPath()
downloadFile(DOWNLOAD_PATH, TLS_LIB_PATH)
