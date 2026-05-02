"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useLanguage } from '@/context/LanguageContext';
import { apiService } from '@/services/api';

interface QRCheckInProps {
  projectId: number;
  mode: 'generate' | 'scan';
  onSuccess?: () => void;
}

export default function QRCheckIn({ projectId, mode, onSuccess }: QRCheckInProps) {
  const { t } = useLanguage();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = apiService.getCurrentUser();

  // Generate a secure token for the QR code
  // In a real app, this should be a time-limited signed JWT
  const qrData = JSON.stringify({
    type: 'artisana_checkin',
    projectId: projectId,
    workerId: user?.id,
    timestamp: Date.now()
  });

  useEffect(() => {
    if (mode === 'scan') {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(decodedText: string) {
        setScanResult(decodedText);
        scanner.clear();
        handleLogAttendance(decodedText);
      }

      function onScanError(err: any) {
        // console.warn(err);
      }

      return () => {
        scanner.clear();
      };
    }
  }, [mode]);

  const handleLogAttendance = async (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type !== 'artisana_checkin') {
        alert("Invalid QR Code");
        return;
      }

      setIsLoading(true);
      // Call API to log attendance
      const response = await fetch(`/api/v1/kalide-one/projects/${projectId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: parsed.workerId,
          type: 'check_in', // Or dynamic based on current state
          location: 'Detected via Browser'
        })
      });

      if (response.ok) {
        alert("Attendance Logged Successfully!");
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to log attendance.");
      }
    } catch (e) {
      alert("Error parsing QR data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] border-white/5 text-center space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-black uppercase tracking-tighter italic">
          {mode === 'generate' ? "Your Check-In Node" : "Field Attendance Scanner"}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {mode === 'generate' ? "Present this to the client on-site" : "Scan the artisan's ID to verify attendance"}
        </p>
      </div>

      <div className="flex justify-center p-6 bg-white rounded-[2rem]">
        {mode === 'generate' ? (
          <QRCodeSVG value={qrData} size={200} level="H" includeMargin={true} />
        ) : (
          <div id="reader" className="w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/10" />
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-primary animate-pulse">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest">Processing Node...</span>
        </div>
      )}
      
      {scanResult && !isLoading && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-400">Node Verified Successfully</p>
        </div>
      )}
    </div>
  );
}
