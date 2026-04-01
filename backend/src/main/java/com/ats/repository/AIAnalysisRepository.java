package com.ats.repository;

import com.ats.model.AIAnalysis;
import com.ats.model.CV;
import com.ats.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {
    
    List<AIAnalysis> findByIsDeletedFalseOrderByCreatedAtDesc();
    
    Optional<AIAnalysis> findByIdAndIsDeletedFalse(Long id);
    
    Optional<AIAnalysis> findByCvIdAndIsDeletedFalse(Long cvId);
    
    Optional<AIAnalysis> findByCvIdAndJobOfferIdAndIsDeletedFalse(Long cvId, Long jobOfferId);
    
    @Query("SELECT ai FROM AIAnalysis ai WHERE ai.isDeleted = false AND ai.cv.id = :cvId ORDER BY ai.createdAt DESC")
    Optional<AIAnalysis> findLatestAnalysisForCV(@Param("cvId") Long cvId);
    
    @Query("SELECT ai FROM AIAnalysis ai WHERE ai.isDeleted = false AND ai.jobOffer.id = :jobOfferId ORDER BY ai.matchScore DESC")
    List<AIAnalysis> findTopAnalysesByJobOffer(@Param("jobOfferId") Long jobOfferId);
    
    @Query("SELECT ai FROM AIAnalysis ai WHERE ai.isDeleted = false AND ai.matchScore >= :minScore ORDER BY ai.matchScore DESC")
    List<AIAnalysis> findAnalysesByMinScore(@Param("minScore") Integer minScore);
    
    @Query("SELECT AVG(ai.matchScore) FROM AIAnalysis ai WHERE ai.isDeleted = false AND ai.jobOffer.id = :jobOfferId")
    Double getAverageScoreForJobOffer(@Param("jobOfferId") Long jobOfferId);
    
    @Query("SELECT COUNT(ai) FROM AIAnalysis ai WHERE ai.isDeleted = false AND ai.jobOffer.id = :jobOfferId")
    long countAnalysesForJobOffer(@Param("jobOfferId") Long jobOfferId);
    
    @Query("SELECT ai FROM AIAnalysis ai WHERE ai.isDeleted = false AND ai.aiModel = :model ORDER BY ai.createdAt DESC")
    List<AIAnalysis> findAnalysesByModel(@Param("model") String model);
}
