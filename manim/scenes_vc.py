r"""Shattering and the VC dimension (c23): what "shatter" means with lines in the plane, why 4 points always fail,
and how the same idea reads off a dichotomy table (exam type T1).

Notation follows chapter c23 (L07 p22-p29): points x₁…xₙ, labels + / − (written 1 / 0 in tables),
VC(F) = size of the largest shattered set. Tables: L07 p29 (VC = 3) and 2026 practice Q3 (8 rows but VC = 2).
"""
from itertools import combinations

import numpy as np
from manim import (
    LEFT, RIGHT, UP,
    Circle, Create, FadeIn, FadeOut, Flash, Indicate, Line, Polygon, Rectangle, ReplacementTransform,
    RoundedRectangle, ValueTracker, VGroup, VMobject, always_redraw,
)
from common import BLUE, GREEN, GREY, INK, P, RED, StepScene, T, WHITE, YELLOW, px

PLUS, MINUS = RED, BLUE
SUB = '₀₁₂₃₄₅₆₇₈₉'

TRI = [(0.2, 0.24), (0.8, 0.24), (0.5, 0.8)]                    # x₁ x₂ x₃, not collinear (local box coords, v up)
COL = [(0.16, 0.5), (0.5, 0.5), (0.84, 0.5)]                    # three collinear points
SQUARE = [(0.25, 0.2), (0.75, 0.2), (0.75, 0.8), (0.25, 0.8)]   # x₁..x₄ counter-clockwise from bottom-left
INNER = [(0.14, 0.18), (0.86, 0.18), (0.5, 0.86), (0.5, 0.42)]  # three outer points + one inside their triangle
L07 = ['0000', '0110', '1001', '1101', '0100', '1010', '1111', '0011', '0101', '1110']   # L07 p29
Q26 = ['00001', '10001', '01010', '01101', '01011', '10111', '11101', '01111']           # 2026 practice Q3


def xs(i):
    return 'x' + SUB[i]


def bits(k, n):
    return [(k >> (n - 1 - j)) & 1 for j in range(n)]


def sign(b):
    return '+' if b else '−'


class Box:
    """A plot area given in layout px (x0, y0)-(x1, y1); local coords (u, v) in [0, 1] with v up."""

    def __init__(self, x0, y0, x1, y1):
        self.lo = P(x0, y1)
        self.hi = P(x1, y0)

    def pt(self, u, v):
        return np.array([self.lo[0] + u * (self.hi[0] - self.lo[0]), self.lo[1] + v * (self.hi[1] - self.lo[1]), 0.0])

    @property
    def centre(self):
        return (self.lo + self.hi) / 2

    def frame(self, color='#4a5060'):
        return Rectangle(width=self.hi[0] - self.lo[0], height=self.hi[1] - self.lo[1], stroke_color=color,
                         stroke_width=1.5, fill_opacity=0).move_to(self.centre)


def clip(box, n, c):
    """Segment of the line n·p = c inside the box and the polygon of its + side n·p >= c."""
    corners = [np.array([box.lo[0], box.lo[1]]), np.array([box.hi[0], box.lo[1]]),
               np.array([box.hi[0], box.hi[1]]), np.array([box.lo[0], box.hi[1]])]
    f = [float(n @ q - c) for q in corners]
    poly, seg = [], []
    for i in range(4):
        q, r, fq, fr = corners[i], corners[(i + 1) % 4], f[i], f[(i + 1) % 4]
        if fq >= 0:
            poly.append(q)
        if fq * fr < 0:
            x = q + fq / (fq - fr) * (r - q)
            poly.append(x)
            seg.append(x)
    return seg, poly


def to3(q):
    return np.array([q[0], q[1], 0.0])


def cut(box, n, c, sw=3.0, shade=0.16):
    """The line (white) with its + side shaded light red, clipped to the box."""
    seg, poly = clip(box, n, c)
    g = VGroup()
    if len(poly) >= 3:
        g.add(Polygon(*[to3(q) for q in poly], fill_color=PLUS, fill_opacity=shade, stroke_width=0))
    if len(seg) >= 2:
        g.add(Line(to3(seg[0]), to3(seg[1]), color=WHITE, stroke_width=sw))
    return g


def separator(pts, lab, box):
    """A line (n, c) with every label-1 point on the + side (n·p > c) and every label-0 point on the other side:
    the widest gap over 360 directions; when all labels agree, a horizontal line outside the points. None if no
    line works."""
    q = [np.asarray(p[:2]) for p in pts]
    pos = [a for a, l in zip(q, lab) if l]
    neg = [a for a, l in zip(q, lab) if not l]
    up = np.array([0.0, 1.0])
    if not neg:
        return up, (min(a[1] for a in q) + box.lo[1]) / 2
    if not pos:
        return up, (max(a[1] for a in q) + box.hi[1]) / 2
    best = None
    for deg in range(360):
        n = np.array([np.cos(np.radians(deg)), np.sin(np.radians(deg))])
        lo, hi = max(n @ a for a in neg), min(n @ a for a in pos)
        if hi - lo > 1e-3 and (best is None or hi - lo > best[0]):
            best = (hi - lo, n, (lo + hi) / 2)
    return None if best is None else (best[1], best[2])


