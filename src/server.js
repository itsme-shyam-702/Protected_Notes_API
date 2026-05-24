require('dotenv').config()
const mongoose =  require('mongoose')
const app = require('./app')

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB connected");
     app.listen(PORT, () => {
      console.log(`🚀 Notes API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });

