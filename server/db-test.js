import connection from './db/connection.js';
import OTP from './model/otp.js';

async function simpleDBTest() {
    try {
        console.log("Connecting to database...");
        await connection();
        
        console.log("Testing OTP model...");
        
        // Simple create test
        const testOTP = new OTP({
            email: 'test@example.com',
            otp: '123456',
            attempts: 0
        });
        
        console.log("Saving OTP...");
        await testOTP.save();
        console.log("✅ OTP saved successfully!");
        
        // Test find
        console.log("Finding OTP...");
        const found = await OTP.findOne({ email: 'test@example.com' });
        console.log("Found OTP:", found ? 'Yes' : 'No');
        
        // Cleanup
        console.log("Cleaning up...");
        await OTP.deleteOne({ email: 'test@example.com' });
        console.log("✅ Test completed successfully!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Database test failed:", error);
        process.exit(1);
    }
}

simpleDBTest();
