from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required
from app.models.data_models import DiseaseRecord, Prediction, Alert, WeatherData
from datetime import datetime
import io
import json
import csv

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_report():
    data = request.get_json() or {}
    report_type = data.get('type', 'json')
    state = data.get('state')
    district = data.get('district')
    db = current_app.db
    
    disease_stats = DiseaseRecord.get_stats(db)
    predictions = Prediction.get_latest(db, state, district)
    alerts = Alert.get_active(db, state)
    weather = WeatherData.get_latest(db, state, district)
    
    report_data = {
        'title': 'Disease Outbreak Prediction Report',
        'generated_at': datetime.utcnow().isoformat(),
        'region': {'state': state, 'district': district},
        'disease_statistics': disease_stats,
        'predictions': predictions,
        'active_alerts': alerts,
        'weather_conditions': weather,
        'summary': {
            'total_diseases_tracked': len(disease_stats),
            'high_risk_diseases': len([p for p in predictions if p['risk_level'] == 'High']),
            'active_alerts': len(alerts)
        }
    }
    
    if report_type == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Disease', 'Risk Level', 'Probability', 'Confidence', 'State', 'District'])
        for p in predictions:
            writer.writerow([p['disease_name'], p['risk_level'], p['probability'], p['confidence'], p['state'], p['district']])
        
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'disease_report_{datetime.now().strftime("%Y%m%d")}.csv'
        )
    
    elif report_type == 'pdf':
        try:
            from fpdf import FPDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font('Arial', 'B', 16)
            pdf.cell(0, 10, 'Disease Outbreak Prediction Report', 0, 1, 'C')
            pdf.set_font('Arial', '', 10)
            pdf.cell(0, 8, f'Generated: {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}', 0, 1)
            pdf.cell(0, 8, f'Region: {state or "All"}, {district or "All"}', 0, 1)
            pdf.ln(5)
            
            pdf.set_font('Arial', 'B', 12)
            pdf.cell(0, 8, 'Disease Predictions:', 0, 1)
            pdf.set_font('Arial', '', 10)
            
            for p in predictions:
                pdf.cell(0, 6, f"{p['disease_name']}: {p['risk_level']} Risk ({p['probability']*100:.1f}%)", 0, 1)
            
            pdf.ln(5)
            pdf.set_font('Arial', 'B', 12)
            pdf.cell(0, 8, 'Active Alerts:', 0, 1)
            pdf.set_font('Arial', '', 10)
            for a in alerts[:10]:
                pdf.cell(0, 6, f"[{a['risk_level']}] {a['title']} - {a['region']}", 0, 1)
            
            output = io.BytesIO(pdf.output())
            return send_file(
                output,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f'disease_report_{datetime.now().strftime("%Y%m%d")}.pdf'
            )
        except ImportError:
            return jsonify({'error': 'PDF generation requires fpdf2 package'}), 500
    
    return jsonify({'report': report_data}), 200


@reports_bp.route('/summary', methods=['GET'])
def get_summary():
    db = current_app.db
    disease_stats = DiseaseRecord.get_stats(db)
    predictions = Prediction.get_all(db, limit=20)
    alerts = Alert.get_active(db)
    
    summary = {
        'total_diseases': len(disease_stats),
        'total_predictions': len(predictions),
        'active_alerts': len(alerts),
        'high_risk_count': len([p for p in predictions if p['risk_level'] == 'High']),
        'medium_risk_count': len([p for p in predictions if p['risk_level'] == 'Medium']),
        'low_risk_count': len([p for p in predictions if p['risk_level'] == 'Low'])
    }
    return jsonify({'summary': summary}), 200
