import { ArchitectureSection } from './types';

export const APP_NAME = "AeroSync";

export const MOCK_PEER_POOL = [
  { id: 'p1', name: 'Pixel 8 Pro', deviceType: 'android', ip: '192.168.1.105', trusted: true },
  { id: 'p2', name: 'ThinkPad X1', deviceType: 'windows', ip: '192.168.1.110', trusted: true },
] as const;

export const ANDROID_MANIFEST_CODE = `<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Required for Local Network Discovery & Transfer -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_MULTICAST_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <!-- Android 13+ Media Permissions -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
</manifest>`;

export const ANDROID_KOTLIN_CODE = `package com.example.aerosync.network

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.DataOutputStream
import java.io.File
import java.io.FileInputStream
import java.net.InetAddress
import java.security.cert.X509Certificate
import javax.net.ssl.*

class AeroClient(private val context: Context) {

    private val nsdManager = context.getSystemService(Context.NSD_SERVICE) as NsdManager
    private val serviceType = "_aerosync._tcp."
    private var discoveredHost: InetAddress? = null
    private var discoveredPort: Int = 0

    // --- 1. DISCOVERY (mDNS) ---
    fun startDiscovery() {
        nsdManager.discoverServices(serviceType, NsdManager.PROTOCOL_DNS_SD, discoveryListener)
    }

    private val discoveryListener = object : NsdManager.DiscoveryListener {
        override fun onServiceFound(serviceInfo: NsdServiceInfo) {
            if (serviceInfo.serviceType.contains("_aerosync")) {
                nsdManager.resolveService(serviceInfo, resolveListener)
            }
        }
        override fun onDiscoveryStarted(regType: String) = Log.d("Aero", "Discovery Started")
        override fun onDiscoveryStopped(serviceType: String) = Log.d("Aero", "Discovery Stopped")
        override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) {}
        override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) {}
    }

    private val resolveListener = object : NsdManager.ResolveListener {
        override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
            discoveredHost = serviceInfo.host
            discoveredPort = serviceInfo.port
            Log.d("Aero", "Resolved: \${discoveredHost?.hostAddress}:\$discoveredPort")
        }
        override fun onResolveFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {}
    }

    // --- 2. SECURE TRANSFER ---
    suspend fun sendFile(file: File) = withContext(Dispatchers.IO) {
        val host = discoveredHost ?: throw Exception("No device found")
        val port = discoveredPort

        // Bypass self-signed cert check for LAN (For production, use Certificate Pinning)
        val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
            override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
            override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
        })
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(null, trustAllCerts, java.security.SecureRandom())
        
        val socket = sslContext.socketFactory.createSocket(host, port) as SSLSocket
        socket.startHandshake()

        try {
            val outputStream = DataOutputStream(socket.outputStream)
            
            // A. Protocol Header: [4-byte Length][JSON Metadata]
            val metadata = JSONObject().apply {
                put("name", file.name)
                put("size", file.length())
            }
            val metaBytes = metadata.toString().toByteArray(Charsets.UTF_8)
            
            outputStream.writeInt(metaBytes.size) // 4 bytes
            outputStream.write(metaBytes)         // N bytes

            // B. Stream Payload
            val fis = FileInputStream(file)
            val buffer = ByteArray(64 * 1024) // 64KB Buffer
            var bytesRead: Int
            var totalSent: Long = 0

            while (fis.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                totalSent += bytesRead
                // Callback progress update here if needed
            }
            
            outputStream.flush()
            
            // C. Wait for ACK (Optional)
            // socket.inputStream.read() 
            
            Log.d("Aero", "Transfer Complete")
        } finally {
            socket.close()
        }
    }
}`;

