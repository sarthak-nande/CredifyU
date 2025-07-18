import mongoose from "mongoose";

async function connection() {

    try {
        const url = process.env.MONGO_DB_URI;

        if(!url){
            console.error("DB Connection String Not Found!");
        }

        const connect = await mongoose.connect(url);

        if(!connect){
            console.error("Faild To Connect DB");
        }

        console.log("✅ DB Connection Successfuly! " + connect.connection.host);

    } catch (error) {
        console.log("DB Connection Terminated Due To, " + error);
    }
}

export default connection;