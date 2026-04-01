package com.ats.repository;

import com.ats.model.RefreshToken;
import com.ats.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByTokenAndIsDeletedFalse(String token);
    
    Optional<RefreshToken> findByTokenAndIsRevokedFalseAndIsDeletedFalse(String token);
    
    List<RefreshToken> findByUserAndIsDeletedFalse(User user);
    
    List<RefreshToken> findByUserAndIsRevokedFalseAndIsDeletedFalse(User user);
    
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = false AND rt.isDeleted = false AND rt.expiryDate > :now")
    List<RefreshToken> findValidTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = false AND rt.isDeleted = false")
    List<RefreshToken> findActiveTokensByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(rt) > 0 FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = false AND rt.isDeleted = false")
    boolean hasActiveTokens(@Param("user") User user);
    
    @Query("DELETE FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = true OR rt.expiryDate < :now")
    void deleteExpiredAndRevokedTokens(@Param("user") User user, @Param("now") LocalDateTime now);
    
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.isDeleted = false")
    long countAllActiveTokens();
    
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.isDeleted = false AND rt.expiryDate < :now")
    long countExpiredTokens(@Param("now") LocalDateTime now);
}
