"""
make_slides.py
==============
Generates dungeon_quest_slides.pptx using only Python standard library.
No third-party libraries (no python-pptx, no lxml, etc.)

DUNGEON QUEST — hackathon presentation (10 slides, dark pixel art theme)
Run: python3 make_slides.py
"""

import zipfile
import io
import os

# ---------------------------------------------------------------------------
# Color palette (hex without #)
# ---------------------------------------------------------------------------
BG       = "09091a"   # near-black background
GOLD     = "ffcc44"   # accent gold
BLUE     = "6699ff"   # accent blue
WHITE    = "eeeeee"   # body text
PANEL    = "111128"   # panel / card background
GREEN    = "44cc88"   # green accent
RED      = "ff6655"   # danger / HP
DARK_GOLD= "b38b00"   # darker gold for borders

# ---------------------------------------------------------------------------
# EMU helpers
# ---------------------------------------------------------------------------
SLIDE_W = 12192000   # 16:9 width  in EMU
SLIDE_H =  6858000   # 16:9 height in EMU

def emu(cm: float) -> int:
    """Convert centimetres to EMU (1 cm = 360000 EMU)."""
    return int(cm * 360000)

def pt(points: float) -> int:
    """Convert points to hundredths-of-a-point (used in pptx font size)."""
    return int(points * 100)

# ---------------------------------------------------------------------------
# XML building helpers
# ---------------------------------------------------------------------------

def xml_escape(text: str) -> str:
    return (text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;"))

def solid_fill(hex_color: str) -> str:
    """Return solidFill XML fragment."""
    return f'<a:solidFill><a:srgbClr val="{hex_color}"/></a:solidFill>'

def no_fill() -> str:
    return '<a:noFill/>'

def no_line() -> str:
    return '<a:ln><a:noFill/></a:ln>'

def line_fill(hex_color: str, w_emu: int = 12700) -> str:
    return f'<a:ln w="{w_emu}">{solid_fill(hex_color)}</a:ln>'

def sp_pr(x: int, y: int, cx: int, cy: int,
          fill_xml: str = "",
          line_xml: str = "",
          rx: int = 0) -> str:
    """Shape properties (position + size + optional fill/line/round)."""
    prstGeom = f'<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val {rx}"/></a:avLst></a:prstGeom>' if rx else '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
    return (
        f'<p:spPr>'
        f'<a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        f'{prstGeom}'
        f'{fill_xml}'
        f'{line_xml}'
        f'</p:spPr>'
    )

def txBody(
    *paragraphs,           # each item: (text, size_pt, bold, color_hex, align)
    vert_anchor: str = "t",
    inset_l: int = 91440,
    inset_r: int = 91440,
    inset_t: int = 45720,
    inset_b: int = 45720,
    wrap: bool = True,
) -> str:
    wrap_attr = 'wrap="square"' if wrap else 'wrap="none"'
    paras_xml = ""
    for item in paragraphs:
        if item is None:
            paras_xml += "<a:p/>"
            continue
        text, size, bold, color, align = item
        b_attr  = "1" if bold else "0"
        align_attr = f' algn="{align}"' if align else ""
        latin = '<a:latin typeface="+mj-lt"/>'
        paras_xml += (
            f'<a:p>'
            f'<a:pPr{align_attr}/>'
            f'<a:r>'
            f'<a:rPr lang="ja-JP" altLang="en-US" sz="{pt(size)}" b="{b_attr}" dirty="0">'
            f'{solid_fill(color)}'
            f'{latin}'
            f'</a:rPr>'
            f'<a:t>{xml_escape(text)}</a:t>'
            f'</a:r>'
            f'</a:p>'
        )
    return (
        f'<p:txBody>'
        f'<a:bodyPr {wrap_attr} anchor="{vert_anchor}" lIns="{inset_l}" rIns="{inset_r}" tIns="{inset_t}" bIns="{inset_b}"/>'
        f'<a:lstStyle/>'
        f'{paras_xml}'
        f'</p:txBody>'
    )

def text_shape(
    shape_id: int,
    x: int, y: int, cx: int, cy: int,
    *paragraphs,
    fill: str = "",
    line: str = "",
    rx: int = 0,
    vert_anchor: str = "t",
) -> str:
    """A complete <p:sp> text box."""
    fill_xml = solid_fill(fill) if fill else no_fill()
    line_xml = line_fill(line) if line else no_line()
    return (
        f'<p:sp>'
        f'<p:nvSpPr>'
        f'<p:cNvPr id="{shape_id}" name="Shape{shape_id}"/>'
        f'<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>'
        f'<p:nvPr/>'
        f'</p:nvSpPr>'
        f'{sp_pr(x, y, cx, cy, fill_xml, line_xml, rx)}'
        f'{txBody(*paragraphs, vert_anchor=vert_anchor)}'
        f'</p:sp>'
    )

def rect_shape(shape_id: int, x: int, y: int, cx: int, cy: int,
               fill: str = PANEL, line_color: str = GOLD, line_w: int = 19050,
               rx: int = 0) -> str:
    """A filled rectangle (no text)."""
    fill_xml = solid_fill(fill)
    line_xml = line_fill(line_color, line_w) if line_color else no_line()
    return (
        f'<p:sp>'
        f'<p:nvSpPr>'
        f'<p:cNvPr id="{shape_id}" name="Rect{shape_id}"/>'
        f'<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>'
        f'<p:nvPr/>'
        f'</p:nvSpPr>'
        f'{sp_pr(x, y, cx, cy, fill_xml, line_xml, rx)}'
        f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>'
        f'</p:sp>'
    )

# ---------------------------------------------------------------------------
# Slide background helper
# ---------------------------------------------------------------------------

def slide_bg(hex_color: str) -> str:
    return (
        f'<p:bg>'
        f'<p:bgPr>'
        f'{solid_fill(hex_color)}'
        f'<a:effectLst/>'
        f'</p:bgPr>'
        f'</p:bg>'
    )

# ---------------------------------------------------------------------------
# Full slide XML wrapper
# ---------------------------------------------------------------------------

def make_slide(body_xml: str, bg_color: str = BG) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
        'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
        f'{slide_bg(bg_color)}'
        '<p:cSld>'
        '<p:spTree>'
        '<p:nvGrpSpPr>'
        '<p:cNvPr id="1" name=""/>'
        '<p:cNvGrpSpPr/>'
        '<p:nvPr/>'
        '</p:nvGrpSpPr>'
        '<p:grpSpPr>'
        '<a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
        '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm>'
        '</p:grpSpPr>'
        f'{body_xml}'
        '</p:spTree>'
        '</p:cSld>'
        '</p:sld>'
    )

