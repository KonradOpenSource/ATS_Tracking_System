package com.ats.service;

import com.ats.model.RefreshToken;
import com.ats.model.User;
import com.ats.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    
    @Value("${jwt.refresh.secret:myRefreshSecretKey123456789012345678901234567890}")
    private String refreshSecret;
    
    @Value("${jwt.refresh.expiration:604800000}") // 7 days in milliseconds
    private long refreshExpiration;
    
    @Value("${jwt.refresh.max.active:5}") // Maximum active refresh tokens per user
    private int maxActiveTokens;
    
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }
    
    public RefreshToken createRefreshToken(User user, HttpServletRequest request) {
        // Revoke existing tokens if user has too many active tokens
        List<RefreshToken> activeTokens = refreshTokenRepository.findActiveTokensByUser(user);
        if (activeTokens.size() >= maxActiveTokens) {
            // Revoke the oldest token
            RefreshToken oldestToken = activeTokens.get(0);
            oldestToken.setIsRevoked(true);
            refreshTokenRepository.save(oldestToken);
        }
        
        // Generate new refresh token
        String token = generateRefreshToken(user);
        
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(refreshExpiration / 1000);
        
        RefreshToken refreshToken = new RefreshToken(token, user, expiryDate);
        refreshToken.setIpAddress(getClientIpAddress(request));
        refreshToken.setUserAgent(request.getHeader("User-Agent"));
        
        return refreshTokenRepository.save(refreshToken);
    }
    
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByTokenAndIsRevokedFalseAndIsDeletedFalse(token);
    }
    
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            token.setIsRevoked(true);
            refreshTokenRepository.save(token);
            throw new RuntimeException("Refresh token is expired");
        }
        return token;
    }
    
    public void revokeToken(String token) {
        refreshTokenRepository.findByTokenAndIsDeletedFalse(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setIsRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }
    
    public void revokeAllUserTokens(User user) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserAndIsDeletedFalse(user);
        tokens.forEach(token -> token.setIsRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }
    
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
    
    public void deleteExpiredAndRevokedTokens(User user) {
        refreshTokenRepository.deleteExpiredAndRevokedTokens(user, LocalDateTime.now());
    }
    
    public List<RefreshToken> getUserRefreshTokens(User user) {
        return refreshTokenRepository.findValidTokensByUser(user, LocalDateTime.now());
    }
    
    public boolean hasActiveTokens(User user) {
        return refreshTokenRepository.hasActiveTokens(user);
    }
    
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);
        
        SecretKey key = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
        
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    public Claims parseRefreshToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
        
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public User getUserFromToken(String token) {
        Claims claims = parseRefreshToken(token);
        Long userId = Long.parseLong(claims.getSubject());
        
        // In a real implementation, you would fetch the user from the database
        // For now, return a mock user
        User user = new User();
        user.setId(userId);
        return user;
    }
    
    public boolean isTokenValid(String token) {
        try {
            Optional<RefreshToken> refreshToken = findByToken(token);
            if (refreshToken.isEmpty()) {
                return false;
            }
            
            RefreshToken tokenEntity = refreshToken.get();
            if (tokenEntity.isExpired() || tokenEntity.getIsRevoked()) {
                return false;
            }
            
            // Also verify JWT signature
            parseRefreshToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    // Cleanup method to be called periodically
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
    
    // Get token statistics
    public long getActiveTokenCount() {
        return refreshTokenRepository.countAllActiveTokens();
    }
    
    public long getExpiredTokenCount() {
        return refreshTokenRepository.countExpiredTokens(LocalDateTime.now());
    }
}
