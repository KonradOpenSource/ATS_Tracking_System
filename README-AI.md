# ATS AI Integration

## 🤖 Overview

This document describes the AI integration for the Applicant Tracking System (ATS) using local Python models with Hugging Face. The system provides intelligent CV analysis and candidate matching without requiring paid APIs.

## 🏗️ Architecture

### Backend Components

#### 1. **CV Management**
- **CV Entity**: Stores CV file metadata and extracted text
- **CV Repository**: Database operations for CV management
- **File Storage**: Local filesystem storage with unique filenames

#### 2. **AI Analysis**
- **AIAnalysis Entity**: Stores analysis results and scores
- **AIAnalysis Repository**: Database operations for analysis data
- **AIAnalysisService**: Business logic for CV analysis

#### 3. **Endpoints**
- `POST /api/ai/cv/upload` - Upload CV files
- `POST /api/ai/analyze/{cvId}/{jobOfferId}` - Analyze CV against job
- `GET /api/ai/cv/{id}/download` - Download CV files
- `GET /api/ai/analysis/{id}` - Get analysis results

### AI Service (Python)

#### 1. **FastAPI Service**
- **Port**: 8000
- **Framework**: FastAPI with automatic OpenAPI documentation
- **Models**: Local BERT-based analysis (no external API calls)

#### 2. **Analysis Features**
- **Skill Extraction**: Identifies technical skills from CV text
- **Experience Matching**: Analyzes years of experience
- **Education Assessment**: Evaluates educational background
- **Score Calculation**: 0-100 match score with detailed breakdown

#### 3. **Supported File Types**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Plain Text (.txt)
- Maximum file size: 10MB

### Frontend Components

#### 1. **AI Panel**
- **CV Upload**: Drag-and-drop interface with progress tracking
- **Analysis Results**: Detailed score breakdown and recommendations
- **Top Candidates**: Ranked list of best matches

#### 2. **Integration Points**
- **Candidate Management**: AI analysis accessible from candidate profiles
- **Pipeline Integration**: AI scores visible in recruitment pipeline
- **Dashboard**: AI statistics and insights

## 🔧 Technical Implementation

### Backend Setup

#### Dependencies
```xml
<!-- Spring Boot dependencies for AI features -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

#### Configuration
```yaml
# application.yml
ats:
  cv:
    upload-dir: ./uploads/cv
  ai:
    service-url: http://ai-service:8000
```

### AI Service Setup

#### Python Dependencies
```txt
fastapi==0.104.1
uvicorn==0.24.0
transformers==4.35.2
torch==2.1.1
sentence-transformers==2.2.2
scikit-learn==1.3.2
PyPDF2==3.0.1
python-docx==1.1.0
```

#### Docker Configuration
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Integration

#### AI Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly API_URL = 'http://localhost:8081/api/ai';
  
  uploadCV(file: File, candidateId: number): Observable<CV> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateId', candidateId.toString());
    return this.http.post<CV>(`${this.API_URL}/cv/upload`, formData);
  }
  
  analyzeCV(cvId: number, jobOfferId: number): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(`${this.API_URL}/analyze/${cvId}/${jobOfferId}`, {});
  }
}
```

## 📊 AI Analysis Algorithm

### Scoring Breakdown

#### 1. **Skill Match (70% weight)**
- Extracts technical skills from CV and job requirements
- Calculates confidence scores for each skill
- Partial matching for skill variations

#### 2. **Experience Match (20% weight)**
- Extracts years of experience from CV text
- Compares against job requirements
- Handles experience ranges and levels

#### 3. **Education Match (10% weight)**
- Identifies degree levels and fields
- Matches against job requirements
- Considers relevant fields of study

### Skill Categories

#### Technical Skills
- **Programming**: Python, Java, JavaScript, TypeScript, C++, C#, PHP, Ruby, Go, Rust
- **Web**: HTML, CSS, React, Angular, Vue, Node.js, Express, Django, Flask
- **Database**: SQL, MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes, Terraform, Ansible
- **Tools**: Git, GitHub, Jira, Confluence, Microsoft Office

#### Experience Levels
- **Junior**: 0-2 years, entry-level, trainee
- **Mid**: 2-5 years, intermediate, experienced
- **Senior**: 5+ years, lead, principal, expert

