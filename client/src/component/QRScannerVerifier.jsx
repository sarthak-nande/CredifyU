import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { jwtVerify, importSPKI } from "jose"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, RotateCcw, ArrowRight, User, Mail, Phone, Calendar, GraduationCap, AlertCircle, Camera, ForwardIcon } from 'lucide-react'
import api from "@/utils/api"
import { QRCodeCanvas } from "qrcode.react"
import { set } from "lodash"
import { useSelector } from "react-redux"
import CollegeSelect from "./CollegeSelect"
import { useNavigate } from "react-router-dom"
import SuccessCard from "./SuccessCard"

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

  const myCollegeId = useSelector((state) => state.college.collegeId);

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
        setPayload(verifiedPayload);
        setIsVerified(true);
        setError("");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      if (mountedRef.current) {
        setError("Invalid or tampered token");
      }
    }
  };

  const handleRescan = () => {
    setIsVerified(false);
    setPayload(null);
    setError("");
    cleanupScanner();
    setIsScanning(true);
  };

  const handleMoveForward = () => {
    setIsForwarded(true);
  };

  const mockScan = () => {
    cleanupScanner();
    verifyToken(mockJWT);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
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


  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <Card className="border-green-200 bg-green-50 text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">✅ Verified JWT</span>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-6 w-6" />
                Student Identity Card
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <QRCodeCanvas value={myToken} size={256} />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800">{payload?.name}</h2>
                  <Badge variant="secondary" className="mt-1">
                    {payload?.branch} - {payload?.year}
                  </Badge>
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleRescan} className="flex-1 bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Rescan
            </Button>
            <SuccessCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    myCollegeId ? (
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
            <div className="flex justify-center">
              <div className="relative w-80 h-80">
                <div
                  ref={qrRef}
                  id={scannerIdRef.current}
                  className={`w-full h-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden ${!isScanning ? "flex items-center justify-center bg-gray-50" : ""
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
                {isScanning ? "Scanning..." : "Start Scan"}
              </Button>
              {isScanning && (
                <Button
                  onClick={async () => {
                    await cleanupScanner(); // stop and clear the scanner
                    setIsScanning(false);   // update state
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Stop Scan
                </Button>

              )}
              <Button onClick={handleRescan} variant="secondary" className="w-full" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Rescan
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </div>
    ) : (navigate("/student/college-name"))// Redirect to college selection if not set

  );
}