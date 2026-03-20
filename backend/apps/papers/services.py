import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Optional


class ArxivAPIClient:
    """
    Client for interacting with arXiv API
    
    API Documentation: https://arxiv.org/help/api/index
    """
    
    BASE_URL = "http://export.arxiv.org/api/query"
    
    def __init__(self):
        self.session = requests.Session()
    
    def search(
        self, 
        query: str, 
        max_results: int = 10,
        start: int = 0
    ) -> List[Dict]:
        """
        Search arXiv for papers
        
        Args:
            query: Search query (e.g., "machine learning")
            max_results: Number of results to return (max 30000)
            start: Starting index for pagination
            
        Returns:
            List of paper dictionaries
        """
        # Build query parameters
        params = {
            'search_query': f'all:{query}',
            'start': start,
            'max_results': min(max_results, 30000),  # arXiv limit
            'sortBy': 'relevance',
            'sortOrder': 'descending'
        }
        
        try:
            # Make request
            response = self.session.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            # Parse XML response
            papers = self._parse_response(response.text)
            
            return papers
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching from arXiv: {e}")
            return []
    
    def _parse_response(self, xml_text: str) -> List[Dict]:
        """
        Parse arXiv XML response into list of paper dictionaries
        
        Args:
            xml_text: XML response from arXiv
            
        Returns:
            List of paper dictionaries
        """
        papers = []
        
        # Parse XML
        root = ET.fromstring(xml_text)
        
        # arXiv namespace
        ns = {
            'atom': 'http://www.w3.org/2005/Atom',
            'arxiv': 'http://arxiv.org/schemas/atom'
        }
        
        # Find all entry elements
        entries = root.findall('atom:entry', ns)
        
        for entry in entries:
            try:
                paper = self._parse_entry(entry, ns)
                papers.append(paper)
            except Exception as e:
                print(f"Error parsing entry: {e}")
                continue
        
        return papers
    
    def _parse_entry(self, entry, ns: dict) -> Dict:
        """
        Parse a single entry element into paper dictionary
        
        Args:
            entry: XML entry element
            ns: Namespace dictionary
            
        Returns:
            Paper dictionary
        """
        # Extract ID (e.g., "http://arxiv.org/abs/2301.12345" -> "2301.12345")
        arxiv_id = entry.find('atom:id', ns).text.split('/abs/')[-1]
        
        # Extract title
        title = entry.find('atom:title', ns).text.strip()
        
        # Extract authors
        authors = []
        for author in entry.findall('atom:author', ns):
            name = author.find('atom:name', ns).text
            authors.append(name)
        
        # Extract abstract/summary
        abstract = entry.find('atom:summary', ns).text.strip()
        
        # Extract published date
        published = entry.find('atom:published', ns).text
        published_date = self._parse_date(published)
        
        # Extract PDF link
        pdf_url = None
        for link in entry.findall('atom:link', ns):
            if link.get('title') == 'pdf':
                pdf_url = link.get('href')
                break
        
        # Extract categories
        categories = []
        for category in entry.findall('atom:category', ns):
            categories.append(category.get('term'))
        
        # Build paper dictionary
        paper = {
            'title': title,
            'authors': ', '.join(authors),  # Join as comma-separated string
            'abstract': abstract or '',
            'published_date': published_date,
            'source_api': 'arxiv',
            'external_id': arxiv_id,
            'pdf_url': pdf_url or f"http://arxiv.org/pdf/{arxiv_id}.pdf",
            'external_url': f"http://arxiv.org/abs/{arxiv_id}",
            'api_data': {
                'id': arxiv_id,
                'categories': categories,
                'primary_category': categories[0] if categories else None,
                'published': published,
            }
        }
        
        return paper
    
    def _parse_date(self, date_str: str) -> Optional[str]:
        """
        Parse arXiv date string to YYYY-MM-DD format
        
        Args:
            date_str: Date string from arXiv (e.g., "2023-01-15T00:00:00Z")
            
        Returns:
            Date string in YYYY-MM-DD format or None
        """
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.strftime('%Y-%m-%d')
        except:
            return None