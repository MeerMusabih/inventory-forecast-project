# AGENTS.md

## Testing rules

- Before running any test that uploads data through the API (forecast, actual
  transfers, MRP, accurate forecast), first DELETE the existing rows from the
  corresponding table(s) so repeated test runs do not duplicate data.
- Upload endpoints append rows; they do not replace. Always clear first.

Clear snippet (run from the project root):

```
python -c "import sys; sys.path.insert(0,'backend'); from database import get_conn; c=get_conn(); [c.execute('DELETE FROM '+t) for t in ['forecast_entries','actual_transfers','mrp_data','accurate_forecast']]; c.commit(); c.close(); print('cleared')"
```

Canonical clean dataset (from `sample_data/`):
- forecast: periods 1-6 = 20000 / 5000 / 3000 / 2500 / 2000 / 1500 rows
- actual_transfers: 45040 rows
- mrp_data: 200 rows
- accurate_forecast: 2500 rows

## Running the app locally

- Backend: `python -m uvicorn main:app --host 127.0.0.1 --port 8000` from `backend/`
- Frontend build: `npm run build` from project root (outputs to `dist/`)
- Note: port 8000 may be held by an orphaned uvicorn worker on Windows; kill the
  listening PID and any `spawn_main` python children before restarting.
