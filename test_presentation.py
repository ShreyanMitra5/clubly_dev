from enhanced_slides_generator import generate_presentation

# Test parameters
club_type = "Python Club"
topic = "Introduction to Variables and Data Types"
week_number = 1
theme = "coding"  # Use the new coding theme for a code-inspired look

# Generate the presentation
filename = generate_presentation(club_type, topic, week_number, theme)
print(f"Generated presentation: {filename}") 