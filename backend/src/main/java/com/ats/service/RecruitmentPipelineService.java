package com.ats.service;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecruitmentPipelineService {
    
    private final RecruitmentPipelineRepository pipelineRepository;
    private final RecruitmentStageRepository stageRepository;
    private final CandidateStageHistoryRepository historyRepository;
    private final CandidateRepository candidateRepository;
    
    public RecruitmentPipelineService(
            RecruitmentPipelineRepository pipelineRepository,
            RecruitmentStageRepository stageRepository,
            CandidateStageHistoryRepository historyRepository,
            CandidateRepository candidateRepository) {
        this.pipelineRepository = pipelineRepository;
        this.stageRepository = stageRepository;
        this.historyRepository = historyRepository;
        this.candidateRepository = candidateRepository;
    }
    
    // Pipeline Management
    public List<RecruitmentPipeline> getAllPipelines() {
        return pipelineRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
    }
    
    public List<RecruitmentPipeline> getActivePipelines() {
        return pipelineRepository.findByIsActiveTrueAndIsDeletedFalseOrderByCreatedAtDesc();
    }
    
    public Optional<RecruitmentPipeline> getPipelineById(Long id) {
        return pipelineRepository.findByIdAndIsDeletedFalse(id);
    }
    
    public RecruitmentPipeline createPipeline(RecruitmentPipeline pipeline) {
        return pipelineRepository.save(pipeline);
    }
    
    public RecruitmentPipeline updatePipeline(Long id, RecruitmentPipeline pipelineDetails) {
        return pipelineRepository.findByIdAndIsDeletedFalse(id)
                .map(pipeline -> {
                    pipeline.setName(pipelineDetails.getName());
                    pipeline.setDescription(pipelineDetails.getDescription());
                    pipeline.setIsActive(pipelineDetails.getIsActive());
                    return pipelineRepository.save(pipeline);
                })
                .orElseThrow(() -> new RuntimeException("Pipeline not found"));
    }
    
    public void deletePipeline(Long id) {
        pipelineRepository.findByIdAndIsDeletedFalse(id)
                .ifPresent(pipeline -> {
                    pipeline.setIsDeleted(true);
                    pipelineRepository.save(pipeline);
                });
    }
    
    // Stage Management
    public List<RecruitmentStage> getAllStages() {
        return stageRepository.findByIsDeletedFalseOrderByOrderAsc();
    }
    
    public Optional<RecruitmentStage> getStageById(Long id) {
        return stageRepository.findByIdAndIsDeletedFalse(id);
    }
    
    public RecruitmentStage createStage(RecruitmentStage stage) {
        return stageRepository.save(stage);
    }
    
    public RecruitmentStage updateStage(Long id, RecruitmentStage stageDetails) {
        return stageRepository.findByIdAndIsDeletedFalse(id)
                .map(stage -> {
                    stage.setName(stageDetails.getName());
                    stage.setDescription(stageDetails.getDescription());
                    stage.setOrder(stageDetails.getOrder());
                    return stageRepository.save(stage);
                })
                .orElseThrow(() -> new RuntimeException("Stage not found"));
    }
    
    public void deleteStage(Long id) {
        stageRepository.findByIdAndIsDeletedFalse(id)
                .ifPresent(stage -> {
                    stage.setIsDeleted(true);
                    stageRepository.save(stage);
                });
    }
    
    // Candidate Stage Management
    @Transactional
    public CandidateStageHistory moveCandidateToStage(Long candidateId, Long stageId, Long changedById, String notes) {
        Candidate candidate = candidateRepository.findByIdAndIsDeletedFalse(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        RecruitmentStage stage = stageRepository.findByIdAndIsDeletedFalse(stageId)
                .orElseThrow(() -> new RuntimeException("Stage not found"));
        
        User changedBy = new User(); // TODO: Get current user from security context
        changedBy.setId(changedById);
        
        CandidateStageHistory history = new CandidateStageHistory(candidate, stage, changedBy, notes);
        return historyRepository.save(history);
    }
    
    public List<CandidateStageHistory> getCandidateHistory(Long candidateId) {
        return historyRepository.findCandidateHistory(candidateId);
    }
    
    public List<CandidateStageHistory> getStageHistory(Long stageId) {
        return historyRepository.findStageHistory(stageId);
    }
    
    public Optional<CandidateStageHistory> getLatestCandidateStage(Long candidateId) {
        return historyRepository.findLatestCandidateStage(candidateId);
    }
    
    public List<CandidateStageHistory> getCandidatesInStage(Long stageId) {
        return historyRepository.findCandidatesInStage(stageId);
    }
    
    // Pipeline Data
    public List<RecruitmentStage> getPipelineStages(Long pipelineId) {
        return stageRepository.findAllActiveStages();
    }
    
    @Transactional
    public void initializeDefaultStages() {
        if (stageRepository.count() == 0) {
            List<RecruitmentStage> defaultStages = List.of(
                new RecruitmentStage("Applied", "Candidate applied for the position", 1),
                new RecruitmentStage("Screening", "Initial screening of application", 2),
                new RecruitmentStage("Technical Interview", "Technical assessment", 3),
                new RecruitmentStage("HR Interview", "HR interview", 4),
                new RecruitmentStage("Offer", "Job offer extended", 5),
                new RecruitmentStage("Hired", "Candidate accepted offer", 6),
                new RecruitmentStage("Rejected", "Candidate rejected", 7)
            );
            
            stageRepository.saveAll(defaultStages);
        }
    }
    
    // Statistics
    public long getCandidatesInStageCount(Long stageId) {
        return historyRepository.findCandidatesInStage(stageId).stream()
                .filter(history -> history.getIsDeleted() == false)
                .count();
    }
    
    public List<Candidate> getLatestCandidatesInStage(Long stageId) {
        return historyRepository.findCandidatesInStage(stageId).stream()
                .filter(history -> history.getIsDeleted() == false)
                .map(CandidateStageHistory::getCandidate)
                .distinct()
                .collect(Collectors.toList());
    }
}
