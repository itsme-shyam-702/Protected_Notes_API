const AppError = require("../utils/AppError")
const asyncWrapper = require("../utils/AsyncWrapper")



const signAccessToken = (user)=>
    jwt.sign(
        {id: user._id, email: user.email, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || '15M'}
    )

    const signrefreshToken = (user)=>
        jwt.sign(
            {id: user._id},
            process.env.REFRESH_SECRET,
            {expiresIn: '7d'}
        )
    

const register = asyncWrapper(async (req,res)=>{
    const {email,password} = req.body

    const existing  = await User.findOne({email});
    if (existing) {
        throw new AppError('Email already registered',409);
    }
    const passwordHash = await bcrypt.hash(password,12)
    const user = await user.create({email,passwordHash})

    res.status(201).json({message:'User registered', userId:user._id})

})  


const login =  asyncWrapper(async (req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email}).select('+passwordHash')
    if (!user) {
        throw new AppError('Invalid credentials',401)
    }
    const valid = await bcrypt.campare (password,user.passwordHash)
    if (!valid){
        throw new AppError('Invalid credentials',401);
}
const accessToken = signAccessToken(user)
const refreshToken = signrefreshToken(user)

user.refreshToken = refreshToken
await user.save()
res.json({accessToken,refreshToken})
})

const refresh = asyncWrapper(async (req,res)=>{
    const {refreshToken} = req.body
    if (!refreshToken){
        throw new AppError('Refresh token required',401)
    }
    let decoded;
    try{
        decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    }catch{
        throw new AppError('Ivnvalid or expired refresh token',401)
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken){
        throw new AppError('Invalid refresh token',401);
    }

    const newAccessToken = signAccessToken(user);
    res.json({accessToken: newAccessToken})
})


const logout = asyncWrapper(async (req, res)=>{
    const {refreshToken } = req.body;
    await User.findOneAndUpdate({refreshToken},{refreshToken: null});
    res.json({message:'Logged Out'})
})

module.exports = {register,login,refresh, logout}