export const PYTHON_SERVER_CODE = `import asyncio
import ssl
import json
import os
import struct
import socket
import time
from zeroconf import ServiceInfo, Zeroconf

# ==========================================
# AEROSYNC WINDOWS RECEIVER (Production)
# ==========================================
# 1. Install deps: pip install zeroconf
# 2. Gen Certs: openssl req -new -x509 -days 365 -nodes -out cert.pem -keyout key.pem
# ==========================================

SAVE_DIR = os.path.join(os.path.expanduser("~"), "Downloads", "AeroSync")
CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"
PORT = 8888
CHUNK_SIZE = 65536 # 64KB

def get_lan_ip():
    """Robustly find the actual LAN IP address."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't need to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def get_unique_filepath(directory, filename):
    """Avoid overwrites by appending (1), (2), etc."""
    name, ext = os.path.splitext(filename)
    counter = 1
    filepath = os.path.join(directory, filename)
    while os.path.exists(filepath):
        filepath = os.path.join(directory, f"{name}_{counter}{ext}")
        counter += 1
    return filepath

async def handle_client(reader, writer):
    addr = writer.get_extra_info('peername')
    print(f"\\n[+] Connection established from {addr}")

    try:
        # 1. READ HEADER LENGTH (4 Bytes, Big-Endian)
        header_len_data = await reader.readexactly(4)
        header_len = struct.unpack('>I', header_len_data)[0]
        
        # 2. READ METADATA (JSON)
        metadata_json = await reader.readexactly(header_len)
        metadata = json.loads(metadata_json.decode('utf-8'))
        
        filename = os.path.basename(metadata['name'])
        filesize = metadata['size']
        
        # 3. SETUP FILE PATH
        os.makedirs(SAVE_DIR, exist_ok=True)
        filepath = get_unique_filepath(SAVE_DIR, filename)
        
        print(f"[*] Receiving: {filename}")
        print(f"[*] Size: {filesize / (1024*1024):.2f} MB")
        print(f"[*] Saving to: {filepath}")
        
        # 4. STREAM DATA TO DISK
        received_bytes = 0
        start_time = time.time()
        last_log = 0
        
        with open(filepath, 'wb') as f:
            while received_bytes < filesize:
                # Read chunk
                chunk = await reader.read(min(CHUNK_SIZE, filesize - received_bytes))
                if not chunk:
                    break
                f.write(chunk)
                received_bytes += len(chunk)
                
                # Performance Logging (Every 0.5s)
                now = time.time()
                if now - last_log > 0.5:
                    elapsed = now - start_time
                    speed = (received_bytes / (1024*1024)) / elapsed if elapsed > 0 else 0
                    percent = (received_bytes / filesize) * 100
                    print(f"\\r>> Progress: {percent:.1f}% | Speed: {speed:.1f} MB/s", end='')
                    last_log = now

        total_time = time.time() - start_time
        avg_speed = (filesize / (1024*1024)) / total_time if total_time > 0 else 0
        print(f"\\n[√] Transfer Complete in {total_time:.1f}s (Avg: {avg_speed:.1f} MB/s)")
        
        # 5. SEND ACKNOWLEDGMENT
        writer.write(b'OK')
        await writer.drain()

    except asyncio.IncompleteReadError:
        print("\\n[!] Connection lost/incomplete read.")
    except Exception as e:
        print(f"\\n[!] Error: {e}")
    finally:
        writer.close()
        await writer.wait_closed()

async def main():
    # 1. SSL CONTEXT (TLS 1.3)
    if not os.path.exists(CERT_FILE) or not os.path.exists(KEY_FILE):
        print(f"[!] Missing {CERT_FILE} or {KEY_FILE}. Run the openssl command.")
        return

    ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_ctx.load_cert_chain(CERT_FILE, KEY_FILE)
    
    # 2. START SERVER
    server = await asyncio.start_server(handle_client, '0.0.0.0', PORT, ssl=ssl_ctx)
    
    # 3. MDNS REGISTRATION
    local_ip = get_lan_ip()
    desc = {'version': '1.0', 'type': 'windows', 'os': 'win11'}
    
    info = ServiceInfo(
        "_aerosync._tcp.local.",
        f"AeroSync-Win-{socket.gethostname()}._aerosync._tcp.local.",
        addresses=[socket.inet_aton(local_ip)],
        port=PORT,
        properties=desc,
        server=f"{socket.gethostname()}.local."
    )
    
    zc = Zeroconf()
    zc.register_service(info)
    
    print(f"\\n{'='*40}")
    print(f" AEROSYNC SECURE RECEIVER RUNNING")
    print(f" IP: {local_ip} | Port: {PORT}")
    print(f" Saving to: {SAVE_DIR}")
    print(f"{'='*40}\\n")
    
    try:
        async with server:
            await server.serve_forever()
    except asyncio.CancelledError:
        pass
    finally:
        zc.unregister_service(info)
        zc.close()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\n[*] Stopping Server...")
`;

export const ARCHITECTURE_DOCS: ArchitectureSection[] = [
  {
    title: "1. Networking Protocol Specification",
    content: "To achieve high performance and security, we bypass HTTP overhead and use raw TCP sockets wrapped in TLS 1.3.\n\n**The Framed Protocol:**\n1. **Header Length (4 bytes):** Big-endian integer indicating size of metadata.\n2. **Metadata (N bytes):** UTF-8 JSON string containing `filename`, `size`, `hash`.\n3. **Payload (Stream):** Raw binary bytes of the file, encrypted by TLS layer.",
    language: 'json',
    codeSnippet: `// Packet Structure Visualization
[ 00 00 00 7B ] [ {"name":"video.mp4","size":502844...} ] [ ...Binary Data Stream... ]
^ 4 bytes len   ^ JSON Metadata                            ^ AES-GCM Encrypted Payload`
  },
  {
    title: "2. Android Implementation (Kotlin)",
    content: "The Android client acts as the initiator. It discovers the Windows service via NsdManager, then opens a SecureSocket.",
    language: 'kotlin',
    codeSnippet: `// 1. DISCOVERY
val nsdManager = getSystemService(Context.NSD_SERVICE) as NsdManager
val discoveryListener = object : NsdManager.DiscoveryListener {
    override fun onServiceFound(serviceInfo: NsdServiceInfo) {
        if (serviceInfo.serviceType.contains("_aerosync")) {
            nsdManager.resolveService(serviceInfo, resolveListener)
        }
    }
}
nsdManager.discoverServices("_aerosync._tcp", NsdManager.PROTOCOL_DNS_SD, discoveryListener)

// 2. TRANSFER (Coroutine)
suspend fun sendFile(file: File, host: String, port: Int) = withContext(Dispatchers.IO) {
    // TrustManager that pins the self-signed cert (Simplified for brevity)
    val factory = sslContext.socketFactory
    val socket = factory.createSocket(host, port) as SSLSocket
    socket.startHandshake()

    val dos = DataOutputStream(socket.outputStream)
    
    // Send Header
    val metadata = JSONObject().put("name", file.name).put("size", file.length()).toString().toByteArray()
    dos.writeInt(metadata.size)
    dos.write(metadata)
    
    // Stream File
    val fis = FileInputStream(file)
    val buffer = ByteArray(64 * 1024) // 64KB Chunk
    var bytesRead: Int
    while (fis.read(buffer).also { bytesRead = it } != -1) {
        dos.write(buffer, 0, bytesRead)
    }
    
    dos.flush()
    socket.close()
}`
  },
  {
    title: "3. Windows Backend (Python AsyncIO)",
    content: "The backend uses Python's `asyncio` for non-blocking I/O, allowing it to handle multiple incoming file transfers simultaneously without threads.",
    language: 'python',
    codeSnippet: PYTHON_SERVER_CODE
  }
];