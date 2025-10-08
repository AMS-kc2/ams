import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';
import { authenticateJWT } from '../middleware';


const router = Router();

// POST /sessions
router.post('/', authenticateJWT, sessionController.createSession);

// GET /sessions/active
router.get('/active', authenticateJWT, sessionController.getActiveSessions);

// PUT /sessions/:sessionId/sign-out-otp
router.put('/:sessionId/sign-out-otp', authenticateJWT, sessionController.getSignOutOtp);

// POST /sessions/verify
router.post('/verify', authenticateJWT, sessionController.verifySession);

// PUT /sessions/:sessionId/end
router.put('/:sessionId/end', authenticateJWT, sessionController.endSession);

// PUT /sessions/:sessionId/reattach
router.put('/:sessionId/reattach', authenticateJWT, sessionController.reattachSession);

// GET /sessions?lecturerId=1&courseId=2
router.get('/', authenticateJWT, sessionController.getSessions);

// GET /sessions/:sessionId/attendances
router.get('/:sessionId/attendances', authenticateJWT, sessionController.getSessionAttendances);

export default router;


