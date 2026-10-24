# AgriSense-Edge Pod™ Core (agrisense-edge-core)

[![Live Web Portal](https://img.shields.io/badge/Live_Portal-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://aurosri-arman-panigrahi.github.io/agrisense-edge-portal/)
[![Deploy to Render](https://img.shields.io/badge/Deploy_to_Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/deploy?repo=https://github.com/Aurosri-Arman-Panigrahi/agrisense-edge-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![IEEE Paper](https://img.shields.io/badge/IEEE_Manuscript-5_Pages_PDF-dc2626?style=for-the-badge&logo=adobeacrobatreader)](paper/AgriSense_Edge_Research_Paper.pdf)

> **Patent Pending | IPC Classification: A01G 25/16 (Agricultural Watering Control)**  
> **Authors:** Aurosri Arman Panigrahi, Aayush Saha, Ayush Pradhan, Ayush Das, Kumar Mimanshu Singh  
> **Affiliation:** Department of Computer Science & Engineering, KIIT University, Bhubaneswar, India  

---

## 🌾 Overview
This repository contains the core cyber-physical runtime, mathematical algorithms, 38-node Industry 4.0 SCADA pipeline, multi-depth soil dynamics engine, Kaggle dataset streaming cycler, and the complete IEEEtran research paper manuscript for the **AgriSense-Edge Pod™**.

- 🌐 **Live Web Portal**: [https://aurosri-arman-panigrahi.github.io/agrisense-edge-portal/](https://aurosri-arman-panigrahi.github.io/agrisense-edge-portal/)
- 📄 **Compiled IEEE Research Paper**: [Download / Read Paper PDF](paper/AgriSense_Edge_Research_Paper.pdf)

---

## 🏭 Industry 4.0 SCADA Pipeline Architecture (38 Nodes)

The visual orchestration engine executes an authentic 4-stage pipeline inside Node-RED:

```mermaid
graph LR
    subgraph 1. Sensor Ingestion & Telemetry
        S1[Kaggle Dataset Cycler 3s]
        S2[3-Depth Soil VWC 10/25/45cm]
        S3[Soil Temp & Microclimate]
        S4[Solar Irradiance & Rain Gauge]
        S5[Line Pressure & Battery BMS]
    end

    subgraph 2. Physical Calibration & Dynamics
        C1[Glitch Rejection & Range Guard]
        C2[3rd-Order Soil Polynomial Eq 3]
        C3[Vapor Pressure Deficit VPD]
        C4[FAO-56 Penman-Monteith ET0 Eq 2]
        C5[Readily Available Water RAW Deficit]
    end

    subgraph 3. Closed-Loop Decisions & Interlocks
        D1[Tri-Strata Hysteretic FSM Eq 4]
        D2[Deep Leaching Lockout VWC45 >= 0.35]
        D3[Meteorological Rain Inhibit]
        D4[Frost & Line Rupture Guardians]
        D5[SCADA Command Synthesizer]
    end

    subgraph 4. Actuation & SCADA Telemetry
        O1[12V Bi-Stable Latch Driver]
        O2[MQTT /agrisense/actuation/valve]
        O3[WebSocket Server /ws/telemetry]
        O4[Circular Offline Telemetry Buffer]
        O5[Cumulative Water Ledger]
    end

    S1 --> S2 --> S3 --> S4 --> S5
    S2 --> C1 --> C2 --> C3 --> C4 --> C5
    C5 --> D1
    D2 --> D5
    D3 --> D5
    D4 --> D5
    D1 --> D5
    D5 --> O1
    D5 --> O2
    D5 --> O3
    D5 --> O4
    D5 --> O5
```

---

## 🔐 Node-RED Access & Credentials

| Role | Username | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **SCADA Administrator** | `admin` | `admin@12345` | Full Flow Read/Write, Deploy, Terminal, Settings |
| **Field Operator** | `operator` | `FarmOperator2026!` | Read-Only Monitor, Telemetry Inspector |

---

## 🚀 Deployment Options

### Option 1: 1-Click Cloud Deploy to Render
Deploy the Node-RED engine directly to the cloud without local hardware:
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Aurosri-Arman-Panigrahi/agrisense-edge-core)

### Option 2: Docker / Docker Compose
Run the entire stack (Node-RED + Mosquitto MQTT Broker) with one command:
```bash
cd nodered
docker compose up -d
```
Access the visual SCADA flow canvas at `http://localhost:1880/`.

### Option 3: Local Node.js Execution
```bash
cd nodered
npm install
npm start
```

---

## 📊 Directory Structure
```
agrisense-edge-core/
├── render.yaml                          # Cloud deployment blueprint (Render)
├── paper/
│   ├── main.tex                         # Complete IEEEtran research manuscript
│   ├── references.bib                   # 16 peer-reviewed BibTeX citations
│   ├── compile_paper.bat                # Automated MiKTeX pdflatex build script
│   └── AgriSense_Edge_Research_Paper.pdf # Compiled IEEE research paper (5 pages)
├── nodered/
│   ├── settings.js                      # Production Node-RED settings (bcrypt, Helmet)
│   ├── flows.json                       # 38-node Industry 4.0 SCADA pipeline
│   ├── Dockerfile                       # Containerized edge runtime
│   ├── docker-compose.yml               # Mosquitto MQTT + Node-RED stack
│   └── mosquitto/
│       └── mosquitto.conf               # Edge MQTT broker configuration
└── simulator/
    ├── kaggle_simulator.py              # Agricultural telemetry streaming daemon
    ├── requirements.txt                 # Simulator dependencies (paho-mqtt)
    └── data/
        └── kaggle_soil_telemetry.csv    # Multi-depth time-series agricultural dataset
```

---

## 📜 Citation
```bibtex
@article{panigrahi2026agrisense,
  title={AgriSense-Edge Pod: Autonomous Micro-Irrigation and Multi-Depth Soil Dynamics Engine for Edge-Class Embedded Microcontrollers},
  author={Panigrahi, Aurosri Arman and Saha, Aayush and Pradhan, Ayush and Das, Ayush and Singh, Kumar Mimanshu},
  journal={IEEE Transactions on AgriFood Electronics (Under Review)},
  year={2026}
}
```
