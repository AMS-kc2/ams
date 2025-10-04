import { Router } from 'express';
import * as courseController from '../controllers/session.controller';


const router = Router();

// POST /sessions
router.post('/', courseController.createSession);

// POST /sessions/verify
router.post('/verify', courseController.verifySession);

// PUT /sessions/:sessionId/end
router.put('/:sessionId/end', courseController.endSession);

// PUT /sessions/:sessionId/reattach
router.put('/:sessionId/reattach', courseController.reattachSession);

// GET /sessions?lecturerId=1&courseId=2
router.get('/', courseController.getSessions);

// GET /sessions/:sessionId/attendances
router.get('/:sessionId/attendances', courseController.getSessionAttendances);

export default router;