# ---------------------------------------------------------------------------
# Decoration helpers
# ---------------------------------------------------------------------------

def gold_header_bar(shape_id: int, height: int = 160000) -> str:
    """Full-width gold accent bar at the top of a slide."""
    return rect_shape(shape_id, 0, 0, SLIDE_W, height, fill=GOLD, line_color="", line_w=0)

def bottom_bar(shape_id: int, height: int = 80000) -> str:
    return rect_shape(shape_id, 0, SLIDE_H - height, SLIDE_W, height, fill=PANEL, line_color=GOLD, line_w=9525)

def section_label(shape_id: int, text: str, x: int, y: int, cx: int, cy: int) -> str:
    return text_shape(
        shape_id, x, y, cx, cy,
        (text, 10, True, GOLD, "l"),
        fill=PANEL, line=GOLD,
    )

# ---------------------------------------------------------------------------
# ──────────────────────────────────────────────────────────────────
# SLIDE DEFINITIONS
# ──────────────────────────────────────────────────────────────────
# ---------------------------------------------------------------------------

def slide1() -> str:
    """タイトル slide."""
    shapes = []
    sid = 2

    # Full background accent stripe (decorative)
    shapes.append(rect_shape(sid, 0, emu(5.8), SLIDE_W, emu(0.5), fill=GOLD, line_color=""))
    sid += 1

    # Large title
    shapes.append(text_shape(
        sid, emu(0.5), emu(1.2), emu(23.5), emu(3.5),
        ("DUNGEON QUEST", 72, True, GOLD, "ctr"),
        vert_anchor="ctr",
    ))
    sid += 1

    # Subtitle
    shapes.append(text_shape(
        sid, emu(0.5), emu(4.2), emu(23.5), emu(1.2),
        ("ブラウザで遊ぶローグライク × JRPG", 28, False, WHITE, "ctr"),
        vert_anchor="ctr",
    ))
    sid += 1

    # Tagline
    shapes.append(text_shape(
        sid, emu(0.5), emu(5.2), emu(23.5), emu(0.9),
        ("Pure HTML / CSS / JavaScript — No Libraries, No Server", 18, False, BLUE, "ctr"),
        vert_anchor="ctr",
    ))
    sid += 1

    # Decorative pixel squares (top-left corner accents)
    for i, col in enumerate([GOLD, BLUE, GREEN]):
        shapes.append(rect_shape(sid, emu(0.5 + i * 0.35), emu(0.25), emu(0.22), emu(0.22),
                                  fill=col, line_color=""))
        sid += 1

    # GitHub URL (bottom)
    shapes.append(text_shape(
        sid, emu(0.5), emu(6.0), emu(23.5), emu(0.6),
        ("https://github.com/you0209/roguelike", 14, False, BLUE, "ctr"),
    ))
    sid += 1

    return make_slide("".join(shapes))


