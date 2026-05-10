import express from 'express';
import { getProfile, Login, logoutUser, SignUp, verifyemail, oauthSuccess } from '../controllers/user.js';
import { isAuthenticated } from '../middlewares/auth.js';
import passport from 'passport';

const  router = express.Router();


router.post('/signup', SignUp);

router.post('/login', Login);
router.post('/verifyemail', verifyemail);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  oauthSuccess
);

// now user should be logged in 
// router.use(isAuthenticated); after this all routes usees is authenticated auto amtically 
router.get('/me', isAuthenticated, getProfile);
router.get('/logout', isAuthenticated, logoutUser);

export default router;