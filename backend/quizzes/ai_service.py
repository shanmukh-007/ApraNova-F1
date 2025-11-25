import json
import requests
from django.conf import settings
from decouple import config


class AIQuizGenerator:
    """Service for generating quizzes using Google Gemini API"""
    
    def __init__(self):
        self.api_key = config('GEMINI_API_KEY', default='')
        # Using gemini-2.5-flash which is available
        self.api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    
    def generate_quiz_from_prompt(self, prompt, num_questions=5):
        """Generate quiz questions from a trainer's prompt"""
        system_prompt = f"""Generate {num_questions} multiple-choice quiz questions based on the following topic or prompt.

Topic/Prompt: {prompt}

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "question": "Question text here?",
    "type": "SINGLE",
    "answers": [
      {{"text": "Answer option 1", "correct": true}},
      {{"text": "Answer option 2", "correct": false}},
      {{"text": "Answer option 3", "correct": false}},
      {{"text": "Answer option 4", "correct": false}}
    ]
  }}
]

Rules:
- Each question must have 4 answer options
- For "SINGLE" type, only ONE answer should have "correct": true
- For "MULTIPLE" type, 2-3 answers can have "correct": true
- Make questions clear and educational
- Return ONLY the JSON array, no additional text"""
        
        return self._call_gemini_api(system_prompt)
    
    def generate_quiz_from_web_search(self, search_query, num_questions=5):
        """Generate quiz questions from web search results"""
        # First, get web content (simplified - in production use proper search API)
        search_content = self._perform_web_search(search_query)
        
        system_prompt = f"""Based on the following web content about "{search_query}", generate {num_questions} multiple-choice quiz questions.

Content:
{search_content}

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "question": "Question text here?",
    "type": "SINGLE",
    "answers": [
      {{"text": "Answer option 1", "correct": true}},
      {{"text": "Answer option 2", "correct": false}},
      {{"text": "Answer option 3", "correct": false}},
      {{"text": "Answer option 4", "correct": false}}
    ]
  }}
]

Rules:
- Each question must have 4 answer options
- For "SINGLE" type, only ONE answer should have "correct": true
- Base questions on the provided content
- Return ONLY the JSON array, no additional text"""
        
        return self._call_gemini_api(system_prompt)
    
    def _call_gemini_api(self, prompt):
        """Make API call to Google Gemini"""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not configured")
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048,
            }
        }
        
        try:
            print(f"[DEBUG] Calling Gemini API...")
            response = requests.post(
                f"{self.api_url}?key={self.api_key}",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            print(f"[DEBUG] Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"[ERROR] API Error Response: {response.text}")
                raise Exception(f"Gemini API returned status {response.status_code}: {response.text}")
            
            result = response.json()
            print(f"[DEBUG] Response received, parsing...")
            
            # Extract text from Gemini response
            if 'candidates' in result and len(result['candidates']) > 0:
                text = result['candidates'][0]['content']['parts'][0]['text']
                print(f"[DEBUG] Raw response text: {text[:200]}...")
                
                # Clean up the response - remove markdown code blocks if present
                text = text.strip()
                if text.startswith('```json'):
                    text = text[7:]
                if text.startswith('```'):
                    text = text[3:]
                if text.endswith('```'):
                    text = text[:-3]
                text = text.strip()
                
                print(f"[DEBUG] Cleaned text: {text[:200]}...")
                
                # Parse JSON
                questions = json.loads(text)
                print(f"[DEBUG] Successfully parsed {len(questions)} questions")
                return questions
            else:
                print(f"[ERROR] No candidates in response: {result}")
                raise ValueError("No response from Gemini API")
                
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Request exception: {str(e)}")
            raise Exception(f"API request failed: {str(e)}")
        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON decode error: {str(e)}")
            print(f"[ERROR] Text that failed to parse: {text}")
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {str(e)}")
            raise
    
    def _perform_web_search(self, query):
        """Perform web search and return content (simplified version)"""
        # In production, integrate with Google Custom Search API or Bing Search API
        # For now, return a placeholder that instructs Gemini to use its knowledge
        return f"""Generate educational content about: {query}
        
Use your knowledge to create accurate, informative quiz questions about this topic.
Focus on key concepts, definitions, and practical applications."""
