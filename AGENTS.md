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

## Setup on a new machine

Prerequisites: Python 3.10+ and Node.js 18+.

1. Install deps:
   - Frontend: `npm install` from the project root
   - Backend: `pip install -r requirements.txt` from `backend/`
2. Load the canonical dataset (one of):
   - Open the app and press **Test System** in the top bar
     (`POST /api/system/test-data` clears all tables and reloads
     `sample_data/`), or
   - Run the clear snippet above and upload each file from `sample_data/`
     through the UI/API.
3. Build the frontend: `npm run build`.
4. Start the backend: `python -m uvicorn main:app --host 127.0.0.1 --port 8000`
   from `backend/`, then open http://localhost:8000.

opencode loads `opencode.json` and `AGENTS.md` automatically when this folder
is opened; no global opencode setup is required for this project.
