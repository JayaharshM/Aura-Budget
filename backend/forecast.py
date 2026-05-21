#!/usr/bin/env python3
"""
Spending Forecaster Bridge Script
Reads transaction data from stdin (JSON), uses the ML model to predict
future spending for the next N days, and outputs JSON to stdout.
"""

import sys
import json
import warnings
import datetime
import os

warnings.filterwarnings('ignore')

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        transactions = input_data.get('transactions', [])
        days_ahead = input_data.get('days', 30)

        # Aggregate daily expense totals from transactions
        daily_totals = {}
        for t in transactions:
            if t.get('type') != 'expense':
                continue
            # Parse date
            try:
                date_str = t.get('date', '')[:10]  # YYYY-MM-DD
                daily_totals[date_str] = daily_totals.get(date_str, 0) + float(t.get('amount', 0))
            except (ValueError, TypeError):
                continue

        # Sort dates and get last 3 days of spending as lag features
        sorted_dates = sorted(daily_totals.keys())
        today = datetime.date.today()

        if len(sorted_dates) >= 3:
            last3 = sorted_dates[-3:]
            lag1 = daily_totals[last3[2]]  # most recent
            lag2 = daily_totals[last3[1]]
            lag3 = daily_totals[last3[0]]
        elif len(sorted_dates) == 2:
            lag1 = daily_totals[sorted_dates[1]]
            lag2 = daily_totals[sorted_dates[0]]
            lag3 = (lag1 + lag2) / 2
        elif len(sorted_dates) == 1:
            lag1 = daily_totals[sorted_dates[0]]
            lag2 = lag1
            lag3 = lag1
        else:
            # No transaction data, use zero base
            lag1, lag2, lag3 = 0.0, 0.0, 0.0

        # Load model via joblib
        import joblib
        import pandas as pd

        model_path = os.path.join(os.path.dirname(__file__), 'model', 'spending_forecaster.pkl')
        model = joblib.load(model_path)

        # Predict iteratively day by day
        results = []
        for i in range(days_ahead):
            future_date = today + datetime.timedelta(days=i + 1)
            features = pd.DataFrame({
                'Lag1': [lag1],
                'Lag2': [lag2],
                'Lag3': [lag3],
                'DayOfWeek': [future_date.weekday()],
                'Month': [future_date.month]
            })
            pred = float(model.predict(features)[0])
            pred = max(0.0, round(pred, 2))

            results.append({
                'date': str(future_date),
                'predicted': pred,
                'dayOfWeek': future_date.strftime('%a'),
                'month': future_date.strftime('%b')
            })

            # Roll lag values forward
            lag3 = lag2
            lag2 = lag1
            lag1 = pred

        # Compute summary stats
        total_predicted = round(sum(r['predicted'] for r in results), 2)
        avg_daily = round(total_predicted / days_ahead, 2) if days_ahead > 0 else 0.0
        peak_day = max(results, key=lambda x: x['predicted']) if results else {}

        output = {
            'forecast': results,
            'summary': {
                'totalPredicted': total_predicted,
                'avgDaily': avg_daily,
                'peakDay': peak_day,
                'daysAhead': days_ahead
            }
        }

        print(json.dumps(output))

    except Exception as e:
        error_output = {
            'error': str(e),
            'forecast': [],
            'summary': {}
        }
        print(json.dumps(error_output))
        sys.exit(1)


if __name__ == '__main__':
    main()
