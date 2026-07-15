import app, { ensureFirebaseInitialized } from "../server.ts";

export default async function handler(req: any, res: any) {
  await ensureFirebaseInitialized();
  app(req, res);
}
