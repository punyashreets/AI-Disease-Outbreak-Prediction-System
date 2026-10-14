# Disease Outbreak Prediction System

A web application for disease monitoring and outbreak-risk prediction, with a focus on Karnataka. The system combines a React frontend, Flask API, MongoDB, and machine-learning tools for exploring disease data.

## Features

- Disease monitoring dashboards and risk visualizations
- Karnataka district and disease data views
- Dataset upload and prediction tools
- Citizen and administrator pages
- Health information, alerts, and reports

## Technology

- Frontend: React, Vite, Material UI
- Backend: Python, Flask
- Database: MongoDB
- Data and machine learning: Pandas, NumPy, scikit-learn

## Requirements

- Node.js and npm
- Python 3.10 or newer
- MongoDB, running locally or available through a connection URI

## Installation

Install frontend dependencies from the project root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
python -m pip install -r requirements.txt
```

## Configuration

Create a `backend/.env` file and set your local configuration:

```env
MONGO_URI=mongodb://localhost:27017/disease_outbreak
SECRET_KEY=replace-with-a-local-secret
JWT_SECRET_KEY=replace-with-a-local-secret
```

Do not commit secrets or private configuration files to GitHub.

## Run the Application

Start the backend in one terminal:

```bash
cd backend
python run.py
```

Start the frontend in a second terminal from the project root:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:3000`.

The Flask API runs at `http://localhost:5000`.

## Dataset Format

The dataset manager expects a CSV with these columns:

```text
disease_name, state, district, cases, deaths, recovered, date
```

Use a date format that Pandas can parse, such as `YYYY-MM-DD`. Do not upload datasets containing personal or sensitive health information.

## Project Structure

```text
src/                 React frontend
backend/app/         Flask application, routes, and models
backend/data/        Backend data files
backend/ml/          Dataset and machine-learning files
```

## Notes

This project is intended for monitoring and informational purposes. Predictions should not be treated as medical advice or a substitute for guidance from public-health professionals.

## License

Add a license before distributing or reusing this project.
