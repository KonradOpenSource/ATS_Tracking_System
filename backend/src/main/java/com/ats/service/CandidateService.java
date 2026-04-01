package com.ats.service;

import com.ats.model.Candidate;
import com.ats.repository.CandidateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CandidateService {
    
    private final CandidateRepository candidateRepository;
    
    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }
    
    public List<Candidate> findAll() {
        return candidateRepository.findAll();
    }
    
    public Optional<Candidate> findById(Long id) {
        return candidateRepository.findById(id);
    }
    
    public Candidate save(Candidate candidate) {
        return candidateRepository.save(candidate);
    }
    
    public void deleteById(Long id) {
        candidateRepository.deleteById(id);
    }
    
    public long count() {
        return candidateRepository.count();
    }
    
    public long countCandidates() {
        return count();
    }
}
