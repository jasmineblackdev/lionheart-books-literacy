// Minimal stand-in for supabase-js used by the edge functions. Records every call;
// results come from globalThis.__db.respond(op) so each test can script the database.
export function createClient() {
  const builder = (table) => {
    const op = { table, calls: [] };
    const chain = new Proxy(function () {}, {
      get(_, prop) {
        if (prop === "then") {
          globalThis.__db.ops.push(op);
          const res = globalThis.__db.respond(op);
          return (ok, bad) => Promise.resolve(res).then(ok, bad);
        }
        return (...args) => { op.calls.push([prop, ...args]); return chain; };
      },
    });
    return chain;
  };
  return {
    from: builder,
    auth: { getUser: async (t) => globalThis.__db.getUser(t) },
  };
}
