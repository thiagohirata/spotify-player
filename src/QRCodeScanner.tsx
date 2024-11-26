import React, { useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onError }) => {
  const [cameraIndex, setCameraIndex] = React.useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let mounted = true;

    const startScanning = async () => {
      // Get video stream from camera
      const videoInputDevices =
        await BrowserQRCodeReader.listVideoInputDevices();

      if (videoInputDevices?.length > 0) {
        const selectedDeviceId = (
          videoInputDevices?.[1] ?? videoInputDevices?.[0]
        ).deviceId;

        // Start continuous scanning
        const controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result && mounted) {
              onScan(result.getText());
            }
          }
        );
        return controls;
      }
    };

    const controls = startScanning();

    return () => {
      mounted = false;

      controls?.then((c) => {
        c?.stop();
      });
    };
  }, [onScan, onError, cameraIndex]);

  return (
    <div className="qr-scanner">
      <video ref={videoRef} style={{ width: "100%", maxWidth: "400px" }} />
    </div>
  );
};

export default QRCodeScanner;
