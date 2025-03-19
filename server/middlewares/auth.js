import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
export const isAuthenticated = async (req, res, next) => {
    try {
        
      const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token after "Bearer"
    // console.log('auth  ',token);
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
      const decodedData = jwt.verify(token, process.env.JWT_SECERET);
    //   console.log(decodedData);
      
        req.user = decodedData.userId;
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // Respond with an error if any issue occurs
        console.error("Error in authentication middleware:", error);
        return res.status(500).json({ message: "Error in checking authentication" });
    }
}

export const isAdmin = async (req,res,next) => {
     try {
        const token = res.cookie['admin-token'];
        if (!token) {
            res.status(500).json({ message: "Only admin can access this route" });
        }
        const seceretKey = jwt.verify(token, process.env.ADMIN_SECERET_KEYS);
        const adminSeceretKey = process.env.ADMIN_SECERET_KEYS|| "Shrey";
         const isMatch = seceretKey === adminSeceretKey;
         if (!isMatch) {
            return res.status(400).json({ message: "Invalid admin key" });
        }
         next();
    } catch (error) {
        res.status(500).json({ message: "Error in checking " });
        
    }
}