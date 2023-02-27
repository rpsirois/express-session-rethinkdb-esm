# express-session-rethinkdb-esm

[RethinkDB](https://rethinkdb.com/) database adapter for [`express-session`](https://github.com/expressjs/session) middleware for [ExpressJS](https://expressjs.com/).

Thank you to everyone writing `express-session` drivers out there for the boilerplate and inspiration.

**Note**: Sessions are not vacuumed by the adapter like some of the others out there (`setInterval` and friends). Pull requests welcome :)

## Installation

`npm install express-session-rethinkdb-esm --save`

## Usage

```javascript
// rethinkdb
import r from 'rethinkdb'
const rc = await r.connect({ host })

// express
import express from 'express'
import session from 'express-session'
import _init_rdb_express_session_store from 'express-session-rethinkdb-esm'

const app = express()
const RethinkdbSessionStore = await _init_rdb_express_session_store({ session })

app.use( session({
    store: new RethinkdbSessionStore({ client: r, conn: rc })
})
```

## Constructor Options

`client`: **Required** -- RethinkDB import.

`conn`: **Required** -- RethinkDB database connection.

`table`: RethinkDB table to store sessions in (default: `sessions`).

`ttl`: Time in milliseconds to expire sessions (default: two weeks).
