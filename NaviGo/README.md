# NaviGo - AI-Powered Vehicle Care Platform

A comprehensive vehicle maintenance and care platform with AI-powered diagnostics, predictive maintenance, and autonomous scheduling.

## Repository Structure

This repository is organized into the following directories:

```
NaviGo/
├── frontend/              # Next.js frontend application
│   └── vehicle-care-2/   # Main frontend codebase
├── backend/               # Backend services and cloud functions
│   └── functions/       # Firebase Cloud Functions
├── agents/                # AI Agent implementations
│   ├── communication/    # Communication agents (SMS, LLM)
│   ├── data_analysis/   # Data analysis agents
│   ├── diagnosis/        # Diagnostic agents
│   ├── engagement/      # Customer engagement agents
│   ├── feedback/         # Feedback processing agents
│   ├── forecasting/      # Forecasting agents
│   ├── manufacturing/   # Manufacturing agents
│   ├── master/          # Master orchestrator and policy engine
│   ├── rca/             # Root cause analysis agents
│   └── scheduling/      # Scheduling agents
├── deployment/           # Deployment configurations
│   ├── firebase.json    # Firebase hosting and functions config
│   └── .firebaserc      # Firebase project configuration
├── docs/                 # Documentation
│   ├── AGENTIC_AI_README.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── FRONTEND_CHANGES_REQUIRED.md
│   └── ... (other documentation files)
├── scripts/              # Deployment and setup scripts
│   ├── setup_pubsub_topics.sh
│   └── verify_pubsub_topics.sh
└── config/               # Configuration files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.11+
- Firebase CLI
- Google Cloud SDK (for deployment)

### Frontend Setup

```bash
cd frontend/vehicle-care-2
npm install  # or pnpm install
npm run dev
```

### Backend Setup

```bash
cd backend/functions
# Install dependencies for each agent/service as needed
pip install -r <agent>/requirements.txt
```

### Deployment

```bash
cd deployment
firebase deploy
```

## Features

- **AI-Powered Diagnostics**: Advanced vehicle health monitoring and diagnostics
- **Predictive Maintenance**: Proactive maintenance scheduling based on AI predictions
- **Autonomous Scheduling**: Intelligent appointment scheduling
- **Manufacturer Dashboard**: Production monitoring and quality control
- **Service Center Dashboard**: Comprehensive service management
- **Customer Engagement**: AI-driven customer communication

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- `AGENTIC_AI_README.md` - Complete AI agent system documentation
- `BACKEND_ARCHITECTURE.md` - Backend architecture and design
- `FRONTEND_CHANGES_REQUIRED.md` - Frontend implementation guide
- `NAVIGO_*` - Various flow and system documentation

## Contributing

Please read the documentation in the `docs/` directory before contributing.

## License

[Add your license here]