def slide2() -> str:
    """ゲーム概要."""
    shapes = []
    sid = 2

    # Header bar
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(
        sid, emu(0.5), emu(0.1), emu(20), emu(0.9),
        ("ゲーム概要", 32, True, GOLD, "l"),
        vert_anchor="ctr",
    ))
    sid += 1

    # ── Left panel: Concept ──
    shapes.append(rect_shape(sid, emu(0.4), emu(1.3), emu(10.8), emu(4.8),
                              fill=PANEL, line_color=GOLD, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(
        sid, emu(0.6), emu(1.4), emu(10.4), emu(0.7),
        ("コンセプト", 18, True, GOLD, "l"),
    ))
    sid += 1
    concept_lines = [
        ("• 7階層のダンジョンを踏破するローグライク", 15, False, WHITE, "l"),
        ("• コマンド制ターン制バトル（JRPG スタイル）", 15, False, WHITE, "l"),
        ("• 強力なレリックを集めてビルドを構築", 15, False, WHITE, "l"),
        ("• ランダム性で毎回異なる体験", 15, False, WHITE, "l"),
    ]
    y = emu(2.1)
    for line in concept_lines:
        shapes.append(text_shape(sid, emu(0.7), y, emu(10.3), emu(0.55), line))
        sid += 1
        y += emu(0.55)

    # ── Right panel: Specs ──
    shapes.append(rect_shape(sid, emu(11.6), emu(1.3), emu(11.8), emu(4.8),
                              fill=PANEL, line_color=BLUE, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(
        sid, emu(11.8), emu(1.4), emu(11.4), emu(0.7),
        ("スペック", 18, True, BLUE, "l"),
    ))
    sid += 1
    specs = [
        ("プレイ時間", "約 15〜30 分"),
        ("ターン数", "各階層 3 択イベント × 7 階"),
        ("勝利条件", "7 階ボス「ヴァルムドラグ」撃破"),
        ("敗北条件", "HP ≤ 0 でゲームオーバー"),
        ("敵種類", "20 タイプ（Canvas 2D 手描き）"),
        ("レリック", "60 種以上"),
    ]
    y = emu(2.1)
    for label, val in specs:
        shapes.append(text_shape(sid, emu(11.8), y, emu(5.2), emu(0.5),
                                  (label, 13, True, GOLD, "l")))
        sid += 1
        shapes.append(text_shape(sid, emu(17.2), y, emu(5.8), emu(0.5),
                                  (val, 13, False, WHITE, "l")))
        sid += 1
        y += emu(0.55)

    # Bottom note
    shapes.append(text_shape(
        sid, emu(0.5), emu(6.15), emu(23), emu(0.5),
        ("ブラウザを開くだけで即プレイ可能 — インストール不要", 14, False, GREEN, "ctr"),
    ))
    sid += 1

    return make_slide("".join(shapes))


def slide3() -> str:
    """バトルシステム."""
    shapes = []
    sid = 2

    # Header
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(sid, emu(0.5), emu(0.1), emu(20), emu(0.9),
                               ("バトルシステム", 32, True, GOLD, "l"), vert_anchor="ctr"))
    sid += 1

    # Commands panel
    shapes.append(rect_shape(sid, emu(0.4), emu(1.3), emu(7.5), emu(5.0),
                              fill=PANEL, line_color=GOLD, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(0.6), emu(1.4), emu(7), emu(0.7),
                               ("4 コマンド", 18, True, GOLD, "l")))
    sid += 1
    commands = [
        ("⚔  Attack",  "通常攻撃。レリックで強化可能"),
        ("🛡  Defend",  "防御 + カウンター系レリック発動"),
        ("✨  Skill",   "12 種類のスキルを装備・使用"),
        ("🎒  Item",    "消耗品 6 種を使用"),
    ]
    y = emu(2.1)
    for cmd, desc in commands:
        shapes.append(rect_shape(sid, emu(0.6), y, emu(7.1), emu(0.7),
                                  fill="1a1a3a", line_color=BLUE, line_w=12700, rx=40000))
        sid += 1
        shapes.append(text_shape(sid, emu(0.7), y + emu(0.05), emu(2.8), emu(0.6),
                                  (cmd, 14, True, BLUE, "l"), vert_anchor="ctr"))
        sid += 1
        shapes.append(text_shape(sid, emu(3.6), y + emu(0.05), emu(4.0), emu(0.6),
                                  (desc, 12, False, WHITE, "l"), vert_anchor="ctr"))
        sid += 1
        y += emu(0.82)

    # Skills panel
    shapes.append(rect_shape(sid, emu(8.3), emu(1.3), emu(7.5), emu(2.4),
                              fill=PANEL, line_color=BLUE, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(8.5), emu(1.4), emu(7), emu(0.7),
                               ("12 スキルタイプ", 18, True, BLUE, "l")))
    sid += 1
    skill_types = [
        "物理 / 魔法 / 貫通 / 全体",
        "回復 / バフ / デバフ / ドレイン",
        "カウンター / 蘇生 / 瀕死強化 / ゴールド変換",
    ]
    for i, s in enumerate(skill_types):
        shapes.append(text_shape(sid, emu(8.5), emu(2.1) + i * emu(0.55), emu(7.2), emu(0.55),
                                  (s, 13, False, WHITE, "l")))
        sid += 1

    # Enemy scaling panel
    shapes.append(rect_shape(sid, emu(8.3), emu(3.9), emu(7.5), emu(2.4),
                              fill=PANEL, line_color=GREEN, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(8.5), emu(4.0), emu(7), emu(0.7),
                               ("敵スケーリング", 18, True, GREEN, "l")))
    sid += 1
    scaling = [
        "20 タイプ × 7 階層でパラメータ成長",
        "行動チャージシステム（溜め攻撃）",
        "ボス「ヴァルムドラグ」：特殊多段行動",
    ]
    for i, s in enumerate(scaling):
        shapes.append(text_shape(sid, emu(8.5), emu(4.7) + i * emu(0.55), emu(7.2), emu(0.55),
                                  (s, 13, False, WHITE, "l")))
        sid += 1

    # Bottom bar
    shapes.append(text_shape(
        sid, emu(0.5), emu(6.15), emu(23), emu(0.5),
        ("全バトルデータは JS オブジェクト定義 — サーバー不要", 14, False, GOLD, "ctr"),
    ))
    sid += 1

    return make_slide("".join(shapes))


def slide4() -> str:
    """レリックシステム."""
    shapes = []
    sid = 2

    # Header
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(sid, emu(0.5), emu(0.1), emu(20), emu(0.9),
                               ("レリックシステム  ─  60 種以上", 32, True, GOLD, "l"), vert_anchor="ctr"))
    sid += 1

    # 7 build category cards (2 rows)
    categories = [
        (GOLD,  "シンプルステータス", "HP / ATK / DEF 強化"),
        (BLUE,  "通常攻撃強化",       "連撃・貫通・吸血"),
        (GREEN, "物理スキル特化",      "物理系スキルをブースト"),
        ("ff88cc", "魔法スキル特化",   "魔法系スキルをブースト"),
        ("ff9944", "防御・カウンター", "被ダメ軽減・反射"),
        (RED,   "瀕死ビルド",          "HP 低下で超強化"),
        (GOLD,  "ゴールド投資",        "ゴールドを戦力に変換"),
    ]
    positions = [
        (emu(0.4),  emu(1.4)),
        (emu(3.95), emu(1.4)),
        (emu(7.5),  emu(1.4)),
        (emu(11.05),emu(1.4)),
        (emu(0.4),  emu(3.9)),
        (emu(3.95), emu(3.9)),
        (emu(7.5),  emu(3.9)),
    ]
    card_w = emu(3.3)
    card_h = emu(2.2)
    for (color, title, desc), (cx, cy) in zip(categories, positions):
        shapes.append(rect_shape(sid, cx, cy, card_w, card_h,
                                  fill=PANEL, line_color=color, line_w=25400, rx=60000))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(0.1), cy + emu(0.1), card_w - emu(0.2), emu(0.7),
                                  (title, 14, True, color, "ctr"), vert_anchor="ctr"))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(0.1), cy + emu(0.85), card_w - emu(0.2), emu(1.2),
                                  (desc, 12, False, WHITE, "ctr"), vert_anchor="t"))
        sid += 1

    # Right panel: key points
    shapes.append(rect_shape(sid, emu(11.05), emu(3.9), emu(12.35), emu(2.2),
                              fill=PANEL, line_color=GOLD, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(11.25), emu(4.0), emu(12), emu(0.6),
                               ("ビルド多様性のポイント", 15, True, GOLD, "l")))
    sid += 1
    points = [
        "• ショップで毎回ランダムにレリックが並ぶ",
        "• 複数レリックの複合効果で戦略が無限に広がる",
        "• パッシブ発動システム — 条件満足時に自動効果",
    ]
    for i, p in enumerate(points):
        shapes.append(text_shape(sid, emu(11.25), emu(4.65) + i * emu(0.45), emu(12), emu(0.45),
                                  (p, 12, False, WHITE, "l")))
        sid += 1

    # Bottom
    shapes.append(text_shape(
        sid, emu(0.5), emu(6.15), emu(23), emu(0.5),
        ("すべてのレリック効果を JS オブジェクト 1 ファイルで管理", 14, False, GREEN, "ctr"),
    ))
    sid += 1

    return make_slide("".join(shapes))


