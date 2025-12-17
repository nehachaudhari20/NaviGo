# How to Run Tests and See Results

## Quick Commands

### Option 1: Run with pytest (Best for detailed output)
```bash
# Install pytest if needed
pip install pytest pytest-cov

# Run tests
pytest tests/test_agents_integration.py -v

# See output in real-time
pytest tests/test_agents_integration.py -v -s
```

### Option 2: Run directly with Python
```bash
# From project root
python3 tests/test_agents_integration.py
```

### Option 3: Use the test script
```bash
# Make it executable (first time only)
chmod +x tests/run_tests.sh

# Run it
./tests/run_tests.sh
```

## What You'll See

### ✅ Successful Test Run
```
============================================================
🚀 NAVIGO AGENTS INTEGRATION TEST SUITE
============================================================

📋 Testing Communication Agent (TestCommunicationAgent)...
----------------------------------------------------------------------
✅ Communication agent import successful
✅ Voice communication agent initialization passed
✅ Defect explanation function test passed
   ✅ 3 test(s) passed

============================================================
📈 TEST SUMMARY
============================================================
✅ Passed:   25 tests
❌ Failed:    0 tests
⏭️  Skipped:   5 tests
📊 Total:    30 tests
📈 Success Rate: 100.0%
============================================================

🎉 ALL TESTS PASSED! Agents are ready for integration.
```

### ❌ Failed Test Example
```
📋 Testing Data Analysis Agent (TestDataAnalysisAgent)...
----------------------------------------------------------------------
✅ Data analysis agent import successful
❌ test_anomaly_detection_logic: AssertionError: Expected value
   ❌ 1 test(s) failed

============================================================
📈 TEST SUMMARY
============================================================
✅ Passed:   20 tests
❌ Failed:    5 tests  <-- Look here!
⏭️  Skipped:   5 tests
📊 Total:    30 tests
📈 Success Rate: 80.0%
============================================================

⚠️  5 test(s) failed. Please review the errors above.
```

## Understanding the Results

### Status Symbols
- **✅** = Test passed - Agent is working correctly
- **❌** = Test failed - Something needs to be fixed
- **⏭️** = Test skipped - Usually because dependency not available (not a problem)

### What Each Number Means
- **Passed**: Number of tests that worked correctly
- **Failed**: Number of tests that found problems
- **Skipped**: Number of tests that couldn't run (usually OK)
- **Success Rate**: Percentage of tests that passed (excluding skipped)

## What to Do Based on Results

### ✅ All Tests Pass (Success Rate 100%)
**Action**: ✅ Agents are ready for integration!
- All agents can be imported
- Core functions work correctly
- Ready to deploy

### ⚠️ Some Tests Failed (Success Rate < 100%)
**Action**: Review failed tests
1. Look at the error messages
2. Check which agent failed
3. Fix the issues
4. Run tests again

### ⏭️ Many Tests Skipped
**Action**: Usually OK, but check:
- Missing dependencies? Install them
- Missing environment variables? Set them up
- Missing credentials? Add them (or tests will use mocks)

## Common Issues and Solutions

### Issue: "ModuleNotFoundError"
**Solution**: 
```bash
# Install dependencies
pip install -r requirements.txt
pip install -r tests/requirements.txt
```

### Issue: "Twilio not available"
**Solution**: This is OK! Tests will skip Twilio tests. To enable:
```bash
export TWILIO_ACCOUNT_SID=your_sid
export TWILIO_AUTH_TOKEN=your_token
```

### Issue: "Import error"
**Solution**: Make sure you're in project root:
```bash
cd /path/to/NaviGo
python3 tests/test_agents_integration.py
```

## Getting More Details

### See full error messages
```bash
pytest tests/test_agents_integration.py -v -s --tb=long
```

### Run only specific agent tests
```bash
# Test only communication agent
pytest tests/test_agents_integration.py::TestCommunicationAgent -v

# Test only telemetry
pytest tests/test_agents_integration.py::TestIngestTelemetry -v
```

### Generate HTML report
```bash
pytest tests/test_agents_integration.py --html=report.html --self-contained-html
# Then open report.html in browser
```

## Next Steps

1. **Run the tests**: `python3 tests/test_agents_integration.py`
2. **Check the summary**: Look at the bottom for pass/fail counts
3. **Review failures**: If any failed, check the error messages
4. **Fix issues**: Address any problems found
5. **Re-run**: Run tests again to verify fixes
6. **Integrate**: Once all pass, agents are ready to use!

