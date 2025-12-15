<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DriveAI Protect - Mahindra XEV 9e Servicing</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        /* HEADER */
        .header {
            background: rgba(30, 41, 59, 0.8);
            border-bottom: 2px solid #0ea5e9;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }

        .header h1 {
            color: #0ea5e9;
            font-size: 28px;
            margin-bottom: 10px;
        }

        .vehicle-info {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 14px;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .info-label {
            color: #94a3b8;
            font-weight: 500;
        }

        /* HERO SECTION */
        .hero {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            align-items: center;
        }

        .hero-image {
            background: rgba(15, 23, 42, 0.8);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }

        .hero-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(6, 182, 212, 0.2);
        }

        .vehicle-details {
            display: grid;
            gap: 15px;
        }

        .detail-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .detail {
            background: rgba(15, 23, 42, 0.6);
            padding: 12px;
            border-radius: 8px;
            border-left: 3px solid #0ea5e9;
        }

        .detail-label {
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .detail-value {
            font-size: 18px;
            font-weight: 600;
            color: #f1f5f9;
            margin-top: 4px;
        }

        /* STATUS CHIPS */
        .status-chips {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .chip {
            background: rgba(15, 23, 42, 0.6);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #334155;
        }

        .chip-label {
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
        }

        .chip-value {
            font-size: 24px;
            font-weight: 700;
            margin-top: 8px;
        }

        .chip.excellent .chip-value { color: #10b981; }
        .chip.good .chip-value { color: #84cc16; }
        .chip.warning .chip-value { color: #f59e0b; }
        .chip.critical .chip-value { color: #ef4444; }

        /* DATA PIPELINE DIAGRAM */
        .pipeline {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            overflow-x: auto;
        }

        .pipeline-title {
            color: #0ea5e9;
            font-size: 20px;
            margin-bottom: 30px;
            text-align: center;
        }

        .pipeline-flow {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            min-width: 100%;
        }

        .pipeline-stage {
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            position: relative;
        }

        .pipeline-stage::after {
            content: "→";
            position: absolute;
            right: -25px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 24px;
            color: #0ea5e9;
        }

        .pipeline-stage:last-child::after {
            display: none;
        }

        .stage-number {
            display: inline-block;
            background: #0ea5e9;
            color: #0f172a;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            line-height: 30px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .stage-title {
            font-weight: 600;
            color: #0ea5e9;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .stage-desc {
            font-size: 12px;
            color: #cbd5e1;
        }

        /* COMPONENTS SECTION */
        .components-section {
            margin-bottom: 40px;
        }

        .section-title {
            color: #0ea5e9;
            font-size: 24px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #334155;
            flex-wrap: wrap;
        }

        .tab {
            padding: 12px 20px;
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-weight: 500;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
        }

        .tab.active {
            color: #0ea5e9;
            border-bottom-color: #0ea5e9;
        }

        /* COMPONENT CARD */
        .component-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            display: none;
        }

        .component-card.active {
            display: block;
        }

        .component-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 20px;
            gap: 15px;
        }

        .component-name {
            font-size: 20px;
            font-weight: 600;
            color: #f1f5f9;
        }

        .health-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
        }

        .health-badge.excellent { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .health-badge.good { background: rgba(132, 204, 22, 0.2); color: #84cc16; }
        .health-badge.warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .health-badge.critical { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .health-bar {
            width: 100%;
            height: 30px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 15px;
            border: 1px solid #334155;
        }

        .health-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #84cc16);
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            color: white;
            font-weight: 600;
            font-size: 12px;
        }

        .health-fill.warning { background: linear-gradient(90deg, #f59e0b, #ff6b6b); }
        .health-fill.critical { background: linear-gradient(90deg, #ef4444, #dc2626); }

        .component-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .metric {
            background: rgba(15, 23, 42, 0.6);
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #0ea5e9;
        }

        .metric-label {
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .metric-value {
            font-size: 20px;
            font-weight: 600;
            color: #f1f5f9;
        }

        .metric-status {
            font-size: 12px;
            margin-top: 4px;
        }

        .status-ok { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-critical { color: #ef4444; }

        /* CHARTS */
        .chart-container {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
            height: 400px;
        }

        .chart-title {
            text-align: center;
            color: #cbd5e1;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
        }

        /* ALERT BOX */
        .alert {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #fca5a5;
        }

        .alert-title {
            font-weight: 600;
            margin-bottom: 5px;
        }

        /* SERVICE RECOMMENDATIONS */
        .services-section {
            margin-top: 40px;
        }

        .service-card {
            background: rgba(30, 41, 59, 0.8);
            border-left: 4px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 20px;
            align-items: start;
        }

        .service-card.urgent { border-left-color: #ef4444; }
        .service-card.high { border-left-color: #f59e0b; }
        .service-card.medium { border-left-color: #0ea5e9; }

        .service-name {
            font-size: 16px;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 10px;
        }

        .service-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            font-size: 13px;
            margin-bottom: 15px;
        }

        .service-detail {
            color: #cbd5e1;
        }

        .service-detail-label {
            color: #94a3b8;
            text-transform: uppercase;
            font-size: 11px;
            margin-bottom: 3px;
        }

        .service-detail-value {
            font-weight: 600;
            color: #f1f5f9;
            font-size: 14px;
        }

        .service-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 10px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.3s ease;
            white-space: nowrap;
        }

        .btn-primary {
            background: #0ea5e9;
            color: #0f172a;
        }

        .btn-primary:hover {
            background: #06b6d4;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(6, 182, 212, 0.3);
        }

        .btn-secondary {
            background: rgba(51, 65, 85, 0.6);
            color: #e2e8f0;
            border: 1px solid #334155;
        }

        .btn-secondary:hover {
            background: rgba(51, 65, 85, 0.9);
        }

        /* TYRE VISUALIZATION */
        .tyre-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }

        .tyre {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }

        .tyre-position {
            font-weight: 600;
            color: #0ea5e9;
            margin-bottom: 15px;
        }

        .tyre-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: white;
            position: relative;
        }

        .tyre-circle.good { background: rgba(16, 185, 129, 0.3); border: 2px solid #10b981; }
        .tyre-circle.warning { background: rgba(245, 158, 11, 0.3); border: 2px solid #f59e0b; }

        .tyre-pressure {
            color: #cbd5e1;
            font-size: 12px;
            margin-bottom: 8px;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
            .hero {
                grid-template-columns: 1fr;
            }

            .detail-row {
                grid-template-columns: 1fr;
            }

            .service-card {
                grid-template-columns: 1fr;
            }

            .vehicle-info {
                flex-direction: column;
                gap: 10px;
            }

            .pipeline-flow {
                grid-template-columns: 1fr;
            }

            .chart-container {
                height: 300px;
            }
        }

        .footer {
            text-align: center;
            color: #64748b;
            font-size: 12px;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid #334155;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <h1>🔧 DriveAI Protect - Servicing Dashboard</h1>
            <div class="vehicle-info">
                <div class="info-item">
                    <span class="info-label">Vehicle:</span>
                    <span>Mahindra XEV 9e (Elite Plus)</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Registration:</span>
                    <span>MH-07-AB-1234</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Mileage:</span>
                    <span>23,450 km</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Last Service:</span>
                    <span>45 days ago</span>
                </div>
            </div>
        </div>

        <!-- HERO SECTION -->
        <div class="hero">
            <div class="hero-image">
                <img src="https://pplx-res.cloudinary.com/image/upload/v1765383352/search_images/9732cf520869b00f4b92aea8e153b53f40c0d2c2.jpg" alt="Mahindra XEV 9e">
                <p style="margin-top: 15px; color: #94a3b8; font-size: 12px;">Pearl White | Elite Plus Variant</p>
            </div>
            
            <div class="vehicle-details">
                <div class="detail-row">
                    <div class="detail">
                        <div class="detail-label">Color</div>
                        <div class="detail-value">Pearl White</div>
                    </div>
                    <div class="detail">
                        <div class="detail-label">Mileage</div>
                        <div class="detail-value">23,450 km</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail">
                        <div class="detail-label">Warranty</div>
                        <div class="detail-value">Active (Dec 2027)</div>
                    </div>
                    <div class="detail">
                        <div class="detail-label">Last Service</div>
                        <div class="detail-value">45 days ago</div>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; margin-bottom: 15px;">Health Overview</div>
                    <div class="status-chips">
                        <div class="chip excellent">
                            <div class="chip-label">Overall</div>
                            <div class="chip-value">87/100</div>
                        </div>
                        <div class="chip good">
                            <div class="chip-label">Mechanical</div>
                            <div class="chip-value">84/100</div>
                        </div>
                        <div class="chip good">
                            <div class="chip-label">Electrical</div>
                            <div class="chip-value">91/100</div>
                        </div>
                        <div class="chip warning">
                            <div class="chip-label">Tyres</div>
                            <div class="chip-value">78/100</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- DATA PIPELINE DIAGRAM -->
        <div class="pipeline">
            <div class="pipeline-title">🤖 AI Data Analysis Pipeline</div>
            <div class="pipeline-flow">
                <div class="pipeline-stage">
                    <div class="stage-number">1</div>
                    <div class="stage-title">Vehicle Sensors</div>
                    <div class="stage-desc">CAN-BUS, BMS, TPMS, ADAS</div>
                </div>
                <div class="pipeline-stage">
                    <div class="stage-number">2</div>
                    <div class="stage-title">Data Ingestion</div>
                    <div class="stage-desc">Normalization, Validation, Enrichment</div>
                </div>
                <div class="pipeline-stage">
                    <div class="stage-number">3</div>
                    <div class="stage-title">Anomaly Detection</div>
                    <div class="stage-desc">Isolation Forest ML Model</div>
                </div>
                <div class="pipeline-stage">
                    <div class="stage-number">4</div>
                    <div class="stage-title">AI Diagnosis</div>
                    <div class="stage-desc">LangGraph + GPT-4 Reasoning</div>
                </div>
                <div class="pipeline-stage">
                    <div class="stage-number">5</div>
                    <div class="stage-title">Confidence Check</div>
                    <div class="stage-desc">4-Factor Scoring (92-96%)</div>
                </div>
                <div class="pipeline-stage">
                    <div class="stage-number">6</div>
                    <div class="stage-title">Smart Scheduling</div>
                    <div class="stage-desc">OR-Tools CSP Optimization</div>
                </div>
            </div>
        </div>

        <!-- MECHANICAL COMPONENTS -->
        <div class="components-section">
            <div class="section-title">⚙️ Mechanical Components</div>

            <div class="section-tabs">
                <button class="tab active" onclick="showTab(this, 'engine')">Engine</button>
                <button class="tab" onclick="showTab(this, 'transmission')">Transmission</button>
                <button class="tab" onclick="showTab(this, 'brakes')">Brakes</button>
            </div>

            <!-- ENGINE -->
            <div id="engine" class="component-card active">
                <div class="component-header">
                    <div>
                        <div class="component-name">🔧 Engine</div>
                        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">4-Cylinder EV Charger</div>
                    </div>
                    <span class="health-badge good">84/100</span>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Health Status</div>
                    <div class="health-bar">
                        <div class="health-fill" style="width: 84%;">84%</div>
                    </div>
                </div>

                <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="color: #fbbf24; font-weight: 600; margin-bottom: 5px;">⚠️ Temperature Alert</div>
                    <div style="color: #fed7aa; font-size: 13px;">Current: 91°C (Baseline: 82°C) - +9°C above normal. Coolant level at 95% (normal: 100%)</div>
                </div>

                <div class="component-grid">
                    <div class="metric">
                        <div class="metric-label">Temperature</div>
                        <div class="metric-value">91°C</div>
                        <div class="metric-status status-warning">⚠️ +9°C above baseline</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Oil Pressure</div>
                        <div class="metric-value">2.8 bar</div>
                        <div class="metric-status status-ok">✓ Normal (2.5-3.0)</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Coolant Level</div>
                        <div class="metric-value">95%</div>
                        <div class="metric-status status-warning">⚠️ Low (normal: 100%)</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Deterioration</div>
                        <div class="metric-value">+2.3°C/day</div>
                        <div class="metric-status status-warning">⚠️ Trending up</div>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-title">Temperature Trend (Last 30 Days)</div>
                    <canvas id="engineChart"></canvas>
                </div>

                <div style="background: rgba(15, 23, 42, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #0ea5e9;">
                    <div style="color: #0ea5e9; font-weight: 600; margin-bottom: 8px;">🤖 AI Analysis</div>
                    <div style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">Low coolant and approaching oil change interval. Temperature spike detected over 4 days (82→91°C). Schedule oil change within 1,300 km to restore optimal thermal management. Risk: 3% (Low). Confidence: 92%</div>
                </div>

                <div class="service-actions" style="margin-top: 15px;">
                    <button class="btn btn-primary">Schedule Oil Change</button>
                    <button class="btn btn-secondary">View Similar Cases</button>
                </div>
            </div>

            <!-- TRANSMISSION -->
            <div id="transmission" class="component-card">
                <div class="component-header">
                    <div>
                        <div class="component-name">⚙️ Transmission (CVT)</div>
                        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Continuously Variable - Hybrid System</div>
                    </div>
                    <span class="health-badge warning">78/100</span>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Health Status</div>
                    <div class="health-bar">
                        <div class="health-fill warning" style="width: 78%;">78%</div>
                    </div>
                </div>

                <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="color: #fbbf24; font-weight: 600; margin-bottom: 5px;">⚠️ Shift Delay Detected</div>
                    <div style="color: #fed7aa; font-size: 13px;">Fluid pressure declining. Last occurrence: 2 hours ago. Frequency: 3 times in 24 hours, pattern during aggressive acceleration.</div>
                </div>

                <div class="component-grid">
                    <div class="metric">
                        <div class="metric-label">Fluid Pressure</div>
                        <div class="metric-value">135 bar</div>
                        <div class="metric-status status-warning">⚠️ Low (normal: 140-160)</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Shift Delay</div>
                        <div class="metric-value">145 ms</div>
                        <div class="metric-status status-warning">⚠️ Slow (normal: &lt;100ms)</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Fluid Temp</div>
                        <div class="metric-value">88°C</div>
                        <div class="metric-status status-warning">⚠️ Hot (normal: 70-85°C)</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Deterioration</div>
                        <div class="metric-value">-0.75%/day</div>
                        <div class="metric-status status-warning">⚠️ Trending down</div>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-title">Fluid Pressure vs Shift Delay Correlation</div>
                    <canvas id="transChart"></canvas>
                </div>

                <div style="background: rgba(15, 23, 42, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #0ea5e9;">
                    <div style="color: #0ea5e9; font-weight: 600; margin-bottom: 8px;">🤖 AI Analysis</div>
                    <div style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">Transmission fluid degradation detected. Strong correlation between pressure drop and shift delay. Reduce aggressive acceleration until fluid flush scheduled. Remaining useful life: 8-12 days. Risk: 8%. Confidence: 88%</div>
                </div>

                <div class="service-actions" style="margin-top: 15px;">
                    <button class="btn btn-primary">Schedule Fluid Flush</button>
                    <button class="btn btn-secondary">Driving Tips</button>
                </div>
            </div>

            <!-- BRAKES -->
            <div id="brakes" class="component-card">
                <div class="component-header">
                    <div>
                        <div class="component-name">🛑 Brakes</div>
                        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Regenerative + Hydraulic Blend System</div>
                    </div>
                    <span class="health-badge critical">72/100</span>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Health Status</div>
                    <div class="health-bar">
                        <div class="health-fill critical" style="width: 72%;">72%</div>
                    </div>
                </div>

                <div class="alert">
                    <div class="alert-title">🔴 URGENT: Brake Pad Replacement Needed</div>
                    <div style="font-size: 13px;">Front pads at 78% wear, deteriorating 0.75% per day. Estimated replacement in 29 days or 500 km (whichever comes first). Risk of brake failure: 12%. DO NOT DELAY.</div>
                </div>

                <div class="component-grid">
                    <div class="metric">
                        <div class="metric-label">Front Pad Wear</div>
                        <div class="metric-value">78%</div>
                        <div class="metric-status status-critical">🔴 URGENT</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Rear Pad Wear</div>
                        <div class="metric-value">62%</div>
                        <div class="metric-status status-warning">⚠️ Monitor</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Hydraulic Pressure</div>
                        <div class="metric-value">240 bar</div>
                        <div class="metric-status status-ok">✓ Normal</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Failure Risk</div>
                        <div class="metric-value">12%</div>
                        <div class="metric-status status-critical">🔴 Medium-High</div>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-title">Brake Pad Wear Forecast (All Wheels)</div>
                    <canvas id="brakesChart"></canvas>
                </div>

                <div style="background: rgba(15, 23, 42, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #0ea5e9;">
                    <div style="color: #0ea5e9; font-weight: 600; margin-bottom: 8px;">🤖 AI Analysis</div>
                    <div style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">Front brake pads critical. Deteriorating 0.75%/day due to urban driving and hard braking patterns. Increase regen braking on downhill slopes to extend pad life by 25-30%. Schedule replacement within 500 km. Cost: ₹5,200. Benefit: Avoid ₹45,000 emergency repair. Confidence: 94%</div>
                </div>

                <div class="service-actions" style="margin-top: 15px;">
                    <button class="btn btn-primary">Schedule Pad Replacement NOW</button>
                    <button class="btn btn-secondary">Optimization Tips</button>
                </div>
            </div>
        </div>

        <!-- TYRES SECTION -->
        <div class="components-section">
            <div class="section-title">🛞 Tyre Health & Pressure</div>

            <div class="tyre-grid">
                <div class="tyre">
                    <div class="tyre-position">FL - Front Left</div>
                    <div class="tyre-circle good">
                        <div>64%</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px; margin-bottom: 8px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Pressure</div>
                        <div style="font-weight: 600;">2.2 bar ✓</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Temperature</div>
                        <div style="font-weight: 600;">42°C ✓</div>
                    </div>
                </div>

                <div class="tyre">
                    <div class="tyre-position">FR - Front Right</div>
                    <div class="tyre-circle good">
                        <div>62%</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px; margin-bottom: 8px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Pressure</div>
                        <div style="font-weight: 600;">2.2 bar ✓</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Temperature</div>
                        <div style="font-weight: 600;">43°C ✓</div>
                    </div>
                </div>

                <div class="tyre">
                    <div class="tyre-position">RL - Rear Left</div>
                    <div class="tyre-circle warning">
                        <div>68%</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px; margin-bottom: 8px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Pressure</div>
                        <div style="font-weight: 600;">2.1 bar ⚠️</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Temperature</div>
                        <div style="font-weight: 600;">41°C ✓</div>
                    </div>
                </div>

                <div class="tyre">
                    <div class="tyre-position">RR - Rear Right</div>
                    <div class="tyre-circle good">
                        <div>66%</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px; margin-bottom: 8px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Pressure</div>
                        <div style="font-weight: 600;">2.2 bar ✓</div>
                    </div>
                    <div style="color: #cbd5e1; font-size: 13px;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Temperature</div>
                        <div style="font-weight: 600;">42°C ✓</div>
                    </div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">Tyre Pressure Stability (Last 30 Days)</div>
                <canvas id="tyreChart"></canvas>
            </div>

            <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 15px; border-radius: 8px;">
                <div style="color: #fbbf24; font-weight: 600; margin-bottom: 5px;">⚠️ Monitor RL Pressure</div>
                <div style="color: #fed7aa; font-size: 13px;">Rear Left tyre showing gradual pressure drop (2.20 → 2.10 bar over 30 days). Possible slow leak or natural pressure loss. Schedule inspection within 2 weeks.</div>
            </div>

            <div class="service-actions" style="margin-top: 20px;">
                <button class="btn btn-secondary">Schedule Tyre Rotation</button>
                <button class="btn btn-secondary">RL Inspection</button>
            </div>
        </div>

        <!-- SERVICE RECOMMENDATIONS -->
        <div class="services-section">
            <div class="section-title">📋 Recommended Services (Priority-Ordered by AI)</div>

            <div class="service-card urgent">
                <div>
                    <div class="service-name">🔴 Brake Pad Replacement (Front + Rear)</div>
                    <div class="service-details">
                        <div class="service-detail">
                            <div class="service-detail-label">Distance Remaining</div>
                            <div class="service-detail-value">500 km</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">Cost</div>
                            <div class="service-detail-value">₹5,200</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">Duration</div>
                            <div class="service-detail-value">2 hours</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">AI Confidence</div>
                            <div class="service-detail-value">94% (Very High)</div>
                        </div>
                    </div>
                    <div style="color: #fed7aa; font-size: 13px; line-height: 1.6; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 6px;">
                        <strong>Why:</strong> Front pads at 78% wear, deteriorating 0.75%/day. Failure risk 12% if delayed >10 days.<br>
                        <strong>Benefit:</strong> Prevent ₹45,000 emergency repair. Cost savings: ₹39,800.
                    </div>
                </div>
                <div class="service-actions" style="align-self: flex-start;">
                    <button class="btn btn-primary">Schedule Now</button>
                </div>
            </div>

            <div class="service-card high">
                <div>
                    <div class="service-name">🟡 Oil Change + Coolant Top-up</div>
                    <div class="service-details">
                        <div class="service-detail">
                            <div class="service-detail-label">Distance Remaining</div>
                            <div class="service-detail-value">1,300 km</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">Cost</div>
                            <div class="service-detail-value">₹800</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">Duration</div>
                            <div class="service-detail-value">30 mins</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">AI Confidence</div>
                            <div class="service-detail-value">92% (Very High)</div>
                        </div>
                    </div>
                    <div style="color: #fcd34d; font-size: 13px; line-height: 1.6; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 6px;">
                        <strong>Why:</strong> Engine temp elevated (91°C vs 82°C baseline). Coolant at 95%.<br>
                        <strong>Benefit:</strong> Restore thermal baseline. Extend engine lifespan by 2+ years.
                    </div>
                </div>
                <div class="service-actions" style="align-self: flex-start;">
                    <button class="btn btn-primary">Schedule Now</button>
                </div>
            </div>

            <div class="service-card high">
                <div>
                    <div class="service-name">🟡 Transmission Fluid Flush</div>
                    <div class="service-details">
                        <div class="service-detail">
                            <div class="service-detail-label">Distance Remaining</div>
                            <div class="service-detail-value">5,000 km</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">Cost</div>
                            <div class="service-detail-value">₹2,500</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">Duration</div>
                            <div class="service-detail-value">3 hours</div>
                        </div>
                        <div class="service-detail">
                            <div class="service-detail-label">AI Confidence</div>
                            <div class="service-detail-value">88% (High)</div>
                        </div>
                    </div>
                    <div style="color: #fcd34d; font-size: 13px; line-height: 1.6; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 6px;">
                        <strong>Why:</strong> Fluid pressure declining. Shift delay 145ms (normal <100ms).<br>
                        <strong>Benefit:</strong> Restore pressure 135→160 bar. Prevent ₹35,000 emergency repair.
                    </div>
                </div>
                <div class="service-actions" style="align-self: flex-start;">
                    <button class="btn btn-primary">Schedule Now</button>
                </div>
            </div>
        </div>

        <!-- SUMMARY STATS -->
        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-top: 40px; margin-bottom: 40px;">
            <div style="color: #0ea5e9; font-size: 18px; font-weight: 600; margin-bottom: 20px;">📊 AI Analytics Summary</div>
            
            <div class="component-grid">
                <div class="metric">
                    <div class="metric-label">Total Anomalies Detected</div>
                    <div class="metric-value">7</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Avg Prediction Accuracy</div>
                    <div class="metric-value">98.4%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Data Points Processed</div>
                    <div class="metric-value">47.2M</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Processing Latency</div>
                    <div class="metric-value">2.3 sec</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Potential Savings</div>
                    <div class="metric-value">₹89,800</div>
                </div>
                <div class="metric">
                    <div class="metric-label">False Positive Rate</div>
                    <div class="metric-value">2.1%</div>
                </div>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border-left: 3px solid #10b981;">
                <div style="color: #6ee7b7; font-weight: 600; margin-bottom: 8px;">✓ Preventive Success Story</div>
                <div style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">You've completed 5 preventive services over 7 months. This proactive approach has prevented 2 emergency breakdowns (estimated ₹67,200+ in emergency costs). Your ROI: 1,058% - every ₹1 spent on preventive service saves ₹10.58 in potential emergency repairs.</div>
            </div>
        </div>

        <div class="footer">
            <p>DriveAI Protect uses advanced telemetry, AI analysis, and predictive maintenance to keep your Mahindra XEV 9e running optimally.</p>
            <p style="margin-top: 10px; color: #475569;">Last updated: December 10, 2025 | Data confidence: 98.4% | Next analysis: In 24 hours</p>
        </div>
    </div>

    <script>
        // Initialize charts
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1', font: { size: 12 } }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                }
            }
        };

        // ENGINE TEMPERATURE
        const engineCtx = document.getElementById('engineChart');
        if (engineCtx) {
            new Chart(engineCtx, {
                type: 'line',
                data: {
                    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
                    datasets: [
                        {
                            label: 'Current Temp',
                            data: [82, 83, 85, 87, 89, 91, 91],
                            borderColor: '#0ea5e9',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Baseline (Normal)',
                            data: [82, 82, 82, 82, 82, 82, 82],
                            borderColor: '#10b981',
                            borderDash: [5, 5],
                            tension: 0
                        },
                        {
                            label: 'Safe Threshold',
                            data: [85, 85, 85, 85, 85, 85, 85],
                            borderColor: '#f59e0b',
                            borderDash: [5, 5],
                            tension: 0
                        }
                    ]
                },
                options: chartOptions
            });
        }

        // TRANSMISSION PRESSURE vs SHIFT DELAY
        const transCtx = document.getElementById('transChart');
        if (transCtx) {
            new Chart(transCtx, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Current Reading',
                            data: [{x: 135, y: 145}],
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            borderColor: '#ef4444',
                            pointRadius: 8
                        },
                        {
                            label: 'Normal Range',
                            data: [
                                {x: 160, y: 85},
                                {x: 150, y: 95},
                                {x: 140, y: 105}
                            ],
                            backgroundColor: 'rgba(16, 185, 129, 0.6)',
                            borderColor: '#10b981',
                            pointRadius: 6
                        }
                    ]
                },
                options: {
                    ...chartOptions,
                    scales: {
                        x: {
                            ...chartOptions.scales.x,
                            title: { display: true, text: 'Fluid Pressure (bar)', color: '#cbd5e1' },
                            min: 130,
                            max: 165
                        },
                        y: {
                            ...chartOptions.scales.y,
                            title: { display: true, text: 'Shift Delay (ms)', color: '#cbd5e1' },
                            min: 80,
                            max: 150
                        }
                    }
                }
            });
        }

        // BRAKE PAD WEAR
        const brakesCtx = document.getElementById('brakesChart');
        if (brakesCtx) {
            new Chart(brakesCtx, {
                type: 'line',
                data: {
                    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20'],
                    datasets: [
                        {
                            label: 'FL (Front Left) - URGENT',
                            data: [78, 76, 74, 72, 70],
                            borderColor: '#ef4444',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'FR (Front Right) - URGENT',
                            data: [76, 74, 72, 70, 68],
                            borderColor: '#f97316',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'RL (Rear Left)',
                            data: [62, 60, 58, 56, 54],
                            borderColor: '#0ea5e9',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'RR (Rear Right)',
                            data: [64, 62, 60, 58, 56],
                            borderColor: '#8b5cf6',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Replacement Threshold',
                            data: [50, 50, 50, 50, 50],
                            borderColor: '#fbbf24',
                            borderDash: [5, 5],
                            tension: 0,
                            pointRadius: 0
                        }
                    ]
                },
                options: chartOptions
            });
        }

        // TYRE PRESSURE
        const tyreCtx = document.getElementById('tyreChart');
        if (tyreCtx) {
            new Chart(tyreCtx, {
                type: 'line',
                data: {
                    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
                    datasets: [
                        {
                            label: 'FL',
                            data: [2.20, 2.20, 2.20, 2.20, 2.20, 2.20, 2.20],
                            borderColor: '#0ea5e9',
                            tension: 0.4
                        },
                        {
                            label: 'FR',
                            data: [2.20, 2.20, 2.20, 2.20, 2.20, 2.20, 2.20],
                            borderColor: '#10b981',
                            tension: 0.4
                        },
                        {
                            label: 'RL - Pressure Drop ⚠️',
                            data: [2.20, 2.19, 2.17, 2.15, 2.13, 2.11, 2.10],
                            borderColor: '#f59e0b',
                            tension: 0.4
                        },
                        {
                            label: 'RR',
                            data: [2.20, 2.20, 2.20, 2.20, 2.19, 2.19, 2.20],
                            borderColor: '#8b5cf6',
                            tension: 0.4
                        }
                    ]
                },
                options: chartOptions
            });
        }

        // Tab switching
        function showTab(button, tabId) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.component-card').forEach(c => c.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        }
    </script>
</body>
</html>