def slide5() -> str:
    """探索・イベント."""
    shapes = []
    sid = 2

    # Header
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(sid, emu(0.5), emu(0.1), emu(20), emu(0.9),
                               ("探索・イベント", 32, True, GOLD, "l"), vert_anchor="ctr"))
    sid += 1

    # Floor progression diagram
    shapes.append(rect_shape(sid, emu(0.4), emu(1.3), emu(13.5), emu(5.1),
                              fill=PANEL, line_color=GOLD, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(0.6), emu(1.4), emu(13), emu(0.7),
                               ("フロア進行フロー", 18, True, GOLD, "l")))
    sid += 1

    # Flow diagram nodes
    flow_items = [
        (emu(0.7),  emu(2.2), GREEN,  "イベント選択\n3 択"),
        (emu(3.5),  emu(2.2), BLUE,   "バトル\n or スキップ"),
        (emu(6.3),  emu(2.2), GOLD,   "ショップ\n（レリック購入）"),
        (emu(9.1),  emu(2.2), RED,    "次の階層\nor ボス"),
    ]
    for fx, fy, fc, label in flow_items:
        shapes.append(rect_shape(sid, fx, fy, emu(2.4), emu(1.4),
                                  fill="1a1a3a", line_color=fc, line_w=25400, rx=80000))
        sid += 1
        shapes.append(text_shape(sid, fx + emu(0.05), fy + emu(0.05), emu(2.3), emu(1.3),
                                  (label, 13, True, fc, "ctr"), vert_anchor="ctr"))
        sid += 1

    # Arrows between nodes
    for i, (fx, fy, _, _) in enumerate(flow_items[:-1]):
        shapes.append(text_shape(sid, fx + emu(2.45), fy + emu(0.5), emu(1.0), emu(0.5),
                                  ("▶", 20, True, WHITE, "ctr")))
        sid += 1

    # Event types list
    event_types = [
        "宝箱 ── アイテム / レリック / ゴールド獲得",
        "祝福 ── ステータス永続バフ",
        "罠   ── ダメージ / デバフ",
        "呪い ── バトルへの強制突入",
        "謎の商人 ── 特殊取引イベント",
    ]
    shapes.append(text_shape(sid, emu(0.6), emu(3.8), emu(13), emu(0.65),
                               ("イベント種類", 15, True, GOLD, "l")))
    sid += 1
    for i, ev in enumerate(event_types):
        shapes.append(text_shape(sid, emu(0.7), emu(4.4) + i * emu(0.4), emu(12.8), emu(0.4),
                                  (ev, 12, False, WHITE, "l")))
        sid += 1

    # Right panel: shop
    shapes.append(rect_shape(sid, emu(14.3), emu(1.3), emu(9.0), emu(5.1),
                              fill=PANEL, line_color=BLUE, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(14.5), emu(1.4), emu(8.6), emu(0.7),
                               ("ショップ仕様", 18, True, BLUE, "l")))
    sid += 1
    shop_pts = [
        "各フロアクリア後に出現",
        "レリック 3〜4 種 + アイテム 2 種",
        "在庫はランダム抽選",
        "ゴールドは敵撃破 & イベントで獲得",
        "ゴールド投資レリックも購入可",
        "",
        "アイテム 6 種:",
        "  回復薬 / 力のポーション / 護符",
        "  毒薬 / 爆弾 / エリクサー",
    ]
    for i, pt_text in enumerate(shop_pts):
        color = GOLD if pt_text.endswith(":") else WHITE
        shapes.append(text_shape(sid, emu(14.5), emu(2.1) + i * emu(0.45), emu(8.5), emu(0.45),
                                  (pt_text, 12, pt_text.endswith(":"), color, "l")))
        sid += 1

    return make_slide("".join(shapes))


def slide6() -> str:
    """技術スタック."""
    shapes = []
    sid = 2

    # Header
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(sid, emu(0.5), emu(0.1), emu(20), emu(0.9),
                               ("技術スタック", 32, True, GOLD, "l"), vert_anchor="ctr"))
    sid += 1

    # Big badge: No Libraries
    shapes.append(rect_shape(sid, emu(16.0), emu(1.2), emu(7.3), emu(1.8),
                              fill="1a0000", line_color=RED, line_w=38100, rx=80000))
    sid += 1
    shapes.append(text_shape(sid, emu(16.0), emu(1.2), emu(7.3), emu(1.8),
                               ("NO LIBRARIES", 28, True, RED, "ctr"), vert_anchor="ctr"))
    sid += 1

    # Tech stack cards
    techs = [
        (BLUE,   "HTML5",         "セマンティック構造 + Canvas タグ"),
        (GOLD,   "CSS3",          "カスタムプロパティ・アニメーション"),
        (GREEN,  "JavaScript",    "Vanilla ES6+  / モジュール構成"),
        (BLUE,   "Canvas 2D API", "敵スプライト 20 種を手描きコード生成"),
    ]
    for i, (color, name, desc) in enumerate(techs):
        cx = emu(0.4)
        cy = emu(1.3) + i * emu(1.3)
        shapes.append(rect_shape(sid, cx, cy, emu(15.2), emu(1.1),
                                  fill="1a1a3a", line_color=color, line_w=19050, rx=50000))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(0.15), cy + emu(0.05), emu(4.0), emu(1.0),
                                  (name, 20, True, color, "l"), vert_anchor="ctr"))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(4.3), cy + emu(0.05), emu(10.7), emu(1.0),
                                  (desc, 15, False, WHITE, "l"), vert_anchor="ctr"))
        sid += 1

    # File structure
    shapes.append(rect_shape(sid, emu(16.0), emu(3.2), emu(7.3), emu(3.1),
                              fill=PANEL, line_color=GOLD, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(16.2), emu(3.3), emu(7.0), emu(0.6),
                               ("ファイル構成", 15, True, GOLD, "l")))
    sid += 1
    files = [
        "index.html       ← ゲーム本体",
        "css/             ← スタイル",
        "js/              ← ゲームロジック",
        "  battle.js      ← バトルエンジン",
        "  relics.js      ← レリックデータ",
        "  events.js      ← イベント定義",
        "data/            ← JSON データ",
    ]
    for i, f in enumerate(files):
        shapes.append(text_shape(sid, emu(16.2), emu(3.95) + i * emu(0.33), emu(7.0), emu(0.33),
                                  (f, 11, False, WHITE, "l")))
        sid += 1

    # Bottom
    shapes.append(text_shape(
        sid, emu(0.5), emu(6.15), emu(23), emu(0.5),
        ("index.html をブラウザで開くだけ — ビルドツール不要", 14, False, GREEN, "ctr"),
    ))
    sid += 1

    return make_slide("".join(shapes))


