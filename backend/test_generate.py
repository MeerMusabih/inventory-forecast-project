import sys
sys.path.insert(0, '.')
from data.generator import generate_data
df = generate_data()
df.to_csv('data/sales.csv', index=False)
print(f'Generated {len(df)} rows')
print(f'Date range: {df["date"].min()} to {df["date"].max()}')
print(f'Products: {df["product_id"].nunique()}, Outlets: {df["outlet_id"].nunique()}')
print(f'Total revenue: ${df["revenue"].sum():,.0f}')
print()
print('Sample stats:')
for oid in df['outlet_id'].unique():
    odf = df[df['outlet_id'] == oid]
    print(f'  {oid}: {odf["revenue"].sum():,.0f} revenue, {odf["units_sold"].sum():,} units')
