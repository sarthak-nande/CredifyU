import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, RotateCcw, ArrowRight, User, Mail, Phone, Calendar, GraduationCap, AlertCircle, Camera, Upload } from 'lucide-react'
import api from "@/utils/api"

export default function JWTQRScanner() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const mountedRef = useRef(true)
  const fileInputRef = useRef(null)
  const scanIntervalRef = useRef(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState("")
  const [publicKeyPem, setPublicKeyPem] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [scannerState, setScannerState] = useState("NOT_STARTED")

  // Fetch the public key when component mounts
  useEffect(() => {
    async function fetchPublicKey() {
      try {
        setIsLoading(true)
        const response = await api.post(
          "/api/get-publickey",
          { collegeId: "6889e7b5174eae4686ab9cf0" },
          { withCredentials: true }
        )
        
        if (response.status === 200) {
          const raw = response.data.publicKey
          const fixedPem = raw.replace(/\\n/g, "\n")
          if (mountedRef.current) {
            setPublicKeyPem(fixedPem)
            setError("")
          }
        } else {
          console.error("Failed to fetch public key")
          if (mountedRef.current) {
            setError("Failed to fetch public key")
          }
        }
      } catch (error) {
        console.error("Error fetching public key:", error)
        if (mountedRef.current) {
          setError("Error fetching public key: " + error.message)
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
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
  }, [])

  // Base64 to Uint8Array conversion
  const base64ToUint8Array = (base64) => {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  // JWT verification using Web Crypto API
  const verifyToken = async (token) => {
    try {
      if (!publicKeyPem) {
        throw new Error("Public key not loaded yet")
      }

      // Parse JWT
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format")
      }

      const [headerB64, payloadB64, signatureB64] = parts

      // Decode header and payload
      const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))

      // Convert PEM to CryptoKey
      const pemHeader = "-----BEGIN PUBLIC KEY-----"
      const pemFooter = "-----END PUBLIC KEY-----"
      const pemContents = publicKeyPem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "")
      const keyData = base64ToUint8Array(pemContents)

      const publicKey = await crypto.subtle.importKey(
        "spki",
        keyData,
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        false,
        ["verify"]
      )

      // Verify signature
      const signatureBytes = base64ToUint8Array(signatureB64.replace(/-/g, '+').replace(/_/g, '/'))
      const dataToVerify = new TextEncoder().encode(`${headerB64}.${payloadB64}`)

      const isValid = await crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: "SHA-256"
        },
        publicKey,
        signatureBytes,
        dataToVerify
      )

      if (!isValid) {
        throw new Error("Invalid signature")
      }

      // Verify issuer and audience
      if (payload.iss !== "6889e7b5174eae4686ab9cf0" || payload.aud !== "6889e7b5174eae4686ab9cf0") {
        throw new Error("Invalid issuer or audience")
      }

      if (mountedRef.current) {
        setPayload(payload)
        setError("")
        setIsVerified(true)
        setIsScanning(false)
        setScannerState("VERIFIED")
        stopCamera()
      }
    } catch (err) {
      console.error("JWT verification failed:", err)
      if (mountedRef.current) {
        setError("Invalid or tampered token: " + err.message)
        setIsScanning(false)
        setScannerState("ERROR")
      }
    }
  }

  // QR Code detection using canvas
  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Here you would typically use a QR detection library
    // For now, we'll use a simple pattern detection approach
    // In a real implementation, you'd want to use jsQR or similar library
    
    try {
      // Simple QR code detection - look for dark/light patterns
      // This is a very basic implementation and may not work reliably
      const qrText = scanImageForQR(imageData)
      if (qrText && qrText.startsWith('ey')) { // Basic JWT check
        verifyToken(qrText)
      }
    } catch (error) {
      console.log("QR detection error:", error)
    }
  }

  // Basic QR pattern detection (simplified)
  const scanImageForQR = (imageData) => {
    // This is a placeholder for actual QR detection
    // In a real implementation, you would use a proper QR detection library
    // For demo purposes, you could manually enter a JWT token
    return null
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
        
        // Start scanning for QR codes
        scanIntervalRef.current = setInterval(detectQRCode, 500)
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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
    setScannerState("STOPPED")
  }

  // Handle file upload for QR code image
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setError("")
      setScannerState("PROCESSING")
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          // Process image for QR code
          const qrText = scanImageForQR(imageData)
          if (qrText) {
            verifyToken(qrText)
          } else {
            setError("No QR code found in image")
            setScannerState("ERROR")
          }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Manual JWT input for testing
  const handleManualInput = () => {
    const jwt = prompt("Enter JWT token for testing:")
    if (jwt && jwt.trim()) {
      verifyToken(jwt.trim())
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading public key...</p>
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

            {/* Hidden canvas for QR detection */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

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
                  disabled={isScanning || !publicKeyPem} 
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
                  disabled={!publicKeyPem}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload QR Code Image
                </Button>
              </div>

              {/* Manual Input for Testing */}
              <Button 
                onClick={handleManualInput} 
                variant="secondary" 
                className="w-full"
                disabled={!publicKeyPem}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Manual JWT Input (Testing)
              </Button>
            </div>

            {scannerState !== "NOT_STARTED" && scannerState !== "STOPPED" && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Status: {scannerState}</p>
              </div>
            )}

            {!publicKeyPem && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Waiting for public key to load...</AlertDescription>
              </Alert>
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