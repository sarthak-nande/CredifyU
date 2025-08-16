// Test OTP verification with both valid and invalid OTPs
import fetch from 'node-fetch';

const testEmail = "test@example.com";

async function testOTPVerification() {
    try {
        console.log("🧪 Testing OTP verification functionality...");
        
        // Test 1: Send OTP
        console.log("📧 Sending OTP to:", testEmail);
        const sendResponse = await fetch('http://localhost:5000/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail })
        });
        
        const sendResult = await sendResponse.json();
        console.log("Send OTP result:", sendResult);
        
        // Test 2: Try invalid OTP
        console.log("\n❌ Testing invalid OTP (123456):");
        const invalidResponse = await fetch('http://localhost:5000/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, otp: "123456" })
        });
        
        const invalidResult = await invalidResponse.json();
        console.log("Invalid OTP result:", invalidResult);
        console.log("Status:", invalidResponse.status);
        
        // Test 3: Try another invalid OTP
        console.log("\n❌ Testing another invalid OTP (000000):");
        const invalid2Response = await fetch('http://localhost:5000/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, otp: "000000" })
        });
        
        const invalid2Result = await invalid2Response.json();
        console.log("Invalid OTP result:", invalid2Result);
        console.log("Status:", invalid2Response.status);
        
        console.log("\n✅ OTP verification test completed!");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

testOTPVerification();
