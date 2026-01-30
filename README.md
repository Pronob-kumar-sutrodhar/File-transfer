# AeroSync Secure - Local Encrypted File Transfer System

AeroSync is a dual-purpose application:
1.  **Web Simulation Dashboard:** A visual demonstration of secure, peer-to-peer local file transfer concepts.
2.  **Native Code Generator:** A development command center that generates production-ready **Python (Windows)** and **Kotlin (Android)** code to build the actual system.

> **Privacy First:** Designed for 100% local, offline file transfers. No cloud servers, no data leaks.

## 🚀 Key Features

### 🖥️ Web Dashboard (Simulation Mode)
*   **Visual Discovery Radar:** Demonstrates mDNS/Zeroconf peer discovery logic in a browser environment.
*   **Physics-Based Transfer UI:** Realistic visualization of transfer speeds, progress, and network noise.
*   **Security Audit:** Integrated **Google Gemini 1.5 Pro** to analyze system architecture for vulnerabilities.

### ⚡ Real-World Implementation (Code Generators)
*   **Windows Receiver (Python):**
    *   Full `asyncio` implementation for high-concurrency performance.
    *   **Robust IP Detection:** Solves common localhost/LAN IP resolution issues.
    *   **ZeroConf/mDNS:** Automatic network discovery without manual IP entry.
    *   **TLS 1.3 Security:** End-to-end encrypted raw TCP sockets.
    *   **Smart File Handling:** Auto-renaming for collisions and chunked I/O for large files (GB+).
*   **Android Client (Kotlin):**
    *   **Native Network Service Discovery (NSD):** Discovers the Python receiver automatically.
    *   **Secure Sockets:** Implementation of `SSLSocket` with custom trust management for local peers.
    *   **Efficient I/O:** Coroutine-based streaming for minimal battery impact.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons.
*   **AI Analysis:** Google GenAI SDK (Gemini 1.5 Pro).
*   **Generated Backend:** Python 3.10+ (`asyncio`, `ssl`, `zeroconf`).
*   **Generated Mobile:** Kotlin (Android SDK 29+).

## 📖 How to Build the Real System

This app provides the source code you need to run AeroSync on your actual devices.

### Step 1: Set up Windows Receiver
1.  Go to the **"Get Server Code"** tab.
2.  Install dependencies:
    ```bash
    pip install zeroconf
    ```
3.  Generate SSL Certificates (for TLS 1.3):
    ```bash
    openssl req -new -x509 -days 365 -nodes -out cert.pem -keyout key.pem
    ```
4.  Download and run `server.py`. It will start listening on Port 8888 and broadcast its presence via mDNS.

### Step 2: Set up Android Client
1.  Go to the **"Get Android Code"** tab.
2.  Copy the `AndroidManifest.xml` permissions to your Android project.
3.  Copy `AeroClient.kt` to your networking package.
4.  Call `AeroClient.startDiscovery()` to find your Windows PC and `sendFile()` to transmit data.

## 🏗️ Architecture Specifications

*   **Discovery Protocol:** mDNS (Multicast DNS) via UDP 5353. Service type: `_aerosync._tcp`.
*   **Transfer Protocol:** Custom framed TCP protocol.
    *   **Header:** 4-byte Big-Endian Integer (Metadata JSON Length).
    *   **Metadata:** JSON (`filename`, `filesize`, `hash`).
    *   **Payload:** Raw binary stream (Encrypted).
*   **Security:** TLS 1.3 with AES-GCM. Mutual Authentication (mTLS) recommended for production.

## ⚠️ Limitations (Web Interface)

*   **Browser Sandbox:** The web dashboard *cannot* actually transfer files to your computer or discover real devices due to browser security restrictions on raw TCP/UDP sockets. It simulates these actions to demonstrate the UX.
*   **Use the Generators:** To perform real transfers, you **must** use the generated Python and Kotlin code on native devices.