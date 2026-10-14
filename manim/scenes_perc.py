"""Perceptron learning scene (c31): each mistake pushes the boundary line.

Notation follows chapter c31 (L10 p33-p39): s = w1*x1 + w2*x2 + w0, weights written (w1, w2, w0),
sample x = (x1, x2, 1) with the bias input last; update w <- w + eta*y*x only when y*s <= 0.
"""
import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow, Circle, Create, Dot, FadeIn, FadeOut, Flash,
    Indicate, Line, Polygon, ReplacementTransform, Square, VGroup,
)
from common import (
    BLUE, DIM, GREEN, GREY, INK, M, P, RED, StepScene, T, TEAL,
    WHITE, YELLOW, pill, px,
)

# Layout constants for the 2D plot box
X_MIN, X_MAX = 28.0, 338.0
Y_MIN, Y_MAX = 48.0, 318.0
DX_MIN, DX_MAX = -0.5, 3.0
DY_MIN, DY_MAX = -0.5, 2.5

PANEL_X = 492          # centre of the right-hand panel (layout px); keep its content inside x <= 626


def c2p(x1, x2):
    """Map data coordinate (x1, x2) to Manim point via layout P(x, y)."""
    px_x = X_MIN + (x1 - DX_MIN) / (DX_MAX - DX_MIN) * (X_MAX - X_MIN)
    px_y = Y_MAX - (x2 - DY_MIN) / (DY_MAX - DY_MIN) * (Y_MAX - Y_MIN)
    return P(px_x, px_y)


def score(w, x1, x2):
    """s = w1*x1 + w2*x2 + w0, with w in the chapter's order (w1, w2, w0)."""
    return w[0] * x1 + w[1] * x2 + w[2]


def get_boundary_endpoints(w):
    """Two intersection points of w1*x1 + w2*x2 + w0 = 0 with the data box (w = (w1, w2, w0))."""
    w1, w2, w0 = w
    candidates = []
    # Bottom: x2 = -0.5
    if abs(w1) > 1e-7:
        x1 = (-w0 - w2 * (-0.5)) / w1
        if -0.5001 <= x1 <= 3.0001:
            candidates.append((float(np.clip(x1, -0.5, 3.0)), -0.5))
    # Top: x2 = 2.5
    if abs(w1) > 1e-7:
        x1 = (-w0 - w2 * 2.5) / w1
        if -0.5001 <= x1 <= 3.0001:
            candidates.append((float(np.clip(x1, -0.5, 3.0)), 2.5))
    # Left: x1 = -0.5
    if abs(w2) > 1e-7:
        x2 = (-w0 - w1 * (-0.5)) / w2
        if -0.5001 <= x2 <= 2.5001:
            candidates.append((-0.5, float(np.clip(x2, -0.5, 2.5))))
    # Right: x1 = 3.0
    if abs(w2) > 1e-7:
        x2 = (-w0 - w1 * 3.0) / w2
        if -0.5001 <= x2 <= 2.5001:
            candidates.append((3.0, float(np.clip(x2, -0.5, 2.5))))

    unique = []
    for pt in candidates:
        if not any(np.hypot(pt[0] - u[0], pt[1] - u[1]) < 1e-4 for u in unique):
            unique.append(pt)
    if len(unique) >= 2:
        return c2p(*unique[0]), c2p(*unique[1])
    return c2p(0.5, -0.5), c2p(0.5, 2.5)


