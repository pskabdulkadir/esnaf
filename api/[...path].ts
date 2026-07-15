import app, { ensureFirebaseInitialized } from "../server";

export default async function handler(req: any, res: any) {
  await ensureFirebaseInitialized();
  app(req, res);
}
