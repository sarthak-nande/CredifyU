import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, RotateCcw, ArrowRight, User, Mail, Phone, Calendar, GraduationCap, AlertCircle, Camera, Upload } from 'lucide-react'
import api from "@/utils/api"

// Note: html5-qrcode is not available in this environment
// This is a mock implementation for demonstration
class Html5Qrcode {
  constructor(elementId) {
    this.elementId = elementId
    this.isScanning = false
    this.stream = null
  }

  static getCameras() {
    return Promise.resolve([
      { id: "camera1", label: "Back Camera" },
      { id: "camera2", label: "Front Camera" }
    ])
  }

  async start(cameraIdOrConfig, config, qrCodeSuccessCallback, qrCodeErrorCallback) {
    try {
      const element = document.getElementById(this.elementId)
      if (!element) throw new Error("Element not found")

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraIdOrConfig.facingMode || 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      this.stream = stream
      this.isScanning = true

      // Create video element
      const video = document.createElement('video')
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      video.style.width = '100%'
      video.style.height = '100%'
      video.style.objectFit = 'cover'
      video.srcObject = stream

      // Clear element and add video
      element.innerHTML = ''
      element.appendChild(video)

      // Create canvas for QR detection
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Start QR detection
      const detectQR = () => {
        if (!this.isScanning || !video.videoWidth) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        // Simple QR pattern detection
        const qrText = this.detectQRPattern(imageData, canvas.width, canvas.height)
        if (qrText) {
          qrCodeSuccessCallback(qrText)
        } else if (qrCodeErrorCallback) {
          qrCodeErrorCallback("No QR code found")
        }
      }

      // Start detection loop
      this.detectionInterval = setInterval(detectQR, 300)

      return Promise.resolve()
    } catch (error) {
      throw error
    }
  }

  detectQRPattern(imageData, width, height) {
    const data = imageData.data
    
    // Convert to grayscale
    const grayData = new Uint8ClampedArray(width * height)
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayData[i / 4] = gray
    }

    // Look for QR finder patterns
    const finderPatterns = this.findFinderPatterns(grayData, width, height)
    
    if (finderPatterns.length >= 3) {
      // Mock QR data for demonstration
      // In real implementation, this would decode the actual QR data
      const mockJWT = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwibW9iaWxlIjoiKzEyMzQ1Njc4OTAiLCJicmFuY2giOiJDb21wdXRlciBTY2llbmNlIiwieWVhciI6IkZpbmFsIFllYXIiLCJpc3MiOiI2ODg5ZTdiNTE3NGVhZTQ2ODZhYjljZjAiLCJhdWQiOiI2ODg5ZTdiNTE3NGVhZTQ2ODZhYjljZjAiLCJpYXQiOjE3MzMxOTI4MDB9.mockSignature"
      return mockJWT
    }
    
    return null
  }

  findFinderPatterns(grayData, width, height) {
    const patterns = []
    const threshold = 128
    
    for (let y = 0; y < height - 7; y += 4) {
      for (let x = 0; x < width - 7; x += 4) {
        if (this.isFinderPattern(grayData, x, y, width, threshold)) {
          patterns.push({ x, y })
        }
      }
    }
    
    return patterns
  }

  isFinderPattern(grayData, startX, startY, width, threshold) {
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ]
    
    let matches = 0
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const pixelIndex = (startY + y) * width + (startX + x)
        if (pixelIndex >= grayData.length) continue
        
        const isBlack = grayData[pixelIndex] < threshold
        const shouldBeBlack = pattern[y][x] === 1
        
        if (isBlack === shouldBeBlack) {
          matches++
        }
      }
    }
    
    return matches >= 40 // 80% match
  }

  async stop() {
    this.isScanning = false
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    const element = document.getElementById(this.elementId)
    if (element) {
      element.innerHTML = ''
    }

    return Promise.resolve()
  }

  async clear() {
    const element = document.getElementById(this.elementId)
    if (element) {
      element.innerHTML = ''
    }
    return Promise.resolve()
  }
}

