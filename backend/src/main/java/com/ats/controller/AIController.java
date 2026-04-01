package com.ats.controller;

import com.ats.model.*;
import com.ats.service.AIAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Analysis", description = "API for CV analysis and AI-powered recruitment")
@SecurityRequirement(name = "bearerAuth")
public class AIController {
    
    private final AIAnalysisService aiAnalysisService;
    
    public AIController(AIAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }
    
    // CV Upload and Management
    @PostMapping("/cv/upload")
    @Operation(summary = "Upload CV file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CV uploaded successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = CV.class)))
    })
    public ResponseEntity<CV> uploadCV(
            @Parameter(description = "CV file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Candidate ID") @RequestParam("candidateId") Long candidateId) {
        try {
            CV cv = aiAnalysisService.uploadCV(file, candidateId);
            return ResponseEntity.ok(cv);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/cv/{id}")
    @Operation(summary = "Get CV by ID")
    public ResponseEntity<CV> getCVById(
            @Parameter(description = "CV ID") @PathVariable Long id) {
        return aiAnalysisService.getCVById(id)
                .map(cv -> ResponseEntity.ok(cv))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cv/candidate/{candidateId}")
    @Operation(summary = "Get CVs by candidate")
    public ResponseEntity<List<CV>> getCVsByCandidate(
            @Parameter(description = "Candidate ID") @PathVariable Long candidateId) {
        List<CV> cvs = aiAnalysisService.getCVsByCandidate(candidateId);
        return ResponseEntity.ok(cvs);
    }
    
    @GetMapping("/cv/{id}/download")
    @Operation(summary = "Download CV file")
    public ResponseEntity<Resource> downloadCV(
            @Parameter(description = "CV ID") @PathVariable Long id) {
        Optional<CV> cvOpt = aiAnalysisService.getCVById(id);
        if (cvOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        CV cv = cvOpt.get();
        try {
            Path filePath = Paths.get(cv.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + cv.getOriginalFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/cv/{id}")
    @Operation(summary = "Delete CV")
    public ResponseEntity<Void> deleteCV(
            @Parameter(description = "CV ID") @PathVariable Long id) {
        aiAnalysisService.deleteCV(id);
        return ResponseEntity.noContent().build();
    }
    
    // AI Analysis
    @PostMapping("/analyze/{cvId}/{jobOfferId}")
    @Operation(summary = "Analyze CV against job offer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analysis completed successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = AIAnalysis.class)))
    })
    public ResponseEntity<AIAnalysis> analyzeCV(
            @Parameter(description = "CV ID") @PathVariable Long cvId,
            @Parameter(description = "Job Offer ID") @PathVariable Long jobOfferId) {
        AIAnalysis analysis = aiAnalysisService.analyzeCV(cvId, jobOfferId);
        return ResponseEntity.ok(analysis);
    }
    
    @GetMapping("/analysis/{id}")
    @Operation(summary = "Get AI analysis by ID")
    public ResponseEntity<AIAnalysis> getAnalysisById(
            @Parameter(description = "Analysis ID") @PathVariable Long id) {
        return aiAnalysisService.getAnalysisById(id)
                .map(analysis -> ResponseEntity.ok(analysis))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/analysis/cv/{cvId}/latest")
    @Operation(summary = "Get latest analysis for CV")
    public ResponseEntity<AIAnalysis> getLatestAnalysisForCV(
            @Parameter(description = "CV ID") @PathVariable Long cvId) {
        return aiAnalysisService.getLatestAnalysisForCV(cvId)
                .map(analysis -> ResponseEntity.ok(analysis))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/analysis/job-offer/{jobOfferId}/top")
    @Operation(summary = "Get top analyses for job offer")
    public ResponseEntity<List<AIAnalysis>> getTopAnalysesForJobOffer(
            @Parameter(description = "Job Offer ID") @PathVariable Long jobOfferId) {
        List<AIAnalysis> analyses = aiAnalysisService.getTopAnalysesForJobOffer(jobOfferId);
        return ResponseEntity.ok(analyses);
    }
    
    @GetMapping("/analysis/min-score/{minScore}")
    @Operation(summary = "Get analyses with minimum score")
    public ResponseEntity<List<AIAnalysis>> getAnalysesByMinScore(
            @Parameter(description = "Minimum score") @PathVariable Integer minScore) {
        List<AIAnalysis> analyses = aiAnalysisService.getAnalysesByMinScore(minScore);
        return ResponseEntity.ok(analyses);
    }
    
    // Statistics
    @GetMapping("/stats/job-offer/{jobOfferId}/average-score")
    @Operation(summary = "Get average score for job offer")
    public ResponseEntity<Double> getAverageScoreForJobOffer(
            @Parameter(description = "Job Offer ID") @PathVariable Long jobOfferId) {
        Double averageScore = aiAnalysisService.getAverageScoreForJobOffer(jobOfferId);
        return ResponseEntity.ok(averageScore);
    }
    
    @GetMapping("/stats/job-offer/{jobOfferId}/count")
    @Operation(summary = "Get analysis count for job offer")
    public ResponseEntity<Long> getAnalysisCountForJobOffer(
            @Parameter(description = "Job Offer ID") @PathVariable Long jobOfferId) {
        Long count = aiAnalysisService.getAnalysisCountForJobOffer(jobOfferId);
        return ResponseEntity.ok(count);
    }
    
    // DTOs
    @Schema(description = "CV upload response")
    public static class CVUploadResponse {
        @Schema(description = "CV ID")
        private Long id;
        
        @Schema(description = "Filename")
        private String filename;
        
        @Schema(description = "File size")
        private Long fileSize;
        
        @Schema(description = "Upload timestamp")
        private String uploadedAt;
        
        public CVUploadResponse(Long id, String filename, Long fileSize, String uploadedAt) {
            this.id = id;
            this.filename = filename;
            this.fileSize = fileSize;
            this.uploadedAt = uploadedAt;
        }
        
        // Getters
        public Long getId() { return id; }
        public String getFilename() { return filename; }
        public Long getFileSize() { return fileSize; }
        public String getUploadedAt() { return uploadedAt; }
    }
}
