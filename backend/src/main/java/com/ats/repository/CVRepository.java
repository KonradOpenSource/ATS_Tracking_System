package com.ats.repository;

import com.ats.model.CV;
import com.ats.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
    
    List<CV> findByCandidateIdAndIsDeletedFalse(Long candidateId);
    
    Optional<CV> findByIdAndIsDeletedFalse(Long id);
    
    @Query("SELECT cv FROM CV cv WHERE cv.isDeleted = false ORDER BY cv.createdAt DESC")
    List<CV> findAllActive();
    
    @Query("SELECT COUNT(cv) > 0 FROM CV cv WHERE cv.candidate.id = :candidateId AND cv.isDeleted = false")
    boolean hasCandidateCV(@Param("candidateId") Long candidateId);
    
    @Query("SELECT cv FROM CV cv WHERE cv.isDeleted = false AND cv.extractedText IS NOT NULL")
    List<CV> findCVsWithExtractedText();
    
    @Query("SELECT cv FROM CV cv WHERE cv.candidate.id = :candidateId AND cv.isDeleted = false ORDER BY cv.createdAt DESC")
    Optional<CV> findLatestCandidateCV(@Param("candidateId") Long candidateId);
}
