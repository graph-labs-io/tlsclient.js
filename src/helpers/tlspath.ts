import { readFileSync } from 'fs'
import os from 'os'
const arch = os.arch()
const platform = os.platform()

let version = '1.8.0'
let filename, extension, distribution

if (platform === 'win32') {
  filename = 'tls-client-windows'
  extension = 'dll'
  distribution = arch.includes('64') ? '64' : '32'
} else if (platform === 'darwin') {
  filename = 'tls-client-darwin'
  extension = 'dylib'
  distribution = arch == 'arm64' ? arch : 'amd64'
} else if (platform === 'linux') {
  filename = 'tls-client-linux'
  extension = 'so'

  let releaseDetails = readFileSync('/etc/os-release', 'utf8')
  const lines = releaseDetails.split('\n').slice(0, -1)
  const release: any = {}
  lines.forEach((line: any) => {
    console.log('line', line)
    // Skip empty lines or comment lines
    if (!line || line.startsWith('#')) return

    // Only process lines that contain an '='
    if (!line.includes('=')) return

    const words = line.split('=')
    // In case the value itself contains '=' signs, join the remaining parts
    const key = words[0].trim().toLowerCase()
    const value = words.slice(1).join('=').trim()

    // Only add the key if a value is present
    if (value) {
      release[key] = value
    }
  })

  if (release.id.toLowerCase().includes('ubuntu')) {
    distribution = 'ubuntu-amd64'
  } else if (release.id.toLowerCase().includes('alpine')) {
    distribution = `alpine-amd64`
  } else {
    distribution = arch == 'arm64' ? arch : 'armv7'
  }
} else {
  console.error(`Unsupported platform: ${platform}`)
  process.exit(1)
}
let _filename = `${filename}-${distribution}-${version}.${extension}`
const url = `https://github.com/bogdanfinn/tls-client/releases/download/v${version}/${_filename}`
const destination = `${os.tmpdir()}/${_filename}`

export function getTLSDependencyPath() {
  return {
    DOWNLOAD_PATH: url,
    TLS_LIB_PATH: destination,
  }
}
