# ApraNova Test Quick Reference

**Quick commands for running tests on all platforms**

---

## 🚀 Quick Start

### Windows (Docker)
```powershell
# Run all tests automatically
.\start-all.ps1
```

### Linux (Docker)
```bash
# Run all tests automatically
./start-all.sh
```

### Mac (Podman)
```bash
# Run all tests automatically
./start-all-podman.sh

# Or use management commands
./podman-commands.sh test-all
```

---

## 📦 Test Modules (50 Total Tests)

| Module | Tests | Command |
|--------|-------|---------|
| **Accounts** | 15 | `test accounts` |
| **Advanced** | 15 | `test accounts.test_advanced` |
| **Workspace** | 10 | `test accounts.test_workspace` |
| **Payments** | 10 | `test payments` |

---

## 🎯 Windows Commands

```powershell
# All test suites
docker exec apranova_backend python manage.py test accounts
docker exec apranova_backend python manage.py test accounts.test_advanced
docker exec apranova_backend python manage.py test accounts.test_workspace
docker exec apranova_backend python manage.py test payments

# Verbose output
docker exec apranova_backend python manage.py test --verbosity=2

# Specific test class
docker exec apranova_backend python manage.py test accounts.tests.SignupTestCase

# Specific test method
docker exec apranova_backend python manage.py test accounts.tests.SignupTestCase.test_signup_success
```

---

## 🐧 Linux Commands

```bash
# All test suites
docker exec apranova_backend python manage.py test accounts
docker exec apranova_backend python manage.py test accounts.test_advanced
docker exec apranova_backend python manage.py test accounts.test_workspace
docker exec apranova_backend python manage.py test payments

# Verbose output
docker exec apranova_backend python manage.py test --verbosity=2

# Specific test class
docker exec apranova_backend python manage.py test accounts.tests.SignupTestCase

# Specific test method
docker exec apranova_backend python manage.py test accounts.tests.SignupTestCase.test_signup_success
```

---

## 🍎 Mac (Podman) Commands

### Using podman-commands.sh (Recommended)

```bash
./podman-commands.sh test-all          # All test suites
./podman-commands.sh test-accounts     # Accounts tests
./podman-commands.sh test-advanced     # Advanced tests
./podman-commands.sh test-workspace    # Workspace tests
./podman-commands.sh test-payments     # Payments tests
```

### Direct Podman Commands

```bash
# All test suites
podman exec apranova_backend python manage.py test accounts
podman exec apranova_backend python manage.py test accounts.test_advanced
podman exec apranova_backend python manage.py test accounts.test_workspace
podman exec apranova_backend python manage.py test payments

# Verbose output
podman exec apranova_backend python manage.py test --verbosity=2

# Specific test class
podman exec apranova_backend python manage.py test accounts.tests.SignupTestCase

# Specific test method
podman exec apranova_backend python manage.py test accounts.tests.SignupTestCase.test_signup_success
```

---

## 📋 Test Categories

### Authentication Tests
```bash
# Windows/Linux
docker exec apranova_backend python manage.py test accounts.tests.SignupTestCase
docker exec apranova_backend python manage.py test accounts.tests.LoginTestCase
docker exec apranova_backend python manage.py test accounts.test_advanced.TokenRefreshTestCase

# Mac
podman exec apranova_backend python manage.py test accounts.tests.SignupTestCase
```

### Trainer Assignment Tests
```bash
# Windows/Linux
docker exec apranova_backend python manage.py test accounts.test_advanced.TrainerAssignmentTestCase
docker exec apranova_backend python manage.py test accounts.test_advanced.GetMyStudentsTestCase

# Mac
podman exec apranova_backend python manage.py test accounts.test_advanced.TrainerAssignmentTestCase
```

### Workspace Tests
```bash
# Windows/Linux
docker exec apranova_backend python manage.py test accounts.test_workspace.WorkspaceProvisioningTestCase
docker exec apranova_backend python manage.py test accounts.test_workspace.WorkspaceAccessControlTestCase

# Mac
podman exec apranova_backend python manage.py test accounts.test_workspace.WorkspaceProvisioningTestCase
```

### Payment Tests
```bash
# Windows/Linux
docker exec apranova_backend python manage.py test payments.tests.PaymentModelTestCase
docker exec apranova_backend python manage.py test payments.tests.PaymentAPITestCase
docker exec apranova_backend python manage.py test payments.tests.PaymentHistoryTestCase

# Mac
podman exec apranova_backend python manage.py test payments.tests.PaymentModelTestCase
```

