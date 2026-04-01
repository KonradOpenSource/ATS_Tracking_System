package com.ats.repository;

import com.ats.model.CandidateStageHistory;
import com.ats.model.Candidate;
import com.ats.model.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateStageHistoryRepository extends JpaRepository<CandidateStageHistory, Long> {
    
    List<CandidateStageHistory> findByCandidateIdAndIsDeletedFalseOrderByChangedAtDesc(Long candidateId);
    
    List<CandidateStageHistory> findByStageIdAndIsDeletedFalseOrderByChangedAtDesc(Long stageId);
    
    @Query("SELECT csh FROM CandidateStageHistory csh WHERE csh.candidate.id = :candidateId AND csh.isDeleted = false ORDER BY csh.changedAt DESC")
    List<CandidateStageHistory> findCandidateHistory(@Param("candidateId") Long candidateId);
    
    @Query("SELECT csh FROM CandidateStageHistory csh WHERE csh.stage.id = :stageId AND csh.isDeleted = false ORDER BY csh.changedAt DESC")
    List<CandidateStageHistory> findStageHistory(@Param("stageId") Long stageId);
    
    @Query("SELECT csh FROM CandidateStageHistory csh WHERE csh.candidate.id = :candidateId AND csh.isDeleted = false ORDER BY csh.changedAt DESC LIMIT 1")
    Optional<CandidateStageHistory> findLatestCandidateStage(@Param("candidateId") Long candidateId);
    
    @Query("SELECT csh FROM CandidateStageHistory csh WHERE csh.stage.id = :stageId AND csh.isDeleted = false")
    List<CandidateStageHistory> findCandidatesInStage(@Param("stageId") Long stageId);
    
    @Query("SELECT csh FROM CandidateStageHistory csh WHERE csh.changedAt BETWEEN :startDate AND :endDate AND csh.isDeleted = false ORDER BY csh.changedAt DESC")
    List<CandidateStageHistory> findHistoryByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(csh) FROM CandidateStageHistory csh WHERE csh.candidate.id = :candidateId AND csh.isDeleted = false")
    long countCandidateHistoryEntries(@Param("candidateId") Long candidateId);
}
