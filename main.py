from fastapi import FastAPI, UploadFile, File, Form, Depends, status, HTTPException, BackgroundTasks
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
    "https://club-ai-eta.vercel.app", # Allow requests from the deployed Vercel frontend
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
    background_tasks: BackgroundTasks,
    club: str = Form(...),
    topic: str = Form(...),
    week: int = Form(...), # Assuming week is an integer
    deepseek_key: str = Form(...), # OpenRouter key
    serpapi_key: str = Form(...),
    theme: str = Form(...), # Assuming theme is a string
):
    """Generate a PowerPoint slide presentation."""
    # Validate theme
    if theme not in THEMES:
        raise HTTPException(status_code=400, detail=f"Invalid theme. Available themes: {list(THEMES.keys())}")

    # Create a temporary directory to save the generated file
    temp_dir = None
    temp_filepath = None # Initialize temp_filepath
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

        # Add cleanup task to background tasks
        # Use a function that removes the directory
        def remove_temp_dir(dir_path: str):
            if os.path.exists(dir_path):
                print(f"Cleaning up temporary directory: {dir_path}") # Debug print
                shutil.rmtree(dir_path)

        background_tasks.add_task(remove_temp_dir, temp_dir)

        # Return the file as a FileResponse
        # FileResponse handles setting Content-Disposition and streaming the file
        return FileResponse(path=temp_filepath, filename=f"{club.replace(' ', '_')}_Week{week}.pptx", media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")

    except Exception as e:
        # Clean up temporary directory immediately if an exception occurs before FileResponse is returned
        if temp_dir and os.path.exists(temp_dir):
             print(f"Cleaning up temporary directory due to error: {temp_dir}") # Debug print
             shutil.rmtree(temp_dir)
        print(f"Error generating presentation: {e}") # Log the error server-side
        raise HTTPException(status_code=500, detail=f"Error generating presentation: {e}")

# To run this application:
# Save the code as main.py
# Run in your terminal: uvicorn main:app --reload 