import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'super-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/disease_outbreak')
    
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
    EMAILJS_SERVICE_ID = os.getenv('EMAILJS_SERVICE_ID', '')
    EMAILJS_TEMPLATE_ID = os.getenv('EMAILJS_TEMPLATE_ID', '')
    EMAILJS_PUBLIC_KEY = os.getenv('EMAILJS_PUBLIC_KEY', '')
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
