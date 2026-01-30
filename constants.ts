import { ArchitectureSection } from './types';

export const APP_NAME = "AeroSync";

export const MOCK_PEER_POOL = [
  { id: 'p1', name: 'Pixel 8 Pro', deviceType: 'android', ip: '192.168.1.105', trusted: true },
  { id: 'p2', name: 'ThinkPad X1', deviceType: 'windows', ip: '192.168.1.110', trusted: true },
  { id: 'p3', name: 'MacBook Air', deviceType: 'mac', ip: '192.168.1.115', trusted: true },
  { id: 'p4', name: 'Galaxy Tab S9', deviceType: 'android', ip: '192.168.1.120', trusted: false },
  { id: 'p5', name: 'Desktop-Workstation', deviceType: 'windows', ip: '192.168.1.142', trusted: false },
] as const;

export const ARCHITECTURE_DOCS: ArchitectureSection[] = [
  {
    title: "Device Discovery (mDNS/Zeroconf)",
    content: "Reliable peer detection is achieved using Multicast DNS (mDNS). \n\n**Android:** Uses `NsdManager` (Network Service Discovery) to broadcast `_aerosync._tcp` service type containing device name and partial public key hash in TXT records.\n\n**Windows:** Uses `python-zeroconf` to listen for these broadcasts. \n\n**Reliability:** The system maintains a 'Liveness Cache'. If a heartbeat (UDP packet) isn't received every 5 seconds, the peer is marked stale, then offline. This prevents 'ghost' devices from appearing in the UI.",
    codeSnippet: `# Python Zeroconf Listener
class ServiceListener:
    def add_service(self, zc, type_, name):
        info = zc.get_service_info(type_, name)
        address = socket.inet_ntoa(info.addresses[0])
        # Trigger UI update via WebSocket
        await notify_frontend("peer_found", {
            "name": name, 
            "ip": address,
            "port": info.port
        })`
  },
  {
    title: "Secure Connection Handshake",
    content: "Before any file transfer, a secure control channel is established.\n\n1. **Request:** Client initiates TCP connection to the discovered IP.\n2. **TLS Upgrade:** Connection upgrades to TLS 1.3 immediately.\n3. **Mutual Auth:** Both devices exchange certificates. If the peer is unknown, a 'Trust on First Use' (TOFU) prompt appears, or a numeric comparison (PAKE) is shown to the user.\n4. **Session:** Once authenticated, the socket is kept open (Keep-Alive) for instant transfer starts.",
  },
  {
    title: "High-Performance File Transfer",
    content: "The transfer engine uses a streaming architecture to handle multi-gigabyte files with low memory footprint.\n\n- **Chunking:** Files are read in 64KB - 1MB chunks (dynamic based on network speed).\n- **Pipeline:** Disk -> Encrypt (AES-GCM) -> Socket -> Decrypt -> Disk.\n- **Backpressure:** The sender respects the TCP window size to prevent memory buffer bloat on the receiving Android device.",
  },
  {
    title: "Android Background Handling",
    content: "To ensure transfers survive screen locks:\n\n1. **Foreground Service:** Runs with `ServiceType.DATA_SYNC`.\n2. **WakeLocks:** A partial WakeLock ensures the CPU sleeps but network remains active.\n3. **Notifications:** Real-time progress bar in the system tray allows the OS to prioritize the process.",
    codeSnippet: `// Android Foreground Notification
val notification = NotificationCompat.Builder(context, CHANNEL_ID)
    .setContentTitle("Sending 'Video.mp4'")
    .setProgress(100, currentProgress, false)
    .setSmallIcon(R.drawable.ic_transfer)
    .setOngoing(true) // Prevents dismissal
    .build()`
  }
];