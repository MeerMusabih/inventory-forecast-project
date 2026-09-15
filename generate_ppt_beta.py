"""
StockMind AI — Final Year Project Proposal Presentation Generator
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
import copy

# ── Design Tokens ──────────────────────────────────────────────
PRIMARY   = RGBColor(0x25, 0x63, 0xEB)   # #2563EB
DARK      = RGBColor(0x11, 0x18, 0x27)   # #111827
BG        = RGBColor(0xF9, 0xFA, 0xFB)   # #F9FAFB
ACCENT    = RGBColor(0x14, 0xB8, 0xA6)   # #14B8A6
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xE5, 0xE7, 0xEB)
MED_GRAY  = RGBColor(0x9C, 0xA3, 0xAF)
CARD_BG   = RGBColor(0xFF, 0xFF, 0xFF)
BLUE_LIGHT = RGBColor(0xDB, 0xEA, 0xFE)
TEAL_LIGHT = RGBColor(0xCC, 0xFB, 0xF1)
RED_ACCENT = RGBColor(0xEF, 0x44, 0x44)
ORANGE_ACC = RGBColor(0xF5, 0x9E, 0x0B)
GREEN_ACC  = RGBColor(0x10, 0xB9, 0x81)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

LOGO_PATH = r"D:\inventory forecast project\443732266_1006349624830063_6095867571651137613_n-removebg-preview.png"

# ── Helpers ────────────────────────────────────────────────────
def set_slide_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_shape(slide, left, top, width, height, fill_color=None, line_color=None,
              line_width=Pt(0), shape_type=MSO_SHAPE.ROUNDED_RECTANGLE):
    shp = slide.shapes.add_shape(shape_type, left, top, width, height)
    shp.line.fill.background()
    if fill_color:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill_color
    else:
        shp.fill.background()
    if line_color:
        shp.line.color.rgb = line_color
        shp.line.width = line_width
    else:
        shp.line.fill.background()
    return shp

def add_textbox(slide, left, top, width, height, text, font_size=18,
                font_color=DARK, bold=False, alignment=PP_ALIGN.LEFT,
                font_name="Inter", anchor=MSO_ANCHOR.TOP):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    txBox.text_frame.word_wrap = True
    txBox.text_frame.auto_size = None
    tf = txBox.text_frame
    tf.paragraphs[0].text = ""
    p = tf.paragraphs[0]
    p.alignment = alignment
    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.color.rgb = font_color
    run.font.bold = bold
    run.font.name = font_name
    try:
        tf.paragraphs[0].space_before = Pt(0)
        tf.paragraphs[0].space_after = Pt(0)
    except:
        pass
    return txBox

def add_rich_textbox(slide, left, top, width, height, lines, anchor=MSO_ANCHOR.TOP):
    """lines = [(text, font_size, color, bold, alignment, font_name, space_after), ...]"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    for i, line_data in enumerate(lines):
        text, font_size, color, bold, alignment, font_name, space_after = line_data
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.alignment = alignment
        p.space_after = Pt(space_after)
        run = p.add_run()
        run.text = text
        run.font.size = Pt(font_size)
        run.font.color.rgb = color
        run.font.bold = bold
        run.font.name = font_name
    return txBox

def add_card(slide, left, top, width, height, title, bullets, title_color=PRIMARY,
             bullet_color=DARK, bg_color=CARD_BG, border_color=None, bullet_size=14,
             title_size=16, icon=None):
    """Add a rounded card with title and bullet list."""
    card = add_shape(slide, left, top, width, height, fill_color=bg_color,
                     line_color=border_color, line_width=Pt(1) if border_color else Pt(0))
    card.rotation = 0.0
    # Title
    title_text = f"  {icon}  {title}" if icon else f"  {title}"
    add_textbox(slide, left + Inches(0.15), top + Inches(0.12), width - Inches(0.3), Inches(0.4),
                title_text, font_size=title_size, font_color=title_color, bold=True,
                font_name="Space Grotesk")
    # Bullets
    lines = []
    for b in bullets:
        lines.append((f"    {b}", bullet_size, bullet_color, False, PP_ALIGN.LEFT, "Inter", 4))
    if lines:
        add_rich_textbox(slide, left + Inches(0.15), top + Inches(0.45),
                         width - Inches(0.3), height - Inches(0.55), lines)
    return card

def add_arrow(slide, start_x, start_y, end_x, end_y, color=PRIMARY, width=Pt(2)):
    """Add a simple connector line (arrow) between two points."""
    connector = slide.shapes.add_connector(
        1, start_x, start_y, end_x, end_y)
    connector.line.color.rgb = color
    connector.line.width = width
    return connector

def add_chevron_flow(slide, items, start_x, y, item_w, item_h, gap, colors=None,
                     text_color=WHITE, font_size=12):
    """Add a row of chevron/arrow shapes with text."""
    if colors is None:
        colors = [PRIMARY, ACCENT] * ((len(items) // 2) + 1)
    x = start_x
    shapes_list = []
    for i, item in enumerate(items):
        color = colors[i % len(colors)]
        shp = add_shape(slide, x, y, item_w, item_h, fill_color=color)
        shp.text_frame.word_wrap = True
        tf = shp.text_frame
        tf.paragraphs[0].alignment = PP_ALIGN.CENTER
        run = tf.paragraphs[0].add_run()
        run.text = item
        run.font.size = Pt(font_size)
        run.font.color.rgb = text_color
        run.font.bold = True
        run.font.name = "Inter"
        tf.paragraphs[0].space_before = Pt(0)
        tf.paragraphs[0].space_after = Pt(0)
        shapes_list.append(shp)
        x += item_w + gap
    return shapes_list

def add_down_arrows(slide, x_positions, y_start, y_end, color=MED_GRAY):
    """Add down arrows at given x positions."""
    for x in x_positions:
        add_textbox(slide, x - Inches(0.15), y_start, Inches(0.3), Inches(0.3),
                    "▼", font_size=14, font_color=color, bold=True,
                    alignment=PP_ALIGN.CENTER, font_name="Inter")

def add_slide_number(slide, num, total=21):
    add_textbox(slide, Inches(12.3), Inches(7.05), Inches(0.9), Inches(0.3),
                f"{num} / {total}", font_size=10, font_color=MED_GRAY,
                alignment=PP_ALIGN.RIGHT, font_name="Inter")

def add_logo(slide, top=0.15, size=0.95):
    """Add the RCSI logo to the top-right corner of a slide."""
    slide.shapes.add_picture(LOGO_PATH,
                             Inches(13.333 - 0.25 - size), Inches(top),
                             Inches(size), Inches(size))

def add_bottom_bar(slide):
    add_shape(slide, Inches(0), Inches(7.3), SLIDE_W, Inches(0.2), fill_color=PRIMARY)

def add_header_bar(slide, title_text, subtitle_text=None):
    """Add a blue header bar at the top of the slide."""
    add_shape(slide, Inches(0), Inches(0), SLIDE_W, Inches(1.15), fill_color=PRIMARY)
    add_textbox(slide, Inches(0.6), Inches(0.15), Inches(11.5), Inches(0.6),
                title_text, font_size=30, font_color=WHITE, bold=True,
                font_name="Space Grotesk")
    if subtitle_text:
        add_textbox(slide, Inches(0.6), Inches(0.7), Inches(11.5), Inches(0.4),
                    subtitle_text, font_size=16, font_color=RGBColor(0xBF, 0xDB, 0xFE),
                    bold=False, font_name="Inter")
    add_logo(slide)

def set_notes(slide, text):
    notes_slide = slide.notes_slide
    notes_slide.notes_text_frame.text = text


# ── Presentation ───────────────────────────────────────────────
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]  # blank


# ════════════════════════════════════════════════════════════════
# SLIDE 1 — Title Slide
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)

add_logo(slide)
# Accent stripe on left
add_shape(slide, Inches(0), Inches(0), Inches(0.12), SLIDE_H, fill_color=ACCENT)

# Title
add_textbox(slide, Inches(1.2), Inches(0.8), Inches(11), Inches(1.0),
            "StockMind AI", font_size=52, font_color=PRIMARY, bold=True,
            font_name="Space Grotesk", alignment=PP_ALIGN.LEFT)

# Subtitle
add_textbox(slide, Inches(1.2), Inches(1.85), Inches(10), Inches(0.8),
            "An Intelligent Demand Forecasting and\nInventory Optimization System for Multi-Outlet Retail Chains",
            font_size=22, font_color=DARK, bold=False,
            font_name="Inter")

# Horizontal divider
add_shape(slide, Inches(1.2), Inches(2.85), Inches(3.5), Pt(3), fill_color=ACCENT)

# Proposal label
add_textbox(slide, Inches(1.2), Inches(3.1), Inches(6), Inches(0.4),
            "Final Year Project Proposal", font_size=16, font_color=MED_GRAY,
            bold=False, font_name="Inter")

