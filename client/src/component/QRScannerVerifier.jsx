import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { jwtVerify, importSPKI } from "jose"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { QrCode, CheckCircle, RotateCcw, ArrowRight, User, Mail, Phone, Calendar, GraduationCap, AlertCircle, Camera, ForwardIcon, Upload, FileImage } from 'lucide-react'
import api from "@/utils/api"
import { QRCodeCanvas } from "qrcode.react"
import { set } from "lodash"
import { useSelector } from "react-redux"
import CollegeSelect from "./CollegeSelect"
import { useNavigate } from "react-router-dom"
import SuccessCard from "./SuccessCard"
import Header from "./Header"

export default function JWTQRScanner() {
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const mountedRef = useRef(true);
  const scannerIdRef = useRef(`qr-reader-${Date.now()}`);
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [myToken, setMyToken] = useState("");
  const [isForwarded, setIsForwarded] = useState(false);
  
  // OTP verification states
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOTPLoading, setIsOTPLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [tempPayload, setTempPayload] = useState(null); // Store payload until OTP verification
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef(null);

  const myCollegeId = useSelector((state) => state.college.collegeId);
  const user = useSelector((state) => state.user.user);

  const role = localStorage.getItem("role");

  // Function to get students array from localStorage
  const getStudentsFromStorage = () => {
    try {
      const students = localStorage.getItem("students");
      return students ? JSON.parse(students) : [];
    } catch (error) {
      console.error("Error parsing students data", error);
      return [];
    }
  };

  // Function to save student to array in localStorage
  const saveStudentToArray = (studentData, token) => {
    try {
      const existingStudents = getStudentsFromStorage();
      
      // Check if student already exists (by email or ID)
      const studentExists = existingStudents.some(student => 
        student.email === studentData.email || 
        (student._id && studentData._id && student._id === studentData._id)
      );

      if (!studentExists) {
        // Add timestamp and token for when data was saved
        const studentWithMetadata = {
          ...studentData,
          token: token,
          savedAt: new Date().toISOString(),
          scannedAt: new Date().toISOString(),
          id: Date.now(), // Generate unique ID if not present
          collegeId: myCollegeId
        };
        
        existingStudents.push(studentWithMetadata);
        localStorage.setItem("students", JSON.stringify(existingStudents));
        
        // Set as current student
        localStorage.setItem("currentStudent", JSON.stringify(studentWithMetadata));
        
        console.log("Student data saved to array:", studentWithMetadata);
        return studentWithMetadata;
      } else {
        // Update existing student with new scan data
        const updatedStudents = existingStudents.map(student => {
          if (student.email === studentData.email || 
              (student._id && studentData._id && student._id === studentData._id)) {
            return {
              ...student,
              ...studentData,
              token: token,
              lastScannedAt: new Date().toISOString(),
              collegeId: myCollegeId
            };
          }
          return student;
        });
        
        localStorage.setItem("students", JSON.stringify(updatedStudents));
        
        // Find and set updated student as current
        const updatedStudent = updatedStudents.find(student => 
          student.email === studentData.email || 
          (student._id && studentData._id && student._id === studentData._id)
        );
        
        localStorage.setItem("currentStudent", JSON.stringify(updatedStudent));
        
        console.log("Student data updated in array:", updatedStudent);
        return updatedStudent;
      }
    } catch (error) {
      console.error("Error saving student to array", error);
      return studentData;
    }
  };

  const cleanupScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (error) {
        console.warn("Scanner cleanup error (can be ignored):", error);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  // Main Effect for component mount/unmount and public key fetch
  useEffect(() => {
    mountedRef.current = true;

    async function fetchPublicKey() {
      try {
        setIsLoading(true);
        const response = await api.post("/api/get-publickey", { collegeId: myCollegeId }, { withCredentials: true });
        if (mountedRef.current) {
          if (response.status === 200) {
            const fixedPem = response.data.publicKey.replace(/\\n/g, "\n");
            setPublicKeyPem(fixedPem);
            setError("");
          } else {
            setError("Failed to fetch public key");
          }
        }
      } catch (error) {
        console.error("Error fetching public key:", error);
        if (mountedRef.current) {
          setError("Error fetching public key");
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    fetchPublicKey();

    return () => {
      mountedRef.current = false;
      cleanupScanner();
    };
  }, []);

  // OTP Timer Effect
  useEffect(() => {
    let timer;
    if (requiresOTP && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResendOTP(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [requiresOTP, timeLeft]);

  // Effect to manage scanner start/stop
  useEffect(() => {
    if (isScanning && !html5QrCodeRef.current && qrRef.current && publicKeyPem) {
      const qrCode = new Html5Qrcode(qrRef.current.id);
      html5QrCodeRef.current = qrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const onScanSuccess = (decodedText, decodedResult) => {
        if (mountedRef.current && decodedText) {
          cleanupScanner();
          setMyToken(decodedText);
          localStorage.setItem("token", decodedText);
          verifyToken(decodedText);
        }
      };
      const onScanError = (errorMessage) => {
        // console.warn(errorMessage);
      };

      qrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanError)
        .catch(err => {
          console.error("Failed to start scanner:", err);
          if (mountedRef.current) {
            setError("Could not access camera. Please check permissions.");
            setIsScanning(false);
          }
        });
    }
    // Cleanup function within this effect to handle stop logic
    return () => {
      if (!isScanning) {
        cleanupScanner();
      }
    };
  }, [isScanning, publicKeyPem]);

  const verifyToken = async (token) => {
    try {
      if (!publicKeyPem) throw new Error("Public key not loaded yet");

      const publicKey = await importSPKI(publicKeyPem, "ES256");

      const { payload: verifiedPayload } = await jwtVerify(token, publicKey, {
        issuer: myCollegeId,
        audience: myCollegeId,
      });

      if (mountedRef.current) {
        // Store the verified payload temporarily
        setTempPayload(verifiedPayload);
        setMyToken(token);
        
        // Check if user is authority or third party authority - skip OTP verification
        if (role === "authority" || role === "third-party-authority") {
          // Direct verification for authority users - NO DATA SAVING
          setPayload(verifiedPayload);
          setIsVerified(true);
          setTempPayload(null);
          setError("");
          console.log("Authority user verification - OTP skipped, data not saved");
        } else {
          // Extract email and send OTP for other users
          const email = verifiedPayload.email;
          if (email) {
            setStudentEmail(email);
            await sendOTPToStudent(email);
          } else {
            setError("No email found in student data");
          }
        }
      }
    } catch (err) {
      console.error("Verification failed:", err);
      if (mountedRef.current) {
        setError("Invalid or tampered token");
      }
    }
  };

  // Function to handle QR image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Scan the actual file
      scanUploadedImage(file);
    } else {
      setError("Please select a valid image file");
    }
  };

  // Function to scan uploaded QR image
  const scanUploadedImage = async (file) => {
    try {
      setError("");
      setIsProcessingUpload(true);
      
      // Use Html5Qrcode to scan the file directly
      const html5QrCode = new Html5Qrcode("temp-scanner");
      
      try {
        const result = await html5QrCode.scanFile(file, true);
        
        if (result && mountedRef.current) {
          console.log("QR Code detected:", result);
          setMyToken(result);
          localStorage.setItem("token", result);
          setUploadedImage(null);
          setIsUploadMode(false);
          setIsProcessingUpload(false);
          verifyToken(result);
          return;
        }
      } catch (scanError) {
        console.error("QR scan failed:", scanError);
        
        // Fallback: Try with different approach using canvas
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Scale image for better detection
              const maxSize = 800;
              let { width, height } = img;
              
              if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
              
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              
              // Convert canvas to blob and try scanning again
              canvas.toBlob(async (blob) => {
                try {
                  const resultFallback = await html5QrCode.scanFile(blob, true);
                  if (resultFallback && mountedRef.current) {
                    console.log("QR Code detected with fallback:", resultFallback);
                    setMyToken(resultFallback);
                    localStorage.setItem("token", resultFallback);
                    setUploadedImage(null);
                    setIsUploadMode(false);
                    setIsProcessingUpload(false);
                    verifyToken(resultFallback);
                    resolve();
                  } else {
                    reject(new Error("No QR code found"));
                  }
                } catch (fallbackError) {
                  reject(fallbackError);
                }
              }, 'image/jpeg', 0.9);
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
        } catch (fallbackError) {
          console.error("Fallback scan also failed:", fallbackError);
          setError("Could not detect QR code in the uploaded image. Please try:\n• Using a clearer image\n• Ensuring the QR code is fully visible\n• Uploading a different image format");
          setIsProcessingUpload(false);
        }
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Error processing uploaded image");
      setIsProcessingUpload(false);
    }
  };

  // Function to trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRescan = () => {
    setIsVerified(false);
    setPayload(null);
    setTempPayload(null);
    setRequiresOTP(false);
    setStudentEmail("");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setTimeLeft(300);
    setCanResendOTP(false);
    setError("");
    setIsUploadMode(false);
    setUploadedImage(null);
    setIsProcessingUpload(false);
    cleanupScanner();
    setIsScanning(true);
  };

  // Send OTP to student email
  const sendOTPToStudent = async (email) => {
    try {
      setIsOTPLoading(true);
      const response = await api.post("/api/send-otp", { email });
      
      if (response.status === 200) {
        setRequiresOTP(true);
        setTimeLeft(300); // Reset timer
        setCanResendOTP(false);
        setOtpError("");
        setError("");
        console.log("OTP sent to:", email);
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setError("Failed to send OTP to student email");
    } finally {
      setIsOTPLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP input keydown
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP and show student info
  const verifyOTPAndShowStudent = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setIsOTPLoading(true);
      const response = await api.post("/api/verify-otp", {
        email: studentEmail,
        otp: otpString
      });

      if (response.status === 200 && response.data.verified) {
        // OTP verified, now show student info
        setPayload(tempPayload);
        
        // Only save data if user is not an authority user
        if (!(role === "authority" || role === "third-party-authority")) {
          // Save to array
          const savedStudent = saveStudentToArray(tempPayload, myToken);
          
          // Keep old localStorage for backward compatibility
          localStorage.setItem("student", JSON.stringify(tempPayload));
        } else {
          console.log("Authority user - data not saved");
        }
        
        setIsVerified(true);
        setRequiresOTP(false);
        setOtpError("");
        setError("");
      } else {
        setOtpError("Invalid or expired OTP");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setOtpError(error.response?.data?.message || "OTP verification failed");
    } finally {
      setIsOTPLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (studentEmail) {
      setOtp(["", "", "", "", "", ""]);
      await sendOTPToStudent(studentEmail);
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMoveForward = () => {
    setIsForwarded(true);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Function to get current student count for display
  const getStudentCount = () => {
    const students = getStudentsFromStorage();
    return students.length;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading public key...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // OTP Verification UI
  if (requiresOTP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto space-y-6">
          <Card className="border-blue-200 bg-blue-50 text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Mail className="h-6 w-6" />
                <span className="text-lg font-semibold">Email Verification Required</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Verify Student Email</CardTitle>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code sent to{" "}
                <strong className="text-blue-600">{studentEmail}</strong>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  ))}
                </div>
                {otpError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {otpError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Timer */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600">
                    Code expires in{" "}
                    <span className="font-medium text-blue-600">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">Code has expired</p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                onClick={verifyOTPAndShowStudent}
                disabled={isOTPLoading || otp.join("").length !== 6}
                className="w-full"
                size="lg"
              >
                {isOTPLoading ? "Verifying..." : "Verify & View Student Info"}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  onClick={resendOTP}
                  disabled={!canResendOTP || isOTPLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResendOTP ? "Resend verification code" : "Resend code"}
                </button>
              </div>

              {/* Back to scan */}
              <Button
                onClick={handleRescan}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Scan Different QR Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isVerified) {
    const studentCount = getStudentCount();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <Card className="border-green-200 bg-green-50 text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">✅ Verified JWT</span>
              </div>
              {studentCount > 1 && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {studentCount} students saved
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-6 w-6" />
                {(role === "authority" || role === "third-party-authority") ? "Credential Verification" : "Student Identity Card"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Only show QR code for non-authority users */}
              {!(role === "authority" || role === "third-party-authority") && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <QRCodeCanvas value={myToken} size={256} />
                  </div>
                  <Separator />
                </>
              )}
              
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800">{payload?.name}</h2>
                  <Badge variant="secondary" className="mt-1">
                    {payload?.branch} - {payload?.year}
                  </Badge>
                  {(role === "authority" || role === "third-party-authority") && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        ✅ Verified Credential
                      </Badge>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{payload?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-sm">{payload?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Mobile</p>
                      <p className="font-medium">{payload?.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Academic Year</p>
                      <p className="font-medium">{payload?.year}</p>
                    </div>
                  </div>
                </div>
                
                {/* Only show JWT info for non-authority users */}
                {!(role === "authority" || role === "third-party-authority") && (
                  <>
                    <Separator />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">JWT Information</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Issuer:</span>
                          <span className="font-mono text-xs">{payload?.iss}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Audience:</span>
                          <span className="font-mono text-xs">{payload?.aud}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Issued At:</span>
                          <span>{payload ? formatDate(payload.iat) : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scanned At:</span>
                          <span>{new Date().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleRescan} className="flex-1 bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Rescan
            </Button>
            {/* Only show save option for non-authority users */}
            {!(role === "authority" || role === "third-party-authority") && <SuccessCard />}
          </div>
        </div>
      </div>
    );
  }

  return (
    myCollegeId ? (
      <div>
        {/* Show Header only for non-authority users */}
        {!(role === "authority" || role === "third-party-authority") && (
          <Header title="CredifyU" subtitle="Store and verify student identities" />
        )}
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <QrCode className="h-6 w-6" />
              Scan JWT QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Show existing student count if any */}
            {getStudentCount() > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  📚 {getStudentCount()} student{getStudentCount() > 1 ? 's' : ''} already saved
                </p>
              </div>
            )}
            
            {/* Upload Image Preview */}
            {uploadedImage && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileImage className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Uploaded QR Image</span>
                </div>
                <div className="relative w-full max-w-xs mx-auto">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded QR Code" 
                    className="w-full h-auto rounded-lg border border-gray-200"
                  />
                  <Button
                    onClick={() => {
                      setUploadedImage(null);
                      setIsUploadMode(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {isProcessingUpload ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Scanning QR code from image...
                    </span>
                  ) : (
                    "QR code uploaded successfully"
                  )}
                </p>
                {error && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm sm:w-80 h-80 mx-auto">
                <div
                  ref={qrRef}
                  id={scannerIdRef.current}
                  className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!isScanning && !uploadedImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 pointer-events-none">
                      <div className="text-center">
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Camera will appear here</p>
                        <p className="text-xs text-gray-400 mt-1">Or upload a QR image below</p>
                      </div>
                    </div>
                  )}
                </div>
                {isScanning && (
                  <Badge className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1">
                    Scanning...
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setIsScanning(true)}
                disabled={isScanning || !publicKeyPem}
                className="w-full"
                size="lg"
              >
                {isScanning ? "Scanning..." : "Start Camera Scan"}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={triggerFileUpload}
                  disabled={isScanning || isProcessingUpload}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessingUpload ? "Processing..." : "Upload QR Image"}
                </Button>
                
                {isScanning && (
                  <Button
                    onClick={async () => {
                      await cleanupScanner();
                      setIsScanning(false);
                    }}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Stop Scan
                  </Button>
                )}
              </div>
              
              <Button onClick={handleRescan} variant="secondary" className="w-full" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Rescan
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {/* Hidden temporary scanner for image processing */}
              <div id="temp-scanner" style={{ display: 'none' }}></div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    ) : (navigate("/student/college-name"))
  );
}