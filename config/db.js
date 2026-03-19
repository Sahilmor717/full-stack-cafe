const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbURI = "mongodb+srv://morsahil652_db_user:sahilmor@cluster0.wyvs3lq.mongodb.net/full-stack-cafe?appName=Cluster0";
        await mongoose.connect(dbURI);
        console.log("✅ MongoDB Atlas Connected");
    } catch (err) {
        console.error("❌ DB Connection Error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;