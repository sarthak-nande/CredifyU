import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { jwtVerify, importSPKI } from 'jose';
import api from '@/utils/api';

import {
  QrCode,
  AlertCircle,
  CheckCircle,
  Camera,
  RotateCcw,
  StopCircle,
  PlayCircle,
  Scan,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  User,
  Shield,
  Sparkles,
  Zap,
  Activity,
  Wifi,
  Lock
} from 'lucide-react';

const QRScannerVerifier = () => {
  const qrRef = useRef(null);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const html5QrCodeRef = useRef(null);
  const mountedRef = useRef(true);
  const scannerReadyRef = useRef(false);
  const [scanCount, setScanCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Utility function to format dates
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    async function fetchPublicKey() {
      try {
        setIsLoading(true);
        setConnectionStatus('connecting');
        const response = await api.post(
          '/api/get-publickey',
          { collegeId: '6889e7b5174eae4686ab9cf0' },
          { withCredentials: true }
        );
        if (response.status === 200) {
          const raw = response.data.publicKey;
          const fixedPem = raw.replace(/\\n/g, '\n');
          if (mountedRef.current) {
            setPublicKeyPem(fixedPem);
            setConnectionStatus('connected');
            setIsLoading(false);
          }
        } else {
          if (mountedRef.current) {
            setError('Failed to fetch public key');
            setConnectionStatus('error');
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          setError('Error fetching public key');
          setConnectionStatus('error');
          setIsLoading(false);
        }
      }
    }

    fetchPublicKey();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const verifyToken = async (token) => {
    try {
      if (!publicKeyPem) throw new Error('Public key not loaded yet');

      const publicKey = await importSPKI(publicKeyPem, 'ES256');

      const { payload } = await jwtVerify(token, publicKey, {
        issuer: '6889e7b5174eae4686ab9cf0',
        audience: '6889e7b5174eae4686ab9cf0',
      });

      if (mountedRef.current) {
        setPayload(payload);
        setError('');
        setScanCount(prev => prev + 1);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Invalid or tampered token');
      }
    }
  };

  const startScanning = async () => {
    if (!qrRef.current || !publicKeyPem || isScanning) return;

    await stopScanning();

    if (!mountedRef.current) return;

    setPayload(null);
    setError('');
    setIsScanning(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (mountedRef.current) {
            stopScanning();
            verifyToken(decodedText);
          }
        },
        () => {}
      );
      scannerReadyRef.current = true;
    } catch (err) {
      if (mountedRef.current) {
        setError('Could not access camera. Please check permissions.');
        setIsScanning(false);
      }
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        const scanner = html5QrCodeRef.current;
        html5QrCodeRef.current = null;
        scannerReadyRef.current = false;
        await scanner.stop();
        setTimeout(async () => {
          try {
            await scanner.clear();
          } catch (error) {
            console.log('Scanner clear error (can be ignored):', error);
          }
        }, 100);
      } catch (error) {
        console.log('Scanner stop error (can be ignored):', error);
      }
    }
    if (mountedRef.current) {
      setIsScanning(false);
    }
  };

  const handleRescan = async () => {
    await stopScanning();
    setPayload(null);
    setError('');
    setTimeout(() => {
      if (mountedRef.current) {
        startScanning();
      }
    }, 200);
  };

  useEffect(() => {
    if (publicKeyPem && !isLoading) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [publicKeyPem, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <h3 className="text-white text-xl font-semibold">Initializing Scanner</h3>
          <p className="text-purple-200">Connecting to verification server...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-purple-300">
            <Wifi className="h-4 w-4 animate-pulse" />
            <span>Establishing secure connection</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg mx-auto">
          {/* Header Card */}
          

          {/* Error Alert */}
          {error && (
            <div className="backdrop-blur-lg bg-red-500/20 border border-red-500/50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-red-300 font-semibold">Verification Failed</h3>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scanner Card */}
          {!payload && (
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl">
              <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-purple-400/30">
                <div id="qr-reader" ref={qrRef} className="h-full w-full rounded-2xl" />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-center p-6">
                    <div className="animate-bounce mb-4">
                      <Camera className="h-16 w-16 text-purple-400" />
                    </div>
                    <p className="text-white font-medium mb-2">
                      Point camera at QR code
                    </p>
                    <div className="px-3 py-1 bg-purple-500/30 rounded-full text-xs text-purple-200 mb-2">
                      {publicKeyPem ? 'Ready to scan' : 'Loading security keys...'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <Lock className="h-3 w-3" />
                      <span>End-to-end encrypted</span>
                    </div>
                  </div>
                )}
                
                {isScanning && (
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Scan className="h-4 w-4 text-white animate-pulse" />
                        <span className="text-white text-sm font-medium">Scanning</span>
                      </div>
                      <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white text-xs flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          Live
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scanning overlay with corner indicators */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-purple-400 rounded-2xl">
                      <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-lg"></div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                      Align QR code within frame
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <button
                  onClick={startScanning}
                  disabled={isScanning || !publicKeyPem}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Start</span>
                </button>

                <button
                  onClick={stopScanning}
                  disabled={!isScanning}
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <StopCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Stop</span>
                </button>

                <button
                  onClick={handleRescan}
                  disabled={isScanning}
                  className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Rescan</span>
                </button>
              </div>

              {/* Status info */}
              <div className="mt-4 text-center text-sm text-purple-200">
                <p className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  JWT verification with ES256 encryption
                </p>
              </div>
            </div>
          )}

          {/* Success and Student Card */}
          {payload && (
            <div className="space-y-6">
              {/* Success Alert */}
              <div className="backdrop-blur-lg bg-green-500/20 border border-green-500/50 rounded-2xl p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4 animate-bounce">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-green-300 text-xl font-bold mb-2">
                    ✅ JWT Verified Successfully!
                  </h3>
                  <p className="text-green-200">
                    Token integrity confirmed and student authenticated
                  </p>
                </div>
              </div>

              {/* Student Identity Card */}
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-white text-xl font-bold">Student ID Card</h2>
                          <p className="text-blue-100 text-sm">Digital Identity Verification</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-6">
                  {/* Student Name */}
                  <div className="text-center">
                    <h3 className="text-white text-2xl font-bold mb-2">{payload?.name}</h3>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 px-4 py-2 rounded-full">
                      <span className="text-purple-200 font-medium">{payload?.branch}</span>
                      <span className="text-purple-300">•</span>
                      <span className="text-cyan-200 font-medium">{payload?.year}</span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Full Name</p>
                        <p className="text-white font-medium">{payload?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Mail className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Email Address</p>
                        <p className="text-white font-medium text-sm">{payload?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Phone className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Mobile Number</p>
                        <p className="text-white font-medium">{payload?.mobile}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Calendar className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs">Academic Year</p>
                          <p className="text-white font-medium text-sm">{payload?.year}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs">Branch</p>
                          <p className="text-white font-medium text-sm">{payload?.branch}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                  {/* JWT Metadata */}
                  <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      JWT Security Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Issuer:</span>
                        <span className="text-purple-300 font-mono text-xs bg-purple-500/20 px-2 py-1 rounded">
                          {payload?.iss}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Audience:</span>
                        <span className="text-cyan-300 font-mono text-xs bg-cyan-500/20 px-2 py-1 rounded">
                          {payload?.aud}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Issued:</span>
                        <span className="text-green-300 text-xs bg-green-500/20 px-2 py-1 rounded">
                          {formatDate(payload?.iat)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rescan Button */}
                  <button
                    onClick={handleRescan}
                    className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Scan Another QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerVerifier;