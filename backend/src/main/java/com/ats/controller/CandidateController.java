package com.ats.controller;

import com.ats.model.Candidate;
import com.ats.repository.CandidateRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidates")
@Tag(name = "Candidates", description = "API for managing candidates")
@SecurityRequirement(name = "Bearer Authentication")
public class CandidateController {
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    @GetMapping
    @Operation(
        summary = "Get all candidates",
        description = "Returns a list of all candidates (excluding deleted ones)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Candidates retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = List.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - JWT token required",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - insufficient permissions",
            content = @Content
        )
    })
    public ResponseEntity<List<CandidateResponse>> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findByIsDeletedFalse();
        
        // Convert to response DTOs
        List<CandidateResponse> candidateResponses = candidates.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(candidateResponses);
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Get candidate by ID",
        description = "Returns a specific candidate by their ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Candidate found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CandidateResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Candidate not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized",
            content = @Content
        )
    })
    public ResponseEntity<CandidateResponse> getCandidateById(
            @Parameter(description = "Candidate ID", example = "1", required = true)
            @PathVariable Long id) {
        return candidateRepository.findById(id)
            .filter(candidate -> !candidate.getIsDeleted())
            .map(candidate -> ResponseEntity.ok(convertToResponse(candidate)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(
        summary = "Create new candidate",
        description = "Creates a new candidate in the system"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Candidate created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CandidateResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized",
            content = @Content
        )
    })
    public ResponseEntity<CandidateResponse> createCandidate(
            @Parameter(description = "Candidate data", required = true)
            @Valid @RequestBody CreateCandidateRequest request) {
        
        Candidate candidate = new Candidate();
        candidate.setFirstName(request.getFirstName());
        candidate.setLastName(request.getLastName());
        candidate.setEmail(request.getEmail());
        candidate.setPhone(request.getPhone());
        candidate.setSummary(request.getSummary());
        candidate.setExperience(request.getExperience());
        candidate.setEducation(request.getEducation());
        candidate.setSkills(request.getSkills());
        candidate.setIsDeleted(false);
        
        Candidate savedCandidate = candidateRepository.save(candidate);
        return ResponseEntity.ok(convertToResponse(savedCandidate));
    }
    
    @PutMapping("/{id}")
    @Operation(
        summary = "Update candidate",
        description = "Updates an existing candidate's information"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Candidate updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CandidateResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Candidate not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data",
            content = @Content
        )
    })
    public ResponseEntity<CandidateResponse> updateCandidate(
            @Parameter(description = "Candidate ID", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated candidate data", required = true)
            @Valid @RequestBody UpdateCandidateRequest request) {
        
        return candidateRepository.findById(id)
            .filter(candidate -> !candidate.getIsDeleted())
            .map(candidate -> {
                candidate.setFirstName(request.getFirstName());
                candidate.setLastName(request.getLastName());
                candidate.setEmail(request.getEmail());
                candidate.setPhone(request.getPhone());
                candidate.setSummary(request.getSummary());
                candidate.setExperience(request.getExperience());
                candidate.setEducation(request.getEducation());
                candidate.setSkills(request.getSkills());
                
                Candidate updatedCandidate = candidateRepository.save(candidate);
                return ResponseEntity.ok(convertToResponse(updatedCandidate));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete candidate (soft delete)",
        description = "Soft deletes a candidate by marking as deleted"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "Candidate deleted successfully"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Candidate not found",
            content = @Content
        )
    })
    public ResponseEntity<Void> deleteCandidate(
            @Parameter(description = "Candidate ID", example = "1", required = true)
            @PathVariable Long id) {
        return candidateRepository.findById(id)
            .filter(candidate -> !candidate.getIsDeleted())
            .map(candidate -> {
                candidate.setIsDeleted(true);
                candidateRepository.save(candidate);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    @Operation(
        summary = "Search candidates",
        description = "Search candidates by name, email, or skills"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Search results returned",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = List.class)
            )
        )
    })
    public ResponseEntity<List<CandidateResponse>> searchCandidates(
            @Parameter(description = "Search query", example = "Java developer")
            @RequestParam String query) {
        
        List<Candidate> candidates = candidateRepository.findByIsDeletedFalse();
        List<CandidateResponse> results = candidates.stream()
            .filter(candidate -> {
                String searchTerm = query.toLowerCase();
                return candidate.getFirstName().toLowerCase().contains(searchTerm) ||
                       candidate.getLastName().toLowerCase().contains(searchTerm) ||
                       candidate.getEmail().toLowerCase().contains(searchTerm) ||
                       (candidate.getSkills() != null && candidate.getSkills().toLowerCase().contains(searchTerm));
            })
            .map(this::convertToResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(results);
    }
    
    // Helper method to convert entity to response DTO
    private CandidateResponse convertToResponse(Candidate candidate) {
        CandidateResponse response = new CandidateResponse();
        response.setId(candidate.getId());
        response.setFirstName(candidate.getFirstName());
        response.setLastName(candidate.getLastName());
        response.setEmail(candidate.getEmail());
        response.setPhone(candidate.getPhone());
        response.setSummary(candidate.getSummary());
        response.setExperience(candidate.getExperience());
        response.setEducation(candidate.getEducation());
        response.setSkills(candidate.getSkills());
        return response;
    }
    
    // DTO classes for documentation
    @Schema(description = "Candidate response data")
    public static class CandidateResponse {
        @Schema(description = "Candidate ID", example = "1")
        private Long id;
        
        @Schema(description = "First name", example = "John")
        private String firstName;
        
        @Schema(description = "Last name", example = "Doe")
        private String lastName;
        
        @Schema(description = "Email address", example = "john@example.com")
        private String email;
        
        @Schema(description = "Phone number", example = "+48 123 456 789")
        private String phone;
        
        @Schema(description = "Professional summary", example = "Experienced Java developer...")
        private String summary;
        
        @Schema(description = "Work experience", example = "5 years in software development...")
        private String experience;
        
        @Schema(description = "Education", example = "Computer Science degree...")
        private String education;
        
        @Schema(description = "Technical skills", example = "Java, Spring, PostgreSQL...")
        private String skills;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getExperience() { return experience; }
        public void setExperience(String experience) { this.experience = experience; }
        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }
        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }
    }
    
    @Schema(description = "Create candidate request")
    public static class CreateCandidateRequest {
        @Schema(description = "First name", example = "John")
        private String firstName;
        
        @Schema(description = "Last name", example = "Doe")
        private String lastName;
        
        @Schema(description = "Email address", example = "john@example.com")
        private String email;
        
        @Schema(description = "Phone number", example = "+48 123 456 789")
        private String phone;
        
        @Schema(description = "Professional summary")
        private String summary;
        
        @Schema(description = "Work experience")
        private String experience;
        
        @Schema(description = "Education")
        private String education;
        
        @Schema(description = "Technical skills")
        private String skills;
        
        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getExperience() { return experience; }
        public void setExperience(String experience) { this.experience = experience; }
        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }
        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }
    }
    
    @Schema(description = "Update candidate request")
    public static class UpdateCandidateRequest {
        @Schema(description = "First name", example = "John")
        private String firstName;
        
        @Schema(description = "Last name", example = "Doe")
        private String lastName;
        
        @Schema(description = "Email address", example = "john@example.com")
        private String email;
        
        @Schema(description = "Phone number", example = "+48 123 456 789")
        private String phone;
        
        @Schema(description = "Professional summary")
        private String summary;
        
        @Schema(description = "Work experience")
        private String experience;
        
        @Schema(description = "Education")
        private String education;
        
        @Schema(description = "Technical skills")
        private String skills;
        
        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getExperience() { return experience; }
        public void setExperience(String experience) { this.experience = experience; }
        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }
        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }
    }
}
