# tlsclient.js

An got based wrapper for `bogdanfinn/tls-client` based on ffi-rs for unparalleled performance and usability.

## Performance

![perf](https://i.ibb.co/WxdLcRD/Screenshot-2024-01-10-at-1-16-55-AM.png)

## Installation

Install with npm

```bash
  npm i @dryft/tlsclient
```

## Usage

### First run:

```javascript
import { createTLSClient } from '@dryft/tlsclient'

const got = createTLSClient()
let res = await got.get('https://ipv4.icanhazip.com')
```
