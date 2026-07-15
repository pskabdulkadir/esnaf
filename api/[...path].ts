import app, { ensureFirebaseInitialized } from "../dist/server.cjs";

export default async function handler(req: any, res: any) {
  await ensureFirebaseInitialized();
  app(req, res);
}
