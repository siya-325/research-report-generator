from typing import List, Dict
from .services import ArxivAPIClient
from .services_semantic_scholar import SemanticScholarAPIClient
from .services_pubmed import PubMedAPIClient
from .models import Paper


class UnifiedSearchClient:
    """
    Unified search across multiple academic paper sources
    Combines arXiv, Semantic Scholar, and PubMed results
    """
    
    def __init__(self):
        self.arxiv_client = ArxivAPIClient()
        self.semantic_scholar_client = SemanticScholarAPIClient()
        self.pubmed_client = PubMedAPIClient()
    
    def search(
    self, 
    query: str, 
    max_results: int = 30,
    sources: List[str] = None
    ) -> Dict:
        """
        Search across multiple sources and combine results

        Args:
        query: Search query
        max_results: Total number of results to return
        sources: List of sources ['arxiv', 'semantic_scholar', 'pubmed']
        If None, searches all sources

        Returns:
        Dictionary with combined results and statistics
        """
    
        if sources is None:
            sources = ['arxiv', 'semantic_scholar', 'pubmed']
        
        results = {
            'query': query,
            'total_found': 0,
            'papers': [],
            'sources_searched': sources,
            'breakdown': {}
        }
        
        # Calculate base results per source and remainder
        num_sources = len(sources)
        base_per_source = max_results // num_sources
        remainder = max_results % num_sources
        
        # Distribute results: base amount + 1 extra for first 'remainder' sources
        results_distribution = {}
        for i, source in enumerate(sources):
            if i < remainder:
                results_distribution[source] = base_per_source + 1
            else:
                results_distribution[source] = base_per_source
        
        # Search arXiv
        if 'arxiv' in sources:
            arxiv_count = results_distribution['arxiv']
            arxiv_papers = self.arxiv_client.search(query, max_results=arxiv_count)
            results['papers'].extend(arxiv_papers)
            results['breakdown']['arxiv'] = len(arxiv_papers)
        
        # Search Semantic Scholar
        if 'semantic_scholar' in sources:
            ss_count = results_distribution['semantic_scholar']
            ss_papers = self.semantic_scholar_client.search(query, max_results=ss_count)
            results['papers'].extend(ss_papers)
            results['breakdown']['semantic_scholar'] = len(ss_papers)
        
        # Search PubMed
        if 'pubmed' in sources:
            pubmed_count = results_distribution['pubmed']
            pubmed_papers = self.pubmed_client.search(query, max_results=pubmed_count)
            results['papers'].extend(pubmed_papers)
            results['breakdown']['pubmed'] = len(pubmed_papers)
        
        results['total_found'] = len(results['papers'])
        
        # Sort by citation count (if available) then by date
        results['papers'] = self._sort_papers(results['papers'])
        
        return results
    
    def _sort_papers(self, papers: List[Dict]) -> List[Dict]:
        """
        Sort papers by relevance (citation count + recency)
        
        Args:
            papers: List of paper dictionaries
        
        Returns:
            Sorted list of papers
        """
        
        def sort_key(paper):
            # Use citation count if available, otherwise 0
            citations = paper.get('citation_count') or 0
            
            # Use published date if available
            pub_date = paper.get('published_date')
            if pub_date:
                # Convert date to timestamp for sorting
                year_score = pub_date.year if hasattr(pub_date, 'year') else 2000
            else:
                year_score = 2000
            
            # Combine citation count (weighted) and recency
            # Higher citations + more recent = higher score
            return (citations * 0.7) + (year_score * 0.3)
        
        return sorted(papers, key=sort_key, reverse=True)
    
    def search_and_save(
        self, 
        query: str, 
        max_results: int = 30,
        sources: List[str] = None
    ) -> Dict:
        """
        Search and save papers to database
        
        Args:
            query: Search query
            max_results: Total number of results
            sources: List of sources to search
        
        Returns:
            Dictionary with results and save statistics
        """
        
        # Search across sources
        search_results = self.search(query, max_results, sources)
        
        # Save papers to database
        saved_papers = []
        new_count = 0
        existing_count = 0
        
        for paper_data in search_results['papers']:
            paper, created = Paper.objects.get_or_create(
                source_api=paper_data['source_api'],
                external_id=paper_data['external_id'],
                defaults=paper_data
            )
            
            saved_papers.append(paper)
            
            if created:
                new_count += 1
            else:
                existing_count += 1
        
        return {
            'query': query,
            'total_found': search_results['total_found'],
            'new_papers': new_count,
            'existing_papers': existing_count,
            'papers': saved_papers,
            'breakdown': search_results['breakdown']
        }