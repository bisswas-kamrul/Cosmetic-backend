const mongoose = require('mongoose');
function DBconection() {
    if (!process.env.DB_URL) {
        throw new Error("DB_URL is required");
    }

    mongoose.connect(process.env.DB_URL)
        .then(() => {
            if (process.env.NODE_ENV !== "production") {
                console.log("Database connected");
            }
        })
        .catch((error) => {
            console.error("Database connection failed:", error.message);
            process.exit(1);
        });
}
module.exports = DBconection
