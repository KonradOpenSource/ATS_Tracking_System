package com.ats.service;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AIAnalysisService {
    
    private final CVRepository cvRepository;
    private final AIAnalysisRepository analysisRepository;
    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    
    @Value("${ats.cv.upload-dir:./uploads/cv}")
    private String uploadDir;
    
    @Value("${ats.ai.service-url:http://localhost:8000}")
    private String aiServiceUrl;
    
    public AIAnalysisService(
            CVRepository cvRepository,
            AIAnalysisRepository analysisRepository,
            CandidateRepository candidateRepository,
            JobOfferRepository jobOfferRepository) {
        this.cvRepository = cvRepository;
        this.analysisRepository = analysisRepository;
        this.candidateRepository = candidateRepository;
        this.jobOfferRepository = jobOfferRepository;
    }
    
    // CV Management
    public CV uploadCV(MultipartFile file, Long candidateId) throws IOException {
        Candidate candidate = candidateRepository.findByIdAndIsDeletedFalse(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        // Create CV entity
        CV cv = new CV(
            filename,
            originalFilename,
            filePath.toString(),
            file.getContentType(),
            file.getSize(),
            candidate
        );
        
        return cvRepository.save(cv);
    }
    
    public Optional<CV> getCVById(Long id) {
        return cvRepository.findByIdAndIsDeletedFalse(id);
    }
    
    public List<CV> getCVsByCandidate(Long candidateId) {
        return cvRepository.findByCandidateIdAndIsDeletedFalse(candidateId);
    }
    
    public void deleteCV(Long id) {
        cvRepository.findByIdAndIsDeletedFalse(id)
                .ifPresent(cv -> {
                    // Delete file from filesystem
                    try {
                        Files.deleteIfExists(Paths.get(cv.getFilePath()));
                    } catch (IOException e) {
                        // Log error but continue with database deletion
                        System.err.println("Failed to delete CV file: " + e.getMessage());
                    }
                    
                    // Mark as deleted
                    cv.setIsDeleted(true);
                    cvRepository.save(cv);
                });
    }
    
    // AI Analysis
    public AIAnalysis analyzeCV(Long cvId, Long jobOfferId) {
        CV cv = cvRepository.findByIdAndIsDeletedFalse(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));
        
        JobOffer jobOffer = jobOfferRepository.findByIdAndIsDeletedFalse(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));
        
        // Check if analysis already exists
        Optional<AIAnalysis> existingAnalysis = analysisRepository
                .findByCvIdAndJobOfferIdAndIsDeletedFalse(cvId, jobOfferId);
        
        if (existingAnalysis.isPresent()) {
            return existingAnalysis.get();
        }
        
        // Call AI service for analysis
        AIAnalysisRequest request = new AIAnalysisRequest(
            cv.getExtractedText(),
            jobOffer.getDescription(),
            jobOffer.getRequirements()
        );
        
        AIAnalysisResponse response = callAIService(request);
        
        // Create and save analysis
        AIAnalysis analysis = new AIAnalysis(cv, jobOffer, response.getMatchScore(), response.getModel());
        analysis.setSummary(response.getSummary());
        analysis.setKeySkills(response.getKeySkills());
        analysis.setMissingSkills(response.getMissingSkills());
        analysis.setExperienceMatch(response.getExperienceMatch());
        analysis.setEducationMatch(response.getEducationMatch());
        analysis.setRecommendations(response.getRecommendations());
        analysis.setFullAnalysis(response.getFullAnalysis());
        
        return analysisRepository.save(analysis);
    }
    
    private AIAnalysisResponse callAIService(AIAnalysisRequest request) {
        // In a real implementation, this would call the Python AI service
        // For now, return mock response
        return new AIAnalysisResponse(
            75, // mock score
            "Good match with strong technical skills",
            "Java, Spring Boot, PostgreSQL, REST API",
            "Cloud experience, Docker",
            "5+ years of backend development experience matches well",
            "Computer Science degree is relevant",
            "Consider for technical interview",
            "Full detailed analysis would go here...",
            "local-bert-model-v1"
        );
    }
    
    public Optional<AIAnalysis> getAnalysisById(Long id) {
        return analysisRepository.findByIdAndIsDeletedFalse(id);
    }
    
    public Optional<AIAnalysis> getLatestAnalysisForCV(Long cvId) {
        return analysisRepository.findLatestAnalysisForCV(cvId);
    }
    
    public List<AIAnalysis> getTopAnalysesForJobOffer(Long jobOfferId) {
        return analysisRepository.findTopAnalysesByJobOffer(jobOfferId);
    }
    
    public List<AIAnalysis> getAnalysesByMinScore(Integer minScore) {
        return analysisRepository.findAnalysesByMinScore(minScore);
    }
    
    // Statistics
    public Double getAverageScoreForJobOffer(Long jobOfferId) {
        return analysisRepository.getAverageScoreForJobOffer(jobOfferId);
    }
    
    public long getAnalysisCountForJobOffer(Long jobOfferId) {
        return analysisRepository.countAnalysesForJobOffer(jobOfferId);
    }
    
    // DTOs
    public static class AIAnalysisRequest {
        private String cvText;
        private String jobDescription;
        private String jobRequirements;
        
        public AIAnalysisRequest(String cvText, String jobDescription, String jobRequirements) {
            this.cvText = cvText;
            this.jobDescription = jobDescription;
            this.jobRequirements = jobRequirements;
        }
        
        // Getters
        public String getCvText() { return cvText; }
        public String getJobDescription() { return jobDescription; }
        public String getJobRequirements() { return jobRequirements; }
    }
    
    public static class AIAnalysisResponse {
        private Integer matchScore;
        private String summary;
        private String keySkills;
        private String missingSkills;
        private String experienceMatch;
        private String educationMatch;
        private String recommendations;
        private String fullAnalysis;
        private String model;
        
        public AIAnalysisResponse(Integer matchScore, String summary, String keySkills, 
                                String missingSkills, String experienceMatch, String educationMatch,
                                String recommendations, String fullAnalysis, String model) {
            this.matchScore = matchScore;
            this.summary = summary;
            this.keySkills = keySkills;
            this.missingSkills = missingSkills;
            this.experienceMatch = experienceMatch;
            this.educationMatch = educationMatch;
            this.recommendations = recommendations;
            this.fullAnalysis = fullAnalysis;
            this.model = model;
        }
        
        // Getters
        public Integer getMatchScore() { return matchScore; }
        public String getSummary() { return summary; }
        public String getKeySkills() { return keySkills; }
        public String getMissingSkills() { return missingSkills; }
        public String getExperienceMatch() { return experienceMatch; }
        public String getEducationMatch() { return educationMatch; }
        public String getRecommendations() { return recommendations; }
        public String getFullAnalysis() { return fullAnalysis; }
        public String getModel() { return model; }
    }
}
