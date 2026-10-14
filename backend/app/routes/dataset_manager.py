from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os
import csv
import io
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

dataset_bp = Blueprint('dataset_manager', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
CSV_STORE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'dataset.csv')
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'dataset_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'dataset_scaler.pkl')

COLUMNS = ['disease_name', 'state', 'district', 'cases', 'deaths', 'recovered', 'date']

FEATURE_NAMES = ['total_cases', 'total_deaths', 'case_fatality_rate',
                 'recovery_rate', 'avg_monthly_cases', 'peak_cases', 'case_growth_rate']


def _load_csv_as_df(path):
    """Load a CSV file into a pandas DataFrame with robust type handling."""
    df = pd.read_csv(path, dtype=str)
    for col in ['cases', 'deaths', 'recovered']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
    return df


def _load_from_mongodb(db):
    """Load disease records from MongoDB into a pandas DataFrame (fallback when no CSV)."""
    from app.models.data_models import DiseaseRecord
    records = list(db[DiseaseRecord.COLLECTION].find({}))
    if not records:
        return pd.DataFrame(columns=COLUMNS)
    df = pd.DataFrame(list(records))
    for col in ['cases', 'deaths', 'recovered']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
    else:
        df['date'] = pd.to_datetime('2025-01-01')
    return df


def _filter_karnataka(df, district=None):
    """Filter the DataFrame for Karnataka (optionally a specific district)."""
    mask = df['state'].str.strip().str.lower() == 'karnataka' if 'state' in df.columns else pd.Series(False, index=df.index)
    if district:
        mask = mask & (df['district'].str.strip().str.lower() == district.strip().lower())
    return df[mask].copy()


def _compute_features(group):
    """Compute ML features for a single disease group within a location."""
    total_cases = int(group['cases'].sum())
    total_deaths = int(group['deaths'].sum())
    total_recovered = int(group['recovered'].sum())
    case_fatality_rate = round(total_deaths / total_cases, 4) if total_cases > 0 else 0
    recovery_rate = round(total_recovered / total_cases, 4) if total_cases > 0 else 0

    monthly = group.groupby(group['date'].dt.to_period('M'))['cases'].sum() if not group['date'].isna().all() else group['cases']
    avg_monthly = round(float(monthly.mean()), 2) if len(monthly) > 0 else 0
    peak_cases = int(monthly.max()) if len(monthly) > 0 else total_cases

    if len(monthly) >= 2:
        last = monthly.iloc[-1]
        prev = monthly.iloc[:-1].mean()
        case_growth_rate = round(float((last - prev) / prev), 4) if prev > 0 else 0
    else:
        case_growth_rate = 0.0 if total_cases <= 0 else 1.0

    return {
        'total_cases': total_cases,
        'total_deaths': total_deaths,
        'case_fatality_rate': case_fatality_rate,
        'recovery_rate': recovery_rate,
        'avg_monthly_cases': avg_monthly,
        'peak_cases': peak_cases,
        'case_growth_rate': case_growth_rate,
    }


def _train_model(df):
    """Train a RandomForest on aggregated disease features for a given dataset."""
    features_list = []
    diseases = []
    for disease, group in df.groupby('disease_name'):
        feats = _compute_features(group)
        feats['disease_name'] = disease
        features_list.append(feats)
        diseases.append(disease)

    if not features_list:
        return None, None, {}

    feat_df = pd.DataFrame(features_list)
    X = feat_df[FEATURE_NAMES].values

    # Label: outbreak (1) if cases exceed median, else 0
    threshold = feat_df['total_cases'].median()
    y = (feat_df['total_cases'] > threshold).astype(int).values

    # Ensure both classes exist for training
    if len(np.unique(y)) < 2:
        y = (feat_df['total_cases'] > 0).astype(int).values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42, class_weight='balanced'
    )
    model.fit(X_scaled, y)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    return model, scaler, feat_df.to_dict('records')


