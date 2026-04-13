package com.ats.controller;

import com.ats.model.*;
import com.ats.service.RecruitmentPipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruitment")
@Tag(name = "Recruitment Pipeline", description = "API for managing recruitment pipelines and stages")
public class RecruitmentPipelineController {
    
    private final RecruitmentPipelineService pipelineService;
    
    public RecruitmentPipelineController(RecruitmentPipelineService pipelineService) {
        this.pipelineService = pipelineService;
    }
    
    // Pipeline Endpoints
    @GetMapping("/pipelines")
    @Operation(summary = "Get all recruitment pipelines")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pipelines retrieved successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = RecruitmentPipeline.class)))
    })
    public ResponseEntity<List<RecruitmentPipeline>> getAllPipelines() {
        List<RecruitmentPipeline> pipelines = pipelineService.getAllPipelines();
        return ResponseEntity.ok(pipelines);
    }
    
    @GetMapping("/pipelines/active")
    @Operation(summary = "Get active recruitment pipelines")
    public ResponseEntity<List<RecruitmentPipeline>> getActivePipelines() {
        List<RecruitmentPipeline> pipelines = pipelineService.getActivePipelines();
        return ResponseEntity.ok(pipelines);
    }
    
    @GetMapping("/pipelines/{id}")
    @Operation(summary = "Get pipeline by ID")
    public ResponseEntity<RecruitmentPipeline> getPipelineById(
            @Parameter(description = "Pipeline ID") @PathVariable Long id) {
        return pipelineService.getPipelineById(id)
                .map(pipeline -> ResponseEntity.ok(pipeline))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/pipelines")
    @Operation(summary = "Create new recruitment pipeline")
    public ResponseEntity<RecruitmentPipeline> createPipeline(
            @Valid @RequestBody RecruitmentPipeline pipeline) {
        RecruitmentPipeline createdPipeline = pipelineService.createPipeline(pipeline);
        return ResponseEntity.ok(createdPipeline);
    }
    
    @PutMapping("/pipelines/{id}")
    @Operation(summary = "Update recruitment pipeline")
    public ResponseEntity<RecruitmentPipeline> updatePipeline(
            @Parameter(description = "Pipeline ID") @PathVariable Long id,
            @Valid @RequestBody RecruitmentPipeline pipelineDetails) {
        RecruitmentPipeline updatedPipeline = pipelineService.updatePipeline(id, pipelineDetails);
        return ResponseEntity.ok(updatedPipeline);
    }
    
    @DeleteMapping("/pipelines/{id}")
    @Operation(summary = "Delete recruitment pipeline")
    public ResponseEntity<Void> deletePipeline(
            @Parameter(description = "Pipeline ID") @PathVariable Long id) {
        pipelineService.deletePipeline(id);
        return ResponseEntity.noContent().build();
    }
    
    // Stage Endpoints
    @GetMapping("/stages")
    @Operation(summary = "Get all recruitment stages")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stages retrieved successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = RecruitmentStage.class)))
    })
    public ResponseEntity<List<RecruitmentStage>> getAllStages() {
        List<RecruitmentStage> stages = pipelineService.getAllStages();
        return ResponseEntity.ok(stages);
    }
    
    @GetMapping("/stages/{id}")
    @Operation(summary = "Get stage by ID")
    public ResponseEntity<RecruitmentStage> getStageById(
            @Parameter(description = "Stage ID") @PathVariable Long id) {
        return pipelineService.getStageById(id)
                .map(stage -> ResponseEntity.ok(stage))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/stages")
    @Operation(summary = "Create new recruitment stage")
    public ResponseEntity<RecruitmentStage> createStage(
            @Valid @RequestBody RecruitmentStage stage) {
        RecruitmentStage createdStage = pipelineService.createStage(stage);
        return ResponseEntity.ok(createdStage);
    }
    
    @PutMapping("/stages/{id}")
    @Operation(summary = "Update recruitment stage")
    public ResponseEntity<RecruitmentStage> updateStage(
            @Parameter(description = "Stage ID") @PathVariable Long id,
            @Valid @RequestBody RecruitmentStage stageDetails) {
        RecruitmentStage updatedStage = pipelineService.updateStage(id, stageDetails);
        return ResponseEntity.ok(updatedStage);
    }
    
    @DeleteMapping("/stages/{id}")
    @Operation(summary = "Delete recruitment stage")
    public ResponseEntity<Void> deleteStage(
            @Parameter(description = "Stage ID") @PathVariable Long id) {
        pipelineService.deleteStage(id);
        return ResponseEntity.noContent().build();
    }
    
    // Candidate Stage Management
    @PostMapping("/candidates/{candidateId}/move-to-stage/{stageId}")
    @Operation(summary = "Move candidate to a different stage")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Candidate moved successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = CandidateStageHistory.class)))
    })
    public ResponseEntity<CandidateStageHistory> moveCandidateToStage(
            @Parameter(description = "Candidate ID") @PathVariable Long candidateId,
            @Parameter(description = "Stage ID") @PathVariable Long stageId,
            @RequestBody(required = false) MoveCandidateRequest request) {
        
        String notes = request != null ? request.getNotes() : null;
        Long changedById = request != null ? request.getChangedById() : 1L; // TODO: Get from security context
        
        CandidateStageHistory history = pipelineService.moveCandidateToStage(
                candidateId, stageId, changedById, notes);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/candidates/{candidateId}/history")
    @Operation(summary = "Get candidate stage history")
    public ResponseEntity<List<CandidateStageHistory>> getCandidateHistory(
            @Parameter(description = "Candidate ID") @PathVariable Long candidateId) {
        List<CandidateStageHistory> history = pipelineService.getCandidateHistory(candidateId);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/stages/{stageId}/history")
    @Operation(summary = "Get stage history")
    public ResponseEntity<List<CandidateStageHistory>> getStageHistory(
            @Parameter(description = "Stage ID") @PathVariable Long stageId) {
        List<CandidateStageHistory> history = pipelineService.getStageHistory(stageId);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/candidates/{candidateId}/latest-stage")
    @Operation(summary = "Get candidate's latest stage")
    public ResponseEntity<CandidateStageHistory> getLatestCandidateStage(
            @Parameter(description = "Candidate ID") @PathVariable Long candidateId) {
        return pipelineService.getLatestCandidateStage(candidateId)
                .map(stage -> ResponseEntity.ok(stage))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/stages/{stageId}/candidates")
    @Operation(summary = "Get candidates in a specific stage")
    public ResponseEntity<List<CandidateStageHistory>> getCandidatesInStage(
            @Parameter(description = "Stage ID") @PathVariable Long stageId) {
        List<CandidateStageHistory> candidates = pipelineService.getCandidatesInStage(stageId);
        return ResponseEntity.ok(candidates);
    }
    
    @GetMapping("/pipelines/{pipelineId}/stages")
    @Operation(summary = "Get stages for a specific pipeline")
    public ResponseEntity<List<RecruitmentStage>> getPipelineStages(
            @Parameter(description = "Pipeline ID") @PathVariable Long pipelineId) {
        List<RecruitmentStage> stages = pipelineService.getPipelineStages(pipelineId);
        return ResponseEntity.ok(stages);
    }
    
    @PostMapping("/initialize-default-stages")
    @Operation(summary = "Initialize default recruitment stages")
    public ResponseEntity<Void> initializeDefaultStages() {
        pipelineService.initializeDefaultStages();
        return ResponseEntity.ok().build();
    }
    
    // DTOs
    @Schema(description = "Request to move candidate to stage")
    public static class MoveCandidateRequest {
        @Schema(description = "Notes about the stage change")
        private String notes;
        
        @Schema(description = "ID of user who made the change")
        private Long changedById;
        
        public String getNotes() {
            return notes;
        }
        
        public void setNotes(String notes) {
            this.notes = notes;
        }
        
        public Long getChangedById() {
            return changedById;
        }
        
        public void setChangedById(Long changedById) {
            this.changedById = changedById;
        }
    }
}
