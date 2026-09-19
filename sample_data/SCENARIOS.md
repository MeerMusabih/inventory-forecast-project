# Sample Data Scenario Record

Generated from `scripts/build_sample_data.py`.

## Two product domains, deliberately connected

- **Cakes** (forecast, actual transfers, dashboard): 30 kinds of cake sold through 20 branches over
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
| BR-F | 1.02 | 1.00 | 1.04 | 0.98 | 1.00 | 1.02 |
| BR-G | 0.95 | 0.97 | 1.00 | 1.02 | 1.00 | 0.90 |
| BR-H | 0.85 | 0.90 | 1.00 | 1.10 | 1.05 | 0.95 |
| BR-I | 1.05 | 1.08 | 1.00 | 0.95 | 0.90 | 1.00 |
| BR-J | 0.90 | 0.88 | 0.85 | 0.90 | 0.95 | 1.00 |
| BR-K | 1.00 | 1.00 | 1.10 | 1.00 | 0.95 | 0.85 |
| BR-L | 0.95 | 0.95 | 0.98 | 1.05 | 1.10 | 0.95 |
| BR-M | 0.80 | 0.85 | 0.90 | 0.95 | 1.00 | 1.05 |
| BR-N | 1.10 | 1.05 | 1.00 | 0.95 | 0.90 | 0.85 |
| BR-O | 0.92 | 0.95 | 1.02 | 1.08 | 1.12 | 1.00 |
| BR-P | 0.98 | 0.99 | 1.01 | 1.02 | 1.00 | 0.95 |
| BR-Q | 1.00 | 0.95 | 0.90 | 0.95 | 1.00 | 1.05 |
| BR-R | 0.88 | 0.92 | 0.96 | 1.00 | 1.04 | 0.90 |
| BR-S | 0.75 | 0.80 | 0.90 | 0.95 | 1.05 | 1.10 |
| BR-T | 1.00 | 1.00 | 0.90 | 0.80 | 0.85 | 0.70 |

## Per period / branch outcome (cakes)

