#!/usr/bin/env python3
"""
Production SlidesGPT Generator for Clubly
This script loads club data from JSON files and generates presentations using SlidesGPT API.
"""

import json
import os
import sys
import requests
from typing import Dict, Optional, List
from dataclasses import dataclass
from pathlib import Path
import argparse

@dataclass
class ClubData:
    clubId: str
    userId: str
    userName: str
    userRole: str
    clubName: str
    description: str
    mission: str
    goals: str
    createdAt: str
    updatedAt: str

class ProductionSlidesGPTGenerator:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('SLIDESGPT_API_KEY')
        if not self.api_key:
            raise ValueError("SlidesGPT API key is required. Set SLIDESGPT_API_KEY environment variable or pass it to constructor.")
        
        self.base_url = "https://api.slidesgpt.com"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def load_club_data_from_file(self, json_file_path: str) -> ClubData:
        """Load club data from a JSON file"""
        try:
            with open(json_file_path, 'r') as file:
                data = json.load(file)
            
            return ClubData(
                clubId=data.get('clubId', ''),
                userId=data.get('userId', ''),
                userName=data.get('userName', ''),
                userRole=data.get('userRole', ''),
                clubName=data.get('clubName', ''),
                description=data.get('description', ''),
                mission=data.get('mission', ''),
                goals=data.get('goals', ''),
                createdAt=data.get('createdAt', ''),
                updatedAt=data.get('updatedAt', '')
            )
        except FileNotFoundError:
            raise FileNotFoundError(f"Club data file not found: {json_file_path}")
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON format in file: {json_file_path}")
    
    def find_club_file(self, club_name: str, data_directory: str = "data/clubs") -> str:
        """Find a club JSON file by club name"""
        data_path = Path(data_directory)
        
        if not data_path.exists():
            raise FileNotFoundError(f"Data directory not found: {data_directory}")
        
        # Search through all user directories
        for user_dir in data_path.iterdir():
            if user_dir.is_dir():
                for club_file in user_dir.glob("*.json"):
                    try:
                        with open(club_file, 'r') as f:
                            club_data = json.load(f)
                            if club_data.get('clubName') == club_name:
                                return str(club_file)
                    except (json.JSONDecodeError, KeyError):
                        continue
        
        raise FileNotFoundError(f"Club '{club_name}' not found in {data_directory}")
    
    def create_presentation_prompt(self, club_data: ClubData, topic: str, week: Optional[int] = None) -> str:
        """Create a comprehensive prompt for SlidesGPT API"""
        
        week_info = f" (Week {week})" if week else ""
        
        prompt = f"""
Create a professional presentation for {club_data.clubName}{week_info} about: {topic}

Club Information:
- Club Name: {club_data.clubName}
- Description: {club_data.description}
- Mission Statement: {club_data.mission}
- Goals & Objectives: {club_data.goals}
- User Role: {club_data.userRole}
- User Name: {club_data.userName}

Presentation Requirements:
- Topic: {topic}
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

Make sure the content is tailored specifically for {club_data.clubName} and its members.
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
                                 club_name: str, 
                                 topic: str, 
                                 week: Optional[int] = None,
                                 theme: str = "modern",
                                 slides_count: int = 10,
                                 output_path: Optional[str] = None,
                                 data_directory: str = "data/clubs") -> Dict:
        """
        Complete workflow: Find club file, load data, create prompt, generate and download presentation
        """
        
        # Find and load club data
        club_file_path = self.find_club_file(club_name, data_directory)
        club_data = self.load_club_data_from_file(club_file_path)
        
        print(f"Loaded club data for: {club_data.clubName}")
        print(f"User: {club_data.userName} ({club_data.userRole})")
        
        # Create prompt
        prompt = self.create_presentation_prompt(club_data, topic, week)
        print(f"Created prompt for topic: {topic}")
        
        # Generate presentation
        result = self.generate_presentation(prompt, theme, slides_count)
        print("Presentation generated successfully!")
        
        # Download if output path is provided
        if output_path and result.get('presentation_id'):
            self.download_presentation(result['presentation_id'], output_path)
            result['downloaded_to'] = output_path
            print(f"Presentation downloaded to: {output_path}")
        
        return result

def main():
    """Command-line interface for the SlidesGPT generator"""
    parser = argparse.ArgumentParser(description='Generate presentations using SlidesGPT API with club data')
    parser.add_argument('--club', required=True, help='Name of the club')
    parser.add_argument('--topic', required=True, help='Presentation topic')
    parser.add_argument('--week', type=int, help='Week number (optional)')
    parser.add_argument('--theme', default='modern', help='Presentation theme (default: modern)')
    parser.add_argument('--slides', type=int, default=10, help='Number of slides (default: 10)')
    parser.add_argument('--output', help='Output file path for downloaded presentation')
    parser.add_argument('--data-dir', default='data/clubs', help='Directory containing club data (default: data/clubs)')
    parser.add_argument('--api-key', help='SlidesGPT API key (or set SLIDESGPT_API_KEY environment variable)')
    
    args = parser.parse_args()
    
    try:
        # Initialize generator
        generator = ProductionSlidesGPTGenerator(args.api_key)
        
        # Generate presentation
        result = generator.generate_club_presentation(
            club_name=args.club,
            topic=args.topic,
            week=args.week,
            theme=args.theme,
            slides_count=args.slides,
            output_path=args.output,
            data_directory=args.data_dir
        )
        
        print("\n=== Generation Result ===")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 