def get_region_polygon(w):
    """Clipped positive half-plane (w1*x1 + w2*x2 + w0 >= 0) inside the data box."""
    corners = [(-0.5, -0.5), (3.0, -0.5), (3.0, 2.5), (-0.5, 2.5)]

    def f(p):
        return score(w, p[0], p[1])

    poly = []
    for i in range(4):
        cur = corners[i]
        nxt = corners[(i + 1) % 4]
        fc = f(cur)
        fn = f(nxt)
        if fc >= -1e-9:
            poly.append(cur)
        if (fc > 1e-9 and fn < -1e-9) or (fc < -1e-9 and fn > 1e-9):
            t = fc / (fc - fn)
            inter = (cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1]))
            poly.append(inter)

    clean_poly = []
    for pt in poly:
        if not clean_poly or np.hypot(pt[0] - clean_poly[-1][0], pt[1] - clean_poly[-1][1]) > 1e-4:
            clean_poly.append(pt)
    if len(clean_poly) >= 3:
        pts = [c2p(*p) for p in clean_poly]
        return Polygon(*pts, fill_color=RED, fill_opacity=0.15, stroke_width=0)
    return Polygon(c2p(0, 0), c2p(0, 0), c2p(0, 0), fill_opacity=0, stroke_width=0)


def _box_dist(p, box):
    """Distance from point p (scene coords) to an axis-aligned box (xmin, xmax, ymin, ymax)."""
    dx = max(box[0] - p[0], 0.0, p[0] - box[1])
    dy = max(box[2] - p[1], 0.0, p[1] - box[3])
    return float(np.hypot(dx, dy))


def get_w_arrow_and_label(w, p1, p2, obstacles):
    """Normal arrow perpendicular to the boundary, pointing into the positive region.

    The arrow starts 25 % along the boundary; if that would put the arrow or its label near a data point
    (or a point label), other positions along the line are tried and the clearest one is used."""
    dl = p2 - p1
    perp = np.array([-dl[1], dl[0], 0.0])
    norm = np.linalg.norm(perp)
    perp = perp / norm if norm > 1e-6 else np.array([1.0, 0.0, 0.0])
    screen_norm = c2p(w[0], w[1]) - c2p(0, 0)          # (w1, w2) direction on screen
    if np.dot(perp[:2], screen_norm[:2]) < 0:
        perp = -perp

    lo, hi = c2p(DX_MIN, DY_MIN), c2p(DX_MAX, DY_MAX)
    best, best_clear = None, -1.0
    for frac in (0.25, 0.75, 0.3, 0.2, 0.7, 0.8, 0.35, 0.65, 0.15, 0.85):
        start = p1 + frac * dl
        end = start + perp * 0.85
        lbl_c = end + perp * 0.24
        inside = lo[0] + 0.15 < lbl_c[0] < hi[0] - 0.15 and lo[1] + 0.15 < lbl_c[1] < hi[1] - 0.15
        samples = [start + (end - start) * k / 10 for k in range(1, 11)] + [lbl_c]
        clear = min(_box_dist(s, b) for s in samples for b in obstacles)
        if inside and clear >= 0.35:
            best = start
            break
        if inside and clear > best_clear:
            best, best_clear = start, clear
    start = best if best is not None else p1 + 0.25 * dl
    end = start + perp * 0.85
    arrow = Arrow(start, end, buff=0, color=YELLOW, stroke_width=4, max_tip_length_to_length_ratio=0.25)
    label = M(r'\mathbf w', size=24, color=YELLOW).next_to(end, perp, buff=0.08)
    return arrow, label


def wtex(w):
    """Format a weight tuple like the chapter: (0.1,-0.1,-0.2), (0.3,0,-0.1)."""
    def f(v):
        v = round(v, 2)
        if abs(v) < 1e-9:
            return '0'
        return ('%g' % v)
    return r'(' + r',\ '.join(f(v) for v in w) + r')'


