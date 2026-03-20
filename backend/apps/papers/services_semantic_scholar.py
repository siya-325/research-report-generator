import requests
from typing import List, Dict
from datetime import datetime
from decouple import config
import time


class SemanticScholarAPIClient:
    """
    Client for Semantic Scholar Academic Graph API
    Documentation: https://api.semanticscholar.org/
    """
    
    BASE_URL = "https://api.semanticscholar.org/graph/v1"
    
    def __init__(self):
        # Get API key from environment (optional but recommended)
        self.api_key = config('SEMANTIC_SCHOLAR_API_KEY', default=None)
        self.headers = {}
        
        if self.api_key:
            self.headers['x-api-key'] = self.api_key
    
    def search(self, query: str, max_results: int = 10, fields: List[str] = None) -> List[Dict]:
        """
        Search papers on Semantic Scholar
        
        Args:
            query: Search query
            max_results: Maximum number of results (1-100)
            fields: List of fields to return
            
        Returns:
            List of paper dictionaries
        """
        
        if fields is None:
            fields = [
                'paperId',
                'title',
                'abstract',
                'authors',
                'year',
                'publicationDate',
                'citationCount',
                'influentialCitationCount',
                'url',
                'venue',
                'publicationTypes',
                'fieldsOfStudy',
            ]
        
        # Build search URL
        url = f"{self.BASE_URL}/paper/search"
        
        params = {
            'query': query,
            'limit': min(max_results, 500),  # API limit is 500
            'fields': ','.join(fields),
        }
        
        try:
            # Add delay to respect rate limits (if no API key)
            if not self.api_key:
                time.sleep(1)  # Wait 1 second between requests
            
            response = requests.get(url, params=params, headers=self.headers, timeout=30)
            
            # Check for rate limiting
            if response.status_code == 429:
                print("Rate limit hit. Waiting 60 seconds...")
                time.sleep(60)
                # Retry once
                response = requests.get(url, params=params, headers=self.headers, timeout=30)
            
            response.raise_for_status()
            
            data = response.json()
            papers = data.get('data', [])
            
            # Parse and format papers
            formatted_papers = [self._parse_paper(paper) for paper in papers]
            
            return formatted_papers
            
        except requests.exceptions.RequestException as e:
            print(f"Error searching Semantic Scholar: {e}")
            return []
    
    def _parse_paper(self, paper: Dict) -> Dict:
        """
        Parse Semantic Scholar paper into our format
        
        Args:
            paper: Raw paper data from API
            
        Returns:
            Formatted paper dictionary matching Paper model
        """
        
        # Extract authors
        authors_list = paper.get('authors', [])
        authors = ', '.join([author.get('name', 'Unknown') for author in authors_list])
        
        # Extract publication date
        pub_date = paper.get('publicationDate')
        if pub_date:
            try:
                published_date = datetime.strptime(pub_date, '%Y-%m-%d').date()
            except ValueError:
                # Try year only
                year = paper.get('year')
                if year:
                    published_date = datetime(year, 1, 1).date()
                else:
                    published_date = None
        else:
            year = paper.get('year')
            if year:
                published_date = datetime(year, 1, 1).date()
            else:
                published_date = None
        
        # Build external URL
        paper_id = paper.get('paperId')
        external_url = f"https://www.semanticscholar.org/paper/{paper_id}" if paper_id else ""
        
        # Build PDF URL (Semantic Scholar sometimes has this)
        pdf_url = ""
        if paper.get('openAccessPdf'):
            pdf_url = paper['openAccessPdf'].get('url', '')
        
        # Format into our Paper model structure
        formatted = {
            'title': paper.get('title', 'Untitled'),
            'authors': authors or 'Unknown',
            'abstract': paper.get('abstract', ''),
            'published_date': published_date,
            'source_api': 'semantic_scholar',
            'external_id': paper_id or '',
            'pdf_url': pdf_url,
            'external_url': external_url,
            'citation_count': paper.get('citationCount'),
            'api_data': {
                'paperId': paper_id,
                'year': paper.get('year'),
                'venue': paper.get('venue'),
                'publicationTypes': paper.get('publicationTypes', []),
                'fieldsOfStudy': paper.get('fieldsOfStudy', []),
                'influentialCitationCount': paper.get('influentialCitationCount'),
                'authors_detailed': authors_list,
            }
        }
        
        return formatted
    
    def get_paper_details(self, paper_id: str) -> Dict:
        """
        Get detailed information about a specific paper
        
        Args:
            paper_id: Semantic Scholar paper ID
            
        Returns:
            Paper details dictionary
        """
        
        url = f"{self.BASE_URL}/paper/{paper_id}"
        
        fields = [
            'paperId',
            'title',
            'abstract',
            'authors',
            'year',
            'publicationDate',
            'citationCount',
            'influentialCitationCount',
            'url',
            'venue',
            'publicationTypes',
            'fieldsOfStudy',
            'references',
            'citations',
        ]
        
        params = {'fields': ','.join(fields)}
        
        try:
            # Add delay to respect rate limits
            if not self.api_key:
                time.sleep(1)
            
            response = requests.get(url, params=params, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            paper = response.json()
            return self._parse_paper(paper)
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching paper details: {e}")
            return {}