---

## 🔍 Useful Test Options

### Verbosity Levels
```bash
--verbosity=0    # Minimal output
--verbosity=1    # Normal output (default)
--verbosity=2    # Verbose output (recommended)
--verbosity=3    # Very verbose output
```

### Keep Test Database
```bash
--keepdb         # Preserve test database between runs
```

### Parallel Testing
```bash
--parallel       # Run tests in parallel
--parallel=4     # Run tests using 4 processes
```

### Fail Fast
```bash
--failfast       # Stop on first failure
```

### Example with Options
```bash
# Windows/Linux
docker exec apranova_backend python manage.py test accounts --verbosity=2 --failfast

# Mac
podman exec apranova_backend python manage.py test accounts --verbosity=2 --failfast
```

---

## 📊 Expected Output

### Successful Test Run
```
Found 15 test(s).
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
...............
----------------------------------------------------------------------
Ran 15 tests in 7.810s

OK
Destroying test database for alias 'default'...
```

### Failed Test Run
```
Found 15 test(s).
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..........F....
======================================================================
FAIL: test_signup_success (accounts.tests.SignupTestCase)
----------------------------------------------------------------------
Traceback (most recent call last):
  ...
AssertionError: ...

----------------------------------------------------------------------
Ran 15 tests in 7.810s

FAILED (failures=1)
```

---

## 🐛 Troubleshooting

### Tests Not Found
```bash
# Make sure backend container is running
docker ps | grep apranova_backend    # Windows/Linux
podman ps | grep apranova_backend    # Mac

# Check if test files exist
docker exec apranova_backend ls -la backend/accounts/test*.py
```

### Database Errors
```bash
# Run migrations first
docker exec apranova_backend python manage.py migrate    # Windows/Linux
podman exec apranova_backend python manage.py migrate    # Mac
```

### Import Errors
```bash
# Check Python path
docker exec apranova_backend python -c "import sys; print(sys.path)"

# Verify Django settings
docker exec apranova_backend python manage.py check
```

---

## 📈 Test Coverage

To generate test coverage report:

```bash
# Windows/Linux
docker exec apranova_backend coverage run --source='.' manage.py test
docker exec apranova_backend coverage report
docker exec apranova_backend coverage html

# Mac
podman exec apranova_backend coverage run --source='.' manage.py test
podman exec apranova_backend coverage report
podman exec apranova_backend coverage html
```

---

## 🎯 Common Test Scenarios

### Run All Tests Before Deployment
```bash
# Windows
docker exec apranova_backend python manage.py test --verbosity=2

# Linux
docker exec apranova_backend python manage.py test --verbosity=2

# Mac
./podman-commands.sh test-all
```

### Test Specific Feature
```bash
# Test only signup functionality
docker exec apranova_backend python manage.py test accounts.tests.SignupTestCase

# Test only payment creation
docker exec apranova_backend python manage.py test payments.tests.PaymentAPITestCase
```

### Quick Smoke Test
```bash
# Run one test from each module
docker exec apranova_backend python manage.py test accounts.tests.SignupTestCase.test_signup_success
docker exec apranova_backend python manage.py test payments.tests.PaymentModelTestCase.test_create_payment
```

---

## 📝 Test Files Location

```
backend/
├── accounts/
│   ├── tests.py              # 15 tests (signup, login, profile)
│   ├── test_advanced.py      # 15 tests (trainer, roles, tokens)
│   └── test_workspace.py     # 10 tests (workspace provisioning)
└── payments/
    └── tests.py              # 10 tests (payment processing)
```

---

## ✅ Quick Checklist

Before committing code:
- [ ] Run all test suites
- [ ] All tests pass (100% success rate)
- [ ] No deprecation warnings
- [ ] Test execution time < 30 seconds
- [ ] No database errors
- [ ] No import errors

---

## 🔗 Related Documentation

- **Comprehensive Test Suite**: `COMPREHENSIVE_TEST_SUITE.md`
- **Test Results**: `TEST_RESULTS.md`
- **Setup Complete Summary**: `SETUP_COMPLETE_SUMMARY.md`

---

**Last Updated**: 2025-11-08  
**Total Tests**: 50  
**Platforms**: Windows, Linux, Mac