def side(n, c, p):
    return int(n @ np.asarray(p[:2]) - c >= 0)


def dot(p, lab=None, r=0.13, glyph=True):
    """A data point: red with '+' for label 1, blue with '−' for label 0, grey when unlabelled."""
    col = GREY if lab is None else (PLUS if lab else MINUS)
    c = Circle(radius=r, fill_color=col, fill_opacity=1, stroke_color=WHITE, stroke_width=1.2).move_to(p)
    if lab is None or not glyph:
        return c
    return VGroup(c, T(sign(lab), 18, INK, weight='BOLD').move_to(p))


def seq(lab, size=17, buff=0.12):
    """A label pattern like '+ − −' with each sign in its colour."""
    return VGroup(*[T(sign(b), size, PLUS if b else MINUS, weight='BOLD') for b in lab]).arrange(RIGHT, buff=buff)


def left_at(m, x, y):
    return m.move_to(P(x, y), aligned_edge=LEFT)


def card_lines(rows, x, y0, dy=26):
    """Left-aligned text rows starting at layout (x, y0); rows are (text, size, colour)."""
    return VGroup(*[left_at(T(s, size, col), x, y0 + k * dy) for k, (s, size, col) in enumerate(rows)])


class Table:
    """A 0/1 dichotomy table: 1 in red, 0 in blue; one column per point, one row per classifier."""

    def __init__(self, rows, col_x, y0, dy, size=19, numbers_x=None):
        self.rows, self.col_x, self.y = rows, col_x, [y0 + dy * (r + 1) for r in range(len(rows))]
        self.head = VGroup(*[T(xs(j + 1), size, YELLOW).move_to(P(x, y0)) for j, x in enumerate(col_x)])
        self.cells = [[T(ch, size, PLUS if ch == '1' else MINUS).move_to(P(col_x[j], self.y[r]))
                       for j, ch in enumerate(row)] for r, row in enumerate(rows)]
        left, right = col_x[0] - 22, col_x[-1] + 22
        self.rule = Line(P(left, y0 + dy / 2), P(right, y0 + dy / 2), color=GREY, stroke_width=1.2)
        self.nums = VGroup()
        if numbers_x is not None:
            self.nums = VGroup(*[T(str(r + 1), 14, GREY).move_to(P(numbers_x, y)) for r, y in enumerate(self.y)])
        self.group = VGroup(self.head, self.rule, self.nums, *[VGroup(*r) for r in self.cells])
        self.left, self.right, self.dy = left, right, dy

    def column(self, j):
        return VGroup(self.head[j], *[r[j] for r in self.cells])

    def row_box(self, r):
        return RoundedRectangle(corner_radius=0.05, width=px(self.right - self.left), height=px(self.dy - 2),
                                stroke_color=YELLOW, stroke_width=2, fill_opacity=0).move_to(
            P((self.left + self.right) / 2, self.y[r]))


