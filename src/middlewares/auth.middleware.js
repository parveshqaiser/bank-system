
import jwt from "jsonwebtoken";

export const authenticateUser = async(req, res, next)=>{
    try {
        
        let token = req.cookies.token || req.header("Authorization")?.replace("Bearer","");

        if(!token){
            return res.status(401).json({
                message : "Unauthorized User", 
                success : false, 
                status : 401
            });
        }

        let decode = jwt.verify(token,process.env.SECRET_KEY);
        req.user = decode;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or Expired Token",
            success: false
        });
    }
}