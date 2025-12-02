import { app } from "../server/index";

export default (req: any, res: any) => {
  return app(req, res);
};