# AI-Powered PowerPoint Generator

This tool automatically generates PowerPoint presentations for high school club meetings using AI-generated content and beautiful images from Unsplash.

## Features

- AI-generated presentation content using OpenRouter's API
- Beautiful images from Unsplash
- Multiple theme options (modern, dark, nature)
- Automatic slide creation with proper formatting
- Speaker notes for each slide
- PowerPoint (.pptx) output

## Prerequisites

- Python 3.7 or higher
- Unsplash API key
- OpenRouter API key

## Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys:
```
OPENROUTER_API_KEY=your_openrouter_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_api_key
```

## Usage

1. Run the script with your desired parameters:
```python
from enhanced_slides_generator import generate_presentation

# Example usage
club_type = "Python Club"
topic = "Introduction to Variables and Data Types"
week_number = 1
theme = "modern"  # Options: "modern", "dark", "nature"

filename = generate_presentation(club_type, topic, week_number, theme)
print(f"Generated presentation: {filename}")
```

2. The script will generate a PowerPoint presentation (.pptx file) in the current directory.

## Available Themes

- **Modern**: Clean, professional design with a light background
- **Dark**: Sleek, modern design with a dark background
- **Nature**: Fresh, organic design with nature-inspired colors

## Customization

You can customize the presentation by:
- Modifying the `THEMES` dictionary in the script
- Adjusting the slide templates in the `create_title_slide` and `create_content_slide` functions
- Changing the content generation prompts in the `generate_slide_content` function

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 