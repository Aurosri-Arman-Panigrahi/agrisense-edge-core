#!/usr/bin/env python3
"""
AgriSense-Edge Pod™ - Autonomous Agricultural Telemetry Streaming Daemon
Simulates in-situ multi-depth soil probe telemetry from Kaggle time-series datasets
and dispatches MQTT JSON packets to local Node-RED edge middleware.

Patent Pending | IPC: A01G 25/16
"""

import os
import sys
import time
import json
import csv
import argparse
from datetime import datetime, timezone

# Default Kaggle Token provided by user
DEFAULT_KAGGLE_TOKEN = "KGAT_219ebdb6937977f9580518ec84c666ca"

try:
    import paho.mqtt.client as mqtt
    PAHO_AVAILABLE = True
except ImportError:
    PAHO_AVAILABLE = False


def parse_arguments():
    parser = argparse.ArgumentParser(
        description="AgriSense-Edge Kaggle Soil Telemetry Simulator"
    )
    parser.add_argument(
        "--csv",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "data", "kaggle_soil_telemetry.csv"),
        help="Path to soil time-series CSV file"
    )
    parser.add_argument(
        "--broker",
        type=str,
        default="127.0.0.1",
        help="MQTT Broker address (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=1883,
        help="MQTT Broker port (default: 1883)"
    )
    parser.add_argument(
        "--topic",
        type=str,
        default="agrisense/telemetry/pod_01",
        help="Telemetry publish topic"
    )
    parser.add_argument(
        "--speed",
        type=str,
        default="1x",
        choices=["1x", "2x", "5x", "10x"],
        help="Simulation playback speed multiplier"
    )
    parser.add_argument(
        "--inject-drought",
        action="store_true",
        help="Inject extreme soil moisture deficit anomaly (stimulate valve OPEN)"
    )
    parser.add_argument(
        "--inject-rain",
        action="store_true",
        help="Inject heavy precipitation anomaly (stimulate drainage & valve CLOSE)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without connecting to live MQTT broker (prints to console)"
    )
    parser.add_argument(
        "--kaggle-token",
        type=str,
        default=os.getenv("KAGGLE_API_TOKEN", DEFAULT_KAGGLE_TOKEN),
        help="Kaggle API token for live dataset synchronization"
    )
    return parser.parse_args()


def get_speed_delay(speed_str):
    speeds = {"1x": 2.0, "2x": 1.0, "5x": 0.4, "10x": 0.2}
    return speeds.get(speed_str, 2.0)


def evaluate_hysteresis_locally(moisture_10cm, moisture_30cm, moisture_50cm):
    """Local verification of the FAO-56 state machine."""
    THETA_PWP = 0.18
    THETA_FC = 0.32
    THETA_DRAINAGE = 0.35

    if moisture_50cm >= THETA_DRAINAGE:
        return "CLOSED (Deep Drainage Prevention)"
    elif moisture_30cm >= THETA_FC:
        return "CLOSED (Root Field Capacity Reached)"
    elif moisture_10cm < THETA_PWP and moisture_50cm < THETA_DRAINAGE:
        return "OPEN (Rhizosphere Depletion Active)"
    else:
        return "HOLD_STATE (Hysteresis Buffer)"


def main():
    args = parse_arguments()

    print("=" * 72)
    print("   AGRISENSE-EDGE POD™: HARDWARE-FREE KAGGLE TELEMETRY DAEMON   ")
    print("   Patent Pending | IPC: A01G 25/16 - Agricultural Watering Control")
    print("=" * 72)
    print(f"[*] Kaggle Token Configured : {args.kaggle_token[:8]}...{args.kaggle_token[-4:]}")
    print(f"[*] Ingesting Dataset       : {os.path.abspath(args.csv)}")
    print(f"[*] Target MQTT Broker      : {args.broker}:{args.port}")
    print(f"[*] Telemetry Target Topic  : {args.topic}")
    print(f"[*] Playback Speed          : {args.speed}")
    print(f"[*] Anomaly Injections      : Drought={args.inject_drought}, Rain={args.inject_rain}")
    print(f"[*] Dry-Run Mode            : {args.dry_run}")
    print("=" * 72)

    if not os.path.exists(args.csv):
        print(f"[!] Error: CSV file not found at {args.csv}")
        sys.exit(1)

    client = None
    if not args.dry_run:
        if not PAHO_AVAILABLE:
            print("[!] Warning: paho-mqtt not installed. Falling back to --dry-run mode.")
            args.dry_run = True
        else:
            try:
                client = mqtt.Client(client_id="agrisense_kaggle_simulator")
                client.connect(args.broker, args.port, keepalive=60)
                client.loop_start()
                print("[+] Successfully connected to Mosquitto MQTT Broker!")
            except Exception as e:
                print(f"[!] Failed to connect to MQTT broker ({e}). Falling back to --dry-run mode.")
                args.dry_run = True

    delay = get_speed_delay(args.speed)
    packet_count = 0

    try:
        while True:
            with open(args.csv, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    packet_count += 1
                    now_iso = datetime.now(timezone.utc).isoformat()

                    # Normalize and cast soil moisture values
                    m10 = float(row.get("moisture_10cm", 0.25))
                    m30 = float(row.get("moisture_30cm", 0.28))
                    m50 = float(row.get("moisture_50cm", 0.32))
                    temp = float(row.get("air_temp_c", 25.0))
                    hum = float(row.get("humidity_pct", 60.0))
                    solar = float(row.get("solar_radiation_w_m2", 500.0))

                    # Apply anomalies if flags enabled
                    if args.inject_drought:
                        m10 = max(0.08, m10 * 0.55)
                        m30 = max(0.12, m30 * 0.65)
                    elif args.inject_rain:
                        m10 = min(0.44, m10 * 1.5)
                        m50 = min(0.40, m50 * 1.3)

                    # Build structured JSON payload
                    payload = {
                        "device_id": "pod_01",
                        "firmware_version": "v2.4-edge",
                        "timestamp": now_iso,
                        "packet_seq": packet_count,
                        "moisture_10cm": round(m10, 4),
                        "moisture_30cm": round(m30, 4),
                        "moisture_50cm": round(m50, 4),
                        "temperature_c": round(temp, 1),
                        "humidity_pct": round(hum, 1),
                        "solar_w_m2": round(solar, 1),
                        "battery_mv": 3280,
                        "solar_charging": True if solar > 50 else False,
                        "guard_ring_active": True
                    }

                    payload_json = json.dumps(payload, indent=None)
                    expected_decision = evaluate_hysteresis_locally(m10, m30, m50)

                    if not args.dry_run and client:
                        client.publish(args.topic, payload_json, qos=1)

                    print(
                        f"[{now_iso}] Pkt #{packet_count:04d} | "
                        f"10cm={m10:.3f} | 30cm={m30:.3f} | 50cm={m50:.3f} | "
                        f"Temp={temp:4.1f}°C | State: {expected_decision}"
                    )

                    time.sleep(delay)

            # In continuous mode, loop back over the dataset
            print("[*] Completed dataset cycle. Looping time-series stream...")

    except KeyboardInterrupt:
        print("\n[*] AgriSense-Edge Telemetry Daemon terminated by user.")
        if client:
            client.loop_stop()
            client.disconnect()


if __name__ == "__main__":
    main()
