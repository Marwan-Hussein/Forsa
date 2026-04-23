import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  ChevronRight,
  Camera,
  AlertCircle,
  UserCheck,
  Clock,
  Smartphone,
} from "lucide-react";

// Mock scan results
const mockScanResults = [
  {
    id: "1",
    attendeeName: "Sarah Johnson",
    ticketType: "VIP",
    ticketCount: 2,
    scanTime: new Date().toISOString(),
    status: "success",
  },
  {
    id: "2",
    attendeeName: "Michael Chen",
    ticketType: "General",
    ticketCount: 1,
    scanTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "success",
  },
  {
    id: "3",
    attendeeName: "Unknown User",
    ticketType: "N/A",
    ticketCount: 0,
    scanTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: "error",
    errorMessage: "Invalid ticket or already checked in",
  },
];

export default function QRCodeScannerPage() {
  const { eventId } = useParams();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(mockScanResults);
  const [lastScannedResult, setLastScannedResult] = useState<typeof mockScanResults[0] | null>(null);

  const mockEvent = {
    id: eventId || "1",
    title: "Tech Summit 2026",
    date: "2026-04-15",
    location: "Grand Convention Center",
  };

  const stats = {
    totalScanned: scanResults.filter(r => r.status === "success").length,
    failedScans: scanResults.filter(r => r.status === "error").length,
    lastScanTime: scanResults.length > 0 ? scanResults[0].scanTime : null,
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    // Simulate camera activation
    setTimeout(() => {
      // Simulate a successful scan after 2 seconds
      const newScan = {
        id: String(scanResults.length + 1),
        attendeeName: "Emily Rodriguez",
        ticketType: "VIP",
        ticketCount: 3,
        scanTime: new Date().toISOString(),
        status: "success" as const,
      };
      setScanResults([newScan, ...scanResults]);
      setLastScannedResult(newScan);
      setIsScanning(false);
    }, 2000);
  };

  const handleManualEntry = () => {
    const ticketId = prompt("Enter ticket ID:");
    if (ticketId) {
      alert(`Processing ticket ID: ${ticketId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/organization-dashboard" className="hover:text-accent cursor-pointer">Dashboard</Link>
          <ChevronRight className="size-4" />
          <Link to={`/manage-attendees/${eventId}`} className="hover:text-accent cursor-pointer">Manage Attendees</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">QR Scanner</span>
        </div>

        {/* Event Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <QrCode className="size-8" />
            QR Code Scanner
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-5" />
              <div>
                <p className="text-sm text-white/80">Event</p>
                <p className="font-semibold">{mockEvent.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-5" />
              <div>
                <p className="text-sm text-white/80">Date</p>
                <p className="font-semibold">{new Date(mockEvent.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-5" />
              <div>
                <p className="text-sm text-white/80">Location</p>
                <p className="font-semibold">{mockEvent.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Successfully Scanned</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalScanned}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="size-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Failed Scans</p>
                <p className="text-3xl font-bold text-red-600">{stats.failedScans}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="size-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Scan</p>
                <p className="text-lg font-bold text-foreground">
                  {stats.lastScanTime
                    ? new Date(stats.lastScanTime).toLocaleTimeString()
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-lg">
                <Clock className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-6">
            {/* Scanner Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
              <h2 className="text-xl font-bold text-foreground mb-4">Scan QR Code</h2>
              
              {/* Scanner Area */}
              <div className="relative aspect-square bg-background rounded-xl border-2 border-dashed border-primary flex items-center justify-center mb-6">
                {isScanning ? (
                  <div className="text-center">
                    <div className="relative size-48 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-accent rounded-lg animate-pulse" />
                      <div className="absolute inset-4 border-4 border-accent/50 rounded-lg animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <div className="absolute inset-8 border-4 border-accent/25 rounded-lg animate-pulse" style={{ animationDelay: "0.4s" }} />
                      <Camera className="absolute inset-0 m-auto size-16 text-foreground opacity-50" />
                    </div>
                    <p className="text-foreground font-semibold">Scanning...</p>
                    <p className="text-sm text-muted-foreground">Point camera at QR code</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="size-24 text-muted-foreground opacity-50 mx-auto mb-4" />
                    <p className="text-foreground font-semibold mb-2">Ready to Scan</p>
                    <p className="text-sm text-muted-foreground mb-4">Click the button below to start scanning</p>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              <div className="space-y-3">
                <button
                  onClick={handleStartScanning}
                  disabled={isScanning}
                  className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="size-5" />
                  {isScanning ? "Scanning..." : "Start Scanning"}
                </button>
                <button
                  onClick={handleManualEntry}
                  className="w-full px-6 py-3 border border-primary text-foreground rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="size-5" />
                  Manual Ticket Entry
                </button>
              </div>
            </div>

            {/* Last Scanned Result */}
            {lastScannedResult && (
              <div className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
                lastScannedResult.status === "success"
                  ? "border-green-500"
                  : "border-red-500"
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    lastScannedResult.status === "success"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}>
                    {lastScannedResult.status === "success" ? (
                      <CheckCircle className="size-8 text-green-600" />
                    ) : (
                      <XCircle className="size-8 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      lastScannedResult.status === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}>
                      {lastScannedResult.status === "success"
                        ? "Check-in Successful!"
                        : "Check-in Failed"}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Name:</strong> {lastScannedResult.attendeeName}</p>
                      {lastScannedResult.status === "success" && (
                        <>
                          <p><strong className="text-foreground">Ticket Type:</strong> {lastScannedResult.ticketType}</p>
                          <p><strong className="text-foreground">Tickets:</strong> {lastScannedResult.ticketCount}</p>
                        </>
                      )}
                      <p><strong className="text-foreground">Time:</strong> {new Date(lastScannedResult.scanTime).toLocaleTimeString()}</p>
                      {lastScannedResult.status === "error" && lastScannedResult.errorMessage && (
                        <p className="text-red-600 mt-2">
                          <strong>Error:</strong> {lastScannedResult.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-br from-primary/80 to-primary/60 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="size-5" />
                Scanning Instructions
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Click "Start Scanning" to activate the camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Point your camera at the attendee's QR code ticket</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Wait for automatic check-in confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Use manual entry if QR code is not working</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Scans</h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {scanResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border-2 ${
                    result.status === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      result.status === "success" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {result.status === "success" ? (
                        <UserCheck className="size-5 text-green-600" />
                      ) : (
                        <XCircle className="size-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{result.attendeeName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.scanTime).toLocaleTimeString()}
                        </span>
                      </div>
                      {result.status === "success" ? (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">Ticket:</span> {result.ticketType} × {result.ticketCount}
                          </p>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            ✓ Checked In
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <p className="text-red-600">{result.errorMessage}</p>
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full mt-1">
                            ✗ Failed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {scanResults.length === 0 && (
              <div className="text-center py-12">
                <QrCode className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No scans yet. Start scanning to see results here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
