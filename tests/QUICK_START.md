# Quick Start: Running Agent Tests

## How to Run Tests

### Method 1: Using the Test Script (Easiest)
```bash
# From project root
./tests/run_tests.sh
```

### Method 2: Using pytest (Recommended)
```bash
# Install dependencies first
pip install -r tests/requirements.txt

# Run all tests
pytest tests/test_agents_integration.py -v

# Run with detailed output
pytest tests/test_agents_integration.py -v -s
```

### Method 3: Direct Python Execution
```bash
# From project root
python tests/test_agents_integration.py
```

## Understanding Test Results

### ✅ Success Indicators
- `✅` = Test passed
- Green output = Everything working

### ❌ Failure Indicators
- `❌` = Test failed
- Red output = Something needs fixing
- Error message shows what went wrong

### ⏭️ Skipped Tests
- `⏭️` = Test skipped (usually because dependency not available)
- Yellow output = Not a failure, just not run

## Example Output

```
============================================================
🚀 NAVIGO AGENTS INTEGRATION TEST SUITE
============================================================

📋 Testing Communication Agent (TestCommunicationAgent)...
----------------------------------------------------------------------
✅ Communication agent import successful
✅ Voice communication agent initialization passed
✅ Defect explanation function test passed
✅ User question handling test passed
✅ TwiML generation test passed
✅ Make voice call test passed
   ✅ 6 test(s) passed

============================================================
📈 TEST SUMMARY
============================================================
✅ Passed:   45 tests
❌ Failed:    0 tests
⏭️  Skipped:   5 tests
📊 Total:    50 tests
📈 Success Rate: 100.0%
============================================================

🎉 ALL TESTS PASSED! Agents are ready for integration.
```

## What Each Test Checks

1. **Import Tests** - Verifies agents can be imported (no syntax errors)
2. **Initialization Tests** - Checks agents can be created
3. **Function Tests** - Tests specific functions work correctly
4. **Integration Tests** - Tests agents work with mocked dependencies

## Troubleshooting

### "Module not found" errors
```bash
# Make sure you're in project root
cd /path/to/NaviGo

# Install dependencies
pip install -r requirements.txt
pip install -r tests/requirements.txt
```

### "Twilio not available" warnings
This is normal if Twilio credentials aren't set. Tests will skip Twilio-dependent tests.

### "Firestore not available" errors
Tests use mocks, so you don't need actual Firestore. If you see this, check the mock setup.

## Next Steps After Tests Pass

1. ✅ All tests pass → Agents are ready for integration
2. Review any skipped tests (may need environment setup)
3. Check failed tests and fix issues
4. Integrate agents into your workflow

## Need Help?

Check the detailed README: `tests/README.md`

