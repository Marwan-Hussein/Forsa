import { useState, useEffect } from "react";
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
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { organizerApi } from "../../api/organizerApi";
import { toast } from "react-toastify";

interface ScanResult {
  id: string;
  attendeeName: string;
  ticketType: string;
  ticketCount: number;
  scanTime: string;
  status: "success" | "error";
  errorMessage?: string;
}

export default function QRCodeScannerPage() {
  const { eventId } = useParams();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [stats, setStats] = useState({ totalScanned: 0, failedScans: 0, lastScanTime: null as string | null });
  const [loading, setLoading] = useState(true);

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [event, attendees] = await Promise.all([
        organizerApi.getEventDetails(Number(eventId)),
        organizerApi.getEventAttendees(Number(eventId))
      ]);
      setEventDetails(event);
      
      const checkedIn = attendees.filter((a: any) => a.checkInStatus === "checked-in");
      setStats(prev => ({
        ...prev,
        totalScanned: checkedIn.length,
        lastScanTime: checkedIn.length > 0 ? new Date().toISOString() : prev.lastScanTime
      }));

    } catch (err: any) {
      toast.error("Failed to load event details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const processScan = async (qrCode: string) => {
    if (!eventId) return;
    try {
      setIsScanning(true);
      await organizerApi.verifyAttendance(Number(eventId), qrCode);
      
      // Success
      toast.success("Ticket scanned successfully!");
      
      const newScan: ScanResult = {
        id: Date.now().toString(),
        attendeeName: "Ticket Approved", // the api doesn't return attendee info directly for now
        ticketType: "Event Ticket",
        ticketCount: 1,
        scanTime: new Date().toISOString(),
        status: "success",
      };

      setScanResults(prev => [newScan, ...prev]);
      setStats(prev => ({
        ...prev,
        totalScanned: prev.totalScanned + 1,
        lastScanTime: newScan.scanTime
      }));
      
    } catch (err: any) {
      // Failed scan
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Invalid ticket";
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Invalid ticket");
      
      const newScan: ScanResult = {
        id: Date.now().toString(),
        attendeeName: "Unknown",
        ticketType: "N/A",
        ticketCount: 0,
        scanTime: new Date().toISOString(),
        status: "error",
        errorMessage: typeof errorMessage === 'string' ? errorMessage : "Invalid ticket"
      };
      
      setScanResults(prev => [newScan, ...prev]);
      setStats(prev => ({
        ...prev,
        failedScans: prev.failedScans + 1,
        lastScanTime: newScan.scanTime
      }));
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartScanning = () => {
    // For now, we simulate camera by showing the manual entry modal 
    // but giving the user a "Scanning..." effect in the background
    setIsScanning(true);
    setTimeout(() => {
      setShowManualModal(true);
    }, 500);
  };

  const handleManualEntry = () => {
    setIsScanning(false);
    setShowManualModal(true);
  };

  const submitManualEntry = () => {
    if (manualCode.trim()) {
      processScan(manualCode.trim());
      setManualCode("");
      setShowManualModal(false);
    }
  };

  const cancelManualEntry = () => {
    setManualCode("");
    setShowManualModal(false);
    setIsScanning(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-['Inter:Medium',sans-serif] text-slate-400 mb-2">
        <Link to="/organizer" className="hover:text-violet-500 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/organizer/events/${eventId}/attendees`} className="hover:text-violet-500 transition-colors">Manage Attendees</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700">QR Scanner</span>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#0B1120] to-[#1E3D61] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-[#1E3D61]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/30 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full filter blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold mb-4 flex items-center gap-3">
              <QrCode className="w-8 h-8 text-violet-400" />
              Check-in Scanner
            </h1>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-['Inter:Medium',sans-serif] text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                <span>{eventDetails?.title || eventDetails?.Title || "Event Details"} - {eventDetails?.startDate || eventDetails?.StartDate ? new Date(eventDetails.startDate || eventDetails.StartDate).toLocaleDateString() : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>{eventDetails?.place || eventDetails?.Place || "Virtual"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Successfully Scanned</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-emerald-600">{stats.totalScanned}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-rose-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Failed Scans</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-rose-600">{stats.failedScans}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center transition-colors">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-violet-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Last Scan</p>
            <p className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">
              {stats.lastScanTime ? new Date(stats.lastScanTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
            </p>
          </div>
          <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center transition-colors">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Col: Scanner Area */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[rgba(39,55,77,0.1)] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-white pointer-events-none" />
            <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6 relative z-10">Scan QR Code</h2>
            
            <div className="relative aspect-square max-w-sm mx-auto bg-slate-50 rounded-3xl border-4 border-dashed border-violet-200 flex flex-col items-center justify-center mb-8 relative z-10">
              {isScanning ? (
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-violet-500 rounded-2xl animate-ping opacity-75" />
                    <div className="absolute inset-0 bg-violet-100 rounded-2xl flex items-center justify-center">
                      <Camera className="w-12 h-12 text-violet-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-['Inter:Bold',sans-serif] text-violet-600 text-lg">Scanning...</p>
                  <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mt-1">Point camera at QR code</p>
                </div>
              ) : (
                <div className="text-center p-6">
                  <QrCode className="w-24 h-24 text-slate-300 mx-auto mb-6 group-hover:text-violet-300 transition-colors" />
                  <p className="font-['Inter:Bold',sans-serif] text-slate-700 text-lg mb-1">Ready to Scan</p>
                  <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">Tap below to activate camera</p>
                </div>
              )}
            </div>

            <div className="space-y-3 relative z-10 max-w-sm mx-auto">
              <button
                onClick={handleStartScanning}
                disabled={isScanning}
                className="w-full px-6 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                {isScanning ? "Scanning..." : "Start Camera"}
              </button>
              <button
                onClick={handleManualEntry}
                className="w-full px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Manual Entry
              </button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h3 className="font-['Inter:Bold',sans-serif] font-bold text-amber-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Scanning Instructions
            </h3>
            <ul className="space-y-2 text-sm font-['Inter:Medium',sans-serif] text-amber-700">
              <li className="flex gap-2"><span className="font-bold opacity-50">1.</span> Tap "Start Camera" and allow browser permissions.</li>
              <li className="flex gap-2"><span className="font-bold opacity-50">2.</span> Hold the attendee's QR ticket steady in the frame.</li>
              <li className="flex gap-2"><span className="font-bold opacity-50">3.</span> Wait for the green success confirmation sound/alert.</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Scan Results */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[rgba(39,55,77,0.1)] h-[800px] flex flex-col">
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6">Recent Scans</h2>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            <AnimatePresence>
              {scanResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-5 rounded-2xl border-2 ${
                    result.status === "success"
                      ? "bg-emerald-50/50 border-emerald-100"
                      : "bg-rose-50/50 border-rose-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      result.status === "success" ? "bg-emerald-100" : "bg-rose-100"
                    }`}>
                      {result.status === "success" ? (
                        <UserCheck className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 truncate">{result.attendeeName}</h4>
                        <span className="text-xs font-['Inter:Medium',sans-serif] text-slate-400 shrink-0">
                          {new Date(result.scanTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        </span>
                      </div>
                      
                      {result.status === "success" ? (
                        <div className="mt-2">
                          <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-600 mb-2">
                            <span className="text-slate-400">Ticket:</span> {result.ticketType} × {result.ticketCount}
                          </p>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-['Inter:Bold',sans-serif] font-bold rounded-md">
                            <CheckCircle className="w-3.5 h-3.5" /> Checked In
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-600 mb-2">{result.errorMessage}</p>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-['Inter:Bold',sans-serif] font-bold rounded-md">
                            <XCircle className="w-3.5 h-3.5" /> Entry Denied
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {scanResults.length === 0 && (
              <div className="text-center py-20 text-slate-400 h-full flex flex-col items-center justify-center">
                <QrCode className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-['Inter:Medium',sans-serif] text-lg">No scans yet. Start scanning to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={cancelManualEntry}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-2">Enter Ticket Code</h3>
                <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-6">
                  Please enter the ticket QR code or token string manually to verify attendance.
                </p>
                <input
                  type="text"
                  placeholder="e.g. e12c0f1e-f2c0-4382-9f21-becbc570b0e8"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitManualEntry()}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-['Inter:Medium',sans-serif] text-slate-700 placeholder:text-slate-400 transition-all mb-6"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={cancelManualEntry}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-['Inter:Bold',sans-serif] font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitManualEntry}
                    disabled={!manualCode.trim()}
                    className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl transition-colors"
                  >
                    Verify Ticket
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
