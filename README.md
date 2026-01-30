# AeroSync Secure - Local Encrypted File Transfer Dashboard

A high-performance, secure local file transfer system dashboard designed to facilitate seamless file sharing between Android and Windows devices over local Wi-Fi, without cloud dependencies.

> **Note:** This web application currently runs in **Simulation Mode**. Browser security sandboxes prevent direct access to raw TCP/UDP sockets and mDNS needed for real local network discovery. This dashboard visualizes the UI/UX and system architecture of the intended native application.

## 🚀 Features

*   **Zero-Cloud Privacy:** Operates entirely on the local network (LAN). No data leaves your Wi-Fi.
*   **Device Discovery Radar:** Visualizes mDNS/Zeroconf peer discovery logic.
*   **Secure Handshake Simulation:** Demonstrates the TLS 1.3 mutual authentication flow (Connection -> Handshake -> Connected).
*   **Physics-Based Transfer UI:** Realistic file transfer visualization with speed calculation and progress tracking.
*   **AI Security Audit:** Integrated Google Gemini 1.5 Pro to audit the system architecture specifications for vulnerabilities.
*   **Architecture Documentation:** Interactive documentation explaining the underlying Python/Kotlin implementation details.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **AI Integration:** Google GenAI SDK (Gemini 1.5 Pro)
*   **Simulation Physics:** `requestAnimationFrame` for smooth transfer progress handling.

## 📖 How to Use (Simulation Flow)

1.  **Start Discovery:**
    *   Navigate to the "Transfer Hub".
    *   Click the **Start Discovery** button on the Network Radar.
    *   *Simulation:* The app mimics network scanning and randomly "finds" local devices (e.g., Pixel 8 Pro, ThinkPad X1) after a short delay.

2.  **Connect Securely:**
    *   Click on a discovered device icon.
    *   *Simulation:* The status changes to yellow "Handshaking..." (simulating Key Exchange/TLS Setup) and then green "Connected". You cannot send files until this handshake is complete.

3.  **Transfer Files:**
    *   Drag and drop files into the drop zone or click "Select Files".
    *   Watch the transfer progress bar, speed indicators, and completion status.
    *   *Note:* In simulation mode, files are not actually sent over the network, but the UI behaves exactly as it would in the native app.

## 🏗️ System Architecture (Native Implementation Plan)

While this web app acts as a dashboard/prototype, the actual native implementation relies on:

*   **Android:**
    *   **Discovery:** `NsdManager` for mDNS broadcasting (`_aerosync._tcp`).
    *   **Background:** Foreground Services with `ServiceType.DATA_SYNC` and Partial WakeLocks.
    *   **Language:** Kotlin + Jetpack Compose.

*   **Windows Backend:**
    *   **Discovery:** `python-zeroconf`.
    *   **Server:** FastAPI / Raw AsyncIO TCP Sockets.
    *   **Encryption:** TLS 1.3 + AES-GCM (via `cryptography` library).

## 🔒 Security

*   **End-to-End Encryption:** All transfers are encrypted in transit.
*   **Mutual Authentication:** Devices verify each other's certificates before allowing file exchange.
*   **Trust-On-First-Use (TOFU):** Pairing model for new devices.

## 🤖 AI Security Audit

The "Security Audit" tab uses the Gemini API to analyze the defined system architecture. It acts as a "second pair of eyes," pointing out theoretical bottlenecks or security improvements (e.g., suggesting specific key rotation policies or firewall configurations).

## ⚠️ Limitations (Web Version)

*   **No Real Network Access:** Browsers cannot listen for UDP multicasts (mDNS) or open raw TCP sockets to local IPs due to CORS and mixed-content security policies.
*   **Mocked Peers:** The devices you see are simulated to demonstrate the intended user experience.