| Period | Month | Branch | Kind | Forecast | Actual | Ratio | Accurate | Over | Under | Note |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | March | BR-A | short | 803 | 596 | 0.74 | 6 | 24 | 0 |  |
| 1 | March | BR-B | volatile | 669 | 675 | 1.01 | 18 | 6 | 6 |  |
| 1 | March | BR-C | volatile | 602 | 607 | 1.01 | 18 | 6 | 6 |  |
| 1 | March | BR-D | short | 535 | 449 | 0.84 | 20 | 10 | 0 |  |
| 1 | March | BR-E | volatile | 469 | 480 | 1.02 | 18 | 6 | 6 |  |
| 1 | March | BR-F | volatile | 401 | 416 | 1.04 | 18 | 6 | 6 |  |
| 1 | March | BR-G | volatile | 401 | 389 | 0.97 | 18 | 6 | 6 |  |
| 1 | March | BR-H | short | 335 | 291 | 0.87 | 24 | 6 | 0 |  |
| 1 | March | BR-I | volatile | 335 | 358 | 1.07 | 18 | 6 | 6 |  |
| 1 | March | BR-J | volatile | 335 | 308 | 0.92 | 23 | 6 | 1 |  |
| 1 | March | BR-K | volatile | 268 | 273 | 1.02 | 18 | 6 | 6 |  |
| 1 | March | BR-L | volatile | 268 | 267 | 1.00 | 18 | 6 | 6 |  |
| 1 | March | BR-M | short | 201 | 163 | 0.81 | 19 | 11 | 0 |  |
| 1 | March | BR-N | surplus | 201 | 231 | 1.15 | 18 | 6 | 6 |  |
| 1 | March | BR-O | volatile | 201 | 194 | 0.97 | 19 | 6 | 5 |  |
| 1 | March | BR-P | volatile | 201 | 205 | 1.02 | 18 | 6 | 6 |  |
| 1 | March | BR-Q | volatile | 134 | 140 | 1.04 | 18 | 6 | 6 |  |
| 1 | March | BR-R | volatile | 134 | 123 | 0.92 | 23 | 6 | 1 |  |
| 1 | March | BR-S | short | 134 | 103 | 0.77 | 10 | 20 | 0 |  |
| 1 | March | BR-T | volatile | 68 | 68 | 1.00 | 18 | 6 | 6 |  |
| 2 | April | BR-A | volatile | 824 | 746 | 0.91 | 24 | 6 | 0 |  |
| 2 | April | BR-B | volatile | 684 | 714 | 1.04 | 18 | 6 | 6 |  |
| 2 | April | BR-C | volatile | 616 | 637 | 1.03 | 18 | 6 | 6 |  |
| 2 | April | BR-D | outage | 544 | 126 | 0.23 | 0 | 30 | 0 | zero receipts |
| 2 | April | BR-E | surplus | 479 | 540 | 1.13 | 18 | 6 | 6 |  |
| 2 | April | BR-F | volatile | 410 | 420 | 1.02 | 18 | 6 | 6 |  |
| 2 | April | BR-G | volatile | 410 | 413 | 1.01 | 18 | 6 | 6 |  |
| 2 | April | BR-H | volatile | 342 | 315 | 0.92 | 23 | 6 | 1 |  |
| 2 | April | BR-I | surplus | 342 | 381 | 1.11 | 18 | 6 | 6 |  |
| 2 | April | BR-J | volatile | 342 | 311 | 0.91 | 24 | 6 | 0 |  |
| 2 | April | BR-K | volatile | 275 | 284 | 1.03 | 18 | 6 | 6 |  |
| 2 | April | BR-L | volatile | 275 | 274 | 1.00 | 18 | 6 | 6 |  |
| 2 | April | BR-M | short | 202 | 173 | 0.86 | 22 | 8 | 0 |  |
| 2 | April | BR-N | volatile | 202 | 213 | 1.05 | 18 | 6 | 6 |  |
| 2 | April | BR-O | volatile | 202 | 204 | 1.01 | 18 | 6 | 6 |  |
| 2 | April | BR-P | volatile | 202 | 206 | 1.02 | 18 | 6 | 6 |  |
| 2 | April | BR-Q | volatile | 137 | 139 | 1.01 | 22 | 6 | 2 |  |
| 2 | April | BR-R | volatile | 137 | 136 | 0.99 | 23 | 6 | 1 |  |
| 2 | April | BR-S | short | 137 | 110 | 0.80 | 13 | 17 | 0 |  |
| 2 | April | BR-T | volatile | 69 | 70 | 1.01 | 19 | 5 | 6 |  |
| 3 | May | BR-A | volatile | 860 | 819 | 0.95 | 18 | 6 | 6 |  |
| 3 | May | BR-B | volatile | 716 | 730 | 1.02 | 18 | 6 | 6 |  |
| 3 | May | BR-C | volatile | 645 | 657 | 1.02 | 18 | 6 | 6 |  |
| 3 | May | BR-D | volatile | 571 | 548 | 0.96 | 19 | 6 | 5 |  |
| 3 | May | BR-E | volatile | 500 | 476 | 0.95 | 20 | 6 | 4 |  |
| 3 | May | BR-F | volatile | 429 | 460 | 1.07 | 18 | 6 | 6 |  |
| 3 | May | BR-G | volatile | 429 | 442 | 1.03 | 18 | 6 | 6 |  |
| 3 | May | BR-H | volatile | 359 | 369 | 1.03 | 18 | 6 | 6 |  |
| 3 | May | BR-I | volatile | 359 | 369 | 1.03 | 18 | 6 | 6 |  |
| 3 | May | BR-J | short | 359 | 316 | 0.88 | 24 | 6 | 0 |  |
| 3 | May | BR-K | surplus | 290 | 329 | 1.13 | 18 | 6 | 6 |  |
| 3 | May | BR-L | volatile | 290 | 298 | 1.03 | 18 | 6 | 6 |  |
| 3 | May | BR-M | volatile | 212 | 196 | 0.92 | 19 | 6 | 5 |  |
| 3 | May | BR-N | volatile | 212 | 222 | 1.05 | 18 | 6 | 6 |  |
| 3 | May | BR-O | volatile | 212 | 222 | 1.05 | 18 | 6 | 6 |  |
| 3 | May | BR-P | volatile | 212 | 222 | 1.05 | 18 | 6 | 6 |  |
| 3 | May | BR-Q | volatile | 144 | 134 | 0.93 | 24 | 6 | 0 |  |
| 3 | May | BR-R | volatile | 144 | 148 | 1.03 | 20 | 6 | 4 |  |
| 3 | May | BR-S | volatile | 144 | 134 | 0.93 | 24 | 6 | 0 |  |
| 3 | May | BR-T | volatile | 72 | 73 | 1.01 | 20 | 5 | 5 |  |
| 4 | June | BR-A | surplus | 886 | 975 | 1.10 | 18 | 6 | 6 |  |
| 4 | June | BR-B | volatile | 739 | 754 | 1.02 | 18 | 6 | 6 |  |
| 4 | June | BR-C | surplus | 666 | 762 | 1.14 | 18 | 6 | 6 |  |
| 4 | June | BR-D | surplus | 594 | 664 | 1.12 | 18 | 6 | 6 |  |
| 4 | June | BR-E | volatile | 520 | 539 | 1.04 | 18 | 6 | 6 |  |
| 4 | June | BR-F | volatile | 443 | 458 | 1.03 | 18 | 6 | 6 |  |
| 4 | June | BR-G | volatile | 443 | 467 | 1.05 | 18 | 6 | 6 |  |
| 4 | June | BR-H | surplus | 369 | 423 | 1.15 | 18 | 6 | 6 |  |
| 4 | June | BR-I | volatile | 369 | 367 | 0.99 | 18 | 6 | 6 |  |
| 4 | June | BR-J | volatile | 369 | 346 | 0.94 | 23 | 6 | 1 |  |
| 4 | June | BR-K | volatile | 295 | 308 | 1.04 | 18 | 6 | 6 |  |
| 4 | June | BR-L | volatile | 295 | 320 | 1.08 | 18 | 6 | 6 |  |
| 4 | June | BR-M | volatile | 222 | 224 | 1.01 | 18 | 6 | 6 |  |
| 4 | June | BR-N | volatile | 222 | 224 | 1.01 | 18 | 6 | 6 |  |
| 4 | June | BR-O | surplus | 222 | 247 | 1.11 | 19 | 5 | 6 |  |
| 4 | June | BR-P | volatile | 222 | 233 | 1.05 | 18 | 6 | 6 |  |
| 4 | June | BR-Q | volatile | 146 | 151 | 1.03 | 19 | 6 | 5 |  |
| 4 | June | BR-R | volatile | 146 | 152 | 1.04 | 18 | 6 | 6 |  |
| 4 | June | BR-S | volatile | 146 | 151 | 1.03 | 19 | 6 | 5 |  |
| 4 | June | BR-T | short | 74 | 63 | 0.85 | 19 | 11 | 0 |  |
| 5 | July | BR-A | surplus | 886 | 1052 | 1.19 | 19 | 5 | 6 |  |
| 5 | July | BR-B | volatile | 738 | 769 | 1.04 | 18 | 6 | 6 |  |
| 5 | July | BR-C | volatile | 663 | 619 | 0.93 | 24 | 6 | 0 |  |
| 5 | July | BR-D | volatile | 590 | 539 | 0.91 | 24 | 6 | 0 |  |
| 5 | July | BR-E | surplus | 516 | 699 | 1.35 | 6 | 0 | 24 |  |
| 5 | July | BR-F | volatile | 443 | 459 | 1.04 | 18 | 6 | 6 |  |
| 5 | July | BR-G | volatile | 443 | 459 | 1.04 | 18 | 6 | 6 |  |
| 5 | July | BR-H | volatile | 369 | 402 | 1.09 | 18 | 6 | 6 |  |
| 5 | July | BR-I | volatile | 369 | 346 | 0.94 | 23 | 6 | 1 |  |
| 5 | July | BR-J | volatile | 369 | 365 | 0.99 | 18 | 6 | 6 |  |
| 5 | July | BR-K | volatile | 293 | 292 | 1.00 | 18 | 6 | 6 |  |
| 5 | July | BR-L | surplus | 293 | 336 | 1.15 | 19 | 5 | 6 |  |
| 5 | July | BR-M | volatile | 217 | 225 | 1.04 | 18 | 6 | 6 |  |
| 5 | July | BR-N | volatile | 217 | 201 | 0.93 | 21 | 6 | 3 |  |
| 5 | July | BR-O | surplus | 217 | 256 | 1.18 | 21 | 3 | 6 |  |
| 5 | July | BR-P | volatile | 217 | 225 | 1.04 | 18 | 6 | 6 |  |
| 5 | July | BR-Q | volatile | 149 | 155 | 1.04 | 18 | 6 | 6 |  |
| 5 | July | BR-R | volatile | 149 | 159 | 1.07 | 19 | 5 | 6 |  |
| 5 | July | BR-S | volatile | 149 | 159 | 1.07 | 19 | 5 | 6 |  |
| 5 | July | BR-T | volatile | 74 | 68 | 0.92 | 23 | 7 | 0 |  |
| 6 | August | BR-A | volatile | 852 | 814 | 0.96 | 18 | 6 | 6 |  |
| 6 | August | BR-B | volatile | 710 | 708 | 1.00 | 18 | 6 | 6 |  |
| 6 | August | BR-C | volatile | 640 | 586 | 0.92 | 24 | 6 | 0 |  |
| 6 | August | BR-D | volatile | 567 | 531 | 0.94 | 24 | 6 | 0 |  |
| 6 | August | BR-E | short | 499 | 288 | 0.58 | 0 | 30 | 0 |  |
| 6 | August | BR-F | volatile | 427 | 448 | 1.05 | 18 | 6 | 6 |  |
| 6 | August | BR-G | volatile | 427 | 401 | 0.94 | 21 | 6 | 3 |  |
| 6 | August | BR-H | volatile | 356 | 355 | 1.00 | 18 | 6 | 6 |  |
| 6 | August | BR-I | volatile | 356 | 369 | 1.04 | 18 | 6 | 6 |  |
| 6 | August | BR-J | volatile | 356 | 369 | 1.04 | 18 | 6 | 6 |  |
| 6 | August | BR-K | short | 284 | 252 | 0.89 | 24 | 6 | 0 |  |
| 6 | August | BR-L | volatile | 284 | 282 | 0.99 | 18 | 6 | 6 |  |
| 6 | August | BR-M | volatile | 212 | 229 | 1.08 | 20 | 4 | 6 |  |
| 6 | August | BR-N | short | 212 | 184 | 0.87 | 22 | 8 | 0 |  |
| 6 | August | BR-O | volatile | 212 | 220 | 1.04 | 18 | 6 | 6 |  |
| 6 | August | BR-P | volatile | 212 | 216 | 1.02 | 18 | 6 | 6 |  |
| 6 | August | BR-Q | volatile | 142 | 150 | 1.06 | 19 | 5 | 6 |  |
| 6 | August | BR-R | volatile | 142 | 134 | 0.94 | 23 | 6 | 1 |  |
| 6 | August | BR-S | surplus | 142 | 161 | 1.13 | 19 | 5 | 6 |  |
| 6 | August | BR-T | outage | 71 | 43 | 0.61 | 8 | 22 | 0 | zero receipts |

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
