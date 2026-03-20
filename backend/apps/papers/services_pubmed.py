import requests
from typing import List, Dict
from datetime import datetime
from xml.etree import ElementTree as ET


class PubMedAPIClient:
    """
    Client for PubMed/NCBI E-utilities API
    Documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/
    """
    
    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    
    def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search PubMed for papers
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            List of paper dictionaries
        """
        
        # Step 1: Search for paper IDs
        paper_ids = self._search_ids(query, max_results)
        
        if not paper_ids:
            return []
        
        # Step 2: Fetch details for each paper
        papers = self._fetch_details(paper_ids)
        
        return papers
    
    def _search_ids(self, query: str, max_results: int) -> List[str]:
        """
        Search for PubMed IDs matching query
        
        Args:
            query: Search query
            max_results: Maximum results
            
        Returns:
            List of PubMed IDs
        """
        
        url = f"{self.BASE_URL}/esearch.fcgi"
        
        params = {
            'db': 'pubmed',
            'term': query,
            'retmax': max_results,
            'retmode': 'json'
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            id_list = data.get('esearchresult', {}).get('idlist', [])
            
            return id_list
            
        except requests.exceptions.RequestException as e:
            print(f"Error searching PubMed: {e}")
            return []
    
    def _fetch_details(self, paper_ids: List[str]) -> List[Dict]:
        """
        Fetch detailed information for paper IDs
        
        Args:
            paper_ids: List of PubMed IDs
            
        Returns:
            List of formatted paper dictionaries
        """
        
        if not paper_ids:
            return []
        
        url = f"{self.BASE_URL}/efetch.fcgi"
        
        params = {
            'db': 'pubmed',
            'id': ','.join(paper_ids),
            'retmode': 'xml'
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            # Parse XML
            root = ET.fromstring(response.content)
            
            papers = []
            for article in root.findall('.//PubmedArticle'):
                paper = self._parse_article(article)
                if paper:
                    papers.append(paper)
            
            return papers
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching PubMed details: {e}")
            return []
    
    def _parse_article(self, article: ET.Element) -> Dict:
        """
        Parse PubMed XML article into our format
        
        Args:
            article: XML element for article
            
        Returns:
            Formatted paper dictionary
        """
        
        try:
            # Extract PMID
            pmid = article.find('.//PMID')
            pmid_text = pmid.text if pmid is not None else ''
            
            # Extract title
            title_elem = article.find('.//ArticleTitle')
            title = title_elem.text if title_elem is not None else 'Untitled'
            
            # Extract abstract
            abstract_parts = article.findall('.//AbstractText')
            abstract = ' '.join([part.text for part in abstract_parts if part.text]) or ''
            
            # Extract authors
            author_list = article.findall('.//Author')
            authors = []
            for author in author_list:
                last_name = author.find('LastName')
                fore_name = author.find('ForeName')
                if last_name is not None and fore_name is not None:
                    authors.append(f"{fore_name.text} {last_name.text}")
            authors_str = ', '.join(authors) if authors else 'Unknown'
            
            # Extract publication date
            pub_date = article.find('.//PubDate')
            published_date = None
            if pub_date is not None:
                year = pub_date.find('Year')
                month = pub_date.find('Month')
                day = pub_date.find('Day')
                
                if year is not None:
                    year_int = int(year.text)
                    month_int = self._parse_month(month.text if month is not None else '1')
                    day_int = int(day.text) if day is not None else 1
                    
                    try:
                        published_date = datetime(year_int, month_int, day_int).date()
                    except ValueError:
                        published_date = datetime(year_int, 1, 1).date()
            
            # Extract journal
            journal = article.find('.//Journal/Title')
            journal_name = journal.text if journal is not None else ''
            
            # Build URLs
            external_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid_text}/"
            pdf_url = ""  # PubMed doesn't directly provide PDFs
            
            # Format into our structure
            formatted = {
                'title': title,
                'authors': authors_str,
                'abstract': abstract,
                'published_date': published_date,
                'source_api': 'pubmed',
                'external_id': pmid_text,
                'pdf_url': pdf_url,
                'external_url': external_url,
                'citation_count': None,  # PubMed doesn't provide this
                'api_data': {
                    'pmid': pmid_text,
                    'journal': journal_name,
                }
            }
            
            return formatted
            
        except Exception as e:
            print(f"Error parsing PubMed article: {e}")
            return None
    
    def _parse_month(self, month_str: str) -> int:
        """Convert month name to number"""
        months = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
            'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
            'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        }
        return months.get(month_str, 1)