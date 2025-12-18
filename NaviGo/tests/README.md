# NaviGo Agents Integration Tests

This directory contains comprehensive integration tests for all NaviGo agents.

## Running Tests

### Option 1: Using pytest (Recommended)
```bash
# Install pytest if not already installed
pip install pytest

# Run all tests
pytest tests/test_agents_integration.py -v

# Run specific test class
pytest tests/test_agents_integration.py::TestCommunicationAgent -v

# Run with coverage
pytest tests/test_agents_integration.py --cov=agents --cov=backend/functions
```

### Option 2: Direct Python execution
```bash
python tests/test_agents_integration.py
```

## Test Coverage

The test suite covers:

1. **Ingest Telemetry Agent**
   - Schema validation
   - Function execution
   - Firestore integration

2. **Data Analysis Agent**
   - Import verification
   - Anomaly detection logic
   - Agent execution

3. **Communication Agent** (Voice Calling)
   - Agent initialization
   - Defect explanation
   - Question handling
   - TwiML generation
   - Voice call initiation

4. **Scheduling Agent**
   - Import verification
   - Optimization logic
   - Edge case handling

5. **Engagement Agent**
   - Import verification

6. **RCA Agent**
   - Import verification

7. **Diagnosis Agent**
   - Import verification

8. **Manufacturing Agent**
   - Import verification

9. **Master Orchestrator**
   - Import verification
   - Confidence threshold logic

10. **SMS Agent**
    - Import verification
    - Agent initialization
    - SMS generation

## Environment Setup

Before running tests, ensure you have:

1. **Required dependencies installed:**
   ```bash
   pip install -r requirements.txt
   pip install pytest pytest-cov
   ```

2. **Environment variables set** (for communication agent tests):
   ```bash
   export TWILIO_ACCOUNT_SID=your_sid
   export TWILIO_AUTH_TOKEN=your_token
   export TWILIO_PHONE_NUMBER=+1234567890
   ```

   Or create a `.env` file in the project root.

3. **Google Cloud credentials** (for GCP-dependent tests):
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
   ```

## Test Structure

Each test class follows this pattern:
- `test_*_import()` - Verifies agent can be imported
- `test_*_initialization()` - Tests agent initialization
- `test_*_function()` - Tests specific functions
- `test_*_execution()` - Tests full execution flow

## Mocking

Tests use `unittest.mock` to mock external dependencies:
- Firestore (for database operations)
- Pub/Sub (for messaging)
- Twilio (for voice calls/SMS)
- Vertex AI (for LLM calls)

This allows tests to run without actual GCP/Twilio credentials.

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Agent Tests
  run: |
    pip install -r requirements.txt
    pip install pytest
    pytest tests/test_agents_integration.py -v
```

## Troubleshooting

### Import Errors
If you see import errors, ensure:
- Project root is in Python path
- All dependencies are installed
- Agent modules are in correct locations

### Mock Errors
If mocks fail, check:
- Mock setup matches actual function signatures
- Patches are applied before function calls
- Mock return values match expected types

### Environment Errors
If environment-related tests fail:
- Check environment variables are set
- Verify `.env` file exists (if using dotenv)
- Ensure credentials are valid (for GCP tests)