class PerceptronScene(StepScene):
    ID = 'perceptron'
    TITLE = '感知机：每分错一个点，就把分界线朝它推一下'
    FLOW = ['规则与初始线', '样本1：推向负类', '样本2：推向正类', '样本3：分对不动', '第2轮与收敛']

    def card(self, rows):
        """Right-hand arithmetic card (rows left-aligned), centred in the panel."""
        g = VGroup(*rows).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        g.move_to(P(PANEL_X, 200))
        return g

    def construct(self):
        # 1. Opening Question
        self.question(
            r'平面上有两类点，想用一条直线把它们分开，可事先不知道这条线该画在哪。Perceptron（感知机）的办法很朴素：先随手画一条线，再一个点一个点地检查，分对了就不动，分错了就把线往那个点推一下，让它落到正确的一侧。**每分错一个点，就把分界线朝它推一下；分对就不动。**这个视频用课件 L10 例子里的 3 个点，把每一次推动都算出来。',
            ['两类数据，如何用直线分开？', '随手猜一条线，分错了该怎么改？'],
        )

        # 2. Stage 0: Setup geometry & annotated update rule
        self.step(
            r"左边是数据：蓝色圆点 $(1,1)$ 是负类 $y=-1$，两个红色方块 $(2,1)$、$(1.5,0.5)$ 是正类 $y=+1$。感知机是一个 linear classifier（线性分类器）：先算得分 $s=w_1x_1+w_2x_2+w_0$，$s\ge0$ 判正类 $+1$（浅红区域），$s<0$ 判负类 $-1$，绿线就是 $s=0$ 的分界线。$w_0$ 是 bias（偏置）：按课件 L10 的写法，给每个样本末尾补一个固定的 $1$（bias 输入 $x_0=1$），写成 $\mathbf x=(x_1,x_2,1)$，权重按 $(w_1,w_2,w_0)$ 排，得分就是点积 $s=\mathbf w'\mathbf x$。标着 $\mathbf w$ 的黄色箭头画的是 $(w_1,w_2)$，它垂直于分界线、指向正类一侧（c03：$(w_1,w_2)$ 是分界线的法向量；沿它的方向走，得分 $s=\mathbf w'\mathbf x$ 变大，所以箭头指向 $s>0$ 的浅红一侧）。右边是学习规则：$y\,s>0$ 表示得分的正负号和标签一致，分对，不动；$y\,s\le0$ 表示分错（或正好压在线上），这时更新。**只在 $y\,s\le0$ 时更新：$\mathbf w\leftarrow\mathbf w+\eta\,y\,\mathbf x$。**$\eta=0.1$ 是 learning rate（学习率，卡片上写作步长）；$y=\pm1$ 决定往哪边推；$\mathbf x$ 决定沿哪个方向推。初始权重 $(w_1,w_2,w_0)=(0.2,\ 0,\ -0.1)$，分界线 $0.2x_1+0\cdot x_2-0.1=0$，即 $x_1=0.1/0.2=0.5$，是一条竖线，三个点都在它右边的浅红区域里。",
            short='初始线 x₁ = 0.5：得分 s = w₁x₁ + w₂x₂ + w₀',
            stage=0,
        )

        # Build coordinate grid and axes
        grid_lines = []
        for x_val in [0.0, 1.0, 2.0, 3.0]:
            grid_lines.append(Line(c2p(x_val, -0.5), c2p(x_val, 2.5), color='#23262e', stroke_width=1))
        for y_val in [-0.5, 0.0, 1.0, 2.0]:
            grid_lines.append(Line(c2p(-0.5, y_val), c2p(3.0, y_val), color='#23262e', stroke_width=1))
        grid_lines.append(Line(c2p(-0.5, -0.5), c2p(-0.5, 2.5), color='#23262e', stroke_width=1))   # left edge carries the x2 ticks
        axis_x = Line(c2p(-0.5, 0), c2p(3.0, 0), color=DIM, stroke_width=1.5)
        axis_y = Line(c2p(0, -0.5), c2p(0, 2.5), color=DIM, stroke_width=1.5)
        lbl_x1 = T('x₁', 20, GREY).next_to(c2p(2.85, 0), DOWN, buff=0.12)
        lbl_x2 = T('x₂', 20, GREY).next_to(c2p(0, 2.35), LEFT, buff=0.12)
        # Numeric ticks on the box's bottom (x1) and left (x2) edges. They sit OUTSIDE the data box, so no
        # boundary line or shaded region (both clipped to the box) can ever cross them; "0" lines up with the axes.
        tick_c = '#a3aab6'
        ticks = VGroup()
        for v in (0, 0.5, 1, 1.5, 2, 2.5, 3):
            q = c2p(v, DY_MIN)
            ticks.add(Line(q, q + DOWN * px(4), color=tick_c, stroke_width=1.2),
                      T('%g' % v, 15, tick_c).next_to(q + DOWN * px(4), DOWN, buff=px(2)))
        for v in (0, 0.5, 1, 1.5, 2, 2.5):
            q = c2p(DX_MIN, v)
            ticks.add(Line(q, q + LEFT * px(4), color=tick_c, stroke_width=1.2),
                      T('%g' % v, 15, tick_c).next_to(q + LEFT * px(4), LEFT, buff=px(3)))
        legend = VGroup(
            VGroup(Dot(radius=px(6), color=BLUE), T('y = −1', 16, BLUE)).arrange(RIGHT, buff=0.1),
            VGroup(Square(side_length=px(11), fill_color=RED, fill_opacity=1, stroke_color=WHITE, stroke_width=1),
                   T('y = +1', 16, RED)).arrange(RIGHT, buff=0.1),
        ).arrange(RIGHT, buff=0.4).move_to(P(PANEL_X, 330))
        plot_frame = VGroup(*grid_lines, axis_x, axis_y, lbl_x1, lbl_x2, ticks, legend)

        # Data points (label = coordinates; colour/shape = class, see legend)
        # (1, 1), y = -1 (blue dot)
        p0_dot = Dot(c2p(1, 1), radius=px(7), color=BLUE)
        p0_lbl = T('(1, 1)', 17, BLUE).next_to(c2p(1, 1), UP, buff=0.46)
        # (2, 1), y = +1 (red square)
        p1_sq = Square(side_length=px(14), fill_color=RED, fill_opacity=1, stroke_color=WHITE, stroke_width=1.2).move_to(c2p(2, 1))
        p1_lbl = T('(2, 1)', 17, RED).next_to(c2p(2, 1), RIGHT, buff=0.46)
        # (1.5, 0.5), y = +1 (red square)
        p2_sq = Square(side_length=px(14), fill_color=RED, fill_opacity=1, stroke_color=WHITE, stroke_width=1.2).move_to(c2p(1.5, 0.5))
        p2_lbl = T('(1.5, 0.5)', 17, RED).next_to(c2p(1.5, 0.5), RIGHT, buff=0.46)
        data_group = VGroup(p0_dot, p0_lbl, p1_sq, p1_lbl, p2_sq, p2_lbl)

        pad = 0.12
        obstacles = []
        for mob in (p0_lbl, p1_lbl, p2_lbl):
            obstacles.append((mob.get_left()[0] - pad, mob.get_right()[0] + pad,
                              mob.get_bottom()[1] - pad, mob.get_top()[1] + pad))
        for c in ((1, 1), (2, 1), (1.5, 0.5)):
            q = c2p(*c)
            r = px(15) + pad          # focus-ring radius
            obstacles.append((q[0] - r, q[0] + r, q[1] - r, q[1] + r))

        def geometry(w):
            a, b = get_boundary_endpoints(w)
            arrow, arrow_lbl = get_w_arrow_and_label(w, a, b, obstacles)
            return Line(a, b, color=GREEN, stroke_width=3.5), get_region_polygon(w), arrow, arrow_lbl

        def w_value(w):
            return M(r'\mathbf w = ' + wtex(w), size=27, color=GREEN).move_to(P(PANEL_X, 82))

        # Initial weights (w1, w2, w0) = (0.2, 0, -0.1)
        cur_w = [0.2, 0.0, -0.1]
        bd_line, region, w_arrow, w_arrow_lbl = geometry(cur_w)

        # Right panel: header & weight display
        w_title = T('当前权重 (w₁, w₂, w₀)', 18, GREY).move_to(P(PANEL_X, 54))
        w_val_label = w_value(cur_w)

        # Right panel: role-annotated update rule
        score_eq = M(r"s = w_1x_1 + w_2x_2 + w_0 = \mathbf w'\mathbf x", size=24)
        eq_parts = M([r'\mathbf w \leftarrow \mathbf w +', r'\;\eta\;', r'y', r'\;\mathbf x'], size=28)
        eq_parts[1].set_color(TEAL)
        eq_parts[2].set_color(YELLOW)
        eq_parts[3].set_color(BLUE)
        roles = VGroup(
            VGroup(M(r'\eta', 24, TEAL), T('步长 0.1', 18, TEAL)).arrange(RIGHT, buff=0.14),
            VGroup(M(r'y', 24, YELLOW), T('真实标签 ±1：往哪边推', 18, YELLOW)).arrange(RIGHT, buff=0.14),
            VGroup(M(r'\mathbf x = (x_1, x_2, 1)', 22, BLUE), T('沿这个样本推', 18, BLUE)).arrange(RIGHT, buff=0.14),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        rule_notes = VGroup(
            VGroup(M(r'y\,s \le 0', 22, WHITE), T('分错 ⇒ 更新', 18, WHITE)).arrange(RIGHT, buff=0.14),
            VGroup(M(r'y\,s > 0', 22, GREY), T('分对 ⇒ 不动', 18, GREY)).arrange(RIGHT, buff=0.14),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        rule_card = VGroup(score_eq, eq_parts, roles, rule_notes).arrange(DOWN, aligned_edge=LEFT, buff=0.24)
        rule_card.move_to(P(PANEL_X, 215))

        # Animate Step 1 entrance
        self.play(FadeIn(plot_frame), FadeIn(data_group), run_time=1.0)
        self.play(FadeIn(region), Create(bd_line), FadeIn(w_arrow), FadeIn(w_arrow_lbl), run_time=1.2)
        self.play(FadeIn(w_title), FadeIn(w_val_label), FadeIn(rule_card), run_time=1.0)
        self.wait(1.5)

        def move_to_weights(w, extra=()):
            nonlocal bd_line, region, w_arrow, w_arrow_lbl, w_val_label
            n_line, n_region, n_arrow, n_lbl = geometry(w)
            n_val = w_value(w)
            self.play(
                ReplacementTransform(bd_line, n_line),
                ReplacementTransform(region, n_region),
                ReplacementTransform(w_arrow, n_arrow),
                ReplacementTransform(w_arrow_lbl, n_lbl),
                ReplacementTransform(w_val_label, n_val),
                *extra,
                run_time=1.4,
            )
            bd_line, region, w_arrow, w_arrow_lbl, w_val_label = n_line, n_region, n_arrow, n_lbl, n_val

        # 3. Stage 1: sample 1: (1, 1), y = -1 (misclassified)
        self.step(
            r"黄圈圈出第 1 个样本 $(1,1)$，真实标签 $y=-1$。得分 $s=0.2\times1+0\times1+(-0.1)=0.1\ge0$，模型判 $+1$，和标签相反：$y\,s=(-1)\times0.1=-0.1\le0$，分错，要更新。$y=-1$，所以规则变成减去 $0.1\times\mathbf x$，这里 $\mathbf x=(1,1,1)$：$(w_1,w_2,w_0)\leftarrow(0.2,\ 0,\ -0.1)+0.1\times(-1)\times(1,1,1)=(0.2-0.1,\ 0-0.1,\ -0.1-0.1)=(0.1,\ -0.1,\ -0.2)$。分界线变成 $0.1x_1-0.1x_2-0.2=0$，即 $x_2=x_1-2$，转到了右下角；$(1,1)$ 落到浅红区域外面，判 $-1$，分对了，两个红方块也跟着出去了，后面再处理。为什么这样改一定把得分往对的方向推：新得分 $=(\mathbf w+\eta y\mathbf x)'\mathbf x=\mathbf w'\mathbf x+\eta y\,\mathbf x'\mathbf x=s+\eta y\|\mathbf x\|^2$；$\mathbf x'\mathbf x=\|\mathbf x\|^2$ 是各分量平方和（这里 $1^2+1^2+1^2=3$），而且末位总是 $1$，所以它至少是 $1$，永远为正。**所以得分一定朝 $y$ 的符号移动：$y=-1$ 时变小，$y=+1$ 时变大。**右边卡片下方两行就是这个验算：用公式 $0.1+0.1\times(-1)\times3=0.1-0.3=-0.2$；直接算新得分 $0.1\times1+(-0.1)\times1+(-0.2)=-0.2$，一样，$-0.2<0$，判 $-1$。",
            short='点 (1,1) 标签 −1 却判 +1：分界线推向该点',
            stage=1,
        )

        focus_ring = Circle(radius=px(15), stroke_color=YELLOW, stroke_width=2.5).move_to(c2p(1, 1))
        self.play(Create(focus_ring), run_time=0.4)

        card2 = self.card([
            T('样本 1：x = (1, 1)，真实 y = −1', 20, YELLOW),
            M(r's = 0.2\times1 + 0\times1 + (-0.1) = 0.1', size=24),
            VGroup(M(r'y\,s = (-1)\times0.1 = -0.1 \le 0', size=24, color=RED), T('分错', 20, RED)).arrange(RIGHT, buff=0.16),
            M(r'\mathbf w \leftarrow (0.2,\ 0,\ -0.1) - 0.1\times(1,\ 1,\ 1)', size=24),
            M(r'= (0.1,\ -0.1,\ -0.2)', size=27, color=YELLOW),
        ])

        self.play(FadeOut(rule_card), FadeIn(card2), run_time=0.6)
        self.wait(1.0)

        # (w1, w2, w0) = (0.1, -0.1, -0.2)
        move_to_weights([0.1, -0.1, -0.2])
        self.wait(0.6)

        # Why the score of this point must move towards y: new score = s + eta*y*||x||^2 (||x||^2 = 3 > 0).
        why = VGroup(
            VGroup(T('新得分', 19, YELLOW), M(r"=(\mathbf w+\eta y\mathbf x)'\mathbf x=s+\eta\,y\,\|\mathbf x\|^2", size=23))
            .arrange(RIGHT, buff=0.14),
            M([r'=0.1+0.1\times(-1)\times', '3', '=-0.2'], size=24, color=YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        why[1].shift(RIGHT * (why[0][1].get_left()[0] - why[1].get_left()[0]))     # "=" under "="
        # the 3 is ||x||^2 = 1^2 + 1^2 + 1^2 (the bias input 1 keeps it positive)
        why.add(M(r'\|\mathbf x\|^2', size=21, color='#a3aab6').next_to(why[1][1], DOWN, buff=0.05))
        why.next_to(card2, DOWN, buff=0.34, aligned_edge=LEFT)
        self.play(FadeIn(why, shift=UP * 0.1), run_time=0.6)
        self.wait(1.4)

        # 4. Stage 2: sample 2: (2, 1), y = +1 (misclassified)
        self.step(
            r'黄圈移到第 2 个样本 $(2,1)$，真实标签 $y=+1$。用刚更新的权重：$s=0.1\times2+(-0.1)\times1+(-0.2)=0.2-0.1-0.2=-0.1<0$，判 $-1$，又分错：$y\,s=(+1)\times(-0.1)=-0.1\le0$。$y=+1$，这次是加上 $0.1\times\mathbf x$，$\mathbf x=(2,1,1)$：$(w_1,w_2,w_0)\leftarrow(0.1,\ -0.1,\ -0.2)+0.1\times(+1)\times(2,1,1)=(0.1+0.2,\ -0.1+0.1,\ -0.2+0.1)=(0.3,\ 0,\ -0.1)$。分界线变成 $0.3x_1-0.1=0$，即竖线 $x_1=1/3\approx0.33$，浅红区域重新铺满右边，$(2,1)$ 回到正类一侧：新得分 $0.3\times2+0\times1-0.1=0.5>0$。**$y$ 的正负号决定推的方向：正类点分错就加上 $\eta\mathbf x$，负类点分错就减去 $\eta\mathbf x$。**',
            short='点 (2,1) 标签 +1 却判 −1：分界线推向正侧',
            stage=2,
        )

        self.play(focus_ring.animate.move_to(c2p(2, 1)), run_time=0.4)

        card3 = self.card([
            T('样本 2：x = (2, 1)，真实 y = +1', 20, YELLOW),
            M(r's = 0.1\times2 + (-0.1)\times1 + (-0.2) = -0.1', size=24),
            VGroup(M(r'y\,s = (+1)\times(-0.1) = -0.1 \le 0', size=24, color=RED), T('分错', 20, RED)).arrange(RIGHT, buff=0.16),
            M(r'\mathbf w \leftarrow (0.1,\ -0.1,\ -0.2) + 0.1\times(2,\ 1,\ 1)', size=24),
            M(r'= (0.3,\ 0,\ -0.1)', size=27, color=YELLOW),
        ])

        self.play(ReplacementTransform(card2, card3), FadeOut(why), run_time=0.5)
        self.wait(1.0)

        # (w1, w2, w0) = (0.3, 0, -0.1)
        move_to_weights([0.3, 0.0, -0.1])
        self.wait(1.3)

        # 5. Stage 3: sample 3: (1.5, 0.5), y = +1 (correct, no change)
        self.step(
            r'黄圈移到第 3 个样本 $(1.5,0.5)$，真实标签 $y=+1$。得分 $s=0.3\times1.5+0\times0.5+(-0.1)=0.45+0-0.1=0.35$，判 $+1$，和标签一致：$y\,s=(+1)\times0.35=0.35>0$，分对，不满足更新条件，权重保持 $(0.3,\ 0,\ -0.1)$，分界线闪了一下但没有动。三个样本都看过一遍，叫完成一个 epoch（轮）。可是看图：蓝点 $(1,1)$ 现在落在浅红区域里，用当前的分界线 $x_1=1/3$ 算 $s=0.3\times1+0\times1-0.1=0.2>0$，它被判成 $+1$，又错了，是第 2 个样本那次更新把它推错的。**所以要一轮一轮地重复检查，直到某一整轮都没有分错的点才停。**',
            short='点 (1.5,0.5)：y·s = 0.35 > 0 分对，分界线不动',
            stage=3,
        )

        self.play(focus_ring.animate.move_to(c2p(1.5, 0.5)), run_time=0.4)

        card4 = self.card([
            T('样本 3：x = (1.5, 0.5)，真实 y = +1', 20, YELLOW),
            M(r's = 0.3\times1.5 + 0\times0.5 + (-0.1) = 0.35', size=24),
            VGroup(M(r'y\,s = 0.35 > 0', size=24, color=GREEN), T('分对', 20, GREEN)).arrange(RIGHT, buff=0.16),
            T('不满足更新条件 ⇒ 线不动', 20, GREEN),
            VGroup(M(r'\mathbf w', size=24, color=GREEN), T('保持', 20, GREEN),
                   M(r'(0.3,\ 0,\ -0.1)', size=24, color=GREEN)).arrange(RIGHT, buff=0.12),
        ])

        check_icon = T('✓ 分对', 18, GREEN).next_to(c2p(1.5, 0.5), DOWN, buff=0.4)
        self.play(ReplacementTransform(card3, card4), FadeIn(check_icon), run_time=0.5)
        self.play(Indicate(bd_line, color=YELLOW), run_time=0.8)
        self.wait(1.4)
        self.play(FadeOut(check_icon), run_time=0.3)

        # 6. Stage 4: epoch 2 & convergence
        self.step(
            r'课件 L10 p33–p39 只算到这 3 个点；下面多走一步，看算法怎样停下来。第 2 轮先复查 $(1,1)$（$y=-1$）：$s=0.3\times1+0\times1-0.1=0.2$，$y\,s=(-1)\times0.2=-0.2\le0$，分错。减去 $0.1\times(1,1,1)$：$(w_1,w_2,w_0)\leftarrow(0.3,\ 0,\ -0.1)-0.1\times(1,1,1)=(0.2,\ -0.1,\ -0.2)$，新分界线 $0.2x_1-0.1x_2-0.2=0$，即 $2x_1-x_2=2$。右边卡片用新权重把三个点再算一遍：$(1,1)$：$s=0.2-0.1-0.2=-0.1<0$，判 $-1$，对；$(2,1)$：$s=0.4-0.1-0.2=0.1>0$，判 $+1$，对；$(1.5,0.5)$：$s=0.3-0.05-0.2=0.05>0$，判 $+1$，对。三个点都满足 $y\,s>0$，再看一整轮也不会更新，算法停止。**数据 linearly separable（线性可分，存在一条直线能把两类完全分开）时，感知机必在有限步内收敛（c32），但它只找到某一条能分开的线，不找 margin（间隔）最大的那条。**',
            short='第 2 轮修正 (1,1)：三点全分对，收敛停机',
            stage=4,
        )

        self.play(focus_ring.animate.move_to(c2p(1, 1)), run_time=0.4)

        card5 = self.card([
            T('第 2 轮复查 x = (1, 1)：真实 y = −1', 20, YELLOW),
            M(r's = 0.3\times1 + 0\times1 + (-0.1) = 0.2', size=24),
            VGroup(M(r'y\,s = -0.2 \le 0', size=24, color=RED), T('又分错了', 20, RED)).arrange(RIGHT, buff=0.16),
            M(r'\mathbf w \leftarrow (0.3,\ 0,\ -0.1) - 0.1\times(1,\ 1,\ 1)', size=24),
            M(r'= (0.2,\ -0.1,\ -0.2)', size=27, color=YELLOW),
        ])

        self.play(ReplacementTransform(card4, card5), run_time=0.5)
        self.wait(1.0)

        # final (w1, w2, w0) = (0.2, -0.1, -0.2)
        move_to_weights([0.2, -0.1, -0.2], extra=[FadeOut(focus_ring)])
        self.wait(0.8)

        # Final convergence verification card
        card_done = VGroup(
            pill('三点全部分对 · 收敛停机', fill=GREEN, color=INK, size=20),
            VGroup(M(r'(1,1)\!:\ s = -0.1', size=24), T('判 −1 ✓', 19, GREEN)).arrange(RIGHT, buff=0.16),
            VGroup(M(r'(2,1)\!:\ s = 0.1', size=24), T('判 +1 ✓', 19, GREEN)).arrange(RIGHT, buff=0.16),
            VGroup(M(r'(1.5,0.5)\!:\ s = 0.05', size=24), T('判 +1 ✓', 19, GREEN)).arrange(RIGHT, buff=0.16),
        ).arrange(DOWN, buff=0.26).move_to(P(PANEL_X, 200))

        self.play(ReplacementTransform(card5, card_done), run_time=0.6)
        self.play(
            Flash(p0_dot, color=GREEN, flash_radius=0.3),
            Flash(p1_sq, color=GREEN, flash_radius=0.3),
            Flash(p2_sq, color=GREEN, flash_radius=0.3),
            run_time=0.8,
        )
        self.wait(1.5)

        # 7. Takeaway
        self.takeaway(
            r'一句话：感知机分错才推线，分对就不动。**只在 $y\,s\le0$ 时更新：$\mathbf w\leftarrow\mathbf w+\eta\,y\,\mathbf x$。**$\mathbf x=(x_1,x_2,1)$ 的最后一位是 $1$，所以 bias $w_0$ 每次也跟着加减 $\eta$；正类点分错就加上 $\eta\mathbf x$，负类点分错就减去，每次更新都把分界线往分错的样本那边推。数据线性可分时必定收敛，但最后停在哪条线，取决于初始权重和检查样本的顺序，也不是 margin 最大的那条。考试 T11 题型就是照这个顺序手算：算 $s$（别漏 $w_0$），看 $y\,s$ 是否 $\le0$，分错才更新，$w_0$ 也要加 $\eta y$。',
            ['分错推线，分对不动', 'w ← w + η·y·x（只在 y·s ≤ 0 时）', '线性可分必收敛，但不求最大间隔'],
        )
