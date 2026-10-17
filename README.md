# AgriSense-Edge Core (agrisense-edge-core)

> **Patent Pending | IPC Classification: A01G 25/16 (Agricultural Watering Control)**  
> **Authors:** Aurosri Arman Panigrahi, Aayush Saha, Ayush Pradhan, Ayush Das, Kumar Mimanshu Singh  
> **Affiliation:** Department of Computer Science & Engineering, KIIT University, Bhubaneswar, India  

---

## Overview
This repository houses the core cyber-physical runtime, mathematical models, simulator, and academic manuscript for the **AgriSense-Edge Pod™**.

### Directory Structure
```
agrisense-edge-core/
├── paper/
│   ├── main.tex                         # Complete IEEEtran research paper manuscript
│   ├── references.bib                   # 16 peer-reviewed BibTeX citations
│   ├── compile_paper.bat                # Automated MiKTeX pdflatex build pipeline
│   └── AgriSense_Edge_Research_Paper.pdf # Compiled IEEE research paper (5 pages)
├── nodered/
│   ├── settings.js                      # Production-hardened Node-RED settings (bcrypt, Helmet)
│   ├── flows.json                       # Deterministic FAO-56 hysteresis flow engine
│   ├── Dockerfile                       # Containerized edge runtime
│   ├── docker-compose.yml               # Mosquitto MQTT + Node-RED stack
│   └── mosquitto/
│       └── mosquitto.conf               # Secure edge MQTT broker configuration
└── simulator/
    ├── kaggle_simulator.py              # Hardware-free agricultural telemetry streaming daemon
    ├── requirements.txt                 # Simulator dependencies (paho-mqtt)
    └── data/
        └── kaggle_soil_telemetry.csv    # Multi-depth time-series agricultural dataset
```

## Quick Start

### 1. Compile LaTeX Research Paper
```bash
cd paper
./compile_paper.bat
```

### 2. Launch Local Node-RED & Mosquitto Stack
```bash
cd nodered
docker-compose up -d
```
Access dashboard at `http://localhost:1880/ui`.

### 3. Stream Kaggle Agricultural Telemetry
```bash
cd simulator
python kaggle_simulator.py --speed=2x
```
Inject anomalies:
```bash
python kaggle_simulator.py --inject-drought  # Triggers valve OPEN
python kaggle_simulator.py --inject-rain     # Triggers valve CLOSED (drainage guard)
```
