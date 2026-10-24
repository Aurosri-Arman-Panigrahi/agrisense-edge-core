import os
import subprocess
import sys
import time

print("=" * 60)
print("[AgriSense-Edge] Starting Node-RED on Hugging Face Spaces")
print("[AgriSense-Edge] Free CPU Basic Tier (2 vCPU, 16 GB RAM)")
print("=" * 60)

# Check and install Node-RED package if needed
if not os.path.exists("node_modules/node-red"):
    print("[AgriSense-Edge] Installing Node-RED dependencies via npm...")
    subprocess.run(
        ["npm", "install", "node-red", "bcryptjs", "--no-audit", "--no-fund", "--save=false"],
        check=True
    )
    print("[AgriSense-Edge] Node-RED installed successfully.")

# Port 7860 is Hugging Face's default web port
port = os.environ.get("PORT", "7860")
print(f"[AgriSense-Edge] Binding Node-RED to 0.0.0.0:{port}...")

cmd = [
    "node",
    "node_modules/node-red/red.js",
    "--port", str(port),
    "--settings", "settings.js",
    "--userDir", ".",
    "flows.json"
]

print(f"[AgriSense-Edge] Running: {' '.join(cmd)}")
sys.stdout.flush()

process = subprocess.Popen(cmd)

try:
    process.wait()
except KeyboardInterrupt:
    process.terminate()
    print("[AgriSense-Edge] Node-RED stopped.")
