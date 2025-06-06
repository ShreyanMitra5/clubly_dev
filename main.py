from fastapi import FastAPI, UploadFile, File, Form, Depends, status, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil

# Assuming your presentation generation logic is in enhanced_slides_generator.py
from enhanced_slides_generator import generate_presentation, THEMES

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000", # Allow requests from your Next.js frontend development server
    # Add other origins if needed, e.g., your deployed frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Allow cookies/authentication headers to be sent
    allow_methods=["*"],    # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],    # Allow all headers
)

# Define the request body structure using Pydantic (implicitly via function parameters)

@app.post("/generate-slide")
async def generate_slide_endpoint(
    club: str = Form(...),
    topic: str = Form(...),
    week: int = Form(...), # Assuming week is an integer
    theme: str = Form(...), # Assuming theme is a string
    deepseek_key: str = Form(...), # OpenRouter key
    serpapi_key: str = Form(...)
):
    """Generate a PowerPoint slide presentation."""
    # Validate theme
    if theme not in THEMES:
        raise HTTPException(status_code=400, detail=f"Invalid theme. Available themes: {list(THEMES.keys())}")

    # Create a temporary directory to save the generated file
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        temp_filepath = os.path.join(temp_dir, "presentation.pptx")

        # Call your existing generation logic
        # The generate_presentation function now accepts API keys directly
        generated_filename = generate_presentation(
            club_type=club,
            topic=topic,
            week_number=week,
            theme=theme,
            openrouter_key=deepseek_key, # Pass deepseek_key as openrouter_key
            serpapi_key=serpapi_key
        )

        # Move the generated file to the temporary directory with a generic name
        shutil.move(generated_filename, temp_filepath)

        # Return the file as a StreamingResponse
        # We use a generic filename here for the download
        return FileResponse(path=temp_filepath, filename=f"{club.replace(' ', '_')}_Week{week}.pptx", media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")

    except Exception as e:
        # Clean up temporary directory if it was created
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        print(f"Error generating presentation: {e}") # Log the error server-side
        raise HTTPException(status_code=500, detail=f"Error generating presentation: {e}")

    finally:
        # Clean up temporary directory after sending the response
        # This part might need refinement depending on FileResponse behavior
        # A background task might be better for ensuring cleanup after response is sent
        # For now, simple cleanup in finally block after potential exception
        pass # Cleanup after FileResponse is sent is handled by the OS for tempfile or requires background task

# To run this application:
# Save the code as main.py
# Run in your terminal: uvicorn main:app --reload 