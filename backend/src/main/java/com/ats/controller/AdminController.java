package com.ats.controller;

import com.ats.model.*;
import com.ats.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UserService userService;
    private final CandidateService candidateService;
    private final RecruitmentPipelineService pipelineService;
    private final AIAnalysisService aiAnalysisService;
    private final AuditLogService auditLogService;
    private final RefreshTokenService refreshTokenService;
    
    public AdminController(
            UserService userService,
            CandidateService candidateService,
            RecruitmentPipelineService pipelineService,
            AIAnalysisService aiAnalysisService,
            AuditLogService auditLogService,
            RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.candidateService = candidateService;
        this.pipelineService = pipelineService;
        this.aiAnalysisService = aiAnalysisService;
        this.auditLogService = auditLogService;
        this.refreshTokenService = refreshTokenService;
    }
    
    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        long totalUsers = userService.countUsers();
        stats.put("totalUsers", totalUsers);
        
        // Candidate statistics
        stats.put("totalCandidates", candidateService.countCandidates());
        
        // Pipeline statistics
        stats.put("totalPipelines", pipelineService.getAllPipelines().size());
        
        // AI statistics
        stats.put("totalAnalyses", aiAnalysisService.getAnalysisCountForJobOffer(1L)); // Mock job offer ID
        
        // Audit statistics
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        stats.put("weeklyActions", auditLogService.getLogsCountSince(weekAgo));
        
        // Token statistics
        stats.put("activeTokens", refreshTokenService.getActiveTokenCount());
        
        return ResponseEntity.ok(stats);
    }
    
    // User Management
    @GetMapping("/users")
    @Operation(summary = "Get all users with pagination")
    public ResponseEntity<Page<User>> getAllUsers(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUserById(
            @Parameter(description = "User ID") @PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<User> updateUserRole(
            @Parameter(description = "User ID") @PathVariable Long id,
            @RequestBody Map<String, String> roleRequest,
            HttpServletRequest httpRequest) {
        
        User currentUser = getCurrentUser(); // Mock implementation
        User updatedUser = userService.updateUserRole(id, roleRequest.get("role"));
        
        auditLogService.logAction(currentUser, AuditLogService.Actions.UPDATE,
                "Updated user role to " + roleRequest.get("role"),
                AuditLogService.ResourceTypes.USER, id.toString(), httpRequest);
        
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        User currentUser = getCurrentUser(); // Mock implementation
        userService.deleteUser(id);
        
        auditLogService.logAction(currentUser, AuditLogService.Actions.DELETE,
                "Deleted user",
                AuditLogService.ResourceTypes.USER, id.toString(), httpRequest);
        
        return ResponseEntity.noContent().build();
    }
    
    // Audit Logs
    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs with filtering")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Action filter") @RequestParam(required = false) String action,
            @Parameter(description = "Resource type filter") @RequestParam(required = false) String resourceType,
            @Parameter(description = "User ID filter") @RequestParam(required = false) Long userId,
            @Parameter(description = "Start date filter") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date filter") @RequestParam(required = false) String endDate) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;
        
        Page<AuditLog> logs = auditLogService.getFilteredLogs(action, resourceType, userId, start, end, pageable);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/audit-logs/actions")
    @Operation(summary = "Get distinct actions for filtering")
    public ResponseEntity<List<String>> getDistinctActions() {
        List<String> actions = auditLogService.getDistinctActions();
        return ResponseEntity.ok(actions);
    }
    
    @GetMapping("/audit-logs/resource-types")
    @Operation(summary = "Get distinct resource types for filtering")
    public ResponseEntity<List<String>> getDistinctResourceTypes() {
        List<String> resourceTypes = auditLogService.getDistinctResourceTypes();
        return ResponseEntity.ok(resourceTypes);
    }
    
    // System Management
    @GetMapping("/system/health")
    @Operation(summary = "Get system health status")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Database health
        health.put("database", "UP");
        
        // AI service health
        health.put("aiService", "UP"); // In real implementation, check AI service
        
        // Memory usage
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        health.put("memory", Map.of(
                "total", totalMemory,
                "used", usedMemory,
                "free", freeMemory,
                "usagePercentage", (double) usedMemory / totalMemory * 100
        ));
        
        // Active tokens
        health.put("activeTokens", refreshTokenService.getActiveTokenCount());
        
        return ResponseEntity.ok(health);
    }
    
    @PostMapping("/system/cleanup")
    @Operation(summary = "Cleanup expired tokens and logs")
    public ResponseEntity<Map<String, Object>> cleanupSystem(HttpServletRequest httpRequest) {
        Map<String, Object> result = new HashMap<>();
        
        User currentUser = getCurrentUser(); // Mock implementation
        
        // Cleanup expired refresh tokens
        long deletedTokens = refreshTokenService.getActiveTokenCount();
        refreshTokenService.cleanupExpiredTokens();
        
        // In a real implementation, you might also clean up old audit logs
        long deletedLogs = 0; // auditLogService.cleanupOldLogs();
        
        auditLogService.logAction(currentUser, AuditLogService.Actions.DELETE,
                "System cleanup: deleted " + deletedTokens + " expired tokens and " + deletedLogs + " old logs",
                AuditLogService.ResourceTypes.SYSTEM, null, httpRequest);
        
        result.put("deletedTokens", deletedTokens);
        result.put("deletedLogs", deletedLogs);
        result.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(result);
    }
    
    // Reports
    @GetMapping("/reports/user-activity")
    @Operation(summary = "Get user activity report")
    public ResponseEntity<Map<String, Object>> getUserActivityReport() {
        Map<String, Object> report = new HashMap<>();
        
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        
        report.put("weeklyActions", auditLogService.getLogsCountSince(weekAgo));
        report.put("weeklyLogins", auditLogService.getActionCountSince(AuditLogService.Actions.LOGIN, weekAgo));
        report.put("weeklyRegistrations", auditLogService.getActionCountSince(AuditLogService.Actions.REGISTER, weekAgo));
        
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/reports/recruitment-stats")
    @Operation(summary = "Get recruitment statistics")
    public ResponseEntity<Map<String, Object>> getRecruitmentStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Mock data - in real implementation, calculate from actual data
        stats.put("totalCandidates", candidateService.countCandidates());
        stats.put("averageScore", aiAnalysisService.getAverageScoreForJobOffer(1L)); // Mock job offer ID
        stats.put("totalAnalyses", aiAnalysisService.getAnalysisCountForJobOffer(1L));
        
        return ResponseEntity.ok(stats);
    }
    
    // Helper methods
    private User getCurrentUser() {
        // Mock implementation - in real implementation, get from security context
        User user = new User();
        user.setId(1L);
        user.setUsername("admin");
        user.setRole(Role.ADMIN);
        return user;
    }
    
    // DTOs
    @Schema(description = "User role update request")
    public static class UserRoleUpdateRequest {
        @Schema(description = "New role")
        private String role;
        
        public String getRole() {
            return role;
        }
        
        public void setRole(String role) {
            this.role = role;
        }
    }
}
