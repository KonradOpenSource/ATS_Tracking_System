package com.ats.repository;

import com.ats.model.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitmentStageRepository extends JpaRepository<RecruitmentStage, Long> {
    
    List<RecruitmentStage> findByIsDeletedFalseOrderByOrderAsc();
    
    Optional<RecruitmentStage> findByIdAndIsDeletedFalse(Long id);
    
    @Query("SELECT rs FROM RecruitmentStage rs WHERE rs.isDeleted = false ORDER BY rs.order ASC")
    List<RecruitmentStage> findAllActiveStages();
    
    @Query("SELECT rs FROM RecruitmentStage rs WHERE rs.isDeleted = false AND rs.name = :name")
    Optional<RecruitmentStage> findByNameAndIsDeletedFalse(@Param("name") String name);
    
    boolean existsByNameAndIsDeletedFalse(String name);
    
    @Query("SELECT COUNT(rs) > 0 FROM RecruitmentStage rs WHERE rs.isDeleted = false AND rs.name = :name AND rs.id != :id")
    boolean existsByNameAndIsDeletedFalseAndIdNot(@Param("name") String name, @Param("id") Long id);
}
