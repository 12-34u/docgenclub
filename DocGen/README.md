# DocGen - AIML Club Document Generator

Automated document generation tool for AIML Club events. Generates professional notices, reports, and social media content using AI-powered text elaboration.

## Features

- **Event-based templates**: Generate notices, reports, and social media posts from event details
- **Multi-platform support**: Instagram, LinkedIn, WhatsApp, and more
- **AI-powered elaboration**: Intelligent content generation based on your input prompts
- **Graceful fallbacks**: Works even without AI API (uses template-based generation)
- **Word document export**: Download reports and notices as `.docx` files
- **Secure configuration**: Environment variables for sensitive data

## Tech Stack

- **Frontend**: React + Vite
- **Document Generation**: docx library
- **AI Integration**: Google Gemini API (optional)

## Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/docgen.git
cd docgen/DocGen/my-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Gemini API key (optional):
```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Usage

1. Click "Get started" on the homepage
2. Fill in event details:
   - Event Name
   - Event Date
   - Event Start/End Time
   - Event Venue
   - Event Duration
   - Event Flow (agenda/key points)
3. Select document type from the dropdown:
   - Notice (Word document)
   - Report (Word document)
   - Instagram (pre-event)
   - Instagram Post Event (post-event recap)
   - LinkedIn (professional announcement)
   - WhatsApp Invite (casual invitation)
   - WhatsApp Post Event (thank you message)
4. Click "Generate document"
5. For Word documents: File downloads automatically
6. For social media: Copy to clipboard and paste where needed

## Development

### Build
```bash
npm run build
```

### Lint
```bash
npm lint
```

### Preview Production Build
```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the `my-app` directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

- **VITE_GEMINI_API_KEY**: Your Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))
- **VITE_GEMINI_API_URL**: Gemini API endpoint (default provided)

If no API key is provided, the app uses built-in template-based fallbacks.

## Project Structure

```
DocGen/
├── my-app/
│   ├── src/
│   │   ├── App.jsx                 # Main app component
│   │   ├── documentGenerator.js    # AI and template generators
│   │   ├── App.css                 # Styling
│   │   └── index.css
│   ├── public/                     # Static assets
│   ├── .env                        # Environment variables (not in git)
│   ├── .env.example                # Example env file
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
└── server/                         # (Optional) Python backend for future use
```

## License

MIT

## Support

For issues or questions, please create an issue on the repository.
