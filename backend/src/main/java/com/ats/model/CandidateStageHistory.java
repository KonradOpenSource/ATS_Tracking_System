package com.ats.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_stage_history")
@EntityListeners(AuditingEntityListener.class)
public class CandidateStageHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private RecruitmentStage stage;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id", nullable = false)
    private User changedBy;
    
    @Column(nullable = false)
    private LocalDateTime changedAt;
    
    @Column(length = 1000)
    private String notes;
    
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public CandidateStageHistory() {}
    
    public CandidateStageHistory(Candidate candidate, RecruitmentStage stage, User changedBy, String notes) {
        this.candidate = candidate;
        this.stage = stage;
        this.changedBy = changedBy;
        this.changedAt = LocalDateTime.now();
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Candidate getCandidate() {
        return candidate;
    }
    
    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }
    
    public RecruitmentStage getStage() {
        return stage;
    }
    
    public void setStage(RecruitmentStage stage) {
        this.stage = stage;
    }
    
    public User getChangedBy() {
        return changedBy;
    }
    
    public void setChangedBy(User changedBy) {
        this.changedBy = changedBy;
    }
    
    public LocalDateTime getChangedAt() {
        return changedAt;
    }
    
    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
        CandidateStageHistory that = (CandidateStageHistory) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "CandidateStageHistory{" +
                "id=" + id +
                ", candidate=" + candidate +
                ", stage=" + stage +
                ", changedAt=" + changedAt +
                '}';
    }
}
