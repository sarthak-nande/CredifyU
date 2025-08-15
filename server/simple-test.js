console.log("Starting test with DB connection...");

import connection from './db/connection.js';

async function test() {
    try {
        console.log("Connecting to database...");
        await connection();
        
        console.log("Importing OTP module...");
        const { sendOTP, verifyOTP } = await import('./middleware/otpGenerator.js');
        
        console.log("Testing sendOTP...");
        await sendOTP("sarthu102@gmail.com");
        console.log("✅ OTP sent successfully!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

test();