# Students
add_rich_textbox(slide, Inches(1.2), Inches(3.8), Inches(5), Inches(1.6), [
    ("Presented by:", 13, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 2),
    ("Meer Musabih Saleem  &  Malaika Saleem", 18, DARK, True, PP_ALIGN.LEFT, "Inter", 10),
    ("Supervisor:", 13, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 2),
    ("Dr. Muhammad Fawad", 18, DARK, True, PP_ALIGN.LEFT, "Inter", 10),
    ("Riphah International University — Lahore", 14, ACCENT, False, PP_ALIGN.LEFT, "Inter", 0),
])

# Flow diagram on the right side
flow_items = ["Retail Data", "AI Forecast", "Inventory\nIntelligence", "Action"]
flow_x = Inches(6.8)
flow_y = Inches(3.6)
add_chevron_flow(slide, flow_items, flow_x, flow_y, Inches(1.35), Inches(0.65), Inches(0.25),
                 colors=[PRIMARY, PRIMARY, ACCENT, GREEN_ACC], font_size=12)

# Bottom accent
add_shape(slide, Inches(0), Inches(7.25), SLIDE_W, Inches(0.25), fill_color=ACCENT)

set_notes(slide, "Assalam-o-Alaikum. Our Final Year Project is StockMind AI, an intelligent demand forecasting and inventory optimization system designed for multi-outlet retail chains. The system uses historical sales and inventory data to forecast future demand, identify inventory risks, and provide actionable recommendations for replenishment and inter-outlet transfers.")

# ════════════════════════════════════════════════════════════════
# SLIDE 2 — Outline
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Outline")
add_bottom_bar(slide)
add_slide_number(slide, 2)

outline_items = [
    ("01", "Introduction"),
    ("02", "Problem Statement"),
    ("03", "Proposed Solution"),
    ("04", "Project Objectives"),
    ("05", "Key Features"),
    ("06", "Demand Forecasting Engine"),
    ("07", "Inventory Optimization & Recommendation Engine"),
    ("08", "Multi-Outlet Transfer Intelligence"),
    ("09", "Layered System Architecture"),
    ("10", "Technology Stack"),
    ("11", "Data Processing Pipeline"),
    ("12", "Scope & Boundaries"),
    ("13", "17-Week Development Plan"),
    ("14", "Project Team"),
    ("15", "Expected Outcomes"),
    ("16", "Comparative Analysis"),
    ("17", "References"),
    ("18", "Conclusion"),
    ("19", "Q&A"),
]

col_w = Inches(4.1)
col_gap = Inches(0.35)
row_h = Inches(0.5)
row_gap = Inches(0.06)
start_x = Inches(0.4)
start_y = Inches(1.5)

for idx, (num, title) in enumerate(outline_items):
    col = idx // 6
    row = idx % 6
    x = start_x + col * (col_w + col_gap)
    y = start_y + row * (row_h + row_gap)
    badge = add_shape(slide, x, y + Inches(0.08), Inches(0.45), Inches(0.38),
                      fill_color=PRIMARY)
    badge.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = badge.text_frame.paragraphs[0].add_run()
    run.text = num
    run.font.size = Pt(12)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"
    add_textbox(slide, x + Inches(0.55), y + Inches(0.08), col_w - Inches(0.6), Inches(0.38),
                title, font_size=14, font_color=DARK, bold=False,
                font_name="Inter", alignment=PP_ALIGN.LEFT)

# ════════════════════════════════════════════════════════════════
# SLIDE 3 — Introduction
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "The Retail Inventory Challenge")
add_bottom_bar(slide)
add_slide_number(slide, 3)

# Key challenges as cards (2 rows of 3)
challenges = [
    ("Different Demand Patterns", "Each outlet has unique demand behavior"),
    ("Manual Forecasting", "Relies on spreadsheets and averages"),
    ("Stockout Risk", "Lost sales and customer dissatisfaction"),
    ("Overstock Costs", "Holding costs and tied-up capital"),
    ("Seasonal Variability", "Changing demand complicates planning"),
    ("Need for Actionable Insights", "Managers need decisions, not reports"),
]
card_w = Inches(3.8)
card_h = Inches(1.45)
gap_x = Inches(0.25)
gap_y = Inches(0.2)
start_x = Inches(0.6)
start_y = Inches(1.55)

for idx, (title, desc) in enumerate(challenges):
    row = idx // 3
    col = idx % 3
    x = start_x + col * (card_w + gap_x)
    y = start_y + row * (card_h + gap_y)
    card = add_shape(slide, x, y, card_w, card_h, fill_color=CARD_BG,
                     line_color=LIGHT_GRAY, line_width=Pt(1))
    # Colored top edge
    edge_color = PRIMARY if row == 0 else ACCENT
    add_shape(slide, x, y, card_w, Pt(4), fill_color=edge_color)
    add_textbox(slide, x + Inches(0.2), y + Inches(0.18), card_w - Inches(0.4), Inches(0.35),
                title, font_size=15, font_color=PRIMARY, bold=True, font_name="Space Grotesk")
    add_textbox(slide, x + Inches(0.2), y + Inches(0.55), card_w - Inches(0.4), Inches(0.8),
                desc, font_size=13, font_color=MED_GRAY, bold=False, font_name="Inter")

# Connected problems diagram at bottom
diag_y = Inches(5.4)
diag_items = ["Stockouts", "Poor Forecasting", "Overstock"]
diag_colors = [RED_ACCENT, PRIMARY, ORANGE_ACC]
for i, (item, col) in enumerate(zip(diag_items, diag_colors)):
    x = Inches(2.5) + i * Inches(3.5)
    shp = add_shape(slide, x, diag_y, Inches(2.2), Inches(0.7), fill_color=col)
    shp.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = shp.text_frame.paragraphs[0].add_run()
    run.text = item
    run.font.size = Pt(15)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"

# Connecting labels between problems
add_textbox(slide, Inches(4.55), diag_y + Inches(0.15), Inches(1.2), Inches(0.4),
            "←→", font_size=20, font_color=MED_GRAY, bold=True, alignment=PP_ALIGN.CENTER)
add_textbox(slide, Inches(8.05), diag_y + Inches(0.15), Inches(1.2), Inches(0.4),
            "←→", font_size=20, font_color=MED_GRAY, bold=True, alignment=PP_ALIGN.CENTER)

set_notes(slide, "In a multi-outlet retail business, the same product may have very different demand at different outlets. Traditional spreadsheet-based approaches often rely on historical averages or manual judgment. This can result in too much inventory at one outlet while another outlet faces a shortage. StockMind AI is designed to provide predictive and decision-support capabilities to address this problem.")

# ════════════════════════════════════════════════════════════════
# SLIDE 4 — Problem Statement
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Problem Statement")
add_bottom_bar(slide)
add_slide_number(slide, 4)

problems = [
    "Product-specific demand patterns",
    "Outlet-specific demand differences",
    "Trends and seasonality",
    "Future stockout risks",
    "Overstock conditions",
    "Replenishment requirements",
    "Opportunities to redistribute inventory",
]
add_card(slide, Inches(0.6), Inches(1.55), Inches(5.8), Inches(4.6),
         "Existing manual and basic inventory practices may not adequately account for:",
         problems, title_color=PRIMARY, border_color=LIGHT_GRAY, bullet_size=15, title_size=15)

# Core problem box
add_shape(slide, Inches(6.9), Inches(1.55), Inches(5.8), Inches(4.6),
          fill_color=RGBColor(0xEF, 0xF6, 0xFF), line_color=PRIMARY, line_width=Pt(2))
add_textbox(slide, Inches(7.1), Inches(1.8), Inches(5.4), Inches(0.4),
            "CORE PROBLEM", font_size=13, font_color=PRIMARY, bold=True, font_name="Space Grotesk")
add_shape(slide, Inches(7.1), Inches(2.25), Inches(2.5), Pt(2), fill_color=ACCENT)
add_rich_textbox(slide, Inches(7.1), Inches(2.5), Inches(5.4), Inches(3.2), [
    ("How can historical sales and inventory data be transformed into reliable demand forecasts and actionable inventory decisions for multiple retail outlets?",
     17, DARK, True, PP_ALIGN.LEFT, "Inter", 16),
    ("", 8, DARK, False, PP_ALIGN.LEFT, "Inter", 8),
    ("The core challenge is not simply inventory tracking. It is the lack of an integrated decision-support process that connects:",
     14, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 8),
    ("    Historical Data → Forecasting → Optimization → Risk Detection → Recommendations",
     14, PRIMARY, True, PP_ALIGN.LEFT, "Inter", 8),
    ("", 8, DARK, False, PP_ALIGN.LEFT, "Inter", 4),
    ("…across multiple outlets.", 14, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 0),
])

set_notes(slide, "The core problem we identified is not simply inventory tracking. It is the lack of an integrated decision-support process that connects historical data, demand forecasting, inventory optimization, risk detection, and recommendations across multiple outlets.")

# ════════════════════════════════════════════════════════════════
# SLIDE 5 — Proposed Solution (End-to-End Workflow)
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Introducing StockMind AI", "Web-based Predictive Inventory Intelligence & Decision-Support Platform")
add_bottom_bar(slide)
add_slide_number(slide, 5)

