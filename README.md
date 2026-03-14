# 3D-Word-Cloud-Bala-Anjan-Kumar

## Overview

3D Word Cloud News Analyzer is a full-stack application that accepts a news article URL, extracts the article content, identifies important terms using TF-IDF, and visualizes the results as an interactive 3D word cloud.

The project is designed to be easy to run, easy to review, and easy to discuss in a technical interview.

## Features

- Analyze a news article from a public URL
- Extract article title, source domain, and estimated reading time
- Identify top phrases and weighted keyword terms using TF-IDF
- Render keywords in a deterministic 3D word cloud
- Support hover interaction, subtle motion, and orbit controls
- Provide a single root setup script to install dependencies and launch both apps

## Architecture Overview

User  
-> React Frontend  
-> `POST /analyze`  
-> FastAPI Backend  
-> article extraction  
-> TF-IDF keyword extraction  
-> JSON response  
-> React Three Fiber 3D visualization

## Tech Stack / Libraries Used

### Backend

- Python
- FastAPI
- newspaper3k
- trafilatura
- scikit-learn

### Frontend

- React
- TypeScript
- Vite
- React Three Fiber
- @react-three/drei
- Three.js

## How To Run

From the project root:

```bash
./setup.sh
```

This script will:

- create and reuse the backend virtual environment
- install backend dependencies from `backend/requirements.txt`
- install frontend dependencies with `npm install`
- start both development servers concurrently

Local URLs:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)

## Example Workflow

1. Start the project with `./setup.sh`
2. Open the frontend in the browser
3. Choose one of the sample article URLs or paste your own
4. Click **Analyze Article**
5. The frontend sends the URL to the backend
6. The backend extracts the article, runs TF-IDF keyword extraction, and returns structured JSON
7. The frontend displays article metadata, top phrases, and the interactive 3D word cloud

## Visualization Details

- Words are placed using a deterministic 3D layout for stable, repeatable rendering
- Word size scales based on TF-IDF weight
- Word color varies subtly with relevance
- Hover interaction highlights words and increases scale slightly
- The cloud includes subtle motion for readability and visual interest
- Orbit controls allow the user to rotate and zoom the scene

## Additional Notes / Design Decisions

- Article extraction uses `newspaper3k` as the primary strategy with `trafilatura` as a fallback to improve reliability across different news sites
- TF-IDF was chosen because it is lightweight, deterministic, and effective for single-document keyword extraction
- The visualization emphasizes readability and spatial clarity over visual noise
- The backend keeps route handling thin and separates extraction and NLP logic into focused modules

## Future Improvements

- Keyword clustering for related term grouping
- Semantic embeddings for richer topic relationships
- Smoother transitions between analyses
- Expanded metadata and article insight visualizations

## Author

Bala Anjan Kumar Guntupalli
