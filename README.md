# DocGen Club - AI-Powered Document Generator v1.0

An intelligent document generation platform for AIML Club events, powered by Google Gemini AI. Generate professional notices, reports, and social media content for various platforms.

## Features

- **Document Generation**: Create professional notices and event reports with AI
- **Social Media Content**: Generate optimized posts for Instagram, LinkedIn, and WhatsApp
- **Smart Templates**: Pre and post-event content for different platforms
- **AI-Powered**: Uses Google Gemini 1.5-Pro for high-quality content generation
- **Easy to Use**: Simple form-based interface with persistent data storage

## Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool
- **Zustand** - State management with persistence
- **docx.js** - Word document generation

### Backend
- **FastAPI** - High-performance Python web framework
- **Google Gemini API** - AI content generation
- **Python 3.9+** - Backend runtime

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd docgenclub
```

### 2. Backend Setup

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "PORT=3001" >> .env
echo "HOST=0.0.0.0" >> .env

# Start the server
python main.py
```

The backend will run on http://localhost:3001

### 3. Frontend Setup

```bash
cd ../my-app

# Install dependencies
npm install

# Create .env file  
echo "VITE_GENERATOR_API=http://localhost:3001" > .env

# Start development server
npm run dev
```

The frontend will run on http://localhost:5173

## Environment Variables

### Backend (`server/.env`)
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
HOST=0.0.0.0
```

### Frontend (`my-app/.env`)
```env
VITE_GENERATOR_API=http://localhost:3001
```

For production, update `VITE_GENERATOR_API` to your deployed backend URL.

## Document Types Supported

1. **Notice** - Formal event announcements
2. **Report** - Comprehensive event reports
3. **Instagram** - Pre-event announcement posts
4. **Instagram Post Event** - Post-event recap posts
5. **LinkedIn** - Professional event announcements
6. **WhatsApp Invite** - Friendly event invitations
7. **WhatsApp Post Event** - Thank you and recap messages

## Usage

1. Click "Get started" on the homepage
2. Fill in event details:
   - Event Name
   - Event Date
   - Event Start/End Time
   - Event Venue
   - Event Flow (agenda/key points)
   - Speakers (optional)
3. Select document type from the dropdown
4. Click "Generate document"
5. For Word documents: File downloads automatically
6. For social media: Copy to clipboard and paste

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variable:
   - `VITE_GENERATOR_API`: Your backend API URL
4. Deploy!

### Backend Options

#### Option 1: Railway
1. Connect your GitHub repository
2. Set the root directory to `server`
3. Add environment variables (GEMINI_API_KEY, PORT, HOST)
4. Deploy

#### Option 2: Render
1. Create a new Web Service
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python main.py`
4. Add environment variables
5. Deploy

## API Endpoints

### Health Check
```
GET /health
```

### Generate Content
```
POST /generate
```

**Request Body:**
```json
{
  "docType": "report",
  "formData": {
    "eventName": "Machine Learning Workshop",
    "eventDate": "2026-03-15",
    "eventStartTime": "10:00",
    "eventEndTime": "13:00",
    "eventVenue": "Lab 301",
    "eventFlow": "Introduction, hands-on coding, Q&A"
  }
}
```

## Development

### Frontend
```bash
cd my-app
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
cd server
python main.py   # Start FastAPI server
```

## Project Structure

```
docgenclub/
├── my-app/              # Frontend React application
│   ├── src/
│   │   ├── App.jsx      # Main application component
│   │   ├── documentGenerator.js  # Document generation logic
│   │   ├── backendClient.js      # API client
│   │   └── formStore.js          # State management
│   └── package.json
├── server/              # Backend FastAPI application
│   ├── main.py          # API server
│   ├── generator.py     # Content generation logic
│   └── requirements.txt
└── vercel.json          # Deployment config
```

## Version History

### v1.0.0 (March 2026)
- Initial release
- Migrated from GROQ to Google Gemini AI
- Improved prompts for all document types
- Enhanced WhatsApp invite with detailed formatting
- Added comprehensive error handling
- Environment-based configuration
- Production-ready deployment setup

## Troubleshooting

### Backend Issues
- **API Key Error**: Ensure GEMINI_API_KEY is set in server/.env
- **Port Conflict**: Change PORT in .env if 3001 is occupied

### Frontend Issues
- **API Connection Failed**: Check VITE_GENERATOR_API in my-app/.env
- **Build Errors**: Clear node_modules: `rm -rf node_modules && npm install`

## License

MIT License

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: AIML Club, APSIT

---

**Built with ❤️ by AIML Club, APSIT**
