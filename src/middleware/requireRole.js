const requireRole = (role)=>{
    return (req, res, next) =>{
        if (!req.user){
            return res.status(401).json({message: 'Note Authentiated'})
        }
        
        if (req.user.role != role){
            return res.status(403).json({
                message: `Forbiddon: requires role '${role}'`,

            })
        }
        next();

    }
}

module.exports = requireRole