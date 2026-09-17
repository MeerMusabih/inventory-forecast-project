# Sample Data Scenario Record

Generated from `scripts/build_sample_data.py`.

## Two product domains, deliberately connected

- **Cakes** (forecast, actual transfers, dashboard): 10 kinds of cake sold through 5 branches over
  Mar-Aug 2026. Model: `actual = round(forecast x cake_bias x branch_reliability)`.
- **Raw materials** (MRP and ROP): 12 ingredients used to bake those cakes. Each raw material's
  monthly requirement in `MRP_full.xlsx` is a standalone planning figure. `stock_on_hand.csv` is
  a raw-material stock snapshot whose coverage (see `STOCK_COVERAGE`) drives the ROP green/red mix.

## Branch reliability curves

| Branch | Mar | Apr | May | Jun | Jul | Aug |
|---|---|---|---|---|---|---|
| BR-A | 0.72 | 0.88 | 0.92 | 1.06 | 1.14 | 0.92 |
| BR-B | 0.98 | 1.02 | 0.98 | 0.98 | 1.00 | 0.96 |
| BR-C | 0.98 | 1.00 | 0.98 | 1.10 | 0.90 | 0.88 |
| BR-D | 0.82 | 0.30 | 0.92 | 1.08 | 0.88 | 0.90 |
| BR-E | 1.00 | 1.10 | 0.92 | 1.00 | 1.30 | 0.55 |

## Per period / branch outcome (cakes)

| Period | Month | Branch | Kind | Forecast | Actual | Ratio | Accurate | Over | Under | Note |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | March | BR-A | short | 768 | 576 | 0.75 | 3 | 7 | 0 |  |
| 1 | March | BR-B | balanced | 641 | 655 | 1.02 | 4 | 3 | 3 |  |
| 1 | March | BR-C | balanced | 512 | 524 | 1.02 | 4 | 3 | 3 |  |
| 1 | March | BR-D | short | 383 | 327 | 0.85 | 7 | 3 | 0 |  |
| 1 | March | BR-E | balanced | 256 | 267 | 1.04 | 4 | 3 | 3 |  |
| 2 | April | BR-A | balanced | 780 | 722 | 0.93 | 7 | 3 | 0 |  |
| 2 | April | BR-B | balanced | 650 | 696 | 1.07 | 4 | 3 | 3 |  |
| 2 | April | BR-C | balanced | 520 | 546 | 1.05 | 4 | 3 | 3 |  |
| 2 | April | BR-D | outage | 389 | 74 | 0.19 | 0 | 10 | 0 | zero receipts |
| 2 | April | BR-E | surplus | 260 | 300 | 1.15 | 4 | 3 | 3 |  |
| 3 | May | BR-A | balanced | 820 | 797 | 0.97 | 4 | 3 | 3 |  |
| 3 | May | BR-B | balanced | 684 | 707 | 1.03 | 4 | 3 | 3 |  |
| 3 | May | BR-C | balanced | 546 | 566 | 1.04 | 4 | 3 | 3 |  |
| 3 | May | BR-D | balanced | 408 | 399 | 0.98 | 4 | 3 | 3 |  |
| 3 | May | BR-E | balanced | 274 | 265 | 0.97 | 4 | 3 | 3 |  |
| 4 | June | BR-A | surplus | 855 | 963 | 1.13 | 4 | 3 | 3 |  |
| 4 | June | BR-B | balanced | 712 | 739 | 1.04 | 4 | 3 | 3 |  |
| 4 | June | BR-C | surplus | 570 | 664 | 1.16 | 4 | 3 | 3 |  |
| 4 | June | BR-D | surplus | 429 | 492 | 1.15 | 4 | 3 | 3 |  |
| 4 | June | BR-E | balanced | 285 | 303 | 1.06 | 4 | 3 | 3 |  |
| 5 | July | BR-A | surplus | 856 | 1034 | 1.21 | 4 | 3 | 3 |  |
| 5 | July | BR-B | balanced | 713 | 757 | 1.06 | 4 | 3 | 3 |  |
| 5 | July | BR-C | balanced | 572 | 545 | 0.95 | 7 | 3 | 0 |  |
| 5 | July | BR-D | balanced | 429 | 401 | 0.93 | 7 | 3 | 0 |  |
| 5 | July | BR-E | surplus | 284 | 390 | 1.37 | 3 | 0 | 7 |  |
| 6 | August | BR-A | balanced | 831 | 810 | 0.97 | 4 | 3 | 3 |  |
| 6 | August | BR-B | balanced | 694 | 706 | 1.02 | 4 | 3 | 3 |  |
| 6 | August | BR-C | balanced | 554 | 517 | 0.93 | 7 | 3 | 0 |  |
| 6 | August | BR-D | balanced | 415 | 396 | 0.95 | 7 | 3 | 0 |  |
| 6 | August | BR-E | short | 277 | 163 | 0.59 | 0 | 10 | 0 |  |

## Raw material MRP requirement and stock

| Code | Material | Unit | MRP monthly | Stock on hand | ROP action |
|---|---|---|---|---|---|
| RM-001 | Wheat Flour | kg | 420 | 630 | SAFE |
| RM-002 | Sugar | kg | 300 | 330 | SAFE |
| RM-003 | Butter | kg | 240 | 84 | ORDER 156 |
| RM-004 | Eggs | pcs | 4200 | 840 | ORDER 3360 |
| RM-005 | Milk | l | 210 | 147 | ORDER 63 |
| RM-006 | Cocoa Powder | kg | 90 | 112 | SAFE |
| RM-007 | Baking Powder | kg | 12 | 12 | SAFE |
| RM-008 | Vanilla Essence | ml | 900 | 810 | ORDER 90 |
| RM-009 | Whipping Cream | l | 160 | 224 | SAFE |
| RM-010 | Strawberry Jam | kg | 110 | 33 | ORDER 77 |
| RM-011 | Icing Sugar | kg | 130 | 136 | SAFE |
| RM-012 | Lemon Extract | ml | 300 | 510 | SAFE |
