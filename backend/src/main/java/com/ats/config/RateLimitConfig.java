package com.ats.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {
    
    @Value("${rate.limit.enabled:true}")
    private boolean rateLimitEnabled;
    
    @Value("${rate.limit.requests:100}")
    private int requestsPerMinute;
    
    @Value("${rate.limit.burst:200}")
    private int burstCapacity;
    
    @Value("${rate.limit.login.requests:5}")
    private int loginRequestsPerMinute;
    
    @Value("${rate.limit.login.burst:10}")
    private int loginBurstCapacity;
    
    @Value("${rate.limit.upload.requests:10}")
    private int uploadRequestsPerMinute;
    
    @Value("${rate.limit.upload.burst:20}")
    private int uploadBurstCapacity;
    
    @Bean
    public RateLimitInterceptor rateLimitInterceptor() {
        return new RateLimitInterceptor(rateLimitEnabled, requestsPerMinute, burstCapacity,
                loginRequestsPerMinute, loginBurstCapacity,
                uploadRequestsPerMinute, uploadBurstCapacity);
    }
    
    public static class RateLimitInterceptor implements HandlerInterceptor {
        
        private final boolean enabled;
        private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
        private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
        private final Map<String, Bucket> uploadBuckets = new ConcurrentHashMap<>();
        
        private final int requestsPerMinute;
        private final int burstCapacity;
        private final int loginRequestsPerMinute;
        private final int loginBurstCapacity;
        private final int uploadRequestsPerMinute;
        private final int uploadBurstCapacity;
        
        public RateLimitInterceptor(boolean enabled, int requestsPerMinute, int burstCapacity,
                                int loginRequestsPerMinute, int loginBurstCapacity,
                                int uploadRequestsPerMinute, int uploadBurstCapacity) {
            this.enabled = enabled;
            this.requestsPerMinute = requestsPerMinute;
            this.burstCapacity = burstCapacity;
            this.loginRequestsPerMinute = loginRequestsPerMinute;
            this.loginBurstCapacity = loginBurstCapacity;
            this.uploadRequestsPerMinute = uploadRequestsPerMinute;
            this.uploadBurstCapacity = uploadBurstCapacity;
        }
        
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            if (!enabled) {
                return true;
            }
            
            String clientIp = getClientIp(request);
            String path = request.getRequestURI();
            
            Bucket bucket;
            
            if (path.contains("/auth/login")) {
                bucket = loginBuckets.computeIfAbsent(clientIp, k -> createLoginBucket());
            } else if (path.contains("/cv/upload")) {
                bucket = uploadBuckets.computeIfAbsent(clientIp, k -> createUploadBucket());
            } else {
                bucket = buckets.computeIfAbsent(clientIp, k -> createGeneralBucket());
            }
            
            if (bucket.tryConsume(1)) {
                return true;
            } else {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Rate limit exceeded. Please try again later.");
                response.setContentType("application/json");
                return false;
            }
        }
        
        private Bucket createGeneralBucket() {
            return Bucket.builder()
                    .addLimit(Bandwidth.classic(burstCapacity, Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))))
                    .build();
        }
        
        private Bucket createLoginBucket() {
            return Bucket.builder()
                    .addLimit(Bandwidth.classic(loginBurstCapacity, Refill.intervally(loginRequestsPerMinute, Duration.ofMinutes(1))))
                    .build();
        }
        
        private Bucket createUploadBucket() {
            return Bucket.builder()
                    .addLimit(Bandwidth.classic(uploadBurstCapacity, Refill.intervally(uploadRequestsPerMinute, Duration.ofMinutes(1))))
                    .build();
        }
        
        private String getClientIp(HttpServletRequest request) {
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
    }
    
    @Bean
    public Bucket4jProperties bucket4jProperties() {
        return new Bucket4jProperties();
    }
    
    public static class Bucket4jProperties {
        // This class can be used to configure Bucket4j properties if needed
        // For now, it's a placeholder for future configuration
    }
}