class Slots:
    """The 'collect them all' card: one slot per 0/1 pattern; a slot turns green the first time it is seen."""

    def __init__(self, k, xs_, ys_, w=60, h=26):
        self.pats = [''.join(map(str, bits(v, k))) for v in range(2 ** k)]
        self.boxes, self.texts = {}, {}
        for i, pat in enumerate(self.pats):
            x, y = xs_[i % len(xs_)], ys_[i // len(xs_)]
            self.boxes[pat] = RoundedRectangle(corner_radius=0.06, width=px(w), height=px(h), stroke_color=GREY,
                                               stroke_width=1.5, fill_color=GREEN, fill_opacity=0).move_to(P(x, y))
            self.texts[pat] = T(pat, 17, GREY).move_to(P(x, y))
        self.group = VGroup(*self.boxes.values(), *self.texts.values())
        self.seen = set()


class VCShatter(StepScene):
    ID = 'vc-shatter'
    TITLE = 'VC 维：从“打散”到查表'
    FLOW = ['什么叫打散', '三点 8/8', '共线：存在就行', '四点总缺一种', '图 → 表', '查表求 VC', '行数够≠打散']

    def construct(self):
        self.check_numbers()

        self.question(
            r'模型类（比如“平面上所有的直线”）越灵活，越能把训练数据拟合好，也越容易过拟合。怎么用一个数衡量“灵活”？办法是数点：放 $n$ 个点，给每个点贴上 $+$ 或 $-$，一共有 $2^n$ 种贴法。**如果某组 $n$ 个点的 $2^n$ 种贴法，模型类全都做得出来，就说这组点被它 shatter（打散）；能被打散的最大点数，就是 VC dimension（VC 维）。** 下面先用直线把这句话看懂，再学考试怎么从一张表里读出 VC 维（T1 题型）。',
            ['一个模型类有多灵活？', '数一数：它最多能把几个点“任意贴标签”'],
        )
        self.what_is_shatter()
        self.triangle_grid()
        self.collinear()
        self.four_points()
        self.picture_to_table()
        self.read_l07()
        self.trap_q26()

        self.takeaway(
            r'一句话：VC 维量的是模型类“能把多少个点任意贴标签”。**打散 = $2^n$ 种标签全都做得出；VC 维 = 能被打散的最大点数，只需存在一组点。** 平面上的直线：三角形的 3 个点能打散，任何 4 个点都有做不出的标签，所以 VC $=3$。直线有 3 个参数 $(w_1,w_2,b)$，VC 正好是 3；推广到 $\mathbb R^d$ 的线性分类器，有 $d+1$ 个参数，VC $=d+1$（“VC = 参数个数”只是线性分类器的情况，不是普遍规律）。考试从表求 VC 维的三步：① 上界 $\lfloor\log_2(\text{不同的行数})\rfloor$；② 选 $k$ 列、去掉重复行；③ 集齐全部 $2^k$ 种才算打散；想说明没有 $k$ 列能集齐时，先用“每列 0 和 1 各要至少 $2^{k-1}$ 个”预筛。答案写两半：上界说明 VC 不会更大，找到的被打散点集说明 VC 至少这么大。',
            ['VC 维 = 最多能被打散的点数',
             '打散：2<sup>n</sup> 种标签全做得出；存在一组点就够',
             '查表：上界 ⌊log₂ 不同行数⌋ → 选列去重 → 集齐 2<sup>k</sup> 种',
             'ℝ<sup>2</sup> 中直线 VC = 3；ℝ<sup>d</sup> 中线性分类器 VC = d + 1'],
        )

    # ------------------------------------------------------------------ claims the narration makes
    def check_numbers(self):
        box = Box(0, 0, 100, 100)

        def count(cfg):
            pts = [box.pt(*p) for p in cfg]
            n = len(cfg)
            return sum(separator(pts, bits(k, n), box) is not None for k in range(2 ** n))

        assert count(TRI) == 8, 'triangle must be shattered'
        assert separator([box.pt(*p) for p in COL], [1, 0, 1], box) is None, '+ − + on a line is impossible'
        assert count(COL) == 6
        assert separator([box.pt(*p) for p in SQUARE], [1, 0, 1, 0], box) is None, 'XOR is impossible'
        assert separator([box.pt(*p) for p in INNER], [1, 1, 1, 0], box) is None, 'inner point opposite is impossible'
        assert count(SQUARE) == 14 and count(INNER) == 14, 'S(4) = 14'

        def pats(rows, cols):
            return [''.join(r[j] for j in cols) for r in rows]

        p = pats(L07, (0, 1, 3))
        assert len(set(p)) == 8 and [i for i in range(len(p)) if p[i] in p[:i]] == [4, 6], 'L07: rows 5, 7 repeat'
        full3 = [c for c in combinations(range(4), 3) if len(set(pats(L07, c))) == 8]
        assert full3 == [(0, 1, 2), (0, 1, 3), (1, 2, 3)]
        assert all(len(set(pats(Q26, c))) < 8 for c in combinations(range(5), 3)), 'Q26: no 3 columns shattered'
        p = pats(Q26, (0, 2, 3))
        assert len(set(p)) == 7 and {format(v, '03b') for v in range(8)} - set(p) == {'101'}
        assert len(set(pats(Q26, (0, 1)))) == 4
        ok = [j for j in range(5) if min(sum(r[j] == '0' for r in Q26), sum(r[j] == '1' for r in Q26)) >= 4]
        assert ok == [2, 3], 'prefilter: only x3, x4 have >= 4 zeros and ones'

    # ------------------------------------------------------------------ step 1
    def what_is_shatter(self):
        self.step(
            r'平面上 3 个点 $x_1,x_2,x_3$。一条直线把平面切成两半：浅红那一侧判 $+$（红点），另一侧判 $-$（蓝点）。直线一动，点的颜色就跟着变；下方读数是这条线此刻贴出的标签，按 $x_1,x_2,x_3$ 的顺序写。直线稍微平移、只要不越过任何点，标签就不变，所以同一种标签有很多条直线都能做出。这样一种“每个点贴 $+$ 还是 $-$”的结果叫一个 dichotomy（二分）。每个点有 2 种选择，3 个点一共 $2\times2\times2=2^3=8$ 种。**shatter（打散）的意思是：这 8 种标签，每一种都能找到一条直线做出来。**',
            '一条直线给出一种贴标签；3 个点共 2³ = 8 种', stage=0,
        )
        box = Box(34, 62, 318, 290)
        pts = [box.pt(*p) for p in TRI]
        centre = box.centre[:2]
        th, off = ValueTracker(0.0), ValueTracker(0.0)

        def line_nc():
            n = np.array([np.cos(th.get_value()), np.sin(th.get_value())])
            return n, float(n @ centre) + off.get_value()

        def target(lab, prev):
            n, c = separator(pts, lab, box)
            a = np.arctan2(n[1], n[0])
            a += 2 * np.pi * round((prev - a) / (2 * np.pi))
            return a, c - float(n @ centre)

        frame = box.frame()
        names = VGroup(*[T(xs(i + 1), 18, WHITE).next_to(pts[i], d, buff=0.16)
                         for i, d in enumerate([LEFT, RIGHT, UP])])
        a0, o0 = target([1, 0, 0], 0.0)
        th.set_value(a0)
        off.set_value(o0)
        line = always_redraw(lambda: cut(box, *line_nc()))
        dots = always_redraw(lambda: VGroup(*[dot(p, side(*line_nc(), p)) for p in pts]))

        def readout():
            n, c = line_nc()
            parts = [T('这条线贴出：', 18, WHITE)]
            for i, p in enumerate(pts):
                b = side(n, c, p)
                parts += [T(xs(i + 1), 18, WHITE), T(sign(b), 20, PLUS if b else MINUS, weight='BOLD')]
            return VGroup(*parts).arrange(RIGHT, buff=0.08).move_to(P(176, 314))

        read = always_redraw(readout)
        self.play(FadeIn(frame), FadeIn(names), run_time=0.5)
        self.play(FadeIn(line), FadeIn(dots), FadeIn(read), run_time=0.7)
        self.wait(0.8)
        for lab in ([0, 0, 1], [0, 1, 1], [1, 1, 0]):
            a, o = target(lab, th.get_value())
            self.play(th.animate.set_value(a), off.animate.set_value(o), run_time=1.5)
            self.wait(0.6)

        card = card_lines([
            ('dichotomy（二分）', 20, YELLOW),
            ('给每个点贴 + 或 −', 18, WHITE),
            ('3 个点：2 × 2 × 2 = 2³ = 8 种', 18, WHITE),
            ('', 10, WHITE),
            ('shatter（打散）', 20, YELLOW),
            ('8 种里的每一种，', 18, WHITE),
            ('都有某条直线做得出来', 18, WHITE),
        ], 346, 92, 28)
        for m in card:
            self.play(FadeIn(m, shift=UP * 0.1), run_time=0.35)
        self.wait(1.6)

    # ------------------------------------------------------------------ step 2
    def triangle_grid(self):
        self.step(
            r'把 8 种标签逐个摆出来，每格一种，格子上方写着它的符号（按 $x_1,x_2,x_3$ 的顺序）。每一格都画出了一条做得到的直线：全是 $+$ 或全是 $-$ 时，把直线放到所有点的外面；只有一个点和另外两个不同时，用直线把这个点单独切下来。3 个点的标签只有这两类，所以 8 种全部做到，这 3 个点被直线打散，**VC 维至少是 3**。注意这 3 个点不在一条直线上（围成一个三角形），下一步就会看到这一点为什么要紧。',
            '8 种全都做得出：这 3 个点被打散 ⇒ VC ≥ 3', stage=1,
        )
        self.clear_stage()
        done = ValueTracker(0)
        count = always_redraw(lambda: T(f'做出 {int(done.get_value() + 0.01)} / 8 种', 20, WHITE).move_to(P(320, 322)))
        self.play(FadeIn(count), run_time=0.3)
        for k in range(8):
            lab = bits(k, 3)
            cx, y0 = 110 + 140 * (k % 4), 88 + 120 * (k // 4)
            box = Box(cx - 62, y0, cx + 62, y0 + 86)
            pts = [box.pt(*p) for p in TRI]
            n, c = separator(pts, lab, box)
            head = seq(lab, 17).move_to(P(cx, y0 - 12))
            panel = VGroup(box.frame(), *[dot(p, b, r=0.09, glyph=False) for p, b in zip(pts, lab)])
            ln = cut(box, n, c, sw=2.5)
            self.play(FadeIn(panel), FadeIn(head), run_time=0.3)
            self.play(FadeIn(ln), done.animate.set_value(k + 1), run_time=0.45)
        self.wait(0.5)
        final = T('8 / 8 全做到 ⇒ 这 3 个点被打散 ⇒ VC ≥ 3', 20, YELLOW).move_to(P(320, 322))
        self.play(ReplacementTransform(count, final), run_time=0.5)
        self.wait(2.0)

    # ------------------------------------------------------------------ step 3
    def collinear(self):
        self.step(
            r"换一组点：3 个点排在同一条直线上，要做 $+\,-\,+$（两头 $+$、中间 $-$）。从这一步起，点的颜色是“想要做出的标签”，不再跟着直线变；黄圈标出这条线贴错的点。试几条直线，总有一个点贴错。原因是：两个 $+$ 点都在 $+$ 侧，它们之间的连线（红色粗线）也整段在 $+$ 侧。为什么？这段连线要是有一部分跑到 $-$ 侧，就得穿过直线出去、再穿过直线回来，可一条线段和一条直线最多只交一次。（用式子说：分数 $\mathbf w'\mathbf x+b$ 沿这段连线均匀变化，两端都 $\ge0$，中间也 $\ge0$。）中间的 $x_2$ 正好在这段连线上，只能也是 $+$。$-\,+\,-$ 同理做不出，所以这组共线的点没有被打散。但这不推翻上一步：**VC 维只要求“存在”一组 $n$ 个点被打散，不要求任意一组都能被打散。** 三角形那组已经做到，VC 维仍然至少是 3。",
            '共线 3 点做不出 + − +；但只要存在一组被打散就够', stage=2,
        )
        self.clear_stage()
        box = Box(30, 72, 318, 276)
        pts = [box.pt(*p) for p in COL]
        lab = [1, 0, 1]
        frame = box.frame()
        dots = VGroup(*[dot(p, b) for p, b in zip(pts, lab)])
        names = VGroup(*[T(xs(i + 1), 18, WHITE).next_to(p, UP, buff=0.34) for i, p in enumerate(pts)])
        want = left_at(T('要做：', 18, WHITE), 40, 296)
        want_seq = seq(lab, 19).next_to(want, RIGHT, buff=0.12)
        self.play(FadeIn(frame), FadeIn(dots), FadeIn(names), FadeIn(want), FadeIn(want_seq), run_time=0.6)

        mid = lambda a, b: float((pts[a][0] + pts[b][0]) / 2)
        tries = [(np.array([-1.0, 0.0]), -mid(0, 1)),            # x₁ alone on the + side
                 (np.array([1.0, 0.0]), mid(1, 2)),              # x₃ alone on the + side
                 (np.array([0.0, 1.0]), float(pts[0][1]) - 0.6)]  # everything on the + side
        cur = rings = None
        for n, c in tries:
            ln = cut(box, n, c)
            bad = VGroup(*[Circle(radius=0.24, stroke_color=YELLOW, stroke_width=3).move_to(p)
                           for p, b in zip(pts, lab) if side(n, c, p) != b])
            if cur is None:
                self.play(FadeIn(ln), run_time=0.5)
                self.play(Create(bad), run_time=0.4)
            else:
                self.play(ReplacementTransform(cur, ln), FadeOut(rings), run_time=0.7)
                self.play(Create(bad), run_time=0.4)
            cur, rings = ln, bad
            self.wait(0.5)
        self.play(FadeOut(cur), FadeOut(rings), run_time=0.4)
        seg = Line(pts[0], pts[2], color=PLUS, stroke_width=10, stroke_opacity=0.55).set_z_index(-1)
        seg_note = T('两个 + 点之间的整段，都在 + 侧', 16, PLUS).move_to(box.pt(0.5, 0.3))
        ring = Circle(radius=0.26, stroke_color=YELLOW, stroke_width=3).move_to(pts[1])
        self.play(Create(seg), FadeIn(seg_note), run_time=0.8)
        self.play(Create(ring), Indicate(dots[1], color=YELLOW), run_time=0.7)

        card = card_lines([
            ('共线 3 点：+ − + 做不出', 18, WHITE),
            ('（− + − 也做不出）', 16, GREY),
            ('⇒ 这组点没有被打散', 18, WHITE),
            ('', 10, WHITE),
            ('VC 维只要求：', 19, YELLOW),
            ('存在一组 n 个点被打散', 19, YELLOW),
            ('', 10, WHITE),
            ('三角形那组已做到 ⇒ VC ≥ 3 不变', 18, WHITE),
        ], 344, 92, 27)
        for m in card:
            self.play(FadeIn(m, shift=UP * 0.1), run_time=0.3)
        self.wait(2.2)

    # ------------------------------------------------------------------ step 4
    def four_points(self):
        self.step(
            r'再加一个点：4 个点有 $2^4=16$ 种标签。左边 4 个点围成四边形，要做“对角同色”：$x_1,x_3$ 是 $+$，$x_2,x_4$ 是 $-$（就是 XOR 的形状）。直线转一整圈，读数在 1、2、3 之间变，从没到 0。理由和上一步一样：$x_1$—$x_3$ 这条对角线整段在 $+$ 侧，$x_2$—$x_4$ 整段在 $-$ 侧；可两条对角线交于一点（黄点：它是交点，不是贴错的点），这一点不可能同时在两侧。右边是另一种摆法：一个点被另外三个围住，要做“外面三个 $+$、中间一个 $-$”：三个 $+$ 点两两之间的连线都在 $+$ 侧，它们围成的整个三角形也就在 $+$ 侧，中间的点只能是 $+$。4 个点的摆法只有三类：围成四边形（左图）、一个点落在另三点的三角形里（右图）、有三个点共线（上一步，$+\,-\,+$ 做不出）。每一类都至少有一种标签做不出；把这种标签的 $+$ 和 $-$ 整体对调，同样做不出（对调只是把直线两侧换个名字）。**所以任何 4 个点都至少缺 2 种标签，16 种里最多做出 14 种，永远打散不了。** 存在一组 3 个点（三角形）能被打散，任何 4 个点都不能，所以平面上直线的 VC 维是 3。',
            '任何 4 个点都有做不出的标签 ⇒ 直线的 VC 维 = 3', stage=3,
        )
        self.clear_stage()
        bl, br = Box(24, 62, 304, 248), Box(336, 62, 616, 248)
        pl = [bl.pt(*p) for p in SQUARE]
        pr = [br.pt(*p) for p in INNER]
        xor, inner = [1, 0, 1, 0], [1, 1, 1, 0]
        dl = VGroup(*[dot(p, b) for p, b in zip(pl, xor)])
        dr = VGroup(*[dot(p, b) for p, b in zip(pr, inner)])
        nl = VGroup(*[T(xs(i + 1), 17, WHITE).next_to(p, d, buff=0.14)
                      for i, (p, d) in enumerate(zip(pl, [LEFT, RIGHT, RIGHT, LEFT]))])
        self.play(FadeIn(bl.frame()), FadeIn(dl), FadeIn(nl), run_time=0.6)

        th = ValueTracker(0.3)
        centre = bl.centre[:2]

        def nc():
            n = np.array([np.cos(th.get_value()), np.sin(th.get_value())])
            return n, float(n @ centre) + 0.95      # off-centre: sometimes cuts off one corner, never fixes XOR

        line = always_redraw(lambda: cut(bl, *nc()))
        wrong = always_redraw(lambda: T(
            f'贴错 {sum(side(*nc(), p) != b for p, b in zip(pl, xor))} 个', 18, YELLOW).move_to(P(164, 268)))
        self.play(FadeIn(line), FadeIn(wrong), run_time=0.4)
        self.play(th.animate.set_value(0.3 + 2 * np.pi), run_time=4.0, rate_func=lambda t: t)
        self.play(FadeOut(line), FadeOut(wrong), run_time=0.4)

        d1 = Line(pl[0], pl[2], color=PLUS, stroke_width=7, stroke_opacity=0.7).set_z_index(-1)
        d2 = Line(pl[1], pl[3], color=MINUS, stroke_width=7, stroke_opacity=0.7).set_z_index(-1)
        meet = Circle(radius=0.1, fill_color=YELLOW, fill_opacity=1, stroke_width=0).move_to(bl.centre)
        self.play(Create(d1), Create(d2), run_time=0.8)
        self.play(FadeIn(meet), Flash(meet, color=YELLOW), run_time=0.6)
        note_l = VGroup(T('+ 的对角线整段在 + 侧，− 的在 − 侧', 16, WHITE).move_to(P(164, 268)),
                        T('交点（黄）两侧都要在 ⇒ 做不出', 16, YELLOW).move_to(P(164, 292)))
        self.play(FadeIn(note_l), run_time=0.4)
        self.wait(1.0)

        tri = Polygon(*pr[:3], fill_color=PLUS, fill_opacity=0.18, stroke_color=PLUS, stroke_width=2).set_z_index(-1)
        self.play(FadeIn(br.frame()), FadeIn(dr), run_time=0.6)
        self.play(FadeIn(tri), Indicate(dr[3], color=YELLOW), run_time=0.8)
        note_r = VGroup(T('三个 + 围成的三角形整块在 + 侧', 16, WHITE).move_to(P(476, 268)),
                        T('中间的点只能是 + ⇒ 做不出', 16, YELLOW).move_to(P(476, 292)))
        self.play(FadeIn(note_r), run_time=0.4)
        self.wait(0.8)
        verdict = T('任何 4 个点都会卡住：16 种最多做出 14 种 ⇒ 直线 VC = 3', 19, YELLOW).move_to(P(320, 324))
        self.play(FadeIn(verdict, shift=UP * 0.1), run_time=0.5)
        self.wait(2.4)

    # ------------------------------------------------------------------ step 5
    def picture_to_table(self):
        self.step(
            r'考试不给图，只给一张表。把三角形那 8 格搬进表里：$+$ 记作 1，$-$ 记作 0，按 $x_1,x_2,x_3$ 的顺序写成一行。**表里的一行，就是某个分类器（这里是一条直线）在这几个点上贴出的标签；一列，就是一个点。** 所以“这几个点被打散”翻译成表的语言就是：只看这几列，000 到 111 这 $2^3=8$ 种 0/1 组合全都出现。题目里的分类器不一定是直线，读表的方法完全一样。',
            '一行 = 一种贴标签，一列 = 一个点；打散 = 8 种组合全出现', stage=4,
        )
        self.clear_stage()
        minis = []
        for k in range(8):
            lab = bits(k, 3)
            cx, y0 = 62 + 74 * (k % 4), 82 + 78 * (k // 4)
            box = Box(cx - 33, y0, cx + 33, y0 + 52)
            pts = [box.pt(*p) for p in TRI]
            n, c = separator(pts, lab, box)
            head = seq(lab, 15, 0.08).move_to(P(cx, y0 - 10))
            minis.append((VGroup(cut(box, n, c, sw=2), box.frame(),
                                 *[dot(p, b, r=0.065, glyph=False) for p, b in zip(pts, lab)]), head))
        self.play(*[FadeIn(VGroup(*m)) for m in minis], run_time=0.8)
        table = Table([''.join(map(str, bits(k, 3))) for k in range(8)], [430, 480, 530], 78, 25, size=20)
        self.play(FadeIn(table.head), Create(table.rule), run_time=0.5)
        for k in range(8):
            row = VGroup(*table.cells[k])
            self.play(Indicate(minis[k][0], color=YELLOW, scale_factor=1.06),
                      ReplacementTransform(minis[k][1].copy(), row), run_time=0.55)
        notes = card_lines([
            ('+ 记 1，− 记 0', 17, WHITE),
            ('一行 = 一条线在这几个点上贴的标签', 17, WHITE),
            ('一列 = 一个点', 17, WHITE),
        ], 30, 248, 24)
        self.play(FadeIn(notes), run_time=0.5)
        last = T('打散 ⇔ 只看这几列，000 到 111 全出现', 19, YELLOW).move_to(P(320, 326))
        self.play(FadeIn(last, shift=UP * 0.1), run_time=0.5)
        self.wait(2.6)

    # ------------------------------------------------------------------ scanning a table into the slots
    def scan(self, table, cols, slots, x_out, fast=False):
        """Read each row restricted to `cols`, write the pattern at x_out, and drop it into its slot."""
        outs = VGroup()
        hl = None
        for r, row in enumerate(table.rows):
            pat = ''.join(row[j] for j in cols)
            out = T(pat, 18, WHITE).move_to(P(x_out, table.y[r]))
            outs.add(out)
            box = table.row_box(r)
            first = hl is None
            if first:
                self.play(Create(box), FadeIn(out), run_time=0.3 if fast else 0.4)
            else:
                self.play(ReplacementTransform(hl, box), FadeIn(out), run_time=0.22 if fast else 0.3)
            hl = box
            if pat in slots.seen:
                strike = Line(out.get_left(), out.get_right(), color=RED, stroke_width=3)
                tag = T('重复', 14, RED).next_to(out, RIGHT, buff=0.12)
                self.play(Create(strike), FadeIn(tag), Indicate(slots.boxes[pat], color=RED, scale_factor=1.1),
                          run_time=0.3 if fast else 0.45)
                outs.add(strike, tag)
            else:
                slots.seen.add(pat)
                fly = out.copy()
                self.play(fly.animate.move_to(slots.texts[pat]).set_opacity(0),
                          slots.boxes[pat].animate.set_fill(GREEN, 0.4).set_stroke(GREEN),
                          slots.texts[pat].animate.set_color(WHITE), run_time=0.3 if fast else 0.4)
                self.remove(fly)
        self.play(FadeOut(hl), run_time=0.2)
        return outs

    # ------------------------------------------------------------------ step 6
    def read_l07(self):
        self.step(
            r'这是课件 L07 p29 的表：4 个点 $x_1..x_4$，10 行，互不相同（如果有完全相同的整行，先删掉再数）。第一步求上界：打散 4 个点要 $2^4=16$ 种不同的行，表里只有 10 种，不够；$2^3=8\le10$，所以最多打散 3 个点。写成式子是 $\lfloor\log_2 10\rfloor=3$：$\log_2 10$ 问“2 的几次方等于 10”，约 3.32；$\lfloor\ \rfloor$ 是向下取整，得 3。所以 VC $\le3$。第二步选 3 列试：划掉 $x_3$ 列，只看 $(x_1,x_2,x_4)$，逐行读出三位数，放进右边的 8 个格子。灰字格是还没出现过的组合，某一行读到它，格子就变绿。第 5 行的 010、第 7 行的 111 前面已经出现过，是重复，不另算。10 行读完，8 个格子全部变绿：**$\{x_1,x_2,x_4\}$ 被打散，VC $\ge3$；和上界 VC $\le3$ 合起来，VC $=3$。** 答题就写这两半，再写出被打散的那组点。这张表里 $\{x_1,x_2,x_3\}$ 和 $\{x_2,x_3,x_4\}$ 也能凑齐，写出一组即可。',
            '上界 ⌊log₂10⌋ = 3；删 x₃ 列、去重后集齐 8 种 ⇒ VC = 3', stage=5,
        )
        self.clear_stage()
        table = Table(L07, [84, 120, 156, 192], 70, 22.5, size=19, numbers_x=50)
        self.play(FadeIn(table.group), run_time=0.7)
        bound = card_lines([
            ('① 上界：10 个不同的行 < 2⁴ = 16 ⇒ 4 个点不行', 17, WHITE),
            ('⌊log₂10⌋ = 3 ⇒ VC ≤ 3', 17, WHITE),
        ], 300, 72, 24)
        self.play(FadeIn(bound[0]), run_time=0.4)
        self.play(FadeIn(bound[1]), run_time=0.4)
        self.wait(0.6)
        pick = left_at(T('② 划掉 x₃ 列，只看 (x₁, x₂, x₄)', 17, WHITE), 300, 132)
        slots = Slots(3, [338, 408, 478, 548], [166, 200], w=60, h=26)
        self.play(FadeIn(pick), table.column(2).animate.set_opacity(0.18), FadeIn(slots.group), run_time=0.6)
        self.scan(table, (0, 1, 3), slots, 238)
        res = card_lines([
            ('③ 8 / 8 集齐 ⇒ {x₁, x₂, x₄} 被打散', 18, YELLOW),
            ('⇒ VC ≥ 3；又有上界 VC ≤ 3 ⇒ VC = 3', 18, YELLOW),
            ('（{x₁, x₂, x₃}、{x₂, x₃, x₄} 也行）', 15, GREY),
        ], 300, 240, 26)
        for m in res:
            self.play(FadeIn(m, shift=UP * 0.1), run_time=0.35)
        self.wait(2.4)

    # ------------------------------------------------------------------ step 7
    def trap_q26(self):
        self.step(
            r'陷阱题（2026 practice Q3）：5 个点、8 行，互不相同。上界 $\lfloor\log_2 8\rfloor=3$，看起来 VC 可能是 3，但上界只说“最多”。试 $\{x_1,x_3,x_4\}$：8 行依次读出 000、100、001、010、001、111、110、011，其中 001 重复，只有 7 种，缺 101，没凑齐。5 列里选 3 列一共 $\binom53=10$ 种选法，不用逐个试，先预筛：要打散 3 列，某一列取 0 时，另外两列的 4 种组合都得和它配一次，所以这一列至少要有 4 个 0；同理至少要有 4 个 1。数一下：$x_1$ 只有 3 个 1，$x_2$ 只有 3 个 0，$x_5$ 只有 1 个 0，合格的只有 $x_3,x_4$ 两列，凑不出 3 列，所以 VC $\le2$。退一步看 2 列：$\{x_1,x_2\}$ 读出 00、10、01、01、01、10、11、01，去重后 00、01、10、11 四种全齐，VC $\ge2$。**行数够只是必要条件，必须真找到一组列把 $2^k$ 种组合全部集齐**，所以这张表的 VC $=2$。',
            '8 行 ≠ VC 3：没有哪 3 列集齐 8 种，2 列可以 ⇒ VC = 2', stage=6,
        )
        self.clear_stage()
        table = Table(Q26, [84, 116, 148, 180, 212], 70, 25, size=19, numbers_x=50)
        self.play(FadeIn(table.group), run_time=0.7)
        top = card_lines([
            ('① 上界：8 个不同的行 = 2³ ⇒ VC ≤ 3，像是 3？', 17, WHITE),
            ('② 试 (x₁, x₃, x₄)', 17, WHITE),
        ], 306, 72, 26)
        self.play(FadeIn(top[0]), run_time=0.4)
        self.wait(0.5)
        slots = Slots(3, [338, 408, 478, 548], [130, 162], w=60, h=26)
        self.play(FadeIn(top[1]), FadeIn(slots.group), table.column(1).animate.set_opacity(0.18),
                  table.column(4).animate.set_opacity(0.18), run_time=0.6)
        outs = self.scan(table, (0, 2, 3), slots, 252, fast=True)
        hole = slots.boxes['101']
        miss = VGroup(left_at(T('只有 7 种，缺 101 ⇒ 没被打散', 17, RED), 306, 196),
                      left_at(T('预筛：每列 0、1 各要 ≥ 4 个，只有 x₃、x₄ 够', 16, WHITE), 306, 220))
        self.play(hole.animate.set_stroke(RED, 3), Indicate(slots.texts['101'], color=RED), FadeIn(miss[0]),
                  run_time=0.7)
        self.play(FadeIn(miss[1]), run_time=0.4)
        self.wait(1.0)

        two = left_at(T('③ 退到两列 (x₁, x₂)', 17, WHITE), 306, 250)
        slots2 = Slots(2, [338, 408, 478, 548], [280], w=60, h=26)
        self.play(FadeOut(outs), table.column(1).animate.set_opacity(1), table.column(2).animate.set_opacity(0.18),
                  table.column(3).animate.set_opacity(0.18), FadeIn(two), FadeIn(slots2.group), run_time=0.6)
        self.scan(table, (0, 1), slots2, 252, fast=True)
        win = left_at(T('4 / 4 集齐 ⇒ {x₁, x₂} 被打散 ⇒ VC = 2', 18, YELLOW), 306, 314)
        self.play(FadeIn(win, shift=UP * 0.1), run_time=0.5)
        self.wait(2.6)

    def clear_stage(self):
        """Fade out the previous step's drawing; called right after step() so a paused step keeps its last frame."""
        ms = self.mobjects_without_chrome()
        if ms:
            self.play(*[FadeOut(m) for m in ms], run_time=0.5)

    def mobjects_without_chrome(self):
        """Everything on screen except the process bar and the caption."""
        keep = {id(m) for g in (self._flow, self._cap) if g is not None for m in g.get_family()}
        return [m for m in self.mobjects if id(m) not in keep and isinstance(m, VMobject)]   # skip ValueTrackers
