package com.ats.controller;

import com.ats.model.JobOffer;
import com.ats.model.JobStatus;
import com.ats.model.User;
import com.ats.repository.JobOfferRepository;
import com.ats.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/job-offers")
@Tag(name = "Job Offers", description = "API for managing job offers")
@SecurityRequirement(name = "bearerAuth")
public class JobOfferController {
    
    private final JobOfferRepository jobOfferRepository;
    private final UserRepository userRepository;
    
    public JobOfferController(JobOfferRepository jobOfferRepository, UserRepository userRepository) {
        this.jobOfferRepository = jobOfferRepository;
        this.userRepository = userRepository;
    }
    
    @GetMapping
    @Operation(summary = "Get all job offers")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Job offers retrieved successfully")
    })
    public ResponseEntity<List<JobOffer>> getAllJobOffers() {
        List<JobOffer> jobOffers = jobOfferRepository.findAll().stream()
                .filter(jobOffer -> !jobOffer.getIsDeleted())
                .toList();
        return ResponseEntity.ok(jobOffers);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get job offer by ID")
    public ResponseEntity<JobOffer> getJobOfferById(
            @Parameter(description = "Job offer ID") @PathVariable Long id) {
        return jobOfferRepository.findByIdAndIsDeletedFalse(id)
                .map(jobOffer -> ResponseEntity.ok(jobOffer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create new job offer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public ResponseEntity<JobOffer> createJobOffer(
            @Valid @RequestBody JobOffer jobOffer,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        // Get the current user
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        jobOffer.setIsDeleted(false);
        jobOffer.setCreatedBy(user);
        if (jobOffer.getStatus() == null) {
            jobOffer.setStatus(JobStatus.OPEN);
        }
        JobOffer savedJobOffer = jobOfferRepository.save(jobOffer);
        return ResponseEntity.ok(savedJobOffer);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update job offer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public ResponseEntity<JobOffer> updateJobOffer(
            @Parameter(description = "Job offer ID") @PathVariable Long id,
            @Valid @RequestBody JobOffer jobOfferDetails) {
        return jobOfferRepository.findByIdAndIsDeletedFalse(id)
                .map(jobOffer -> {
                    jobOffer.setTitle(jobOfferDetails.getTitle());
                    jobOffer.setDescription(jobOfferDetails.getDescription());
                    jobOffer.setRequirements(jobOfferDetails.getRequirements());
                    jobOffer.setBenefits(jobOfferDetails.getBenefits());
                    jobOffer.setLocation(jobOfferDetails.getLocation());
                    jobOffer.setStatus(jobOfferDetails.getStatus());
                    jobOffer.setSalaryMin(jobOfferDetails.getSalaryMin());
                    jobOffer.setSalaryMax(jobOfferDetails.getSalaryMax());
                    return ResponseEntity.ok(jobOfferRepository.save(jobOffer));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job offer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public ResponseEntity<Void> deleteJobOffer(
            @Parameter(description = "Job offer ID") @PathVariable Long id) {
        return jobOfferRepository.findByIdAndIsDeletedFalse(id)
                .map(jobOffer -> {
                    jobOffer.setIsDeleted(true);
                    jobOfferRepository.save(jobOffer);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // DTO for creating job offers
    @Schema(description = "Job offer creation request")
    public static class JobOfferRequest {
        @Schema(description = "Job title", example = "Senior Java Developer")
        private String title;
        
        @Schema(description = "Job description")
        private String description;
        
        @Schema(description = "Job requirements")
        private String requirements;
        
        @Schema(description = "Job benefits")
        private String benefits;
        
        @Schema(description = "Job location", example = "Remote")
        private String location;
        
        @Schema(description = "Minimum salary")
        private BigDecimal salaryMin;
        
        @Schema(description = "Maximum salary")
        private BigDecimal salaryMax;
        
        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getRequirements() { return requirements; }
        public void setRequirements(String requirements) { this.requirements = requirements; }
        
        public String getBenefits() { return benefits; }
        public void setBenefits(String benefits) { this.benefits = benefits; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public BigDecimal getSalaryMin() { return salaryMin; }
        public void setSalaryMin(BigDecimal salaryMin) { this.salaryMin = salaryMin; }
        
        public BigDecimal getSalaryMax() { return salaryMax; }
        public void setSalaryMax(BigDecimal salaryMax) { this.salaryMax = salaryMax; }
    }
}
