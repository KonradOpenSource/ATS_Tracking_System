package com.ats.repository;

import com.ats.model.RecruitmentPipeline;
import com.ats.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitmentPipelineRepository extends JpaRepository<RecruitmentPipeline, Long> {
    
    List<RecruitmentPipeline> findByIsDeletedFalseOrderByCreatedAtDesc();
    
    List<RecruitmentPipeline> findByIsActiveTrueAndIsDeletedFalseOrderByCreatedAtDesc();
    
    Optional<RecruitmentPipeline> findByIdAndIsDeletedFalse(Long id);
    
    Optional<RecruitmentPipeline> findByJobOfferIdAndIsDeletedFalse(Long jobOfferId);
    
    @Query("SELECT rp FROM RecruitmentPipeline rp WHERE rp.isDeleted = false AND rp.jobOffer.id = :jobOfferId")
    Optional<RecruitmentPipeline> findByJobOffer(@Param("jobOfferId") Long jobOfferId);
    
    @Query("SELECT rp FROM RecruitmentPipeline rp WHERE rp.isDeleted = false AND rp.createdBy.id = :createdBy")
    List<RecruitmentPipeline> findByCreatedBy(@Param("createdBy") Long createdBy);
    
    @Query("SELECT COUNT(rp) > 0 FROM RecruitmentPipeline rp WHERE rp.isDeleted = false AND rp.name = :name AND rp.id != :id")
    boolean existsByNameAndIsDeletedFalseAndIdNot(@Param("name") String name, @Param("id") Long id);
    
    boolean existsByNameAndIsDeletedFalse(String name);
    
    @Query("SELECT rp FROM RecruitmentPipeline rp JOIN rp.stages s WHERE rp.isDeleted = false AND s.id = :stageId")
    Optional<RecruitmentPipeline> findByStageId(@Param("stageId") Long stageId);
}