left_steps = [
    ("Historical Sales &\nInventory Data", PRIMARY),
    ("Data Validation &\nPreprocessing", PRIMARY),
    ("Demand Analysis", ACCENT),
    ("Multiple Forecasting\nApproaches", ACCENT),
]
right_steps = [
    ("Forecast Evaluation &\nModel Selection", PRIMARY),
    ("Inventory Optimization", ACCENT),
    ("Risk Detection", RGBColor(0xF5, 0x9E, 0x0B)),
    ("Recommendations &\nTransfer Opportunities", GREEN_ACC),
]

box_w = Inches(3.6)
box_h = Inches(0.9)
start_x = Inches(0.5)
start_y_left = Inches(1.65)
start_y_right = Inches(1.65)
v_gap = Inches(0.22)

for i, (text, color) in enumerate(left_steps):
    y = start_y_left + i * (box_h + v_gap)
    shp = add_shape(slide, start_x, y, box_w, box_h, fill_color=color)
    shp.text_frame.word_wrap = True
    shp.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = shp.text_frame.paragraphs[0].add_run()
    run.text = text
    run.font.size = Pt(14)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"
    if i < len(left_steps) - 1:
        add_textbox(slide, start_x + Inches(1.55), y + box_h - Inches(0.05),
                    Inches(0.5), Inches(0.35), "▼", font_size=16, font_color=color,
                    bold=True, alignment=PP_ALIGN.CENTER)

# Arrow from left col to right col
mid_arrow_y = Inches(3.2)
add_textbox(slide, Inches(4.15), mid_arrow_y, Inches(1.0), Inches(0.4),
            "→", font_size=28, font_color=PRIMARY, bold=True, alignment=PP_ALIGN.CENTER)

for i, (text, color) in enumerate(right_steps):
    y = start_y_right + i * (box_h + v_gap)
    x = Inches(5.3)
    shp = add_shape(slide, x, y, box_w, box_h, fill_color=color)
    shp.text_frame.word_wrap = True
    shp.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = shp.text_frame.paragraphs[0].add_run()
    run.text = text
    run.font.size = Pt(14)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"
    if i < len(right_steps) - 1:
        add_textbox(slide, x + Inches(1.55), y + box_h - Inches(0.05),
                    Inches(0.5), Inches(0.35), "▼", font_size=16, font_color=color,
                    bold=True, alignment=PP_ALIGN.CENTER)

# Final arrow down to dashboard
add_textbox(slide, Inches(6.75), Inches(6.1), Inches(0.5), Inches(0.35),
            "▼", font_size=16, font_color=PRIMARY, bold=True, alignment=PP_ALIGN.CENTER)
dash_box = add_shape(slide, Inches(4.9), Inches(6.4), Inches(4.2), Inches(0.65), fill_color=DARK)
dash_box.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
run = dash_box.text_frame.paragraphs[0].add_run()
run.text = "Inventory Intelligence Dashboard"
run.font.size = Pt(16)
run.font.color.rgb = WHITE
run.font.bold = True
run.font.name = "Inter"

# Key idea box on far right
add_shape(slide, Inches(9.5), Inches(1.65), Inches(3.5), Inches(1.8),
          fill_color=RGBColor(0xEC, 0xFD, 0xF5), line_color=ACCENT, line_width=Pt(2))
add_rich_textbox(slide, Inches(9.65), Inches(1.85), Inches(3.2), Inches(1.5), [
    ("Key Idea", 14, ACCENT, True, PP_ALIGN.LEFT, "Space Grotesk", 8),
    ("", 6, DARK, False, PP_ALIGN.LEFT, "Inter", 2),
    ("Descriptive →", 13, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 2),
    ("Predictive →", 13, PRIMARY, True, PP_ALIGN.LEFT, "Inter", 2),
    ("Prescriptive Intelligence", 13, ACCENT, True, PP_ALIGN.LEFT, "Inter", 0),
])

set_notes(slide, "StockMind AI moves beyond simply displaying historical inventory information. It first understands historical demand, predicts future demand using multiple forecasting approaches, evaluates those approaches, and then uses the forecasts to calculate inventory indicators and generate recommendations.")

# ════════════════════════════════════════════════════════════════
# SLIDE 6 — Objectives
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Project Objectives")
add_bottom_bar(slide)
add_slide_number(slide, 6)

objectives = [
    ("Demand\nForecasting", "Multiple forecasting\napproaches for\nproduct-outlet demand", PRIMARY),
    ("Forecast\nEvaluation", "Performance metrics\non held-out data:\nMAE, RMSE, MAPE", PRIMARY),
    ("Inventory\nOptimization", "Safety stock, reorder\npoint, days of stock,\nreplenishment, EOQ", ACCENT),
    ("Risk\nDetection", "Stockout, low-stock,\nand overstock\nidentification", RGBColor(0xF5, 0x9E, 0x0B)),
    ("Intelligent\nRecommendations", "Prioritized replenish-\nment and inventory\nactions", GREEN_ACC),
    ("Multi-Outlet\nIntelligence", "Transfer opportunities\nbetween outlets\nwith surplus/shortage", ACCENT),
    ("Decision-Support\nDashboard", "Company, outlet,\nand product-level\nanalytics", PRIMARY),
]

card_w = Inches(1.65)
card_h = Inches(3.6)
gap = Inches(0.18)
start_x = Inches(0.45)
start_y = Inches(1.55)

for idx, (title, desc, color) in enumerate(objectives):
    x = start_x + idx * (card_w + gap)
    # Number circle
    circle = add_shape(slide, x + Inches(0.55), start_y, Inches(0.5), Inches(0.5),
                       fill_color=color, shape_type=MSO_SHAPE.OVAL)
    circle.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = circle.text_frame.paragraphs[0].add_run()
    run.text = str(idx + 1)
    run.font.size = Pt(16)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"

    # Title
    add_textbox(slide, x, start_y + Inches(0.65), card_w, Inches(0.75),
                title, font_size=14, font_color=color, bold=True,
                font_name="Space Grotesk", alignment=PP_ALIGN.CENTER)
    # Description
    add_textbox(slide, x + Inches(0.1), start_y + Inches(1.45), card_w - Inches(0.2), Inches(1.8),
                desc, font_size=11, font_color=MED_GRAY, bold=False,
                font_name="Inter", alignment=PP_ALIGN.CENTER)
    # Bottom accent line
    add_shape(slide, x + Inches(0.4), start_y + card_h - Inches(0.15),
              card_w - Inches(0.8), Pt(3), fill_color=color)

set_notes(slide, "Our objectives cover the complete decision-support workflow. We are not only developing a forecasting model. We are integrating forecasting with inventory calculations, risk detection, recommendations, and a web-based dashboard.")

# ════════════════════════════════════════════════════════════════
# SLIDE 7 — Major Functional Features
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Key Features")
add_bottom_bar(slide)
add_slide_number(slide, 7)

features = [
    ("Inventory Intelligence\nDashboard", [
        "Company-wide inventory KPIs",
        "Outlet-level analytics",
        "Inventory health indicators",
        "Demand and inventory trends",
    ], PRIMARY),
    ("Multi-Model\nForecasting", [
        "Simple Moving Average",
        "Holt-Winters",
        "ARIMA",
        "XGBoost",
    ], ACCENT),
    ("Inventory\nOptimization", [
        "Safety stock",
        "Reorder point",
        "Days of stock",
        "Replenishment quantity",
        "EOQ where applicable",
    ], PRIMARY),
    ("Intelligent\nRecommendations", [
        "Stockout prevention",
        "Low-stock actions",
        "Overstock identification",
        "Prioritized recommendations",
    ], GREEN_ACC),
    ("Multi-Outlet\nTransfer Intelligence", [
        "Surplus outlet detection",
        "Shortage outlet detection",
        "Potential transfer opportunities",
    ], RGBColor(0xF5, 0x9E, 0x0B)),
    ("Product &\nOutlet Views", [
        "Product-level analysis",
        "Outlet-level analysis",
        "Searchable & filterable data",
    ], ACCENT),
]

card_w = Inches(4.0)
card_h = Inches(2.45)
gap_x = Inches(0.22)
gap_y = Inches(0.2)
start_x = Inches(0.45)
start_y = Inches(1.55)

for idx, (title, bullets, color) in enumerate(features):
    row = idx // 3
    col = idx % 3
    x = start_x + col * (card_w + gap_x)
    y = start_y + row * (card_h + gap_y)
    add_card(slide, x, y, card_w, card_h, title, bullets,
             title_color=color, border_color=LIGHT_GRAY, bullet_size=12, title_size=14)

set_notes(slide, "These are the major functional capabilities of the proposed product. A key feature is that the system works at both product and outlet levels, because demand for the same product can differ significantly between outlets.")

# ════════════════════════════════════════════════════════════════
# SLIDE 8 — AI/ML & Forecasting (Forecasting Comparison)
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Demand Forecasting Engine")
add_bottom_bar(slide)
add_slide_number(slide, 8)