def _predict_top_diseases(df, model, scaler):
    """Use the trained model to rank diseases by outbreak probability."""
    results = []
    feat_records = []
    for disease, group in df.groupby('disease_name'):
        feats = _compute_features(group)
        feats['disease_name'] = disease
        feat_records.append(feats)

    if not feat_records or model is None:
        return []

    feat_df = pd.DataFrame(feat_records)
    X = feat_df[FEATURE_NAMES].values
    X_scaled = scaler.transform(X)
    probs = model.predict_proba(X_scaled)[:, 1]

    for i, disease in enumerate(feat_df['disease_name']):
        results.append({
            'disease': disease,
            'probability': round(float(probs[i]), 4),
            'total_cases': int(feat_df.iloc[i]['total_cases']),
            'total_deaths': int(feat_df.iloc[i]['total_deaths']),
            'case_fatality_rate': float(feat_df.iloc[i]['case_fatality_rate']),
            'recovery_rate': float(feat_df.iloc[i]['recovery_rate']),
            'avg_monthly_cases': float(feat_df.iloc[i]['avg_monthly_cases']),
            'peak_cases': int(feat_df.iloc[i]['peak_cases']),
            'case_growth_rate': float(feat_df.iloc[i]['case_growth_rate']),
        })

    results.sort(key=lambda x: x['probability'], reverse=True)
    return results