def slide7() -> str:
    """開発体制."""
    shapes = []
    sid = 2

    # Header
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(sid, emu(0.5), emu(0.1), emu(20), emu(0.9),
                               ("開発体制", 32, True, GOLD, "l"), vert_anchor="ctr"))
    sid += 1

    # 3 person cards
    members = [
        (GOLD,  "担当 A",  "ショップ & レリック",
         ["ショップ UI / ロジック設計",
          "60 種以上のレリック実装",
          "ゴールド経済バランス調整"]),
        (BLUE,  "担当 B",  "バトル & 敵 & アイテム",
         ["ターン制バトルエンジン",
          "20 タイプ敵の行動 AI",
          "アイテム 6 種の効果実装"]),
        (GREEN, "担当 C",  "イベント & スキル",
         ["フロアイベントシステム",
          "12 スキルタイプ実装",
          "Canvas スプライト描画"]),
    ]
    for i, (color, role, title, tasks) in enumerate(members):
        cx = emu(0.4) + i * emu(7.95)
        cy = emu(1.3)
        shapes.append(rect_shape(sid, cx, cy, emu(7.55), emu(5.0),
                                  fill=PANEL, line_color=color, line_w=31750, rx=80000))
        sid += 1
        # Role badge
        shapes.append(rect_shape(sid, cx + emu(0.2), cy + emu(0.15), emu(2.2), emu(0.65),
                                  fill=color, line_color="", rx=40000))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(0.2), cy + emu(0.15), emu(2.2), emu(0.65),
                                  (role, 14, True, BG, "ctr"), vert_anchor="ctr"))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(0.2), cy + emu(0.95), emu(7.1), emu(0.75),
                                  (title, 17, True, color, "l"), vert_anchor="ctr"))
        sid += 1
        for j, task in enumerate(tasks):
            shapes.append(text_shape(sid, cx + emu(0.3), cy + emu(1.85) + j * emu(0.65),
                                      emu(7.0), emu(0.6),
                                      ("• " + task, 13, False, WHITE, "l")))
            sid += 1

    # Git strategy
    shapes.append(rect_shape(sid, emu(0.4), emu(6.2), emu(23.5), emu(0.45),
                              fill="1a1a3a", line_color=GOLD, line_w=12700, rx=30000))
    sid += 1
    shapes.append(text_shape(sid, emu(0.6), emu(6.2), emu(23), emu(0.45),
                               ("Git 戦略:  main ブランチへの直接コミットは禁止 — feature ブランチ → PR → レビュー → merge", 13, False, GOLD, "ctr"),
                               vert_anchor="ctr"))
    sid += 1

    return make_slide("".join(shapes))


def slide8() -> str:
    """こだわり・工夫した点."""
    shapes = []
    sid = 2

    # Header
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(sid, emu(0.5), emu(0.1), emu(22), emu(0.9),
                               ("こだわり・工夫した点", 32, True, GOLD, "l"), vert_anchor="ctr"))
    sid += 1

    highlights = [
        (GOLD,  "パッシブレリックシステム",
                "全 60+ レリックをオブジェクト配列で管理し、バトルイベントごとに条件判定を自動実行。\n"
                "新規レリック追加が 1 オブジェクト追記のみで完結するデータ駆動設計。"),
        (BLUE,  "敵行動チャージシステム",
                "敵が「溜め」ターンを経て強力な技を発動する仕組みで戦略性向上。\n"
                "ボス「ヴァルムドラグ」は多段フェーズで行動パターンが変化。"),
        (GREEN, "Canvas 2D 手描きスプライト",
                "20 種類の敵キャラをすべてコードベースの Canvas 描画命令で実装。\n"
                "外部画像ファイルゼロ — 完全に JS だけでビジュアルを生成。"),
        (RED,   "瀕死ビルド・逆転設計",
                "HP が一定以下で発動するレリックを複数実装し、「あえて HP を削る」逆転ビルドを実現。\n"
                "リスク vs リターンのジレンマがゲームプレイに深みを与える。"),
    ]

    for i, (color, title, desc) in enumerate(highlights):
        row = i // 2
        col = i % 2
        cx = emu(0.4) + col * emu(11.9)
        cy = emu(1.3) + row * emu(2.7)
        shapes.append(rect_shape(sid, cx, cy, emu(11.5), emu(2.5),
                                  fill=PANEL, line_color=color, line_w=25400, rx=60000))
        sid += 1
        # Accent strip
        shapes.append(rect_shape(sid, cx, cy, emu(0.35), emu(2.5),
                                  fill=color, line_color="", rx=0))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(0.5), cy + emu(0.15), emu(10.8), emu(0.65),
                                  (title, 16, True, color, "l")))
        sid += 1
        shapes.append(text_shape(sid, cx + emu(0.5), cy + emu(0.9), emu(10.8), emu(1.45),
                                  (desc, 12, False, WHITE, "l")))
        sid += 1

    return make_slide("".join(shapes))