models = [
    ("SMA", "Simple Moving\nAverage", "Recent historical\ndemand estimation", PRIMARY),
    ("Holt-Winters", "Level + Trend\n+ Seasonality", "Captures seasonal\npatterns", PRIMARY),
    ("ARIMA", "Autoregressive +\nMoving Average", "Time-series\ndependency modeling", ACCENT),
    ("XGBoost", "Gradient Boosted\nTrees", "Nonlinear feature-\nbased modeling", ACCENT),
]

model_w = Inches(2.8)
model_h = Inches(2.0)
start_x = Inches(0.5)
model_y = Inches(1.7)
model_gap = Inches(0.35)

for i, (name, subtitle, desc, color) in enumerate(models):
    x = start_x + i * (model_w + model_gap)
    # Card
    card = add_shape(slide, x, model_y, model_w, model_h, fill_color=CARD_BG,
                     line_color=color, line_width=Pt(2))
    # Colored top strip
    add_shape(slide, x, model_y, model_w, Pt(5), fill_color=color)
    # Title
    add_textbox(slide, x + Inches(0.15), model_y + Inches(0.15), model_w - Inches(0.3), Inches(0.35),
                name, font_size=18, font_color=color, bold=True, font_name="Space Grotesk",
                alignment=PP_ALIGN.CENTER)
    # Subtitle
    add_textbox(slide, x + Inches(0.15), model_y + Inches(0.55), model_w - Inches(0.3), Inches(0.6),
                subtitle, font_size=12, font_color=DARK, bold=True, font_name="Inter",
                alignment=PP_ALIGN.CENTER)
    # Description
    add_textbox(slide, x + Inches(0.15), model_y + Inches(1.2), model_w - Inches(0.3), Inches(0.7),
                desc, font_size=11, font_color=MED_GRAY, bold=False, font_name="Inter",
                alignment=PP_ALIGN.CENTER)

# Down arrows from all models
arrow_y = Inches(3.8)
for i in range(4):
    x = start_x + i * (model_w + model_gap) + model_w / 2 - Inches(0.15)
    add_textbox(slide, x, arrow_y, Inches(0.3), Inches(0.3),
                "▼", font_size=16, font_color=PRIMARY, bold=True, alignment=PP_ALIGN.CENTER)

# Evaluation box
eval_y = Inches(4.3)
eval_box = add_shape(slide, Inches(2.0), eval_y, Inches(9.3), Inches(1.2),
                     fill_color=RGBColor(0xEF, 0xF6, 0xFF), line_color=PRIMARY, line_width=Pt(2))
add_rich_textbox(slide, Inches(2.2), eval_y + Inches(0.12), Inches(9.0), Inches(1.0), [
    ("Forecast Evaluation (Held-Out Data)", 16, PRIMARY, True, PP_ALIGN.CENTER, "Space Grotesk", 8),
    ("MAE    |    RMSE    |    MAPE     →    Model Performance Comparison", 14, DARK, False, PP_ALIGN.CENTER, "Inter", 4),
    ("Model performance determined from observed data — not assumed superiority.", 12, MED_GRAY, False, PP_ALIGN.CENTER, "Inter", 0),
])

# Statistical vs ML labels
add_shape(slide, Inches(0.3), Inches(1.42), Inches(6.2), Inches(0.28), fill_color=PRIMARY)
add_textbox(slide, Inches(0.3), Inches(1.42), Inches(6.2), Inches(0.28),
            "Statistical Approaches", font_size=11, font_color=WHITE, bold=True,
            font_name="Inter", alignment=PP_ALIGN.CENTER)
add_shape(slide, Inches(6.85), Inches(1.42), Inches(3.5), Inches(0.28), fill_color=ACCENT)
add_textbox(slide, Inches(6.85), Inches(1.42), Inches(3.5), Inches(0.28),
            "Machine Learning", font_size=11, font_color=WHITE, bold=True,
            font_name="Inter", alignment=PP_ALIGN.CENTER)

set_notes(slide, "We intentionally use multiple forecasting approaches because different product-outlet demand series may behave differently. SMA may work well for relatively stable demand, Holt-Winters can capture trend and seasonality, ARIMA can model time-series dependencies, while XGBoost can capture nonlinear relationships using engineered features. The system will compare their performance rather than assuming that one algorithm is universally best.")

# ════════════════════════════════════════════════════════════════
# SLIDE 9 — Inventory Optimization & Recommendation Engine
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "From Forecasts to Decisions", "Inventory Optimization & Recommendation Engine")
add_bottom_bar(slide)
add_slide_number(slide, 9)

calc_steps = [
    ("Average Demand", PRIMARY),
    ("Sales Velocity", PRIMARY),
    ("Safety Stock", ACCENT),
    ("Reorder Point", ACCENT),
    ("Days of Stock Remaining", RGBColor(0xF5, 0x9E, 0x0B)),
    ("Recommended Replenishment", GREEN_ACC),
]

pipe_x = Inches(0.8)
pipe_y = Inches(1.65)
pipe_w = Inches(3.5)
pipe_h = Inches(0.6)
pipe_gap = Inches(0.12)

for i, (text, color) in enumerate(calc_steps):
    y = pipe_y + i * (pipe_h + pipe_gap)
    shp = add_shape(slide, pipe_x, y, pipe_w, pipe_h, fill_color=color)
    shp.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = shp.text_frame.paragraphs[0].add_run()
    run.text = text
    run.font.size = Pt(14)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"
    if i < len(calc_steps) - 1:
        add_textbox(slide, pipe_x + Inches(1.55), y + pipe_h - Inches(0.05),
                    Inches(0.4), Inches(0.28), "▼", font_size=13, font_color=color,
                    bold=True, alignment=PP_ALIGN.CENTER)

# Risk Detection card
risk_x = Inches(5.0)
add_card(slide, risk_x, Inches(1.65), Inches(3.8), Inches(2.8),
         "Risk Detection", [
             "Forecasted Demand > Available Stock",
             "   →  Potential Stockout",
             "Current Stock > Required Level",
             "   →  Potential Overstock",
         ], title_color=RGBColor(0xF5, 0x9E, 0x0B), border_color=LIGHT_GRAY,
         bullet_size=13, title_size=15)

# Priority card
add_card(slide, Inches(9.2), Inches(1.65), Inches(3.8), Inches(2.8),
         "Recommendation Priority", [
             "Critical — Expected stockout very soon",
             "High — Near-term stockout risk",
             "Medium — Below reorder point",
             "Low — Optimization / transfer",
         ], title_color=RED_ACCENT, border_color=LIGHT_GRAY,
         bullet_size=13, title_size=15)

# Configurable note
add_shape(slide, Inches(5.0), Inches(4.7), Inches(8.0), Inches(0.5),
          fill_color=RGBColor(0xEC, 0xFD, 0xF5), line_color=ACCENT, line_width=Pt(1))
add_textbox(slide, Inches(5.15), Inches(4.75), Inches(7.7), Inches(0.4),
            "* Thresholds are configurable/adaptable to the project context.",
            font_size=12, font_color=ACCENT, bold=False, font_name="Inter")

set_notes(slide, "This layer is what transforms prediction into practical decision support. For example, if forecasted demand indicates that an outlet is likely to run out of a product before the next replenishment cycle, StockMind can flag the risk and recommend replenishment. Recommendations are prioritized according to configurable risk thresholds.")

# ════════════════════════════════════════════════════════════════
# SLIDE 10 — Multi-Outlet Transfer Intelligence (Transfer Diagram)
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Intelligent Inventory Redistribution", "Multi-Outlet Transfer Intelligence")
add_bottom_bar(slide)
add_slide_number(slide, 10)

# Outlet A (surplus)
outlet_a_x = Inches(0.5)
outlet_a_y = Inches(1.8)
add_shape(slide, outlet_a_x, outlet_a_y, Inches(3.5), Inches(3.0),
          fill_color=CARD_BG, line_color=GREEN_ACC, line_width=Pt(2))
add_shape(slide, outlet_a_x, outlet_a_y, Inches(3.5), Pt(5), fill_color=GREEN_ACC)
add_rich_textbox(slide, outlet_a_x + Inches(0.2), outlet_a_y + Inches(0.2), Inches(3.1), Inches(2.7), [
    ("Outlet A", 20, GREEN_ACC, True, PP_ALIGN.CENTER, "Space Grotesk", 8),
    ("Potential Surplus", 13, GREEN_ACC, False, PP_ALIGN.CENTER, "Inter", 10),
    ("High Inventory", 14, DARK, True, PP_ALIGN.LEFT, "Inter", 4),
    ("Low Forecasted Demand", 14, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 8),
    ("", 6, DARK, False, PP_ALIGN.LEFT, "Inter", 2),
    ("Excess stock available\nfor redistribution", 12, MED_GRAY, False, PP_ALIGN.CENTER, "Inter", 0),
])

