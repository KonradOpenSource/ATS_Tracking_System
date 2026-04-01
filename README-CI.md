# CI/CD Pipeline with GitHub Actions

This project includes a comprehensive CI/CD pipeline using GitHub Actions for automated testing, building, and security scanning.

## 🚀 Pipeline Overview

### Triggers

- **Push**: `main`, `develop` branches
- **Pull Request**: `main`, `develop` branches

### Jobs

1. **Backend Test** - Spring Boot testing
2. **Frontend Test** - Angular linting and testing
3. **AI Service Test** - Python testing
4. **Security Scan** - Vulnerability scanning with Trivy
5. **Build & Push** - Docker image building
6. **Integration Test** - End-to-end testing
7. **Deploy Staging** - Staging deployment
8. **Deploy Production** - Production deployment
9. **Performance Test** - Load testing with k6
10. **Documentation** - API docs generation

## 📋 Pipeline Steps

### Backend Test Job (Spring Boot)

```yaml
- Checkout code
- Set up JDK 17
- Cache Maven dependencies
- Run tests: mvn clean test
- Run integration tests: mvn verify -P integration-test
- Generate test reports
- Upload coverage to Codecov
```

**Structure Support:**

- `/backend/pom.xml` - Backend in subfolder
- Working directory: `./backend`

### Frontend Test Job (Angular)

```yaml
- Checkout code
- Set up Node.js 18
- Cache npm dependencies
- Install: npm ci
- Lint: npm run lint
- Test: npm run test:ci
- E2E: npm run e2e:ci
- Upload coverage to Codecov
```

**Structure Support:**

- `/frontend/package.json` - Frontend in subfolder
- Working directory: `./frontend`

### AI Service Test Job (Python)

```yaml
- Checkout code
- Set up Python 3.11
- Cache pip dependencies
- Install dependencies
- Lint: flake8, black
- Test: pytest with coverage
- Upload coverage to Codecov
```

**Structure Support:**

- `/ai-service/requirements.txt` - AI service in subfolder
- Working directory: `./ai-service`

### Security Scan Job

```yaml
- Run Trivy vulnerability scanner
- Generate SARIF report
- Upload results to GitHub Security tab
- Run OWASP dependency check
- Upload OWASP reports
```

### Build & Push Job

```yaml
- Set up Docker Buildx
- Login to Container Registry
- Build and push Docker images
- Multi-architecture (amd64, arm64)
- Cache Docker layers
```

**Services:** backend, frontend, ai-service

### Integration Test Job

```yaml
- Start test environment with docker-compose.test.yml
- Wait for services to be ready
- Run API integration tests
- Test authentication flow
- Test AI service integration
- Collect logs and artifacts
```

### Deployment Jobs

```yaml
- Deploy to staging (develop branch)
- Deploy to production (main branch)
- Run health checks
- Run smoke tests
- Notify deployment status
```

### Performance Test Job

```yaml
- Set up k6
- Run load tests against staging
- Test API endpoints under load
- Upload performance results
```

## 📁 Project Structure Support

The pipeline automatically detects and works with this structure:

```
project-root/
├── .github/workflows/ci-cd.yml
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   └── src/
├── ai-service/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
├── tests/
│   └── performance/
├── docker-compose.yml
└── docker-compose.test.yml
```

## 🔧 Configuration Details

### Environment Variables

- `JAVA_VERSION`: 17 (Temurin distribution)
- `NODE_VERSION`: 18
- `PYTHON_VERSION`: 3.11
- `REGISTRY`: ghcr.io
- `IMAGE_NAME`: ${{ github.repository }}

### Caching Strategy

- **Maven**: Cached in `~/.m2` based on `pom.xml` hash
- **npm**: Cached based on `package-lock.json`
- **pip**: Cached based on `requirements.txt`
- **Docker**: GitHub Actions cache for layers

### Artifacts

- **Backend**: JAR files (7 days retention)
- **Frontend**: Distribution files (7 days retention)
- **Test Reports**: JUnit, coverage reports
- **Performance**: k6 results
- **Logs**: Integration test logs

## 🚨 Quality Gates

### Test Requirements

- **Backend**: All tests must pass
- **Frontend**: All tests must pass, linting must pass
- **AI Service**: All tests must pass, linting must pass
- **Security**: No critical vulnerabilities

### Performance Thresholds

- **API Response Time**: 95% < 500ms
- **Error Rate**: < 10%
- **Load Test**: Up to 200 concurrent users

### Security Requirements

- **No Critical Vulnerabilities**: Trivy scan
- **Dependency Security**: OWASP check
- **Code Security**: Static analysis

## 🔍 Security Features

### Trivy Scanner

- Scans entire codebase
- Detects vulnerabilities in dependencies
- Generates SARIF reports
- Results appear in GitHub Security tab

