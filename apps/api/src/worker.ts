// The Worker's entry. The example's app (./index) is unchanged: it listens as
// it would on Node, and the Workers runtime's Node.js HTTP server support —
// `httpServerHandler` from `cloudflare:node`, on with nodejs_compat — hands
// every request the Worker receives to that server. The stylesheet and the
// logo never get here: Workers Static Assets serves `public/` first.
import { httpServerHandler } from 'cloudflare:node'
import app from './index'

const PORT = 3000

app.listen(PORT)
export default httpServerHandler({ port: PORT })
