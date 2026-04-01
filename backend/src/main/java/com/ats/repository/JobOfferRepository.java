package com.ats.repository;

import com.ats.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByTitleContainingIgnoreCase(String title);
    Optional<JobOffer> findByIdAndIsDeletedFalse(Long id);
}
