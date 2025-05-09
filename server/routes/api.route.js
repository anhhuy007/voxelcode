import express from "express"
const router = express.Router()

import codeController from "../controllers/code.controller.js"
import shapeController from "../controllers/shape.controller.js"
import scoreController from "../controllers/score.controller.js"

// Code execution routes
router.post("/code/execute", codeController.executeCode)

// Shape routes
router.get("/shape/:patternId", shapeController.getShapeById)
router.get("/shapes", shapeController.getAllShapes)

// Score routes
router.post("/score/compare", scoreController.compareShapes)

// Game session routes
router.post("/session/start", (req, res) => {
  // Create a new game session
  res.json({ sessionId: Date.now().toString(), message: "New game session started" })
})

export default router