#### Education Levels
- **PhD/Doctorate**: Highest academic qualification
- **Master's**: Advanced degree
- **Bachelor's**: Undergraduate degree
- **Relevant Fields**: Computer Science, Software Engineering, IT

## 🚀 Deployment

### Docker Compose
```yaml
services:
  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    container_name: ats-ai-service
    ports:
      - "8000:8000"
    volumes:
      - ./ai-service/uploads:/app/uploads
    networks:
      - ats-network

  backend:
    environment:
      ATS_AI_SERVICE_URL: http://ai-service:8000
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - ai-service
```

### Environment Variables
```bash
# Backend
ATS_CV_UPLOAD_DIR=./uploads/cv
ATS_AI_SERVICE_URL=http://ai-service:8000

# AI Service (Python)
PYTHONPATH=/app
MODEL_CACHE_DIR=/app/models
```

## 📱 User Interface

### AI Panel Features

#### 1. **CV Upload Tab**
- Drag-and-drop file upload
- Progress tracking
- File validation (type, size)
- Recent CVs list

#### 2. **Analysis Results Tab**
- Match score visualization
- Detailed skill analysis
- Experience and education assessment
- Recommendations and summary

#### 3. **Top Candidates Tab**
- Ranked list of candidates
- Score comparison
- Quick analysis access
- Job-specific rankings

### Integration Points

#### Candidate Management
- AI analysis button in candidate profile
- Score display in candidate lists
- Analysis history tracking

#### Recruitment Pipeline
- AI scores visible in pipeline cards
- Color-coded match indicators
- Quick analysis access

## 🔒 Security Considerations

### File Upload Security
- File type validation
- Size limits (10MB)
- Virus scanning (optional)
- Secure file storage

### Data Privacy
- Local processing only
- No external API calls
- Data retention policies
- Secure file deletion

### Access Control
- JWT authentication required
- Role-based access
- Audit logging
- Data encryption at rest

## 📈 Performance Optimization

### AI Service Optimization
- Model caching
- Batch processing
- Async processing
- Memory management

### File Storage
- Efficient file handling
- Compression options
- Cleanup policies
- Storage monitoring

### Database Optimization
- Indexing strategy
- Query optimization
- Connection pooling
- Caching layer

## 🧪 Testing

### Unit Tests
- AI analysis algorithms
- File upload validation
- Score calculation accuracy
- Edge case handling

### Integration Tests
- End-to-end CV analysis
- API communication
- File storage operations
- Error handling

### Performance Tests
- Large file processing
- Concurrent analysis requests
- Memory usage monitoring
- Response time validation

## 🔍 Troubleshooting

### Common Issues

#### AI Service Not Responding
```bash
# Check AI service status
docker-compose logs ai-service

# Restart AI service
docker-compose restart ai-service
```

#### File Upload Failures
```bash
# Check upload directory permissions
ls -la ./uploads/cv

# Create directory if missing
mkdir -p ./uploads/cv
chmod 755 ./uploads/cv
```

#### Analysis Errors
```bash
# Check AI service logs for errors
docker logs ats-ai-service

# Verify model loading
curl http://localhost:8000/
```

### Debug Mode
```yaml
# Enable debug logging
logging:
  level:
    com.ats.service.AIAnalysisService: DEBUG
    org.springframework.web.client: DEBUG
```

## 🔄 Future Enhancements

### Planned Features
- **Advanced NLP**: Sentiment analysis, personality traits
- **Video Analysis**: Video interview analysis
- **Resume Parsing**: Advanced template recognition
- **Skill Gap Analysis**: Learning recommendations

### Model Improvements
- **Custom Training**: Domain-specific models
- **Multilingual Support**: Multiple language analysis
- **Real-time Processing**: Streaming analysis
- **Batch Operations**: Bulk CV processing

### UI Enhancements
- **Interactive Charts**: Visual score breakdowns
- **Comparison Tools**: Side-by-side candidate comparison
- **Export Features**: PDF reports, CSV exports
- **Mobile Optimization**: Responsive design improvements

---

## 📞 Support

For AI-related issues:
1. Check this documentation
2. Review AI service logs
3. Verify file formats and sizes
4. Test with sample CV files
5. Contact development team

---

**Built with ❤️ using Python, FastAPI, and Local AI Models**
