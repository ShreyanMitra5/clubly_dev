import json
import requests
import os
import time
from datetime import datetime
from typing import Dict, List

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Install with: pip install python-dotenv")
    # Fallback: manually load .env file
    try:
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    except FileNotFoundError:
        pass

class SlidesGPTAPITester:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.slidesgpt.com"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.results = []
        self.success_count = 0
        self.failure_count = 0
    
    def make_api_call(self, call_number: int) -> Dict:
        """Make a single API call using the exact same format as production code"""
        
        # Simple test prompt similar to what would be used in production
        test_prompt = f"Create a 3-slide presentation about 'API Test Call #{call_number}' for a high school club. Include an introduction, main content, and conclusion."
        
        payload = {
            "prompt": test_prompt
        }
        
        try:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Making API call #{call_number}...")
            
            # Use the exact same endpoint and format as production code
            response = requests.post(
                f"{self.base_url}/v1/presentations/generate",
                headers=self.headers,
                json=payload,
                timeout=120  # Increased timeout for presentation generation
            )
            
            result = {
                "call_number": call_number,
                "timestamp": datetime.now().isoformat(),
                "status_code": response.status_code,
                "success": response.status_code == 200,
                "response_text": response.text[:300] + "..." if len(response.text) > 300 else response.text
            }
            
            if response.status_code == 200:
                self.success_count += 1
                print(f"✅ Call #{call_number} SUCCESS")
                # Try to parse response to see if it has download URL
                try:
                    response_data = response.json()
                    if 'download' in response_data:
                        print(f"   📥 Download URL: {response_data['download'][:50]}...")
                    if 'id' in response_data:
                        print(f"   🆔 Presentation ID: {response_data['id']}")
                except:
                    pass
            else:
                self.failure_count += 1
                print(f"❌ Call #{call_number} FAILED - Status: {response.status_code}")
                print(f"   Response: {response.text[:150]}...")
            
            return result
            
        except Exception as e:
            self.failure_count += 1
            error_result = {
                "call_number": call_number,
                "timestamp": datetime.now().isoformat(),
                "status_code": None,
                "success": False,
                "error": str(e)
            }
            print(f"❌ Call #{call_number} ERROR - {str(e)}")
            return error_result
    
    def run_test(self, total_calls: int = 100, delay_seconds: int = 10):
        """Run the API test with specified number of calls and delay"""
        
        print(f"🚀 Starting SlidesGPT API Test (Production Format)")
        print(f"📊 Total calls: {total_calls}")
        print(f"⏱️  Delay between calls: {delay_seconds} seconds")
        print(f"⏰ Estimated duration: {(total_calls * delay_seconds) / 60:.1f} minutes")
        print(f"🔑 API Key: {self.api_key[:10]}...{self.api_key[-4:]}")
        print(f"🌐 Endpoint: {self.base_url}/v1/presentations/generate")
        print("=" * 60)
        
        start_time = datetime.now()
        
        for i in range(1, total_calls + 1):
            result = self.make_api_call(i)
            self.results.append(result)
            
            # Don't sleep after the last call
            if i < total_calls:
                print(f"⏳ Waiting {delay_seconds} seconds before next call...")
                time.sleep(delay_seconds)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        self.print_summary(duration)
        self.save_results()
    
    def print_summary(self, duration_seconds: float):
        """Print a summary of the test results"""
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Successful calls: {self.success_count}")
        print(f"❌ Failed calls: {self.failure_count}")
        print(f"📈 Success rate: {(self.success_count / len(self.results)) * 100:.1f}%")
        print(f"⏱️  Total duration: {duration_seconds / 60:.1f} minutes")
        print(f"🔄 Average time per call: {duration_seconds / len(self.results):.1f} seconds")
        
        if self.success_count >= 100:
            print("\n🎉 SUCCESS: API limit appears to be removed!")
            print("   You can now make more than 100 calls on the free tier.")
            print("   Benjamin's changes (removing credit card) are working!")
        elif self.success_count > 0:
            print(f"\n⚠️  PARTIAL SUCCESS: {self.success_count}/100 calls worked")
            print("   The API limit might be partially removed or there are intermittent issues.")
        else:
            print("\n❌ FAILURE: No calls succeeded")
            print("   The API limit may still be in place or there are connectivity issues.")
        
        # Check for specific error patterns
        error_patterns = {}
        for result in self.results:
            if not result['success']:
                error_type = "Unknown"
                response_text = result.get('response_text', '').lower()
                if "limit" in response_text or "quota" in response_text:
                    error_type = "Rate Limit/Quota"
                elif "unauthorized" in response_text or "401" in str(result.get('status_code')):
                    error_type = "Unauthorized"
                elif "timeout" in str(result.get('error', '')).lower():
                    error_type = "Timeout"
                elif "429" in str(result.get('status_code')):
                    error_type = "Rate Limited (429)"
                
                error_patterns[error_type] = error_patterns.get(error_type, 0) + 1
        
        if error_patterns:
            print(f"\n🔍 Error Analysis:")
            for error_type, count in error_patterns.items():
                print(f"   {error_type}: {count} occurrences")
    
    def save_results(self):
        """Save test results to a JSON file"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"slidesgpt_api_test_results_{timestamp}.json"
        
        summary = {
            "test_info": {
                "total_calls": len(self.results),
                "successful_calls": self.success_count,
                "failed_calls": self.failure_count,
                "success_rate": (self.success_count / len(self.results)) * 100,
                "api_key_preview": f"{self.api_key[:10]}...{self.api_key[-4:]}",
                "endpoint": f"{self.base_url}/v1/presentations/generate",
                "test_date": datetime.now().isoformat()
            },
            "results": self.results
        }
        
        with open(filename, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Results saved to: {filename}")

def main():
    """Main function to run the API test"""
    
    # Get API key from environment variable
    API_KEY = os.getenv('SLIDESGPT_API_KEY')
    if not API_KEY:
        print("❌ Error: SLIDESGPT_API_KEY environment variable not set")
        print("Please set your SlidesGPT API key:")
        print("export SLIDESGPT_API_KEY='your_api_key_here'")
        return
    
    # Initialize tester
    tester = SlidesGPTAPITester(API_KEY)
    
    # Run the test
    try:
        tester.run_test(total_calls=100, delay_seconds=10)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        tester.print_summary(0)
        tester.save_results()
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")

if __name__ == "__main__":
    main() 