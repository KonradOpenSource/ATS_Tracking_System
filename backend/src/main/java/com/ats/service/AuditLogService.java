package com.ats.service;

import com.ats.model.AuditLog;
import com.ats.model.User;
import com.ats.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AuditLogService {
    
    private final AuditLogRepository auditLogRepository;
    
    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    
    public void logAction(User user, String action, String description) {
        AuditLog auditLog = new AuditLog(user, action, description);
        auditLogRepository.save(auditLog);
    }
    
    public void logAction(User user, String action, String description, String resourceType, String resourceId) {
        AuditLog auditLog = new AuditLog(user, action, description, resourceType, resourceId);
        auditLogRepository.save(auditLog);
    }
    
    public void logAction(User user, String action, String description, String resourceType, String resourceId, 
                         HttpServletRequest request) {
        AuditLog auditLog = new AuditLog(user, action, description, resourceType, resourceId);
        auditLog.setIpAddress(getClientIpAddress(request));
        auditLog.setUserAgent(request.getHeader("User-Agent"));
        auditLogRepository.save(auditLog);
    }
    
    public void logAction(User user, String action, String description, String resourceType, String resourceId, 
                         String details, HttpServletRequest request) {
        AuditLog auditLog = new AuditLog(user, action, description, resourceType, resourceId);
        auditLog.setDetails(details);
        auditLog.setIpAddress(getClientIpAddress(request));
        auditLog.setUserAgent(request.getHeader("User-Agent"));
        auditLogRepository.save(auditLog);
    }
    
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable);
    }
    
    public Page<AuditLog> getUserLogs(User user, Pageable pageable) {
        return auditLogRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(user, pageable);
    }
    
    public Page<AuditLog> getFilteredLogs(String action, String resourceType, Long userId, 
                                        LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findWithFilters(action, resourceType, userId, startDate, endDate, pageable);
    }
    
    public List<AuditLog> getResourceLogs(String resourceType, String resourceId) {
        return auditLogRepository.findLogsByResource(resourceType, resourceId);
    }
    
    public List<String> getDistinctActions() {
        return auditLogRepository.findDistinctActions();
    }
    
    public List<String> getDistinctResourceTypes() {
        return auditLogRepository.findDistinctResourceTypes();
    }
    
    public long getLogsCountSince(LocalDateTime startDate) {
        return auditLogRepository.countLogsSince(startDate);
    }
    
    public long getActionCountSince(String action, LocalDateTime startDate) {
        return auditLogRepository.countLogsByActionSince(action, startDate);
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
    
    // Predefined actions
    public static class Actions {
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";
        public static final String REGISTER = "REGISTER";
        public static final String CREATE = "CREATE";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";
        public static final String VIEW = "VIEW";
        public static final String DOWNLOAD = "DOWNLOAD";
        public static final String UPLOAD = "UPLOAD";
        public static final String ANALYZE = "ANALYZE";
        public static final String MOVE = "MOVE";
        public static final String EXPORT = "EXPORT";
        public static final String IMPORT = "IMPORT";
        public static final String APPROVE = "APPROVE";
        public static final String REJECT = "REJECT";
        public static final String ACCESS_DENIED = "ACCESS_DENIED";
        public static final String PASSWORD_CHANGE = "PASSWORD_CHANGE";
        public static final String PROFILE_UPDATE = "PROFILE_UPDATE";
    }
    
    // Resource types
    public static class ResourceTypes {
        public static final String USER = "USER";
        public static final String CANDIDATE = "CANDIDATE";
        public static final String JOB_OFFER = "JOB_OFFER";
        public static final String CV = "CV";
        public static final String AI_ANALYSIS = "AI_ANALYSIS";
        public static final String RECRUITMENT_STAGE = "RECRUITMENT_STAGE";
        public static final String PIPELINE = "PIPELINE";
        public static final String REPORT = "REPORT";
        public static final String SYSTEM = "SYSTEM";
        public static final String AUTHENTICATION = "AUTHENTICATION";
    }
}