def slide9() -> str:
    """DEMO slide."""
    shapes = []
    sid = 2

    # Full gradient-feel background overlay
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, SLIDE_H,
                              fill="0d0d28", line_color=""))
    sid += 1

    # Giant DEMO text
    shapes.append(text_shape(
        sid, emu(0.0), emu(1.2), emu(24.0), emu(3.5),
        ("DEMO", 120, True, GOLD, "ctr"),
        vert_anchor="ctr",
    ))
    sid += 1

    # Subtitle
    shapes.append(text_shape(
        sid, emu(0.5), emu(4.3), emu(23.5), emu(0.8),
        ("ブラウザで直接プレイ", 24, False, WHITE, "ctr"),
    ))
    sid += 1

    # URL box
    shapes.append(rect_shape(sid, emu(4.0), emu(5.0), emu(16.0), emu(0.9),
                              fill=PANEL, line_color=GOLD, line_w=25400, rx=50000))
    sid += 1
    shapes.append(text_shape(
        sid, emu(4.0), emu(5.0), emu(16.0), emu(0.9),
        ("https://github.com/you0209/roguelike", 18, False, BLUE, "ctr"),
        vert_anchor="ctr",
    ))
    sid += 1

    # Corner decorations
    for pos_x, pos_y in [(emu(0.3), emu(0.3)), (emu(22.8), emu(0.3)),
                          (emu(0.3), emu(6.0)), (emu(22.8), emu(6.0))]:
        shapes.append(rect_shape(sid, pos_x, pos_y, emu(0.5), emu(0.5),
                                  fill=GOLD, line_color=""))
        sid += 1

    return make_slide("".join(shapes))


def slide10() -> str:
    """まとめ."""
    shapes = []
    sid = 2

    # Header
    shapes.append(rect_shape(sid, 0, 0, SLIDE_W, emu(1.1), fill=PANEL, line_color=GOLD, line_w=0))
    sid += 1
    shapes.append(text_shape(sid, emu(0.5), emu(0.1), emu(20), emu(0.9),
                               ("まとめ", 32, True, GOLD, "l"), vert_anchor="ctr"))
    sid += 1

    # Key achievements
    shapes.append(rect_shape(sid, emu(0.4), emu(1.3), emu(13.5), emu(5.0),
                              fill=PANEL, line_color=GOLD, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(0.6), emu(1.4), emu(13), emu(0.7),
                               ("達成したこと", 18, True, GOLD, "l")))
    sid += 1
    achievements = [
        (GREEN, "✓ Pure HTML/CSS/JS で完全動作するゲームを構築"),
        (GREEN, "✓ 60 種以上のレリック × 7 ビルド方向性"),
        (GREEN, "✓ 3 人チームで機能を分担・統合"),
        (GREEN, "✓ Canvas 2D による 20 種の手描き敵スプライト"),
        (GREEN, "✓ サーバー不要・ライブラリ不要・即プレイ可能"),
    ]
    for i, (color, text) in enumerate(achievements):
        shapes.append(text_shape(sid, emu(0.7), emu(2.2) + i * emu(0.72), emu(13.0), emu(0.65),
                                  (text, 14, False, color, "l")))
        sid += 1

    # Future plans
    shapes.append(rect_shape(sid, emu(14.3), emu(1.3), emu(9.0), emu(3.0),
                              fill=PANEL, line_color=BLUE, line_w=19050, rx=60000))
    sid += 1
    shapes.append(text_shape(sid, emu(14.5), emu(1.4), emu(8.6), emu(0.7),
                               ("今後の展望", 18, True, BLUE, "l")))
    sid += 1
    future = [
        "セーブ / ロード機能",
        "追加ボス・フロア実装",
        "BGM / SE 追加",
        "ランキング機能（LocalStorage）",
        "スマートフォン対応",
    ]
    for i, f in enumerate(future):
        shapes.append(text_shape(sid, emu(14.5), emu(2.1) + i * emu(0.5), emu(8.6), emu(0.5),
                                  ("• " + f, 13, False, WHITE, "l")))
        sid += 1

    # Thank you box
    shapes.append(rect_shape(sid, emu(14.3), emu(4.5), emu(9.0), emu(1.8),
                              fill="1a1a00", line_color=GOLD, line_w=31750, rx=80000))
    sid += 1
    shapes.append(text_shape(sid, emu(14.3), emu(4.5), emu(9.0), emu(1.8),
                               ("ご清聴ありがとうございました", 20, True, GOLD, "ctr"),
                               vert_anchor="ctr"))
    sid += 1

    # Bottom GitHub
    shapes.append(text_shape(
        sid, emu(0.5), emu(6.15), emu(23), emu(0.5),
        ("https://github.com/you0209/roguelike", 13, False, BLUE, "ctr"),
    ))
    sid += 1

    return make_slide("".join(shapes))


# ---------------------------------------------------------------------------
# Static XML files
# ---------------------------------------------------------------------------

CONTENT_TYPES_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml"
    ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/theme/theme1.xml"
    ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml"
    ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml"
    ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
""" + "".join(
    f'  <Override PartName="/ppt/slides/slide{i}.xml"\n'
    f'    ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n'
    for i in range(1, 11)
) + "</Types>"

RELS_DOT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="ppt/presentation.xml"/>
</Relationships>"""