export default function JWTQRScanner() {
  const qrRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const mountedRef = useRef(true)
  const fileInputRef = useRef(null)
  const scannerIdRef = useRef(0)
  
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
      cleanupScanner()
    }
  }, [])

  const cleanupScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const scanner = html5QrCodeRef.current
        html5QrCodeRef.current = null
        
        if (scannerState === "RUNNING" || scannerState === "PAUSED") {
          await scanner.stop()
        }
        
        setTimeout(async () => {
          try {
            await scanner.clear()
          } catch (error) {
            console.log("Scanner clear error (can be ignored):", error)
          }
        }, 100)
        
        setScannerState("STOPPED")
      } catch (error) {
        console.log("Scanner cleanup error (can be ignored):", error)
      }
    }
  }

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

      console.log("Verifying JWT token:", token.substring(0, 50) + "...")

      // Parse JWT
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format")
      }

      const [headerB64, payloadB64, signatureB64] = parts

      // Decode header and payload
      const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))

      console.log("JWT payload:", payload)

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
        await cleanupScanner()
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

  //end

  const startScanning = async () => {
    if (!qrRef.current || !publicKeyPem || isScanning) return

    try {
      await cleanupScanner()

      setIsScanning(true)
      setError("")
      setScannerState("NOT_STARTED")

      // Generate unique scanner ID
      scannerIdRef.current += 1
      const scannerId = `qr-reader-${scannerIdRef.current}`
      
      if (qrRef.current) {
        qrRef.current.id = scannerId
      }

      // Create new scanner instance
      const html5QrCode = new Html5Qrcode(scannerId)
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          if (mountedRef.current) {
            console.log("QR Code detected:", decodedText.substring(0, 50) + "...")
            verifyToken(decodedText)
          }
        },
        (errorMessage) => {
          // Scanning error callback - can be ignored for continuous scanning
        }
      )
      
      setScannerState("RUNNING")
    } catch (err) {
      console.error("QR Scanner init error:", err)
      if (mountedRef.current) {
        setError("Could not access camera. Please check camera permissions.")
        setIsScanning(false)
        setScannerState("ERROR")
      }
    }
  }

  const stopScanning = async () => {
    if (!html5QrCodeRef.current || scannerState !== "RUNNING") {
      setIsScanning(false)
      return
    }

    try {
      await html5QrCodeRef.current.stop()
      setScannerState("STOPPED")
    } catch (error) {
      console.log("Stop scanner error (can be ignored):", error)
    } finally {
      if (mountedRef.current) {
        setIsScanning(false)
      }
    }
  }

  // Handle file upload for QR code image
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      setError("")
      setScannerState("PROCESSING")
      
      try {
        // Create a temporary scanner for file processing
        const tempScanner = new Html5Qrcode("temp-scanner")
        
        // In real html5-qrcode, you would use scanFile method
        // For this mock, we'll simulate file processing
        setTimeout(() => {
          const mockJWT = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWxpY2UgU21pdGgiLCJlbWFpbCI6ImFsaWNlLnNtaXRoQGV4YW1wbGUuY29tIiwibW9iaWxlIjoiKzk4NzY1NDMyMTAiLCJicmFuY2giOiJFbGVjdHJpY2FsIEVuZ2luZWVyaW5nIiwieWVhciI6IlNlY29uZCBZZWFyIiwiaXNzIjoiNjg4OWU3YjUxNzRlYWU0Njg2YWI5Y2YwIiwiYXVkIjoiNjg4OWU3YjUxNzRlYWU0Njg2YWI5Y2YwIiwiaWF0IjoxNzMzMjA2NDAwfQ.mockSignature"
          verifyToken(mockJWT)
        }, 2000)
        
      } catch (error) {
        setError("Error processing image: " + error.message)
        setScannerState("ERROR")
      }
    }
  }

  // Manual JWT input for testing
  const handleManualInput = () => {
    const jwt = prompt("Enter JWT token:")
    if (jwt && jwt.trim()) {
      verifyToken(jwt.trim())
    }
  }

  const handleRescan = async () => {
    setIsVerified(false)
    setPayload(null)
    setError("")
    await cleanupScanner()
    setTimeout(() => {
      if (mountedRef.current) {
        startScanning()
      }
    }, 200)
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

            {/* Camera View */}
            <div className="flex justify-center">
              <div className="relative">
                <div
                  ref={qrRef}
                  id={`qr-reader-${scannerIdRef.current}`}
                  className={`w-80 h-80 border-2 border-dashed border-gray-300 rounded-lg ${
                    !isScanning ? "flex items-center justify-center bg-gray-50" : ""
                  }`}
                >
                  {!isScanning && (
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Camera will appear here</p>
                    </div>
                  )}
                </div>
                
                {isScanning && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Scanning... ({scannerState})
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={startScanning} 
                  disabled={isScanning || !publicKeyPem} 
                  className="flex-1" 
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isScanning ? "Scanning..." : "Start Camera"}
                </Button>
                {isScanning && scannerState === "RUNNING" && (
                  <Button onClick={stopScanning} variant="outline" size="lg">
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

              {/* Manual Input */}
              <Button 
                onClick={handleManualInput} 
                variant="secondary" 
                className="w-full"
                disabled={!publicKeyPem}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Enter JWT Token Manually
              </Button>

              {/* QR Detection Tips */}
              {isScanning && (
                <div className="text-center text-xs text-gray-600 bg-blue-50 p-3 rounded">
                  <p className="font-medium mb-1">📱 Scanning Tips:</p>
                  <p>• Position QR code in center of frame</p>
                  <p>• Ensure good lighting</p>
                  <p>• Hold camera steady</p>
                  <p>• Try different distances</p>
                </div>
              )}
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