# StockMind AI (center)
center_x = Inches(4.8)
center_y = Inches(1.8)
add_shape(slide, center_x, center_y, Inches(3.5), Inches(3.0),
          fill_color=PRIMARY, line_color=PRIMARY, line_width=Pt(0))
add_rich_textbox(slide, center_x + Inches(0.2), center_y + Inches(0.3), Inches(3.1), Inches(2.5), [
    ("StockMind AI", 22, WHITE, True, PP_ALIGN.CENTER, "Space Grotesk", 10),
    ("Cross-Outlet Analysis", 13, RGBColor(0xBF, 0xDB, 0xFE), False, PP_ALIGN.CENTER, "Inter", 12),
    ("Compares inventory levels", 12, WHITE, False, PP_ALIGN.LEFT, "Inter", 3),
    ("vs. predicted demand", 12, WHITE, False, PP_ALIGN.LEFT, "Inter", 8),
    ("", 6, WHITE, False, PP_ALIGN.LEFT, "Inter", 2),
    ("Identifies matching", 12, ACCENT, True, PP_ALIGN.CENTER, "Inter", 2),
    ("surplus & shortage pairs", 12, ACCENT, True, PP_ALIGN.CENTER, "Inter", 0),
])

# Outlet B (shortage)
outlet_b_x = Inches(9.1)
outlet_b_y = Inches(1.8)
add_shape(slide, outlet_b_x, outlet_b_y, Inches(3.5), Inches(3.0),
          fill_color=CARD_BG, line_color=RED_ACCENT, line_width=Pt(2))
add_shape(slide, outlet_b_x, outlet_b_y, Inches(3.5), Pt(5), fill_color=RED_ACCENT)
add_rich_textbox(slide, outlet_b_x + Inches(0.2), outlet_b_y + Inches(0.2), Inches(3.1), Inches(2.7), [
    ("Outlet B", 20, RED_ACCENT, True, PP_ALIGN.CENTER, "Space Grotesk", 8),
    ("Potential Shortage", 13, RED_ACCENT, False, PP_ALIGN.CENTER, "Inter", 10),
    ("Low Inventory", 14, DARK, True, PP_ALIGN.LEFT, "Inter", 4),
    ("High Forecasted Demand", 14, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 8),
    ("", 6, DARK, False, PP_ALIGN.LEFT, "Inter", 2),
    ("Needs stock replenishment\nbefore next cycle", 12, MED_GRAY, False, PP_ALIGN.CENTER, "Inter", 0),
])

# Arrows between
add_textbox(slide, Inches(3.9), Inches(3.0), Inches(1.0), Inches(0.4),
            "→", font_size=26, font_color=GREEN_ACC, bold=True, alignment=PP_ALIGN.CENTER)
add_textbox(slide, Inches(8.3), Inches(3.0), Inches(1.0), Inches(0.4),
            "→", font_size=26, font_color=RED_ACCENT, bold=True, alignment=PP_ALIGN.CENTER)

# Recommendation box at bottom
rec_y = Inches(5.2)
add_shape(slide, Inches(0.5), rec_y, Inches(12.3), Inches(1.5),
          fill_color=RGBColor(0xEF, 0xF6, 0xFF), line_color=PRIMARY, line_width=Pt(2))
add_rich_textbox(slide, Inches(0.7), rec_y + Inches(0.12), Inches(11.9), Inches(1.3), [
    ("System Recommendation", 15, PRIMARY, True, PP_ALIGN.LEFT, "Space Grotesk", 6),
    ("Consider transferring Product X from Outlet A → Outlet B", 14, DARK, True, PP_ALIGN.LEFT, "Inter", 6),
    ("Displays: Product  |  Source Outlet  |  Destination Outlet  |  Current Inventory  |  Forecasted Demand  |  Suggested Quantity  |  Reasoning", 11, MED_GRAY, False, PP_ALIGN.LEFT, "Inter", 4),
    ("StockMind AI provides recommendations only — it does not execute physical transfers or purchase orders.", 11, RGBColor(0xF5, 0x9E, 0x0B), True, PP_ALIGN.LEFT, "Inter", 0),
])

set_notes(slide, "One important part of our multi-outlet design is transfer intelligence. Instead of immediately recommending a new purchase, the system can identify situations where another outlet may have sufficient surplus. This can potentially improve inventory utilization across the chain. The system remains decision-support software and does not automatically execute transfers.")

# ════════════════════════════════════════════════════════════════
# SLIDE 11 — System Architecture (9-layer)
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Layered System Architecture")
add_bottom_bar(slide)
add_slide_number(slide, 11)

layers = [
    ("1. Data Management & Validation", "Historical sales and inventory data", PRIMARY),
    ("2. Data Preprocessing & Feature Preparation", "Cleaning, aggregation, time series, features", PRIMARY),
    ("3. Demand Forecasting Layer", "SMA  |  Holt-Winters  |  ARIMA  |  XGBoost", ACCENT),
    ("4. Forecast Evaluation", "MAE  |  RMSE  |  MAPE", ACCENT),
    ("5. Inventory Optimization", "Safety Stock  |  Reorder Point  |  Days of Stock  |  Replenishment  |  EOQ", PRIMARY),
    ("6. Risk & Recommendation Engine", "Stockout  |  Overstock  |  Priorities  |  Transfers", RGBColor(0xF5, 0x9E, 0x0B)),
    ("7. Backend API", "FastAPI  |  REST  |  Pydantic", PRIMARY),
    ("8. Frontend Presentation", "React  |  TypeScript  |  TailwindCSS", ACCENT),
    ("9. Inventory Intelligence Dashboard", "Interactive analytics & decision support", DARK),
]

layer_w = Inches(11.5)
layer_h = Inches(0.55)
layer_gap = Inches(0.08)
start_x = Inches(0.9)
start_y = Inches(1.5)

for i, (title, subtitle, color) in enumerate(layers):
    y = start_y + i * (layer_h + layer_gap)
    shp = add_shape(slide, start_x, y, layer_w, layer_h, fill_color=color)
    shp.text_frame.word_wrap = True
    tf = shp.text_frame
    tf.paragraphs[0].alignment = PP_ALIGN.LEFT
    run = tf.paragraphs[0].add_run()
    run.text = f"  {title}"
    run.font.size = Pt(13)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Space Grotesk"
    run2 = tf.paragraphs[0].add_run()
    run2.text = f"    —  {subtitle}"
    run2.font.size = Pt(11)
    run2.font.color.rgb = RGBColor(0xBF, 0xDB, 0xFE)
    run2.font.bold = False
    run2.font.name = "Inter"
    # Down arrow between layers
    if i < len(layers) - 1:
        add_textbox(slide, start_x + layer_w / 2 - Inches(0.15), y + layer_h - Inches(0.02),
                    Inches(0.3), Inches(0.22), "▼", font_size=10, font_color=color,
                    bold=True, alignment=PP_ALIGN.CENTER)

set_notes(slide, "Our architecture is modular. Forecasting, inventory optimization, recommendation logic, API services, and frontend presentation are separated. This allows us to develop and test each major component independently while still integrating them into one product.")

# ════════════════════════════════════════════════════════════════
# SLIDE 12 — Technology Stack
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Technology Stack")
add_bottom_bar(slide)
add_slide_number(slide, 12)

stack_data = [
    ("Frontend", "React, TypeScript, Vite, TailwindCSS", PRIMARY),
    ("Visualization", "React-compatible charting library", PRIMARY),
    ("Backend", "Python, FastAPI, REST APIs", ACCENT),
    ("Validation", "Pydantic", ACCENT),
    ("Data Processing", "pandas, NumPy", PRIMARY),
    ("Statistical Forecasting", "statsmodels", PRIMARY),
    ("Machine Learning", "scikit-learn, XGBoost", ACCENT),
    ("Database", "Relational / structured storage", ACCENT),
    ("Development", "VS Code, Git, GitHub", PRIMARY),
    ("API Testing", "Postman / equivalent", PRIMARY),
    ("Deployment", "Suitable cloud/server environment", ACCENT),
]

col_w = Inches(6.0)
col_gap = Inches(0.4)
row_h = Inches(0.52)
row_gap = Inches(0.06)
col_x = [Inches(0.6), Inches(6.9)]

for idx, (layer, techs, color) in enumerate(stack_data):
    col = idx // 6
    row = idx % 6
    x = col_x[col]
    y = Inches(1.55) + row * (row_h + row_gap)

    # Layer label
    label_box = add_shape(slide, x, y, Inches(2.0), row_h, fill_color=color)
    label_box.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT
    run = label_box.text_frame.paragraphs[0].add_run()
    run.text = f"  {layer}"
    run.font.size = Pt(13)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Space Grotesk"

    # Tech value
    val_box = add_shape(slide, x + Inches(2.05), y, Inches(3.95), row_h,
                        fill_color=CARD_BG, line_color=LIGHT_GRAY, line_width=Pt(1))
    val_box.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT
    run = val_box.text_frame.paragraphs[0].add_run()
    run.text = f"  {techs}"
    run.font.size = Pt(13)
    run.font.color.rgb = DARK
    run.font.bold = False
    run.font.name = "Inter"

