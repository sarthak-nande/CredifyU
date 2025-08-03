import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, RotateCcw, ArrowRight, User, Mail, Phone, Calendar, GraduationCap, AlertCircle, Camera, Upload } from 'lucide-react'

export default function JWTQRScanner() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const mountedRef = useRef(true)
  const fileInputRef = useRef(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [scannerState, setScannerState] = useState("NOT_STARTED")

  // Mock API function
  const mockApi = {
    post: async (url, data, config) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWnm/eplO9BFtXaUr+uBiQXd1/xO
VGg5YOQqKXgL2gFRyO5vNFXWv5sZnrNy7dfn2LO1eJpQmVdtgEOqE1rNxw==
-----END PUBLIC KEY-----`
      
      return {
        status: 200,
        data: { publicKey: mockPublicKey }
      }
    }
  }

  // Mock public key fetch
  useEffect(() => {
    async function fetchPublicKey() {
      try {
        setIsLoading(true)
        const response = await mockApi.post(
          "/api/get-publickey",
          { collegeId: "6889e7b5174eae4686ab9cf0" },
          { withCredentials: true }
        )
        if (response.status === 200 && mountedRef.current) {
          setError("")
        }
      } catch (error) {
        console.error("Error fetching public key:", error)
        if (mountedRef.current) {
          setError("Error fetching public key")
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }
    fetchPublicKey()
  }, [])

  // Cleanup effect
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopCamera()
    }
  }, [])

  // Mock JWT verification (since we can't use jose library)
  const verifyToken = async (token) => {
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock payload - in real app this would come from JWT verification
      const mockPayload = {
        name: "Alice Johnson",
        email: "alice.johnson@university.edu",
        mobile: "+1-555-0123",
        branch: "Computer Science Engineering",
        year: "Third Year",
        studentId: "CSE2021045",
        iss: "6889e7b5174eae4686ab9cf0",
        aud: "6889e7b5174eae4686ab9cf0",
        iat: Math.floor(Date.now() / 1000) - 86400 // Yesterday
      }
      
      if (mountedRef.current) {
        setPayload(mockPayload)
        setError("")
        setIsVerified(true)
        setIsScanning(false)
        setScannerState("VERIFIED")
        stopCamera()
      }
    } catch (err) {
      console.error("Invalid token:", err)
      if (mountedRef.current) {
        setError("Invalid or tampered token")
        setIsScanning(false)
        setScannerState("ERROR")
      }
    }
  }

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      setIsScanning(true)
      setError("")
      setScannerState("STARTING")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      if (videoRef.current && mountedRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setScannerState("RUNNING")
        
        // In a real implementation, you would process video frames here
        // to detect and decode QR codes
        
        // For demo purposes, we'll simulate finding a QR code after 3 seconds
        setTimeout(() => {
          if (mountedRef.current && isScanning) {
            const mockJWT = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWxpY2UgSm9obnNvbiIsImVtYWlsIjoiYWxpY2Uuam9obnNvbkB1bml2ZXJzaXR5LmVkdSJ9.mockSignature"
            verifyToken(mockJWT)
          }
        }, 3000)
      }
    } catch (err) {
      console.error("Camera access error:", err)
      if (mountedRef.current) {
        setError("Could not access camera. Please check camera permissions.")
        setIsScanning(false)
        setScannerState("ERROR")
      }
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
    setScannerState("STOPPED")
  }

  // Handle file upload for QR code image
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // In a real implementation, you would:
      // 1. Read the image file
      // 2. Process it to detect QR codes
      // 3. Decode the QR code to get the JWT
      
      // For demo, we'll simulate this process
      setError("")
      setScannerState("PROCESSING")
      
      setTimeout(() => {
        const mockJWT = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQm9iIFNtaXRoIiwiZW1haWwiOiJib2Iuc21pdGhAdW5pdmVyc2l0eS5lZHUifQ.mockSignature"
        verifyToken(mockJWT)
      }, 2000)
    }
  }

  const handleRescan = () => {
    setIsVerified(false)
    setPayload(null)
    setError("")
    setScannerState("NOT_STARTED")
    stopCamera()
  }

  const handleMoveForward = () => {
    console.log("Moving forward with verified student:", payload)
    alert("Student verification complete! Proceeding to next step...")
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  // Mock scan for demo
  const mockScan = () => {
    setError("")
    setScannerState("PROCESSING")
    const mockJWT = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQ2hhcmxpZSBEYXZpcyIsImVtYWlsIjoiY2hhcmxpZS5kYXZpc0B1bml2ZXJzaXR5LmVkdSJ9.mockSignature"
    verifyToken(mockJWT)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verification system...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <QrCode className="h-6 w-6" />
              JWT QR Code Scanner
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Scan or upload a QR code containing a JWT token
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {scannerState === "PROCESSING" && (
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>Processing QR code...</AlertDescription>
              </Alert>
            )}

            {/* Camera View */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  {isScanning ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Camera preview will appear here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {isScanning && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    {scannerState === "RUNNING" ? "Scanning for QR codes..." : scannerState}
                  </div>
                )}

                {/* QR Code overlay corners */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-16 left-16 w-8 h-8 border-l-2 border-t-2 border-green-400"></div>
                    <div className="absolute top-16 right-16 w-8 h-8 border-r-2 border-t-2 border-green-400"></div>
                    <div className="absolute bottom-16 left-16 w-8 h-8 border-l-2 border-b-2 border-green-400"></div>
                    <div className="absolute bottom-16 right-16 w-8 h-8 border-r-2 border-b-2 border-green-400"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={startCamera} 
                  disabled={isScanning} 
                  className="flex-1" 
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isScanning ? "Scanning..." : "Start Camera"}
                </Button>
                {isScanning && (
                  <Button onClick={stopCamera} variant="outline" size="lg">
                    Stop
                  </Button>
                )}
              </div>

              {/* File Upload */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload QR Code Image
                </Button>
              </div>

              {/* Demo Button */}
              <Button 
                onClick={mockScan} 
                variant="secondary" 
                className="w-full"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Demo Scan (Test)
              </Button>
            </div>

            {scannerState !== "NOT_STARTED" && scannerState !== "STOPPED" && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Status: {scannerState}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Verification Status */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">✅ JWT Token Verified</span>
            </div>
          </CardContent>
        </Card>

        {/* Student Identity Card */}
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="h-6 w-6" />
              Student Identity Card
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Student Name & Badge */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{payload?.name}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {payload?.branch}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {payload?.year}
                  </Badge>
                  {payload?.studentId && (
                    <Badge variant="secondary" className="text-sm">
                      ID: {payload.studentId}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Student Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Full Name</p>
                    <p className="font-semibold text-gray-800">{payload?.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Email Address</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">{payload?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Mobile Number</p>
                    <p className="font-semibold text-gray-800">{payload?.mobile}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Academic Year</p>
                    <p className="font-semibold text-gray-800">{payload?.year}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <GraduationCap className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Branch of Study</p>
                    <p className="font-semibold text-gray-800">{payload?.branch}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* JWT Metadata */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Token Information
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Issuer:</span>
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      {payload?.iss}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Audience:</span>
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      {payload?.aud}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Issued Date:</span>
                    <span className="font-medium">
                      {payload ? formatDate(payload.iat) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleRescan} 
            className="flex-1 bg-white hover:bg-gray-50"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Scan Another
          </Button>
          <Button 
            onClick={handleMoveForward} 
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}