package com.ats.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analysis")
@EntityListeners(AuditingEntityListener.class)
public class AIAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "aiAnalysis"})
    private CV cv;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_offer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "candidates"})
    private JobOffer jobOffer;
    
    @NotNull(message = "Match score is required")
    @Min(value = 0, message = "Score must be at least 0")
    @Max(value = 100, message = "Score must be at most 100")
    @Column(nullable = false)
    private Integer matchScore;
    
    @Column(length = 5000)
    private String summary;
    
    @Column(length = 2000)
    private String keySkills;
    
    @Column(length = 2000)
    private String missingSkills;
    
    @Column(length = 2000)
    private String experienceMatch;
    
    @Column(length = 2000)
    private String educationMatch;
    
    @Column(length = 1000)
    private String recommendations;
    
    @Column(columnDefinition = "TEXT")
    private String fullAnalysis;
    
    @Column(nullable = false)
    private String aiModel;
    
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public AIAnalysis() {}
    
    public AIAnalysis(CV cv, JobOffer jobOffer, Integer matchScore, String aiModel) {
        this.cv = cv;
        this.jobOffer = jobOffer;
        this.matchScore = matchScore;
        this.aiModel = aiModel;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CV getCv() {
        return cv;
    }
    
    public void setCv(CV cv) {
        this.cv = cv;
    }
    
    public JobOffer getJobOffer() {
        return jobOffer;
    }
    
    public void setJobOffer(JobOffer jobOffer) {
        this.jobOffer = jobOffer;
    }
    
    public Integer getMatchScore() {
        return matchScore;
    }
    
    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
    }
    
    public String getSummary() {
        return summary;
    }
    
    public void setSummary(String summary) {
        this.summary = summary;
    }
    
    public String getKeySkills() {
        return keySkills;
    }
    
    public void setKeySkills(String keySkills) {
        this.keySkills = keySkills;
    }
    
    public String getMissingSkills() {
        return missingSkills;
    }
    
    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }
    
    public String getExperienceMatch() {
        return experienceMatch;
    }
    
    public void setExperienceMatch(String experienceMatch) {
        this.experienceMatch = experienceMatch;
    }
    
    public String getEducationMatch() {
        return educationMatch;
    }
    
    public void setEducationMatch(String educationMatch) {
        this.educationMatch = educationMatch;
    }
    
    public String getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }
    
    public String getFullAnalysis() {
        return fullAnalysis;
    }
    
    public void setFullAnalysis(String fullAnalysis) {
        this.fullAnalysis = fullAnalysis;
    }
    
    public String getAiModel() {
        return aiModel;
    }
    
    public void setAiModel(String aiModel) {
        this.aiModel = aiModel;
    }
    
    public Boolean getIsDeleted() {
        return isDeleted;
    }
    
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AIAnalysis that = (AIAnalysis) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "AIAnalysis{" +
                "id=" + id +
                ", matchScore=" + matchScore +
                ", aiModel='" + aiModel + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