set_notes(slide, "We selected technologies that allow us to build the project as a complete software product rather than only a machine-learning experiment. Python provides the forecasting and data-processing ecosystem, FastAPI provides the backend API, and React provides the interactive dashboard.")

# ════════════════════════════════════════════════════════════════
# SLIDE 13 — Data & System Workflow
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Data Processing Pipeline")
add_bottom_bar(slide)
add_slide_number(slide, 13)

pipeline = [
    ("Input Data", "Sales Data &\nInventory Data", PRIMARY),
    ("Validation", "Required fields, types,\nmissing values, consistency", RGBColor(0xF5, 0x9E, 0x0B)),
    ("Processing", "Cleaning, aggregation,\ntime series, features", ACCENT),
    ("AI & Analytics", "Demand analysis, forecasting,\nevaluation, optimization", PRIMARY),
    ("Output", "Forecasts + Risks + KPIs\n+ Recommendations", GREEN_ACC),
]

pipe_w = Inches(2.2)
pipe_h = Inches(3.2)
pipe_gap = Inches(0.35)
pipe_start_x = Inches(0.55)
pipe_y = Inches(1.55)

for i, (title, desc, color) in enumerate(pipeline):
    x = pipe_start_x + i * (pipe_w + pipe_gap)
    # Card
    card = add_shape(slide, x, pipe_y, pipe_w, pipe_h, fill_color=CARD_BG,
                     line_color=color, line_width=Pt(2))
    add_shape(slide, x, pipe_y, pipe_w, Pt(5), fill_color=color)
    # Step number
    circle = add_shape(slide, x + pipe_w / 2 - Inches(0.22), pipe_y + Inches(0.2),
                       Inches(0.44), Inches(0.44), fill_color=color, shape_type=MSO_SHAPE.OVAL)
    circle.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = circle.text_frame.paragraphs[0].add_run()
    run.text = str(i + 1)
    run.font.size = Pt(16)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"
    # Title
    add_textbox(slide, x + Inches(0.1), pipe_y + Inches(0.75), pipe_w - Inches(0.2), Inches(0.4),
                title, font_size=15, font_color=color, bold=True,
                font_name="Space Grotesk", alignment=PP_ALIGN.CENTER)
    # Description
    add_textbox(slide, x + Inches(0.1), pipe_y + Inches(1.25), pipe_w - Inches(0.2), Inches(1.8),
                desc, font_size=12, font_color=MED_GRAY, bold=False,
                font_name="Inter", alignment=PP_ALIGN.CENTER)
    # Arrow to next
    if i < len(pipeline) - 1:
        add_textbox(slide, x + pipe_w + Inches(0.05), pipe_y + Inches(1.35),
                    Inches(0.3), Inches(0.3), "→", font_size=20, font_color=MED_GRAY,
                    bold=True, alignment=PP_ALIGN.CENTER)

# Data quality note
add_shape(slide, Inches(0.55), Inches(5.1), Inches(12.2), Inches(0.6),
          fill_color=RGBColor(0xEF, 0xF6, 0xFF), line_color=PRIMARY, line_width=Pt(1))
add_textbox(slide, Inches(0.7), Inches(5.17), Inches(11.9), Inches(0.45),
            "Data quality is critical — forecasting and inventory recommendations are only as reliable as their inputs.",
            font_size=13, font_color=PRIMARY, bold=False, font_name="Inter", alignment=PP_ALIGN.CENTER)

set_notes(slide, "Data quality is important because forecasting and inventory recommendations are only as reliable as their inputs. Therefore, data validation and preprocessing are treated as an explicit part of our architecture.")

# ════════════════════════════════════════════════════════════════
# SLIDE 14 — Scope & Boundaries
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Scope & Boundaries")
add_bottom_bar(slide)
add_slide_number(slide, 14)

included = [
    "Multi-outlet retail inventory intelligence",
    "Historical sales and inventory analysis",
    "Product-outlet demand forecasting",
    "Multiple forecasting approaches",
    "Forecast evaluation",
    "Inventory optimization calculations",
    "Stockout and overstock detection",
    "Prioritized recommendations",
    "Inter-outlet transfer opportunities",
    "Interactive dashboard",
    "Product and outlet analytics",
    "Data validation",
]
add_card(slide, Inches(0.5), Inches(1.55), Inches(5.9), Inches(5.35),
         "Included", included, title_color=GREEN_ACC, border_color=GREEN_ACC, bullet_size=13, title_size=17)

excluded = [
    "Full ERP/POS system",
    "Automated supplier purchase orders",
    "Automatic physical stock transfers",
    "Payment/accounting systems",
    "Warehouse management system",
    "Direct live POS integration",
    "Fully automated purchasing decisions",
    "Weather/promotion-based forecasting",
]
add_card(slide, Inches(6.7), Inches(1.55), Inches(6.1), Inches(5.35),
         "Outside Current Scope", excluded, title_color=RED_ACCENT, border_color=RED_ACCENT,
         bullet_size=13, title_size=17)

set_notes(slide, "We have deliberately defined boundaries so that the FYP remains achievable while still demonstrating substantial AI and software engineering complexity. StockMind is a decision-support platform, not a replacement for a complete ERP or POS system.")

# ════════════════════════════════════════════════════════════════
# SLIDE 15 — Project Plan & Milestones
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "17-Week Development Plan")
add_bottom_bar(slide)
add_slide_number(slide, 15)

milestones = [
    ("M1", "Week 4", "Project Scope &\nRequirements Approved", PRIMARY),
    ("M2", "Week 6", "System Architecture &\nUI Design Completed", PRIMARY),
    ("M3", "Week 7", "Dataset & Data\nPipeline Completed", ACCENT),
    ("M4", "Week 10", "Forecasting Engine\nCompleted", ACCENT),
    ("M5", "Week 11", "Inventory Optimization &\nRecommendation Engine", PRIMARY),
    ("M6", "Week 12", "Core Frontend &\nBackend Integrated", PRIMARY),
    ("M7", "Week 15", "System Testing\nCompleted", GREEN_ACC),
    ("M8", "Week 16", "User Acceptance\nTesting Completed", GREEN_ACC),
    ("M9", "Week 17", "Final Deployment &\nDemonstration Ready", DARK),
]

# Timeline bar
bar_y = Inches(3.5)
add_shape(slide, Inches(0.5), bar_y, Inches(12.3), Pt(4), fill_color=LIGHT_GRAY)

ms_w = Inches(1.2)
ms_gap = Inches(0.18)
ms_start_x = Inches(0.5)

for i, (label, week, desc, color) in enumerate(milestones):
    x = ms_start_x + i * (ms_w + ms_gap)
    # Dot on timeline
    dot = add_shape(slide, x + ms_w / 2 - Inches(0.1), bar_y - Inches(0.08),
                    Inches(0.2), Inches(0.2), fill_color=color, shape_type=MSO_SHAPE.OVAL)
    # Label above
    add_textbox(slide, x, bar_y - Inches(0.7), ms_w, Inches(0.55),
                f"{label}\n{week}", font_size=11, font_color=color, bold=True,
                font_name="Space Grotesk", alignment=PP_ALIGN.CENTER)
    # Description below
    add_textbox(slide, x, bar_y + Inches(0.25), ms_w, Inches(1.5),
                desc, font_size=10, font_color=MED_GRAY, bold=False,
                font_name="Inter", alignment=PP_ALIGN.CENTER)

# Parallel development note
add_shape(slide, Inches(0.5), Inches(5.9), Inches(12.3), Inches(0.55),
          fill_color=RGBColor(0xEF, 0xF6, 0xFF), line_color=PRIMARY, line_width=Pt(1))
add_textbox(slide, Inches(0.7), Inches(5.97), Inches(11.9), Inches(0.4),
            "Parallel Development: Frontend progresses alongside backend & forecasting once interfaces are established.",
            font_size=12, font_color=PRIMARY, bold=False, font_name="Inter", alignment=PP_ALIGN.CENTER)

set_notes(slide, "Our development plan follows an iterative approach. Some activities are intentionally parallelized. For example, frontend development can proceed while the forecasting and backend modules are being developed, provided that the required interfaces and data structures have been established.")

# ════════════════════════════════════════════════════════════════
# SLIDE 16 — Team Responsibilities
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Project Team")
add_bottom_bar(slide)
add_slide_number(slide, 16)

add_card(slide, Inches(0.5), Inches(1.55), Inches(3.9), Inches(5.35),
         "Meer Musabih\nLead Developer / ML & Backend Engineer", [
             "Data pipeline & validation",
             "Forecasting engine",
             "Model evaluation",
             "Inventory optimization",
             "Recommendation engine",
             "Transfer intelligence",
             "FastAPI backend & API",
             "Data storage",
             "Technical documentation",
         ], title_color=PRIMARY, border_color=PRIMARY, bullet_size=12, title_size=14)

