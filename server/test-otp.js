import { sendOTP, verifyOTP } from "./middleware/otpGenerator.js";
import "./db/connection.js"; // Ensure DB connection

async function testOTP() {
    try {
        console.log("🧪 Testing OTP system...");
        
        const email = "sarthu102@gmail.com";
        console.log(`📧 Sending OTP to: ${email}`);
        
        await sendOTP(email);
        console.log("✅ OTP sent successfully!");
        
        // Test verification with a dummy OTP
        console.log("🔍 Testing OTP verification...");
        const result = await verifyOTP(email, "123456");
        console.log(`📊 Verification result: ${result}`);
        
    } catch (error) {
        console.error("❌ Error testing OTP:", error);
    }
}

testOTP();
