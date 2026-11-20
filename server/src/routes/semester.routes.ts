import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma/client.js";
import { sendSuccess } from "../utils/responseFormatter.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { number: "asc" },
    });
    return sendSuccess(res, semesters, "Semesters retrieved.");
  } catch (err) {
    next(err);
  }
});

export default router;