add_card(slide, Inches(4.7), Inches(1.55), Inches(3.9), Inches(5.35),
         "Malaika Saleem\nFrontend / Product & QA Engineer", [
             "UI/UX design",
             "React frontend",
             "Dashboard development",
             "Charts & visualizations",
             "Product/outlet views",
             "Filters and tables",
             "API integration",
             "Usability testing",
             "User documentation",
         ], title_color=ACCENT, border_color=ACCENT, bullet_size=12, title_size=14)

add_card(slide, Inches(8.9), Inches(1.55), Inches(3.9), Inches(5.35),
         "Shared Responsibilities", [
             "Requirements analysis",
             "System architecture",
             "Integration",
             "Testing",
             "Deployment",
             "Final documentation",
             "Presentation & demonstration",
         ], title_color=DARK, border_color=DARK, bullet_size=12, title_size=14)

set_notes(slide, "We have divided responsibilities according to the major technical components while keeping important activities such as requirements, integration, testing, deployment, and documentation shared between both team members.")

# ════════════════════════════════════════════════════════════════
# SLIDE 17 — Expected Outcomes
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Expected Outcomes")
add_bottom_bar(slide)
add_slide_number(slide, 17)

outcomes = [
    ("Predictive Intelligence", "Forecast future\nproduct-outlet demand", PRIMARY),
    ("Inventory Intelligence", "Understand inventory health\nand projected stock position", ACCENT),
    ("Prescriptive Decision Support", "Recommend replenishment\nand potential transfers", GREEN_ACC),
    ("Multi-Outlet Visibility", "Centralized company and\noutlet-level analytics", PRIMARY),
    ("Model Comparison", "Evaluate multiple forecasting\napproaches using observed data", ACCENT),
    ("Interactive Product", "Functional web-based application\nrather than an isolated prototype", DARK),
]

card_w = Inches(3.85)
card_h = Inches(2.0)
gap_x = Inches(0.22)
gap_y = Inches(0.25)
start_x = Inches(0.5)
start_y = Inches(1.55)

for idx, (title, desc, color) in enumerate(outcomes):
    row = idx // 3
    col = idx % 3
    x = start_x + col * (card_w + gap_x)
    y = start_y + row * (card_h + gap_y)
    add_shape(slide, x, y, card_w, card_h, fill_color=CARD_BG,
              line_color=color, line_width=Pt(2))
    add_shape(slide, x, y, Pt(5), card_h, fill_color=color)
    add_textbox(slide, x + Inches(0.25), y + Inches(0.2), card_w - Inches(0.4), Inches(0.35),
                title, font_size=15, font_color=color, bold=True, font_name="Space Grotesk")
    add_textbox(slide, x + Inches(0.25), y + Inches(0.65), card_w - Inches(0.4), Inches(1.2),
                desc, font_size=12, font_color=MED_GRAY, bold=False, font_name="Inter")

# Academic outcome strip
add_shape(slide, Inches(0.5), Inches(5.9), Inches(12.3), Inches(1.1),
          fill_color=RGBColor(0xEF, 0xF6, 0xFF), line_color=PRIMARY, line_width=Pt(2))
add_rich_textbox(slide, Inches(0.7), Inches(5.95), Inches(11.9), Inches(1.0), [
    ("Academic Outcome: Integration of", 13, PRIMARY, True, PP_ALIGN.CENTER, "Space Grotesk", 4),
    ("Software Engineering  +  Data Processing  +  Statistical Forecasting  +  Machine Learning  +  Inventory Optimization  +  Decision Support",
     12, DARK, False, PP_ALIGN.CENTER, "Inter", 0),
])

set_notes(slide, "The expected outcome is a complete functional product that demonstrates both software engineering and artificial intelligence capabilities. The main distinction from a basic forecasting project is the end-to-end integration from raw data to actionable inventory decisions.")

# ════════════════════════════════════════════════════════════════
# SLIDE 18 — Comparative Analysis
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "Comparative Analysis", "StockMind AI vs. Commercial Vendor Solutions")
add_bottom_bar(slide)
add_slide_number(slide, 18)

# Comparative matrix: rows = capability, columns = existing vendor solutions vs StockMind AI
comp_columns = ["Capability", "RELEX Solutions", "Blue Yonder (JDA)", "Slimstock", "StockMind AI"]
comp_rows = [
    ("Demand Forecasting", "Statistical + ML models",
     "Enterprise planning models", "Statistical forecasting", "Statistical + ML models, evaluated"),
    ("Forecast Evaluation", "Limited visibility",
     "Not always exposed",       "Basic metrics",       "MAE / RMSE / MAPE on held-out data"),
    ("Safety Stock & Reorder", "Advanced optimization",
     "Supply-chain planning",    "Inventory policies",  "Calculated from predicted demand"),
    ("Risk Detection", "Alerts (paid tiers)",
     "Dashboard alerts",         "Reorder alerts",      "Predictive stockout & overstock flags"),
    ("Multi-Outlet Transfers", "Yes (enterprise scope)",
     "Partial / module",         "Limited",             "Surplus ↔ shortage matching"),
    ("Target Market", "Large retail / FMCG",
     "Global enterprises",       "SMB / mid-market",    "Small & mid multi-outlet chains"),
    ("Cost & Setup", "High license + services",
     "Very high, long rollout",  "Medium, subscription", "Lightweight, low-cost web app"),
]

# Column header band
col_widths = [Inches(2.1), Inches(2.68), Inches(2.68), Inches(2.28), Inches(2.68)]
table_x = Inches(0.35)
table_y = Inches(1.6)
header_h = Inches(0.5)
col_colors = [DARK, MED_GRAY, MED_GRAY, MED_GRAY, ACCENT]
highlight_col = 4  # StockMind AI

cx = table_x
for ci, (label, color) in enumerate(zip(comp_columns, col_colors)):
    shp = add_shape(slide, cx, table_y, col_widths[ci], header_h, fill_color=color)
    shp.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    shp.text_frame.word_wrap = True
    run = shp.text_frame.paragraphs[0].add_run()
    run.text = label if ci == 0 else (" " + label)
    run.font.size = Pt(11)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Space Grotesk"
    cx += col_widths[ci]

# Rows
row_h = Inches(0.52)
row_gap = Inches(0.04)
ry = table_y + header_h + Inches(0.05)

for ri, row in enumerate(comp_rows):
    cx = table_x
    for ci, cell in enumerate(row):
        is_first = (ci == 0)
        if ci == highlight_col:
            fill = TEAL_LIGHT if ri % 2 == 0 else RGBColor(0x99, 0xF6, 0xE4)
            line_color = ACCENT
            text_color = RGBColor(0x13, 0x4E, 0x4A)
            bold = True
        else:
            fill = CARD_BG if ri % 2 == 0 else RGBColor(0xF3, 0xF4, 0xF6)
            line_color = LIGHT_GRAY
            text_color = PRIMARY if is_first else DARK
            bold = is_first
        shp = add_shape(slide, cx, ry, col_widths[ci], row_h, fill_color=fill,
                        line_color=line_color, line_width=Pt(1))
        shp.text_frame.word_wrap = True
        shp.text_frame.margin_left = Inches(0.08)
        shp.text_frame.margin_right = Inches(0.08)
        shp.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT
        run = shp.text_frame.paragraphs[0].add_run()
        run.text = cell
        run.font.size = Pt(10.5)
        run.font.color.rgb = text_color
        run.font.bold = bold
        run.font.name = "Inter"
        cx += col_widths[ci]
    ry += row_h + row_gap

# Summary bar
add_shape(slide, Inches(0.35), Inches(6.55), Inches(12.65), Inches(0.6),
          fill_color=RGBColor(0xEC, 0xFD, 0xF5), line_color=ACCENT, line_width=Pt(1.5))
add_textbox(slide, Inches(0.55), Inches(6.62), Inches(12.3), Inches(0.45),
            "Key contrast: commercial solutions target large enterprises with high costs and long rollouts — StockMind AI is built specifically for small & mid multi-outlet chains, with transparent, evaluated forecasts.",
            font_size=13, font_color=DARK, bold=False, font_name="Inter", alignment=PP_ALIGN.LEFT)

set_notes(slide, "This comparison benchmarks StockMind AI against established commercial solutions such as RELEX, Blue Yonder, and Slimstock. These products are enterprise-grade: they demand large budgets, long implementation, dedicated data teams, and target large retailers or global supply chains. StockMind AI differentiates on accessibility — a lightweight, low-cost web app for small and mid multi-outlet chains that still evaluates multiple forecasting models on held-out data, derives safety stock and reorder points from predicted demand, proactively flags stockout and overstock risks, and proposes surplus-shortage transfer matches across company, outlet, and product levels.")

# ════════════════════════════════════════════════════════════════
# SLIDE 19 — References
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)
add_header_bar(slide, "References")
add_bottom_bar(slide)
add_slide_number(slide, 19)

