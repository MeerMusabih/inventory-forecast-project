import sys
sys.path.insert(0, '.')
import pandas as pd
import numpy as np
from models.baseline import train_baseline, predict_baseline
from models.holt_winters import train_holt_winters, predict_holt_winters
from models.arima_model import train_arima, predict_arima
from models.xgboost_model import train_xgboost, predict_xgboost
from models.evaluation import evaluate_all_models

df = pd.read_csv('data/sales.csv')
product = 'prod-8'  # Mineral Water (high demand, seasonal)
outlet = 'outlet-5'  # Highway (high demand for this product)

mask = (df['product_id'] == product) & (df['outlet_id'] == outlet)
data = df[mask].sort_values('date')
series = pd.Series(data['units_sold'].values, index=data['date'])

print(f'Testing models on {product} at {outlet}')
print(f'Total data points: {len(series)}')
print(f'Avg daily demand: {series.mean():.1f}')
print()

# Split 70/30
split = int(len(series) * 0.7)
train = series.iloc[:split]
test = series.iloc[split:]
print(f'Train: {len(train)} days, Test: {len(test)} days')
print()

# Test each model
print('=== Baseline SMA ===')
model = train_baseline(train)
pred = predict_baseline(model, len(test))
rmse = np.sqrt(np.mean((test.values - np.array(pred['predictions'][:len(test)]))**2))
print(f'  SMA value: {model["sma"]:.1f}')
print(f'  RMSE: {rmse:.2f}')
print()

print('=== Holt-Winters ===')
model = train_holt_winters(train)
pred = predict_holt_winters(model, len(test))
rmse = np.sqrt(np.mean((test.values - np.array(pred['predictions'][:len(test)]))**2))
print(f'  Alpha: {model["alpha"]}, Beta: {model["beta"]}, Gamma: {model["gamma"]}')
print(f'  RMSE: {rmse:.2f}')
print()

print('=== ARIMA ===')
model = train_arima(train)
pred = predict_arima(model, len(test))
rmse = np.sqrt(np.mean((test.values - np.array(pred['predictions'][:len(test)]))**2))
print(f'  Order: {model["order"]}, AIC: {model["aic"]}')
print(f'  RMSE: {rmse:.2f}')
print()

print('=== XGBoost ===')
model = train_xgboost(data)
pred = predict_xgboost(model, data, len(test))
rmse = np.sqrt(np.mean((test.values - np.array(pred['predictions'][:len(test)]))**2))
print(f'  RMSE: {rmse:.2f}')
print(f'  Top features:')
for f in model['top_features'][:5]:
    print(f'    {f["name"]}: {f["importance"]:.4f}')
print()

print('=== Full Comparison ===')
comparison = evaluate_all_models(train, test, data)
for name, res in comparison.items():
    if 'rmse' in res:
        imp = res.get('improvement_vs_baseline', 0)
        print(f'  {name}: RMSE={res["rmse"]:.2f}, MAE={res["mae"]:.2f}, MAPE={res["mape"]:.1f}%, improvement={imp:+.1f}%')
    else:
        print(f'  {name}: {res}')
