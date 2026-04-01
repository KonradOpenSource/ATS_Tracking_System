package com.ats.config;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.HashSet;

@Configuration
public class DataInitializer {
    
    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository, 
            PasswordEncoder passwordEncoder,
            CandidateRepository candidateRepository,
            JobOfferRepository jobOfferRepository) {
        return args -> {
            // Check if users already exist
            if (userRepository.count() == 0) {
                // Create admin user
                User admin = new User();
                admin.setUsername("admin@ats.com");
                admin.setEmail("admin@ats.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setRole(Role.ADMIN);
                
                // Create recruiter user
                User recruiter = new User();
                recruiter.setUsername("recruiter@ats.com");
                recruiter.setEmail("recruiter@ats.com");
                recruiter.setPassword(passwordEncoder.encode("recruiter123"));
                recruiter.setFirstName("John");
                recruiter.setLastName("Recruiter");
                recruiter.setRole(Role.RECRUITER);
                
                userRepository.save(admin);
                userRepository.save(recruiter);
                
                System.out.println("Default users created successfully!");
                System.out.println("Admin: admin@ats.com / admin123");
                System.out.println("Recruiter: recruiter@ats.com / recruiter123");
            }
            
            // Create sample candidate if none exists
            if (candidateRepository.count() == 0) {
                Candidate candidate = new Candidate();
                candidate.setFirstName("John");
                candidate.setLastName("Doe");
                candidate.setEmail("john.doe@example.com");
                candidate.setPhone("1234567890");
                candidate.setSkills("Java, Spring Boot, Angular");
                candidate.setExperience("5 years of experience in software development");
                candidate.setEducation("Bachelor's degree in Computer Science");
                candidate.setSummary("Experienced software developer looking for new opportunities");
                
                candidateRepository.save(candidate);
                System.out.println("Sample candidate created successfully!");
            }
            
            // Create sample job offer if none exists
            if (jobOfferRepository.count() == 0) {
                User admin = userRepository.findByUsername("admin@ats.com").orElse(null);
                if (admin != null) {
                    JobOffer jobOffer = new JobOffer();
                    jobOffer.setTitle("Senior Java Developer");
                    jobOffer.setDescription("We are looking for a Senior Java Developer with experience in Spring Boot and microservices");
                    jobOffer.setRequirements("Java, Spring Boot, Microservices, PostgreSQL, REST API");
                    jobOffer.setBenefits("Health insurance, remote work, flexible hours");
                    jobOffer.setLocation("Remote");
                    jobOffer.setSalaryMin(new BigDecimal("70000"));
                    jobOffer.setSalaryMax(new BigDecimal("90000"));
                    jobOffer.setCreatedBy(admin);
                    jobOffer.setStatus(JobStatus.OPEN);
                    jobOffer.setIsDeleted(false);
                    jobOffer.setCandidates(new HashSet<>());
                    
                    jobOfferRepository.save(jobOffer);
                    System.out.println("Sample job offer created successfully!");
                }
            }
        };
    }
}
