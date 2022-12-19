const defaults = {
    ttl: 1000 * 60 * 60 * 24 * 14 ,// 2 weeks
    table: 'sessions',
}

export default cfg => (
    class RethinkdbSessionStore extends cfg.session.Store {
        constructor( opt ) {
            super(opt)
            Object.assign(this, defaults, opt)
            if (! this.client) throw new Error('RethinkdbSessionStore requires a client in setup options.')
            if (! this.conn) throw new Error('RethinkdbSessionStore requires a connection in setup options.')
            this.initDb(this.client, this.conn)
        }

        getExpiry( cookie ) {
            return cookie?.expires
                ? new Date(cookie.expires)
                : new Date(Date.now() + this.ttl)
        }

        async initDb( r, rc ) {
            let { table } = this
            let existing_tables = await r.tableList().run(rc)

            if (existing_tables.indexOf( table ) < 0)
                await r.tableCreate( table ).run(rc)
            this._t = r.table(table)
        }

        async all( cb ) {
            try {
                let result = await this._t.run( this.conn ).toArray()
                cb?.( null, result )
                return result
            } catch (err) {
                if (!cb) throw err
                cb(err)
            }
        }

        async destroy( sid, cb ) {
            try {
                let result = await this._t.get( sid )
                    .delete()
                    .run(this.conn)
                cb?.(null, result)
                return result
            } catch (err) {
                cb(err)
            }
        }

        async clear( cb ) {
            try {
                let result = await this._t
                    .delete()
                    .run(this.conn)
                cb?.( null, result )
                return result
            } catch (err) {
                if (!cb) throw err
                cb(err)
            }
        }

        async length( cb ) {
            try {
                let result = await this._t
                    .count()
                    .run(this.conn)
                cb?.( null, result )
                return result
            } catch (err) {
                if (!cb) throw err
                cb(err)
            }
        }

        async get( sid, cb ) {
            try {
                let result = await this._t.get( sid )
                    .run(this.conn)
                result = !result ? null
                    : Date.now() > result.expires.getTime() ? null
                    : JSON.parse( result.session )
                cb?.(null, result)
                return result
            } catch (err) {
                if (!cb) throw err
                cb(err)
            }
        }

        async set( sid, session, cb ) {
            try {
                let obj = {
                    id: sid,
                    session: JSON.stringify(session),
                    expires: this.getExpiry(session?.cookie),
                }

                let ans = await this._t.get( sid )
                    .replace( obj )
                    .run( this.conn )

                cb?.()
            } catch (err) {
                if (!cb) throw err
                cb(err)
            }
        }

        async touch( sid, session, cb ) {
            try {
                let obj = {
                    expires: this.getExpiry( session?.cookie ),
                }

                let ans = await this._t.get( sid )
                    .update( obj )
                    .run( this.conn )

                cb?.()
            } catch (err) {
                if (!cb) throw err
                cb(err)
            }
        }
    })
