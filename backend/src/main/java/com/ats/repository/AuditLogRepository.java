package com.ats.repository;

import com.ats.model.AuditLog;
import com.ats.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    Page<AuditLog> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
    
    Page<AuditLog> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(User user, Pageable pageable);
    
    Page<AuditLog> findByActionContainingIgnoreCaseAndIsDeletedFalseOrderByCreatedAtDesc(String action, Pageable pageable);
    
    Page<AuditLog> findByResourceTypeAndIsDeletedFalseOrderByCreatedAtDesc(String resourceType, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.isDeleted = false AND " +
           "(:action IS NULL OR LOWER(al.action) LIKE LOWER(CONCAT('%', :action, '%'))) AND " +
           "(:resourceType IS NULL OR al.resourceType = :resourceType) AND " +
           "(:userId IS NULL OR al.user.id = :userId) AND " +
           "(:startDate IS NULL OR al.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR al.createdAt <= :endDate) " +
           "ORDER BY al.createdAt DESC")
    Page<AuditLog> findWithFilters(@Param("action") String action,
                                  @Param("resourceType") String resourceType,
                                  @Param("userId") Long userId,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate,
                                  Pageable pageable);
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.isDeleted = false AND al.createdAt >= :startDate")
    long countLogsSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.isDeleted = false AND al.action = :action AND al.createdAt >= :startDate")
    long countLogsByActionSince(@Param("action") String action, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT DISTINCT al.action FROM AuditLog al WHERE al.isDeleted = false")
    List<String> findDistinctActions();
    
    @Query("SELECT DISTINCT al.resourceType FROM AuditLog al WHERE al.isDeleted = false")
    List<String> findDistinctResourceTypes();
    
    @Query("SELECT al FROM AuditLog al WHERE al.isDeleted = false AND al.user.id = :userId ORDER BY al.createdAt DESC")
    List<AuditLog> findRecentLogsByUser(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.isDeleted = false AND al.resourceType = :resourceType AND al.resourceId = :resourceId ORDER BY al.createdAt DESC")
    List<AuditLog> findLogsByResource(@Param("resourceType") String resourceType, @Param("resourceId") String resourceId);
}
