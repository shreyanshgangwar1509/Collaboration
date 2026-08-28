import express from 'express';
import passport from 'passport';
import { getProfile, Login, logoutUser, oauthSuccess, SignUp, verifyemail } from '../controllers/user.js';
import { isAuthenticated } from '../middlewares/auth.js';

const  router = express.Router();


router.post('/signup', SignUp);

router.post('/login', Login);
router.post('/verifyemail', verifyemail);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    session: false,
  }),
  oauthSuccess
);

// now user should be logged in 
// router.use(isAuthenticated); after this all routes usees is authenticated auto amtically 
router.get('/me', isAuthenticated, getProfile);
router.get('/logout', isAuthenticated, logoutUser);

export default router;