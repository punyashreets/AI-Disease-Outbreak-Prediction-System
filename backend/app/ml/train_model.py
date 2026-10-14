"""
Random Forest Disease Outbreak Prediction Model
===============================================
Training script for the ML model used in disease outbreak prediction.
Uses multi-source data integration (weather, satellite, population, historical).
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

def generate_synthetic_data(n_samples=5000):
    """Generate synthetic training data for model training"""
    np.random.seed(42)
    
    data = {
        'temperature': np.random.uniform(15, 45, n_samples),
        'humidity': np.random.uniform(20, 98, n_samples),
        'rainfall': np.random.uniform(0, 300, n_samples),
        'ndvi': np.random.uniform(0.05, 0.9, n_samples),
        'land_surface_temp': np.random.uniform(20, 50, n_samples),
        'water_bodies': np.random.uniform(0, 0.8, n_samples),
        'population_density': np.random.uniform(100, 25000, n_samples),
        'urbanization': np.random.uniform(0.1, 1.0, n_samples),
        'historical_cases': np.random.poisson(50, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Generate labels based on risk factors
    risk_score = np.zeros(n_samples)
    risk_score += (df['temperature'] > 30).astype(float) * 0.15
    risk_score += (df['temperature'] > 35).astype(float) * 0.1
    risk_score += (df['humidity'] > 70).astype(float) * 0.2
    risk_score += (df['humidity'] > 85).astype(float) * 0.1
    risk_score += (df['rainfall'] > 50).astype(float) * 0.2
    risk_score += (df['rainfall'] > 100).astype(float) * 0.1
    risk_score += (df['ndvi'] > 0.5).astype(float) * 0.1
    risk_score += (df['water_bodies'] > 0.3).astype(float) * 0.1
    risk_score += (df['population_density'] > 5000).astype(float) * 0.15
    risk_score += (df['urbanization'] > 0.7).astype(float) * 0.1
    risk_score += (df['historical_cases'] > 100).astype(float) * 0.15
    
    # Add noise
    risk_score += np.random.normal(0, 0.05, n_samples)
    
    # Binary classification: outbreak (1) vs no outbreak (0)
    df['outbreak'] = (risk_score > 0.45).astype(int)
    
    return df


def train_model(df=None):
    """Train Random Forest model for disease outbreak prediction"""
    print("=" * 60)
    print("DISEASE OUTBREAK PREDICTION - MODEL TRAINING")
    print("=" * 60)
    
    if df is None:
        print("\n[1/5] Generating synthetic training data...")
        df = generate_synthetic_data(5000)
    
    features = ['temperature', 'humidity', 'rainfall', 'ndvi', 
                'land_surface_temp', 'water_bodies', 'population_density',
                'urbanization', 'historical_cases']
    
    X = df[features]
    y = df['outbreak']
    
    print(f"[2/5] Dataset: {X.shape[0]} samples, {X.shape[1]} features")
    print(f"      Class distribution: Outbreak={y.sum()}, No Outbreak={len(y)-y.sum()}")
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    print("[3/5] Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("[4/5] Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    print("[5/5] Evaluating model...")
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    metrics = {
        'accuracy': round(accuracy_score(y_test, y_pred), 4),
        'precision': round(precision_score(y_test, y_pred, zero_division=0), 4),
        'recall': round(recall_score(y_test, y_pred, zero_division=0), 4),
        'f1_score': round(f1_score(y_test, y_pred, zero_division=0), 4),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
    }
    
    print(f"\n{'=' * 40}")
    print("MODEL METRICS:")
    print(f"  Accuracy:   {metrics['accuracy']:.4f}")
    print(f"  Precision:  {metrics['precision']:.4f}")
    print(f"  Recall:     {metrics['recall']:.4f}")
    print(f"  F1 Score:   {metrics['f1_score']:.4f}")
    print(f"\nConfusion Matrix:")
    cm = metrics['confusion_matrix']
    print(f"  TN={cm[0][0]}  FP={cm[0][1]}")
    print(f"  FN={cm[1][0]}  TP={cm[1][1]}")
    
    # Feature importance
    print(f"\n{'=' * 40}")
    print("FEATURE IMPORTANCE:")
    importance = dict(zip(features, model.feature_importances_))
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feat:25s}: {imp:.4f}")
    
    # Save model and scaler
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, 'model.pkl')
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    metrics_path = os.path.join(model_dir, 'metrics.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(metrics, metrics_path)
    
    print(f"\n{'=' * 40}")
    print(f"Model saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    print(f"Metrics saved to: {metrics_path}")
    print(f"{'=' * 60}")
    
    return model, scaler, metrics


def load_model():
    """Load trained model and scaler"""
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, 'model.pkl')
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    
    if not os.path.exists(model_path):
        return None, None, None
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None
    metrics = joblib.load(os.path.join(model_dir, 'metrics.pkl')) if os.path.exists(os.path.join(model_dir, 'metrics.pkl')) else {}
    
    return model, scaler, metrics


def predict(features_dict):
    """Make prediction using trained model"""
    model, scaler, metrics = load_model()
    if model is None:
        return None
    
    feature_names = ['temperature', 'humidity', 'rainfall', 'ndvi', 
                     'land_surface_temp', 'water_bodies', 'population_density',
                     'urbanization', 'historical_cases']
    
    feature_array = np.array([[features_dict.get(f, 0) for f in feature_names]])
    
    if scaler:
        feature_array = scaler.transform(feature_array)
    
    prediction = model.predict(feature_array)[0]
    probability = model.predict_proba(feature_array)[0]
    
    risk_level = 'Low' if probability[1] < 0.35 else ('Medium' if probability[1] < 0.70 else 'High')
    
    return {
        'outbreak': bool(prediction),
        'probability': round(float(probability[1]), 4),
        'confidence': round(float(max(probability)), 4),
        'risk_level': risk_level,
        'model_metrics': metrics
    }


if __name__ == '__main__':
    train_model()
