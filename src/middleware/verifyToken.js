const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next)=>{
    const authHeader= req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token){
        return res.status(401).json({message:'Access token required'})
    }
    try{
        const decoded = jwt.verify(token, process.env.JWt_SECRET);
        req.user= decoded;
        next()
    }catch (err){
        res.status(401).json({message:'Invalid or expired token'})
    }
}

module.exports = verifyToken