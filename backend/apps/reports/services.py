from groq import Groq
from decouple import config
from typing import List
from apps.papers.models import Paper
from apps.papers.services import ArxivAPIClient


class ReportGenerator:
    """
    Generates AI-powered literature reviews using Groq + Llama
    """
    
    def __init__(self):
        api_key = config('GROQ_API_KEY')
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"
    
    def generate_literature_review(
        self, 
        topic: str, 
        papers: List[Paper],
        max_tokens: int = 4000
    ) -> str:
        """
        Generate comprehensive literature review from papers
        
        Args:
            topic: Research topic
            papers: List of Paper objects to analyze
            max_tokens: Maximum length of response
            
        Returns:
            Markdown-formatted literature review
        """
        
        # Build the prompt
        prompt = self._build_prompt(topic, papers)
        
        # Call Groq AI
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert academic research assistant. 
                    Generate comprehensive, well-structured literature reviews in Markdown format.
                    Be thorough, analytical, and identify research gaps."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        
        # Extract and return the generated review
        return response.choices[0].message.content
    
    def _build_prompt(self, topic: str, papers: List[Paper]) -> str:
        """
        Build the AI prompt from topic and papers
        
        Args:
            topic: Research topic
            papers: List of papers
            
        Returns:
            Formatted prompt string
        """
        
        # Extract paper information
        papers_text = ""
        for i, paper in enumerate(papers, 1):
            papers_text += f"\n\n### Paper {i}:\n"
            papers_text += f"**Title:** {paper.title}\n"
            papers_text += f"**Authors:** {paper.authors}\n"
            papers_text += f"**Published:** {paper.published_date}\n"
            papers_text += f"**Abstract:** {paper.abstract}\n"
        
        # Build the complete prompt
        prompt = f"""Generate a comprehensive literature review on the topic: "{topic}"

Based on the following {len(papers)} research papers:
{papers_text}

Please provide a literature review with the following sections:

## Overview
Provide a brief introduction to the topic and its significance in current research.

## Key Themes and Findings
Analyze the main themes, methodologies, and findings across the papers. Group related work together.

## Research Gaps
Identify what hasn't been addressed, contradictions, or areas needing further investigation.

## Future Directions
Suggest promising directions for future research based on the identified gaps.

## Summary
Provide a concise summary of the current state of research on this topic.

Format the review in clean Markdown with proper headers, lists, and emphasis where appropriate.
Be analytical and critical, not just descriptive.
"""
        
        return prompt
    
    def search_and_generate(
        self, 
        topic: str, 
        max_papers: int = 20
    ) -> tuple:
        """
        Complete workflow: Search papers + Generate review
        
        Args:
            topic: Research topic to search for
            max_papers: Maximum number of papers to analyze
            
        Returns:
            Tuple of (report_text, papers_list)
        """
    
        # Step 1: Search for papers using UnifiedSearchClient
        from apps.papers.services_unified import UnifiedSearchClient
        
        unified_client = UnifiedSearchClient()
        result = unified_client.search_and_save(topic, max_results=max_papers)
        
        saved_papers = result['papers']
        
        if not saved_papers:
            return "No papers found for this topic.", []
        
        # Step 2: Generate literature review
        report_text = self.generate_literature_review(topic, saved_papers)
        
        return report_text, saved_papers