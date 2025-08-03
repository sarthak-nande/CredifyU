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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const QRScannerVerifier = () => {
  const qrRef = useRef(null);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const mountedRef = useRef(true);
  const scannerReadyRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    async function fetchPublicKey() {
      try {
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
          }
        } else {
          if (mountedRef.current) {
            setError('Failed to fetch public key');
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          setError('Error fetching public key');
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
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Invalid or tampered token');
      }
    }
  };

  const startScanning = async () => {
    if (!qrRef.current || !publicKeyPem || isScanning) return;
    
    // Stop any existing scanner first
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
        { fps: 10, qrbox: 280 },
        (decodedText) => {
          // Only process if component is still mounted
          if (mountedRef.current) {
            // Stop scanner immediately after successful scan
            stopScanning();
            verifyToken(decodedText);
          }
        },
        () => {}
      );
      
      scannerReadyRef.current = true;
    } catch (err) {
      if (mountedRef.current) {
        setError('Could not access camera');
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
        
        // Wait a bit before clearing to ensure stop is complete
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
    setTimeout(() => {
      if (mountedRef.current) {
        startScanning();
      }
    }, 200);
  };

  useEffect(() => {
    if (publicKeyPem) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [publicKeyPem]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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

          {!payload && (
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div
                    id="qr-reader"
                    ref={qrRef}
                    style={{ width: '100%', height: '100%' }}
                  />
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
                      <div>
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Camera will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
                {isScanning && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Scanning...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={startScanning}
              disabled={isScanning}
              className="flex-1"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start
            </Button>

            <Button
              onClick={stopScanning}
              disabled={!isScanning}
              className="flex-1"
              variant="outline"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>

            <Button
              onClick={handleRescan}
              className="flex-1"
              variant="secondary"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Rescan
            </Button>
          </div>

          {payload && (
            <>
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">✅ Verified JWT</span>
              </div>

              <Separator />

              <div className="text-left space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Name:</p>
                  <p>{payload?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Email:</p>
                  <p>{payload?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Mobile:</p>
                  <p>{payload?.mobile}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Branch:</p>
                  <p>{payload?.branch}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Academic Year:</p>
                  <p>{payload?.year}</p>
                </div>

                <Separator />

                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-2">JWT Metadata</p>
                  <div className="text-xs">
                    <p><strong>Issuer:</strong> {payload?.iss}</p>
                    <p><strong>Audience:</strong> {payload?.aud}</p>
                    <p><strong>Issued At:</strong> {payload?.iat ? new Date(payload.iat * 1000).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerVerifier;
