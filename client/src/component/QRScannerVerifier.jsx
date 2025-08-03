import React, { use, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { jwtVerify, importSPKI } from 'jose';
import api from '@/utils/api';

const QRScannerVerifier = () => {
  const qrRef = useRef(null);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [publicKeyPem, setPublicKeyPem] = useState('');


  useEffect(() => {
    async function fetchPublicKey() {
      try {
        const response = await api.post('/api/get-publickey',{collegeId : "6889e7b5174eae4686ab9cf0"} , { withCredentials: true });
        if (response.status === 200) {
          setPublicKeyPem(response.data.publicKey);
        } else {
          console.error('Failed to fetch public key');
          setError('Failed to fetch public key');
        }
      } catch (error) {
        console.error('Error fetching public key:', error);
        setError('Error fetching public key');
      }
    }

    fetchPublicKey();
  }, []);

  

  const verifyToken = async (token) => {
    try {
      const publicKey = await importSPKI(publicKeyPem, 'ES256');
      const { payload } = await jwtVerify(token, publicKey);
      setPayload(payload);
      setError('');
    } catch (err) {
      console.error('Invalid token:', err);
      setError('Invalid or tampered token');
    }
  };

  useEffect(() => {
    if (!qrRef.current) return;

    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      (decodedText) => {
        html5QrCode.stop();
        verifyToken(decodedText);
      },
      (errorMessage) => {
        // Ignore scan errors
      }
    ).catch(err => {
      console.error('QR Scanner init error:', err);
      setError('Could not access camera');
    });

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, []);

  return (
    <div>
      <h2>Scan JWT QR Code</h2>
      <div id="qr-reader" ref={qrRef} style={{ width: '300px', margin: 'auto' }}></div>

      {payload && (
        <div style={{ marginTop: '20px' }}>
          <h3>✅ Verified JWT Payload:</h3>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <strong>{error}</strong>
        </div>
      )}
    </div>
  );
};

export default QRScannerVerifier;