def _health_advisory(disease):
    advisories = {
        'Dengue': {'prevention': ['Remove stagnant water', 'Use mosquito repellents', 'Wear full-sleeve clothes', 'Use window screens'],
                     'symptoms': ['High fever', 'Severe headache', 'Pain behind eyes', 'Joint pain', 'Rash']},
        'Malaria': {'prevention': ['Use mosquito nets', 'Wear full-sleeve clothes', 'Apply insect repellent', 'Sleep in screened rooms'],
                    'symptoms': ['Fever with chills', 'Headache', 'Nausea', 'Sweating', 'Body ache']},
        'Cholera': {'prevention': ['Drink boiled water', 'Wash hands frequently', 'Eat freshly cooked food', 'Maintain hygiene'],
                    'symptoms': ['Watery diarrhea', 'Vomiting', 'Leg cramps', 'Dehydration']},
        'Typhoid': {'prevention': ['Drink purified water', 'Wash hands before eating', 'Avoid street food', 'Get vaccinated'],
                    'symptoms': ['Prolonged fever', 'Headache', 'Abdominal pain', 'Constipation or diarrhea']},
        'Influenza': {'prevention': ['Get flu vaccine', 'Cover mouth while coughing', 'Wash hands frequently', 'Avoid close contact'],
                      'symptoms': ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue']},
        'COVID-19': {'prevention': ['Wear masks', 'Maintain social distance', 'Sanitize hands', 'Get vaccinated'],
                     'symptoms': ['Fever', 'Dry cough', 'Loss of taste/smell', 'Difficulty breathing']},
        'Leptospirosis': {'prevention': ['Avoid contact with floodwater', 'Wear protective clothing', 'Cover wounds', 'Rodent control'],
                          'symptoms': ['High fever', 'Headache', 'Muscle pain', 'Red eyes', 'Jaundice']},
    }
    return advisories.get(disease, advisories['Dengue'])


@dataset_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_csv():
    """Upload a disease dataset CSV and store it for model training."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename or not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are allowed'}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(os.path.dirname(CSV_STORE), exist_ok=True)
    filename = secure_filename(file.filename)
    store_path = CSV_STORE
    file.save(store_path)

    # Also import into MongoDB for general use - read from saved file
    db = current_app.db
    records_count = 0
    errors = []
    df = _load_csv_as_df(store_path)
    from app.models.data_models import DiseaseRecord
    for _, row in df.iterrows():
        try:
            date_val = row['date']
            if hasattr(date_val, 'strftime'):
                date_str = date_val.strftime('%Y-%m-%d')
            elif pd.isna(date_val):
                date_str = '1970-01-01'
            else:
                date_str = str(date_val.date()) if hasattr(date_val, 'date') else str(date_val)

            DiseaseRecord.create(
                db,
                str(row.get('disease_name', '')),
                str(row.get('state', '')),
                str(row.get('district', '')),
                int(row.get('cases', 0) or 0),
                int(row.get('deaths', 0) or 0),
                int(row.get('recovered', 0) or 0),
                date_str,
                source='csv_upload'
            )
            records_count += 1
        except Exception as e:
            errors.append(f'Row {records_count + 1}: {str(e)}')

    return jsonify({
        'message': f'CSV uploaded successfully. {records_count} records imported.',
        'records_imported': records_count,
        'errors': errors[:10],
        'file_path': store_path,
        'filename': filename
    }), 200


@dataset_bp.route('/locations', methods=['GET'])
def get_locations():
    """Get available Karnataka locations from CSV or MongoDB."""
    db = current_app.db
    df = None
    csv_path = CSV_STORE
    if os.path.exists(csv_path):
        try:
            df = _load_csv_as_df(csv_path)
        except Exception:
            pass

    if df is None or df.empty:
        # Fallback: read from MongoDB disease_records collection
        df = _load_from_mongodb(db)

    if df.empty:
        return jsonify({'error': 'No dataset available. Upload a CSV first.'}), 404

    karnataka_df = _filter_karnataka(df)
    if karnataka_df.empty:
        return jsonify({'error': 'No Karnataka data found in dataset'}), 404

    districts = sorted(karnataka_df['district'].dropna().unique().tolist())
    diseases = sorted(karnataka_df['disease_name'].dropna().unique().tolist())

    return jsonify({
        'state': 'Karnataka',
        'districts': districts,
        'diseases': diseases,
        'total_records': len(karnataka_df)
    }), 200


@dataset_bp.route('/train', methods=['POST'])
@jwt_required()
def train_and_predict():
    """Train a model on Karnataka CSV data and return top 5 disease predictions."""
    data = request.get_json() or {}
    district = data.get('district', '').strip()
    state = data.get('state', 'Karnataka').strip()

    db = current_app.db
    df = None
    csv_path = CSV_STORE
    if os.path.exists(csv_path):
        try:
            df = _load_csv_as_df(csv_path)
        except Exception:
            pass

    if df is None or df.empty:
        # Fallback: read from MongoDB disease_records collection
        df = _load_from_mongodb(db)
        if df.empty:
            return jsonify({'error': 'No dataset available. Upload a CSV first.'}), 404

    # Filter for Karnataka (and district if specified)
    if district:
        location_df = _filter_karnataka(df, district=district)
    else:
        location_df = _filter_karnataka(df)

    if location_df.empty:
        return jsonify({'error': f'No data found for {district or "Karnataka"} in the uploaded dataset'}), 404

    # Train model on the filtered data
    model, scaler, feat_records = _train_model(location_df)

    if model is None:
        return jsonify({'error': 'Insufficient data to train model'}), 400

    # Predict outbreak probability for each disease
    predictions = _predict_top_diseases(location_df, model, scaler)
    top_5 = predictions[:5]

    def get_risk_level(prob):
        if prob < 0.35:
            return 'Low'
        elif prob < 0.70:
            return 'Medium'
        else:
            return 'High'

    results = []
    for pred in top_5:
        advisory = _health_advisory(pred['disease'])
        results.append({
            'rank': len(results) + 1,
            'disease': pred['disease'],
            'risk_level': get_risk_level(pred['probability']),
            'probability': pred['probability'],
            'confidence': round(pred['probability'] + 0.05, 4) if pred['probability'] < 0.95 else 0.99,
            'total_cases': pred['total_cases'],
            'case_fatality_rate': round(pred['case_fatality_rate'], 4),
            'recovery_rate': round(pred['recovery_rate'], 4),
            'avg_monthly_cases': round(pred['avg_monthly_cases'], 2),
            'peak_cases': pred['peak_cases'],
            'case_growth_rate': round(pred['case_growth_rate'], 4),
            'explanation': f"{pred['disease']} shows {pred['total_cases']} total cases with {round(pred['case_growth_rate']*100, 1)}% case growth rate in {district or 'Karnataka'}.",
            'advisory': advisory
        })

    return jsonify({
        'predictions': results,
        'state': state,
        'district': district or 'All Karnataka',
        'total_diseases_analyzed': len(predictions),
        'model_used': 'random_forest',
        'total_records': len(location_df)
    }), 200
