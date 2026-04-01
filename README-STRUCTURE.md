# ATS Project Structure

This project follows a monorepo structure with separate frontend and backend directories.

## 📁 Directory Structure

```
applicant-tracking-system/
├── .github/workflows/          # GitHub Actions CI/CD
│   └── ci.yml                 # Pipeline configuration
├── backend/                    # Spring Boot backend
│   ├── src/                   # Java source code
│   │   └── main/
│   │       └── java/com/ats/
│   │           ├── config/    # Configuration classes
│   │           ├── controller/# REST controllers
│   │           ├── model/     # JPA entities
│   │           ├── security/  # JWT & Security
│   │           └── ApplicantTrackingSystemApplication.java
│   ├── pom.xml               # Maven configuration
│   ├── Dockerfile            # Backend Docker image
│   └── target/               # Build artifacts
├── frontend/                  # Angular frontend
│   ├── src/                  # Angular source (to be created)
│   ├── package.json          # npm dependencies
│   ├── Dockerfile            # Frontend Docker image
│   └── nginx.conf            # Nginx configuration
├── docker-compose.yml        # Multi-container setup
└── README-STRUCTURE.md       # This file
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)
```bash
docker-compose up --build
```

### Backend Only
```bash
cd backend
mvn spring-boot:run
```

### Frontend Only (when Angular is set up)
```bash
cd frontend
npm install
npm start
```

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline automatically detects this structure:

### Backend Job
- Detects: `backend/pom.xml`
- Runs: Maven tests and build
- Produces: JAR artifact

### Frontend Job
- Detects: `frontend/package.json`
- Runs: npm lint, test, build
- Produces: Distribution files

### Docker Build
- Detects: `backend/Dockerfile` and `frontend/Dockerfile`
- Builds: Multi-container images
- Tags: With commit SHA

## 🐳 Docker Services

### PostgreSQL
- **Port**: 5432
- **Database**: ats_db
- **Credentials**: ats_user / ats_password

### Backend (Spring Boot)
- **Port**: 8080
- **Context**: /api/*
- **Health**: http://localhost:8080/actuator/health

### Frontend (Angular + Nginx)
- **Port**: 80
- **Proxy**: /api/* → backend:8080
- **Static**: Angular build files

## 🔧 Development Workflow

### 1. Local Development
```bash
# Start database
docker run -d --name ats-postgres -e POSTGRES_DB=ats_db -e POSTGRES_USER=ats_user -e POSTGRES_PASSWORD=ats_password -p 5432:5432 postgres:15

# Start backend
cd backend
mvn spring-boot:run

# Start frontend (when available)
cd frontend
npm start
```

### 2. Testing
```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm run test:ci
```

### 3. Building
```bash
# Backend build
cd backend
mvn clean package

# Frontend build
cd frontend
npm run build
```

### 4. Docker Build
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

## 📊 Service URLs

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080/api/*
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **PostgreSQL**: localhost:5432

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Candidates
- `GET /api/candidates` - List candidates
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/{id}` - Update candidate
- `DELETE /api/candidates/{id}` - Delete candidate

### Job Offers
- `GET /api/job-offers` - List job offers
- `POST /api/job-offers` - Create job offer
- `PUT /api/job-offers/{id}` - Update job offer
- `DELETE /api/job-offers/{id}` - Delete job offer

## 🔒 Security

- **JWT Authentication**: Bearer tokens
- **Roles**: ADMIN, RECRUITER
- **CORS**: Configured for frontend
- **Database**: Encrypted connections

## 🚦 Health Checks

### Backend Health
```bash
curl http://localhost:8080/actuator/health
```

### Database Connection
```bash
docker exec ats-postgres psql -U ats_user -d ats_db -c "SELECT version();"
```

## 📝 Environment Variables

### Backend
- `SPRING_DATASOURCE_URL` - PostgreSQL connection
- `SPRING_DATASOURCE_USERNAME` - DB username
- `SPRING_DATASOURCE_PASSWORD` - DB password
- `JWT_SECRET` - JWT signing key
- `JWT_EXPIRATION` - Token expiration time

### Frontend
- No environment variables needed for basic setup

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check logs
docker-compose logs backend

# Restart service
docker-compose restart backend

# Check database connection
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
```

### Frontend Issues
```bash
# Check build
cd frontend
npm run build

# Check lint
npm run lint

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues
```bash
# Clean up
docker-compose down -v
docker system prune -f

# Rebuild
docker-compose up --build --force-recreate
```

## 📈 Next Steps

1. **Set up Angular frontend** in `/frontend/src`
2. **Configure environment-specific settings**
3. **Add monitoring and logging**
4. **Set up production deployment**
5. **Add integration tests**

---

This structure supports both local development and containerized deployment with full CI/CD integration.
