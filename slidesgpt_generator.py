import json
import requests
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class ClubData:
    name: str
    description: str
    mission: str
    goals: str
    user_role: str
    user_name: str

class SlidesGPTGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.slidesgpt.com"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def load_club_data_from_json(self, json_file_path: str) -> ClubData:
        """Load club data from a JSON file created by the onboarding process"""
        try:
            with open(json_file_path, 'r') as file:
                data = json.load(file)
            
            return ClubData(
                name=data.get('clubName', ''),
                description=data.get('description', ''),
                mission=data.get('mission', ''),
                goals=data.get('goals', ''),
                user_role=data.get('userRole', ''),
                user_name=data.get('userName', '')
            )
        except FileNotFoundError:
            raise FileNotFoundError(f"Club data file not found: {json_file_path}")
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON format in file: {json_file_path}")
    
    def create_club_prompt(self, club_data: ClubData, topic: str, week: int = None, presentation_type: str = "general") -> str:
        """Create a comprehensive prompt for SlidesGPT API using club data"""
        
        week_info = f" (Week {week})" if week else ""
        
        prompt = f"""
Create a professional presentation for {club_data.name}{week_info} about: {topic}

Club Information:
- Club Name: {club_data.name}
- Description: {club_data.description}
- Mission Statement: {club_data.mission}
- Goals & Objectives: {club_data.goals}
- User Role: {club_data.user_role}
- User Name: {club_data.user_name}

Presentation Requirements:
- Topic: {topic}
- Type: {presentation_type} presentation
- Target Audience: Club members and stakeholders
- Tone: Professional yet engaging
- Structure: Include introduction, main content sections, and conclusion
- Visual Style: Modern and clean design

Please create a presentation that:
1. Aligns with the club's mission and goals
2. Is appropriate for the user's role in the club
3. Provides valuable information about the topic
4. Engages the audience effectively
5. Includes relevant examples and practical applications

Make sure the content is tailored specifically for {club_data.name} and its members.
        """.strip()
        
        return prompt
    
    def generate_presentation(self, prompt: str, theme: str = "modern", slides_count: int = 10) -> Dict:
        """Generate a presentation using SlidesGPT API"""
        
        payload = {
            "prompt": prompt,
            "theme": theme,
            "slides_count": slides_count
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/generate",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"SlidesGPT API error: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error: {str(e)}")
    
    def download_presentation(self, presentation_id: str, output_path: str) -> bool:
        """Download the generated presentation"""
        try:
            response = requests.get(
                f"{self.base_url}/download/{presentation_id}",
                headers=self.headers,
                stream=True
            )
            
            if response.status_code == 200:
                with open(output_path, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        file.write(chunk)
                return True
            else:
                raise Exception(f"Download failed: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Download error: {str(e)}")
    
    def generate_club_presentation(self, 
                                 json_file_path: str, 
                                 topic: str, 
                                 week: Optional[int] = None,
                                 theme: str = "modern",
                                 slides_count: int = 10,
                                 output_path: str = None) -> Dict:
        """
        Complete workflow: Load club data, create prompt, generate and download presentation
        """
        
        # Load club data
        club_data = self.load_club_data_from_json(json_file_path)
        
        # Create prompt
        prompt = self.create_club_prompt(club_data, topic, week)
        
        # Generate presentation
        result = self.generate_presentation(prompt, theme, slides_count)
        
        # Download if output path is provided
        if output_path and result.get('presentation_id'):
            self.download_presentation(result['presentation_id'], output_path)
            result['downloaded_to'] = output_path
        
        return result

def main():
    """Example usage of the SlidesGPT generator"""
    
    # Configuration
    API_KEY = os.getenv('SLIDESGPT_API_KEY')
    if not API_KEY:
        print("Please set SLIDESGPT_API_KEY environment variable")
        return
    
    # Initialize generator
    generator = SlidesGPTGenerator(API_KEY)
    
    # Example usage
    try:
        # Load club data and generate presentation
        result = generator.generate_club_presentation(
            json_file_path="club_data_example.json",
            topic="Introduction to Machine Learning",
            week=1,
            theme="modern",
            slides_count=12,
            output_path="presentation.pptx"
        )
        
        print("Presentation generated successfully!")
        print(f"Result: {json.dumps(result, indent=2)}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 