### OWASP Dependency Check

- Scans for vulnerable dependencies
- Generates HTML reports
- Uploads as artifacts

### Security Best Practices

- Uses latest GitHub Actions versions
- Minimal permissions
- No secrets in workflow files
- Cached dependencies reduce supply chain risk

## 📊 Pipeline Monitoring

### GitHub Actions Interface

- **Status Checks**: Visible in PR/commit
- **Artifacts**: Downloadable from Actions tab
- **Logs**: Detailed step-by-step logs
- **Security**: Trivy results in Security tab
- **Performance**: k6 results as artifacts

### Key Metrics

- **Duration**: Typically 10-20 minutes
- **Success Rate**: Should be 100% for main branch
- **Artifact Size**: JAR ~50MB, Frontend ~10MB
- **Test Coverage**: Backend >80%, Frontend >80%

## 🛠️ Local Development

### Testing Pipeline Locally

```bash
# Backend tests
cd backend
mvn clean test
mvn verify -P integration-test

# Frontend tests
cd frontend
npm run lint
npm run test:ci
npm run e2e:ci

# AI Service tests
cd ai-service
flake8 .
black --check .
pytest --cov=. --cov-report=xml

# Performance tests
cd tests/performance
k6 run load-test.js

# Integration tests
docker-compose -f docker-compose.test.yml up -d
# Run integration tests
docker-compose -f docker-compose.test.yml down -v
```

### Pre-commit Hooks

```bash
# Install pre-commit hooks
pre-commit install

# Run all checks before committing
pre-commit run --all-files
```

## 🔄 Continuous Integration Workflow

### 1. Developer creates feature branch

```bash
git checkout -b feature/new-endpoint
```

### 2. Makes changes and commits

```bash
git add .
git commit -m "Add new user endpoint"
git push origin feature/new-endpoint
```

### 3. Creates Pull Request

- Pipeline runs automatically
- All checks must pass
- Security scan results reviewed
- Performance tests pass

### 4. Merge to develop

- Pipeline runs again on merge
- Deployed to staging environment
- Smoke tests run automatically

### 5. Merge to main

- Pipeline runs again on merge
- Deployed to production environment
- Performance tests run
- Notifications sent

## 🚀 Deployment Strategy

### Environments

- **Staging**: Deployed from `develop` branch
- **Production**: Deployed from `main` branch

### Deployment Process

1. **Build**: Create Docker images
2. **Test**: Run integration tests
3. **Deploy**: Deploy to target environment
4. **Verify**: Run health checks and smoke tests
5. **Monitor**: Performance and error monitoring

### Rollback Strategy

- Manual rollback if health checks fail
- Automatic rollback on critical errors
- Previous images retained for rollback

## 📝 Customization Examples

### Add New Test Framework

```yaml
- name: Run integration tests
  run: mvn verify -P integration-tests
```

### Add Code Quality Gate

```yaml
- name: SonarCloud scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Add Notification

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: "#ci-cd"
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Environment-Specific Deployment

```yaml
- name: Deploy to AWS
  run: |
    aws ecs update-service --cluster ats-cluster --service ats-service
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Build Fails

```bash
# Check Java version
java -version

# Clean Maven cache
mvn clean

# Check dependencies
mvn dependency:tree

# Check test profile
mvn help:active-profiles
```

#### Frontend Build Fails

```bash
# Check Node version
node -version

# Clean npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Angular CLI
ng version
```

#### AI Service Build Fails

```bash
# Check Python version
python --version

# Clean pip cache
pip cache purge

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### Integration Test Failures

```bash
# Check Docker Compose
docker-compose -f docker-compose.test.yml config

# Check service logs
docker-compose -f docker-compose.test.yml logs

# Reset environment
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
```

#### Performance Test Failures

```bash
# Check k6 installation
k6 version

# Test locally
k6 run --v tests/performance/load-test.js

# Check staging environment
curl -f https://staging.ats.com/api/health
```

### Getting Help

1. Check GitHub Actions logs
2. Review error messages
3. Check dependency versions
4. Verify file structure
5. Test commands locally
6. Check environment configurations
7. Review security scan results

## 📞 Support

For CI/CD issues:

1. Check this documentation
2. Review GitHub Actions logs
3. Test commands locally
4. Check GitHub Actions documentation
5. Contact DevOps team

### Required Secrets

- `GITHUB_TOKEN`: Automatic (provided by GitHub)
- `SLACK_WEBHOOK`: For notifications (optional)
- `AWS_ACCESS_KEY_ID`: AWS deployment (optional)
- `AWS_SECRET_ACCESS_KEY`: AWS deployment (optional)

---

**Note**: This pipeline supports the full ATS stack with backend, frontend, and AI service integration.
