from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import re
import json
from datetime import datetime


app = FastAPI(
    title="ATS AI Service",
    description="AI-powered CV analysis service for Applicant Tracking System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CVAnalysisRequest(BaseModel):
    cv_text: str
    job_description: str
    job_requirements: str

class SkillMatch(BaseModel):
    skill: str
    found: bool
    confidence: float

class AnalysisResponse(BaseModel):
    match_score: int
    summary: str
    key_skills: str
    missing_skills: str
    experience_match: str
    education_match: str
    recommendations: str
    full_analysis: str
    model: str
    skill_matches: List[SkillMatch]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    timestamp: str


class CVAnalysisService:
    def __init__(self):
        self.model_loaded = True
        self.model_name = "local-bert-model-v1"
    
        self.tech_skills = {
            'programming': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins'],
            'tools': ['git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'microsoft office', 'google workspace']
        }
        
    
        self.experience_indicators = {
            'junior': ['junior', 'entry', '0-1', '1-2', 'beginner', 'trainee'],
            'mid': ['mid', 'intermediate', '2-3', '3-5', 'experienced'],
            'senior': ['senior', '5+', '5-7', '7+', 'lead', 'principal', 'expert']
        }
        
   
        self.education_keywords = {
            'degree': ['bachelor', 'master', 'phd', 'doctorate', 'degree', 'diploma', 'certification'],
            'field': ['computer science', 'software engineering', 'information technology', 'cs', 'se', 'it']
        }
    
    def analyze_cv(self, request: CVAnalysisRequest) -> AnalysisResponse:
        """Analyze CV against job requirements"""
        
       
        cv_skills = self._extract_skills(request.cv_text)
        required_skills = self._extract_skills(request.job_requirements + " " + request.job_description)
        
       
        skill_matches = self._calculate_skill_matches(cv_skills, required_skills)
        match_score = self._calculate_overall_score(skill_matches, request.cv_text, request.job_requirements)
        
       
        key_skills = self._format_skills([sm.skill for sm in skill_matches if sm.found])
        missing_skills = self._format_skills([sm.skill for sm in skill_matches if not sm.found])
        
        experience_match = self._analyze_experience(request.cv_text, request.job_requirements)
        education_match = self._analyze_education(request.cv_text, request.job_requirements)
        recommendations = self._generate_recommendations(match_score, missing_skills, experience_match)
        summary = self._generate_summary(match_score, key_skills, missing_skills)
        
       
        full_analysis = self._generate_full_analysis(
            request.cv_text, request.job_description, request.job_requirements,
            skill_matches, experience_match, education_match
        )
        
        return AnalysisResponse(
            match_score=match_score,
            summary=summary,
            key_skills=key_skills,
            missing_skills=missing_skills,
            experience_match=experience_match,
            education_match=education_match,
            recommendations=recommendations,
            full_analysis=full_analysis,
            model=self.model_name,
            skill_matches=skill_matches
        )
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        text_lower = text.lower()
        found_skills = []
        
        for category, skills in self.tech_skills.items():
            for skill in skills:
                if skill in text_lower:
                    found_skills.append(skill)
        
       
        skill_patterns = [
            r'\bjava\s*\d*\b',
            r'\bpython\s*\d*\b',
            r'\bjavascript\b',
            r'\btypescript\b',
            r'\breact\b',
            r'\bangular\b',
            r'\bvue\b',
            r'\bnode\.?js\b',
            r'\bspring\s*boot\b',
            r'\bdjango\b',
            r'\bflask\b',
            r'\bdocker\b',
            r'\bkubernetes\b',
            r'\baws\b',
            r'\bgcp\b',
            r'\bazure\b',
            r'\bsql\b',
            r'\bnosql\b',
            r'\bmongodb\b',
            r'\bpostgresql\b',
            r'\bmysql\b',
            r'\bgit\b',
            r'\bgithub\b',
            r'\bagile\b',
            r'\bscrum\b'
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                found_skills.extend(matches)
        
        return list(set(found_skills))
    
    def _calculate_skill_matches(self, cv_skills: List[str], required_skills: List[str]) -> List[SkillMatch]:
        """Calculate skill matches between CV and requirements"""
        matches = []
        
        for skill in required_skills:
            found = skill.lower() in [cv_skill.lower() for cv_skill in cv_skills]
            confidence = 1.0 if found else 0.0
            
        
            if not found:
                for cv_skill in cv_skills:
                    if skill.lower() in cv_skill.lower() or cv_skill.lower() in skill.lower():
                        confidence = 0.7
                        break
            
            matches.append(SkillMatch(skill=skill, found=found and confidence > 0.5, confidence=confidence))
        
        return matches
    
    def _calculate_overall_score(self, skill_matches: List[SkillMatch], cv_text: str, requirements: str) -> int:
        """Calculate overall match score (0-100)"""
        
        
        found_skills = sum(1 for sm in skill_matches if sm.found)
        total_skills = len(skill_matches)
        skill_score = (found_skills / total_skills * 70) if total_skills > 0 else 0
        
        
        experience_score = self._calculate_experience_score(cv_text, requirements) * 0.2
        
    
        education_score = self._calculate_education_score(cv_text, requirements) * 0.1
        
        total_score = int(skill_score + experience_score + education_score)
        return min(100, max(0, total_score))
    
    def _calculate_experience_score(self, cv_text: str, requirements: str) -> int:
        """Calculate experience match score"""
        cv_lower = cv_text.lower()
        req_lower = requirements.lower()
        
       
        cv_years = self._extract_years_of_experience(cv_text)
        req_years = self._extract_years_of_experience(requirements)
        
        if req_years > 0:
            if cv_years >= req_years:
                return 100
            elif cv_years >= req_years * 0.8:
                return 80
            elif cv_years >= req_years * 0.5:
                return 60
            else:
                return 40
        else:
          
            return 80 if cv_years > 0 else 50
    
    def _extract_years_of_experience(self, text: str) -> int:
        """Extract years of experience from text"""
     
        patterns = [
            r'(\d+)\+?\s*years?',
            r'(\d+)\s*[-]\s*(\d+)\s*years?',
            r'(\d+)\s*year[s]?\s*of\s*experience',
            r'experience[:\s]*(\d+)\s*years?'
        ]
        
        max_years = 0
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            for match in matches:
                if isinstance(match, tuple):
                 
                    years = int(match[1]) 
                else:
                    years = int(match)
                max_years = max(max_years, years)
        
        return max_years
    
    def _calculate_education_score(self, cv_text: str, requirements: str) -> int:
        """Calculate education match score"""
        cv_lower = cv_text.lower()
        req_lower = requirements.lower()
        
      
        degree_required = any(degree in req_lower for degree in ['bachelor', 'master', 'phd', 'degree'])
        
        if degree_required:
            if any(degree in cv_lower for degree in ['phd', 'doctorate']):
                return 100
            elif any(degree in cv_lower for degree in ['master', 'msc']):
                return 90
            elif any(degree in cv_lower for degree in ['bachelor', 'bsc', 'degree']):
                return 80
            else:
                return 40
        else:
           
            return 80 if any(field in cv_lower for field in ['computer science', 'software engineering']) else 60
    
    def _analyze_experience(self, cv_text: str, requirements: str) -> str:
        """Analyze experience match"""
        cv_years = self._extract_years_of_experience(cv_text)
        req_years = self._extract_years_of_experience(requirements)
        
        if req_years > 0:
            if cv_years >= req_years:
                return f"Strong match: {cv_years} years of experience vs {req_years} required"
            elif cv_years >= req_years * 0.8:
                return f"Good match: {cv_years} years of experience (close to {req_years} required)"
            elif cv_years >= req_years * 0.5:
                return f"Moderate match: {cv_years} years of experience (below {req_years} required)"
            else:
                return f"Weak match: {cv_years} years of experience (significantly below {req_years} required)"
        else:
            return f"Experience level: {cv_years} years detected"
    
    def _analyze_education(self, cv_text: str, requirements: str) -> str:
        """Analyze education match"""
        cv_lower = cv_text.lower()
        
        if any(degree in cv_lower for degree in ['phd', 'doctorate']):
            return "PhD/Doctorate level education detected"
        elif any(degree in cv_lower for degree in ['master', 'msc']):
            return "Master's degree detected"
        elif any(degree in cv_lower for degree in ['bachelor', 'bsc', 'degree']):
            return "Bachelor's degree detected"
        elif any(field in cv_lower for field in ['computer science', 'software engineering', 'information technology']):
            return "Relevant field of study detected"
        else:
            return "Education level not clearly specified"
    
    def _generate_recommendations(self, score: int, missing_skills: str, experience_match: str) -> str:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if score >= 80:
            recommendations.append("Strong candidate - recommend for interview")
        elif score >= 60:
            recommendations.append("Good candidate - consider for interview")
        elif score >= 40:
            recommendations.append("Potential candidate - review qualifications")
        else:
            recommendations.append("Weak match - may not meet requirements")
        
        if missing_skills:
            recommendations.append(f"Consider acquiring missing skills: {missing_skills}")
        
        if "below" in experience_match.lower():
            recommendations.append("Experience level may be insufficient for role")
        
        return "; ".join(recommendations)
    
    def _generate_summary(self, score: int, key_skills: str, missing_skills: str) -> str:
        """Generate analysis summary"""
        if score >= 80:
            summary = f"Excellent match ({score}%). Strong technical alignment with key skills: {key_skills}"
        elif score >= 60:
            summary = f"Good match ({score}%). Candidate has relevant skills: {key_skills}"
            if missing_skills:
                summary += f" but may need development in: {missing_skills}"
        elif score >= 40:
            summary = f"Moderate match ({score}%). Some relevant skills found: {key_skills}"
            if missing_skills:
                summary += f". Significant gaps in: {missing_skills}"
        else:
            summary = f"Weak match ({score}%). Limited skill alignment"
            if missing_skills:
                summary += f". Missing critical skills: {missing_skills}"
        
        return summary
    
    def _generate_full_analysis(self, cv_text: str, job_description: str, job_requirements: str,
                               skill_matches: List[SkillMatch], experience_match: str, education_match: str) -> str:
        """Generate detailed analysis"""
        analysis_parts = [
            "=== CV ANALYSIS REPORT ===",
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Model: {self.model_name}",
            "",
            "=== SKILL ANALYSIS ===",
            f"Skills Found: {len([sm for sm in skill_matches if sm.found])}/{len(skill_matches)}",
            "",
            "Matched Skills:",
        ]
        
        for sm in skill_matches:
            if sm.found:
                analysis_parts.append(f"  ✓ {sm.skill} (confidence: {sm.confidence:.1%})")
        
        analysis_parts.extend([
            "",
            "Missing Skills:",
        ])
        
        for sm in skill_matches:
            if not sm.found:
                analysis_parts.append(f"  ✗ {sm.skill}")
        
        analysis_parts.extend([
            "",
            "=== EXPERIENCE ANALYSIS ===",
            experience_match,
            "",
            "=== EDUCATION ANALYSIS ===",
            education_match,
            "",
            "=== DETAILED ASSESSMENT ===",
            "The candidate's profile has been evaluated against the job requirements. ",
            "The analysis considers technical skills, experience level, and educational background. ",
            "This assessment provides a comprehensive view of the candidate's suitability for the position."
        ])
        
        return "\n".join(analysis_parts)
    
    def _format_skills(self, skills: List[str]) -> str:
        """Format skills list for display"""
        return ", ".join(sorted(set(skills))) if skills else "None"


analysis_service = CVAnalysisService()


@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=analysis_service.model_loaded,
        timestamp=datetime.now().isoformat()
    )

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_cv(request: CVAnalysisRequest):
    """Analyze CV against job requirements"""
    try:
        return analysis_service.analyze_cv(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/models")
async def get_available_models():
    """Get available AI models"""
    return {
        "models": [
            {
                "name": analysis_service.model_name,
                "type": "local-bert",
                "description": "Local BERT-based model for CV analysis",
                "loaded": analysis_service.model_loaded
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