references = [
    ("1", "Box, G. E. P., & Jenkins, G. M. — Time Series Analysis: Forecasting and Control",
     "Foundational text for ARIMA modeling used in the forecasting engine."),
    ("2", "Holt, C. C. — Forecasting Seasonals and Trends by Exponentially Weighted Moving Averages",
     "Basis for exponential smoothing approaches such as Holt-Winters."),
    ("3", "Chen, T., & Guestrin, C. — XGBoost: A Scalable Tree Boosting System (KDD 2016)",
     "Machine-learning gradient boosting method included in the model comparison."),
    ("4", "Hyndman, R. J., & Athanasopoulos, G. — Forecasting: Principles and Practice",
     "Practical guidance on forecast evaluation metrics including MAE, RMSE, and MAPE."),
    ("5", "Silver, E. A., Pyke, D. F., & Thomas, D. J. — Inventory and Production Management",
     "Standard reference for safety stock, reorder point, and inventory control."),
    ("6", "Chopra, S., & Meindl, P. — Supply Chain Management: Strategy, Planning, and Operation",
     "Framework for multi-location inventory and supply-chain coordination."),
    ("7", "Nahmias, S. — Production and Operations Analysis",
     "Inventory policies, EOQ, and replenishment decision foundations."),
    ("8", "Kuhn, M., & Johnson, K. — Applied Predictive Modeling",
     "Model evaluation and validation practices for supervised learning."),
]

ref_w = Inches(6.05)
ref_h = Inches(1.5)
gap_x = Inches(0.2)
gap_y = Inches(0.2)
start_x = Inches(0.5)
start_y = Inches(1.6)

for idx, (num, citation, note) in enumerate(references):
    row = idx // 2
    col = idx % 2
    x = start_x + col * (ref_w + gap_x)
    y = start_y + row * (ref_h + gap_y)
    shp = add_shape(slide, x, y, ref_w, ref_h, fill_color=CARD_BG,
                    line_color=PRIMARY, line_width=Pt(1.5))
    badge = add_shape(slide, x + Inches(0.12), y + Inches(0.12), Inches(0.4), Inches(0.4),
                      fill_color=PRIMARY, shape_type=MSO_SHAPE.OVAL)
    badge.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = badge.text_frame.paragraphs[0].add_run()
    run.text = num
    run.font.size = Pt(12)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"
    add_textbox(slide, x + Inches(0.6), y + Inches(0.12), ref_w - Inches(0.75), Inches(0.65),
                citation, font_size=12, font_color=DARK, bold=True,
                font_name="Inter")
    add_textbox(slide, x + Inches(0.6), y + Inches(0.82), ref_w - Inches(0.75), Inches(0.6),
                note, font_size=10, font_color=MED_GRAY, bold=False,
                font_name="Inter")

set_notes(slide, "References support the forecasting and inventory methodology used in StockMind AI. ARIMA and exponential smoothing are grounded in classic time-series literature, XGBoost follows the original gradient boosting publication, forecasting evaluation follows Forecasting: Principles and Practice, and safety stock, reorder point, EOQ, and multi-location coordination rely on established inventory and supply-chain references.")

# ════════════════════════════════════════════════════════════════
# SLIDE 20 — Conclusion
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)

add_slide_number(slide, 20)
add_logo(slide)
add_shape(slide, Inches(0), Inches(0), Inches(0.12), SLIDE_H, fill_color=ACCENT)

add_textbox(slide, Inches(1.2), Inches(0.6), Inches(11), Inches(0.7),
            "StockMind AI", font_size=40, font_color=PRIMARY, bold=True,
            font_name="Space Grotesk")
add_textbox(slide, Inches(1.2), Inches(1.25), Inches(11), Inches(0.4),
            "From Data → Prediction → Decision", font_size=18, font_color=ACCENT,
            bold=True, font_name="Inter")

# Flow steps
conclusion_steps = [
    ("Historical Data", PRIMARY),
    ("Demand Forecasting", PRIMARY),
    ("Forecast Evaluation", ACCENT),
    ("Inventory Optimization", ACCENT),
    ("Risk Detection", RGBColor(0xF5, 0x9E, 0x0B)),
    ("Actionable Recommendations", GREEN_ACC),
    ("Multi-Outlet Intelligence", GREEN_ACC),
]

step_w = Inches(1.55)
step_h = Inches(0.65)
step_gap = Inches(0.15)
step_start_x = Inches(0.8)
step_y = Inches(2.2)

for i, (text, color) in enumerate(conclusion_steps):
    x = step_start_x + i * (step_w + step_gap)
    shp = add_shape(slide, x, step_y, step_w, step_h, fill_color=color)
    shp.text_frame.word_wrap = True
    shp.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = shp.text_frame.paragraphs[0].add_run()
    run.text = text
    run.font.size = Pt(11)
    run.font.color.rgb = WHITE
    run.font.bold = True
    run.font.name = "Inter"
    if i < len(conclusion_steps) - 1:
        add_textbox(slide, x + step_w + Inches(0.01), step_y + Inches(0.12),
                    Inches(0.18), Inches(0.35), "→", font_size=14, font_color=MED_GRAY,
                    bold=True, alignment=PP_ALIGN.CENTER)

# Final goal
add_shape(slide, Inches(1.2), Inches(3.5), Inches(10.9), Inches(1.2),
          fill_color=RGBColor(0x1E, 0x29, 0x3B), line_color=ACCENT, line_width=Pt(2))
add_rich_textbox(slide, Inches(1.4), Inches(3.65), Inches(10.5), Inches(0.9), [
    ("Final Goal", 14, ACCENT, True, PP_ALIGN.LEFT, "Space Grotesk", 6),
    ("Help retail decision-makers make better inventory planning decisions", 18, WHITE, True, PP_ALIGN.LEFT, "Inter", 2),
    ("using data-driven intelligence.", 18, ACCENT, True, PP_ALIGN.LEFT, "Inter", 0),
])

# Bottom accent
add_shape(slide, Inches(0), Inches(7.25), SLIDE_W, Inches(0.25), fill_color=ACCENT)

set_notes(slide, "To conclude, StockMind AI combines multiple areas of computing into one practical product. It uses historical data to forecast demand, evaluates forecasting approaches, calculates inventory requirements, identifies risks, and provides actionable recommendations through an interactive web platform. Thank you.")

# ════════════════════════════════════════════════════════════════
# SLIDE 21 — Q&A
# ════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide, BG)

add_slide_number(slide, 21)
add_logo(slide)
add_shape(slide, Inches(0), Inches(0), Inches(0.12), SLIDE_H, fill_color=ACCENT)

# Thank you
add_textbox(slide, Inches(1.2), Inches(1.5), Inches(11), Inches(1.0),
            "Thank You", font_size=52, font_color=PRIMARY, bold=True,
            font_name="Space Grotesk", alignment=PP_ALIGN.CENTER)

add_textbox(slide, Inches(1.2), Inches(2.5), Inches(11), Inches(0.5),
            "Questions & Discussion", font_size=22, font_color=ACCENT,
            bold=False, font_name="Inter", alignment=PP_ALIGN.CENTER)

# Divider
add_shape(slide, Inches(5.5), Inches(3.2), Inches(2.3), Pt(2), fill_color=MED_GRAY)

# StockMind AI label
add_textbox(slide, Inches(1.2), Inches(3.6), Inches(11), Inches(0.5),
            "StockMind AI", font_size=28, font_color=PRIMARY, bold=True,
            font_name="Space Grotesk", alignment=PP_ALIGN.CENTER)

add_textbox(slide, Inches(1.2), Inches(4.15), Inches(11), Inches(0.4),
            "An Intelligent Demand Forecasting and Inventory Optimization System",
            font_size=14, font_color=MED_GRAY, bold=False,
            font_name="Inter", alignment=PP_ALIGN.CENTER)

# Team info
add_rich_textbox(slide, Inches(1.2), Inches(4.9), Inches(11), Inches(1.8), [
    ("Meer Musabih  |  Malaika Saleem", 16, DARK, True, PP_ALIGN.CENTER, "Inter", 6),
    ("Supervisor: Dr. Muhammad Fawad", 14, PRIMARY, False, PP_ALIGN.CENTER, "Inter", 6),
    ("Riphah International University — Lahore", 14, ACCENT, False, PP_ALIGN.CENTER, "Inter", 0),
])

# Bottom accent
add_shape(slide, Inches(0), Inches(7.25), SLIDE_W, Inches(0.25), fill_color=ACCENT)

set_notes(slide, "Questions and discussion.")


# ── Save ───────────────────────────────────────────────────────
output_path = r"D:\inventory forecast project\StockMind_AI_Proposal_beta.pptx"
temp_path = r"C:\Users\sirh9\AppData\Local\Temp\StockMind_AI_Proposal_beta.pptx"
prs.save(temp_path)
try:
    import os, shutil
    if os.path.exists(output_path):
        os.remove(output_path)
    shutil.copy2(temp_path, output_path)
    print(f"Presentation saved to: {output_path}")
except PermissionError as e:
    print(f"Original locked, saved to temp instead. {e}")
    print(f"Temp file: {temp_path}")
print(f"Total slides: {len(prs.slides)}")