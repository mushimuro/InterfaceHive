import google.generativeai as genai
from decouple import config
import requests
import re
import json
from pathlib import Path
import os

class GeminiService:
    def __init__(self):
        # Attempt to read from frontend/.env first as requested
        api_key = None
        try:
            # Navigate from backend/apps/ai_agent/services.py to frontend/.env
            # services.py -> ai_agent -> apps -> backend -> root -> frontend
            current_file = Path(__file__).resolve()
            env_path = current_file.parents[3] / 'frontend' / '.env'
            
            if env_path.exists():
                with open(env_path, 'r') as f:
                    for line in f:
                        if '=' in line:
                            key, value = line.split('=', 1)
                            key = key.strip()
                            if key == 'GEMINI_API_KEY' or key == 'VITE_GEMINI_API_KEY':
                                api_key = value.strip().strip('"').strip("'")
                                break
        except Exception as e:
            print(f"Warning: Could not read frontend/.env: {e}")

        # Fallback to backend config
        if not api_key:
            api_key = config('GEMINI_API_KEY', default=None)

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in frontend/.env or backend environment")
            
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def _get_prompt_format(self):
        return """
        Return the response strictly as a JSON object with the following fields:
        {
            "title": "Project Title",
            "description": "Short description (min 50 chars)",
            "what_it_does": "Functional description",
            "inputs_dependencies": "Tech stack and dependencies",
            "desired_outputs": "What contributors should deliver",
            "difficulty": "EASY, INTERMEDIATE, or ADVANCED",
            "tags": ["tag1", "tag2"] (max 5)
        }
        """

    def generate_from_repo(self, github_url):
        # Extract owner/repo
        match = re.search(r'github\.com/([^/]+)/([^/]+)', github_url)
        if not match:
            raise ValueError("Invalid GitHub URL")
        
        owner, repo = match.groups()
        readme_content = ""
        
        # Use GitHub API to find the README (handles default branch and file name variations)
        api_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
        headers = {'Accept': 'application/vnd.github.v3+json'}
        
        # Determine if we have a token (optional, but assumes public repo if not)
        # We don't have a specific GITHUB_TOKEN env var set up in this plan, 
        # so we'll try unauthenticated first which works for public repos.
        
        response = requests.get(api_url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            download_url = data.get('download_url')
            if download_url:
                content_response = requests.get(download_url)
                if content_response.status_code == 200:
                    readme_content = content_response.text
        
        if not readme_content:
            # Fallback: try constructing raw URLs for common branches if API fails (e.g. rate limit)
            branches = ['main', 'master', 'develop']
            for branch in branches:
                url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md"
                response = requests.get(url)
                if response.status_code == 200:
                    readme_content = response.text
                    break

        if not readme_content:
             raise ValueError("Could not fetch README.md. Ensure the repository is public and has a README.")

        prompt = f"""
        Analyze this GitHub repository README and extract project details for a contribution request.
        GitHub URL: {github_url}
        README Content:
        {readme_content[:10000]} # Truncate if too long
        
        {self._get_prompt_format()}
        """
        
        response = self.model.generate_content(prompt)
        return self._parse_json_response(response.text)

    def generate_from_idea(self, idea):
        prompt = f"""
        Turn this project idea into a full contribution request specification.
        Idea: {idea}
        
        {self._get_prompt_format()}
        """
        
        response = self.model.generate_content(prompt)
        return self._parse_json_response(response.text)

    def _parse_json_response(self, text):
        # clean markdown code blocks if present
        clean_text = text.replace('```json', '').replace('```', '').strip()
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError:
            # Fallback or simple extraction
            start = clean_text.find('{')
            end = clean_text.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(clean_text[start:end])
            raise ValueError("Failed to parse AI response")