PRESENTATION_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  saveSubsetFonts="1">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
""" + "".join(
    f'    <p:sldId id="{256 + i}" r:id="rId{i + 2}"/>\n'
    for i in range(10)
) + """  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>"""

def presentation_rels() -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '  <Relationship Id="rId1"',
        '    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"',
        '    Target="slideMasters/slideMaster1.xml"/>',
    ]
    for i in range(10):
        lines.append(
            f'  <Relationship Id="rId{i + 2}"\n'
            f'    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"\n'
            f'    Target="slides/slide{i + 1}.xml"/>'
        )
    lines.append('</Relationships>')
    return "\n".join(lines)

THEME1_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="DungeonTheme">
  <a:themeElements>
    <a:clrScheme name="DungeonColors">
      <a:dk1><a:srgbClr val="09091a"/></a:dk1>
      <a:lt1><a:srgbClr val="eeeeee"/></a:lt1>
      <a:dk2><a:srgbClr val="111128"/></a:dk2>
      <a:lt2><a:srgbClr val="ffffff"/></a:lt2>
      <a:accent1><a:srgbClr val="ffcc44"/></a:accent1>
      <a:accent2><a:srgbClr val="6699ff"/></a:accent2>
      <a:accent3><a:srgbClr val="44cc88"/></a:accent3>
      <a:accent4><a:srgbClr val="ff6655"/></a:accent4>
      <a:accent5><a:srgbClr val="ff9944"/></a:accent5>
      <a:accent6><a:srgbClr val="ff88cc"/></a:accent6>
      <a:hlink><a:srgbClr val="6699ff"/></a:hlink>
      <a:folHlink><a:srgbClr val="b38b00"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="DungeonFonts">
      <a:majorFont>
        <a:latin typeface="Segoe UI"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Segoe UI"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>"""

SLIDE_MASTER_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="09091a"/></a:solidFill>
        <a:effectLst/>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>
        <a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2"
    accent1="accent1" accent2="accent2" accent3="accent3"
    accent4="accent4" accent5="accent5" accent6="accent6"
    hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle>
      <a:lvl1pPr algn="l">
        <a:defRPr sz="3600" b="1">
          <a:solidFill><a:srgbClr val="ffcc44"/></a:solidFill>
          <a:latin typeface="+mj-lt"/>
        </a:defRPr>
      </a:lvl1pPr>
    </p:titleStyle>
    <p:bodyStyle>
      <a:lvl1pPr>
        <a:defRPr sz="1800">
          <a:solidFill><a:srgbClr val="eeeeee"/></a:solidFill>
          <a:latin typeface="+mn-lt"/>
        </a:defRPr>
      </a:lvl1pPr>
    </p:bodyStyle>
    <p:otherStyle>
      <a:defPPr>
        <a:defRPr lang="ja-JP">
          <a:solidFill><a:srgbClr val="eeeeee"/></a:solidFill>
          <a:latin typeface="+mn-lt"/>
        </a:defRPr>
      </a:defPPr>
    </p:otherStyle>
  </p:txStyles>
</p:sldMaster>"""

SLIDE_MASTER_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
    Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme"
    Target="../theme/theme1.xml"/>
</Relationships>"""

SLIDE_LAYOUT_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>
        <a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>"""

SLIDE_LAYOUT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"
    Target="../slideMasters/slideMaster1.xml"/>
</Relationships>"""

def slide_rels(slide_num: int) -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
    Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>"""

# ---------------------------------------------------------------------------
# Main: assemble the PPTX ZIP
# ---------------------------------------------------------------------------

def build_pptx(output_path: str) -> None:
    slide_funcs = [
        slide1,   # 1. タイトル
        slide2,   # 2. ゲーム概要
        slide3,   # 3. バトルシステム
        slide4,   # 4. レリックシステム
        slide5,   # 5. 探索・イベント
        slide6,   # 6. 技術スタック
        slide7,   # 7. 開発体制
        slide8,   # 8. こだわり・工夫した点
        slide9,   # 9. DEMO
        slide10,  # 10. まとめ
    ]

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        def add(name: str, content: str) -> None:
            zf.writestr(name, content.encode("utf-8"))

        add("[Content_Types].xml",                         CONTENT_TYPES_XML)
        add("_rels/.rels",                                 RELS_DOT_RELS)
        add("ppt/presentation.xml",                        PRESENTATION_XML)
        add("ppt/_rels/presentation.xml.rels",             presentation_rels())
        add("ppt/theme/theme1.xml",                        THEME1_XML)
        add("ppt/slideMasters/slideMaster1.xml",           SLIDE_MASTER_XML)
        add("ppt/slideMasters/_rels/slideMaster1.xml.rels",SLIDE_MASTER_RELS)
        add("ppt/slideLayouts/slideLayout1.xml",           SLIDE_LAYOUT_XML)
        add("ppt/slideLayouts/_rels/slideLayout1.xml.rels",SLIDE_LAYOUT_RELS)

        for i, func in enumerate(slide_funcs, start=1):
            slide_xml = func()
            add(f"ppt/slides/slide{i}.xml",                slide_xml)
            add(f"ppt/slides/_rels/slide{i}.xml.rels",     slide_rels(i))

    with open(output_path, "wb") as f:
        f.write(buf.getvalue())

    size_kb = os.path.getsize(output_path) // 1024
    print(f"Generated: {output_path}  ({size_kb} KB, 10 slides)")


if __name__ == "__main__":
    output = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dungeon_quest_slides.pptx")
    build_pptx(output)
