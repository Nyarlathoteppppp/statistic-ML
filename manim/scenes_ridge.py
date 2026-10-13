r"""c17 · Ridge vs Lasso: contours meet the constraint regions.

Port of anim-ridge-lasso in js/viz/scenes_b.js (COMP90051 exam review).
Dual-panel comparison:
- Left panel: Ridge (L2 penalty, unit circle constraint ||w||_2^2 <= 1)
- Right panel: Lasso (L1 penalty, unit diamond constraint ||w||_1 <= 1)
- Both panels share the same unconstrained OLS solution \hat{w} = (2.2, 0.55)
  and the same quadratic error metric Q = [[1.0, 0.45], [0.45, 1.6]].
- Both loss ellipses expand from ONE linked ValueTracker.
- Ridge contacts circle at approx (0.883, 0.470) at c \approx 1.841 (non-zero weights).
- Lasso contacts diamond corner at (1.0, 0.0) at c \approx 2.518 (w_2 = 0, exact sparsity).
"""
import numpy as np
from manim import (
    BackgroundRectangle,
    Create,
    Circle,
    Circumscribe,
    Dot,
    DOWN,
    FadeIn,
    FadeOut,
    Flash,
    Indicate,
    LEFT,
    Line,
    Polygon,
    RIGHT,
    UP,
    ValueTracker,
    VGroup,
    always_redraw,
    DL,
    DR,
    UL,
    UR,
)
from common import (
    BG,
    BLUE,
    DIM,
    GREEN,
    GREY,
    M,
    MT,
    ORANGE,
    P,
    StepScene,
    T,
    TEAL,
    WHITE,
    YELLOW,
    pill,
    px,
)

# Unconstrained OLS solution \hat{w}
WH = np.array([2.2, 0.55])

# Metric tensor Q: loss contour is (w - \hat{w})^T Q (w - \hat{w}) = c
# Q = [[1.0, 0.45], [0.45, 1.6]]
# First contact levels:
C_RIDGE = 1.8410
C_LASSO = 2.5180

# Layout scaling: 46 px per coordinate unit
S_PX = 46.0

# Panel origin coordinates in layout px (y down)
X0_L = 95.0
Y0_L = 225.0
X0_R = 415.0
Y0_R = 225.0

# 80 points around the ellipse for smooth rendering
N_PTS = 80
ALPHAS = np.linspace(0, 2 * np.pi, N_PTS, endpoint=False)
COS_A = np.cos(ALPHAS)
SIN_A = np.sin(ALPHAS)
QF_VALS = 1.0 * COS_A**2 + 0.9 * COS_A * SIN_A + 1.6 * SIN_A**2


def make_ellipse(x0, y0, c_val, color=BLUE, stroke_width=2.2):
    r"""Generate a Polygon mobject for the contour (w - \hat{w})^T Q (w - \hat{w}) = c_val."""
    r = np.sqrt(max(c_val, 0.0001) / QF_VALS)
    w1 = WH[0] + r * COS_A
    w2 = WH[1] + r * SIN_A
    pts = [P(x0 + w1[k] * S_PX, y0 - w2[k] * S_PX) for k in range(N_PTS)]
    return Polygon(*pts, stroke_color=color, stroke_width=stroke_width, fill_opacity=0)


def build_axes(x0, y0):
    r"""Build coordinate axes w1 \in [-1.3, 3.8], w2 \in [-1.3, 2.2] for one panel."""
    x_axis = Line(P(x0 - 1.3 * S_PX, y0), P(x0 + 3.8 * S_PX, y0), color=DIM, stroke_width=1.8)
    y_axis = Line(P(x0, y0 + 1.3 * S_PX), P(x0, y0 - 2.2 * S_PX), color=DIM, stroke_width=1.8)
    lab_w1 = M(r'w_1', 18, GREY).next_to(P(x0 + 3.8 * S_PX, y0), DR, buff=0.06)
    lab_w2 = M(r'w_2', 18, GREY).next_to(P(x0, y0 - 2.2 * S_PX), UR, buff=0.06)

    # Unit tick marks
    tick_w1 = Line(P(x0 + S_PX, y0 - 3), P(x0 + S_PX, y0 + 3), color=DIM, stroke_width=1.5)
    lab_t1 = M('1', 15, GREY).next_to(tick_w1, DOWN, buff=0.08)
    tick_w2 = Line(P(x0 - 3, y0 - S_PX), P(x0 + 3, y0 - S_PX), color=DIM, stroke_width=1.5)
    lab_t2 = M('1', 15, GREY).next_to(tick_w2, LEFT, buff=0.08)
    lab_zero = M('0', 14, GREY).next_to(P(x0, y0), DL, buff=0.08)

    return VGroup(x_axis, y_axis, lab_w1, lab_w2, tick_w1, lab_t1, tick_w2, lab_t2, lab_zero)


class RidgeLasso(StepScene):
    ID = 'ridge-lasso'
    TITLE = 'Ridge vs Lasso：为什么 Lasso 能产生稀疏解'
    FLOW = ['无约束与等高线', '约束：圆 vs 菱形', '等高线同步膨胀', '触点：圆周 vs 尖角', '尖角造就稀疏解']

    def construct(self):
        # 0. Opening question card
        self.question(
            r'Ridge 和 lasso 都能防止过拟合，但只有 lasso 会把无关特征的权重**压成恰好等于 0**，自动做特征选择。为什么换一种惩罚会有这么大差异？从几何上看一清二楚。',
            [
                '同是控制过拟合的正则化，',
                '为什么只有 lasso 能把权重压成恰好 0？',
            ],
            hold=2.8,
        )

        # Dividing line between panels (x = 320 px)
        div_line = Line(P(320, 48), P(320, 312), color=DIM, stroke_width=1.5)

        # Coordinate axes
        axes_L = build_axes(X0_L, Y0_L)
        axes_R = build_axes(X0_R, Y0_R)

        # Panel titles & role annotations
        title_ridge = VGroup(
            T('Ridge：', 20, TEAL),
            M(r'\|\mathbf{w}\|_2^2 \le 1', 22, TEAL)
        ).arrange(RIGHT, buff=0.08).move_to(P(160, 56))

        role_ridge = VGroup(
            M(r'\|\mathbf{w}\|_2^2', 20, TEAL),
            T(' → 圆（没有尖角）', 16, GREY)
        ).arrange(RIGHT, buff=0.06).move_to(P(160, 80))

        title_lasso = VGroup(
            T('Lasso：', 20, ORANGE),
            M(r'\|\mathbf{w}\|_1 \le 1', 22, ORANGE)
        ).arrange(RIGHT, buff=0.08).move_to(P(480, 56))

        role_lasso = VGroup(
            M(r'\|\mathbf{w}\|_1', 20, ORANGE),
            T(' → 菱形（尖角在坐标轴上）', 16, GREY)
        ).arrange(RIGHT, buff=0.06).move_to(P(480, 80))

        # Unconstrained OLS solution points \hat{w} = (2.2, 0.55)
        pos_ols_L = P(X0_L + WH[0] * S_PX, Y0_L - WH[1] * S_PX)
        dot_ols_L = Dot(pos_ols_L, radius=0.08, color=WHITE)
        lab_ols_L = M(r'\hat{\mathbf{w}}', 22, WHITE).next_to(dot_ols_L, UP, buff=0.1)

        pos_ols_R = P(X0_R + WH[0] * S_PX, Y0_R - WH[1] * S_PX)
        dot_ols_R = Dot(pos_ols_R, radius=0.08, color=WHITE)
        lab_ols_R = M(r'\hat{\mathbf{w}}', 22, WHITE).next_to(dot_ols_R, UP, buff=0.1)

        # Faint demo contours for Step 1
        demo_c1_L = make_ellipse(X0_L, Y0_L, 0.35, color=BLUE, stroke_width=1.5).set_stroke(opacity=0.45)
        demo_c2_L = make_ellipse(X0_L, Y0_L, 0.85, color=BLUE, stroke_width=1.5).set_stroke(opacity=0.45)
        demo_c1_R = make_ellipse(X0_R, Y0_R, 0.35, color=BLUE, stroke_width=1.5).set_stroke(opacity=0.45)
        demo_c2_R = make_ellipse(X0_R, Y0_R, 0.85, color=BLUE, stroke_width=1.5).set_stroke(opacity=0.45)

        rss_tag_L = VGroup(
            M(r'\text{RSS}', 17, BLUE),
            T('等高线', 15, BLUE)
        ).arrange(RIGHT, buff=0.06).next_to(pos_ols_L, UR, buff=0.32)

        # Constraint regions (radius t = 1 for both)
        # Ridge: circle ||w||_2^2 <= 1
        region_ridge = Circle(
            radius=px(S_PX), stroke_color=TEAL, stroke_width=2.5,
            fill_color=TEAL, fill_opacity=0.14
        ).move_to(P(X0_L, Y0_L))

        # Lasso: diamond ||w||_1 <= 1
        region_lasso = Polygon(
            P(X0_R + S_PX, Y0_R),
            P(X0_R, Y0_R - S_PX),
            P(X0_R - S_PX, Y0_R),
            P(X0_R, Y0_R + S_PX),
            stroke_color=ORANGE, stroke_width=2.5,
            fill_color=ORANGE, fill_opacity=0.14
        )

        # -------------------------------------------------------------
        # Step 1: Unconstrained OLS solution & RSS contours
        # -------------------------------------------------------------
        self.step(
            r'左右两边分别是 ridge 与 lasso 在权重空间 $(w_1, w_2)$ 上的示意图。白点 $\hat\bw=(2.2,\ 0.55)$ 是未加惩罚时的最小二乘解（OLS）。蓝色椭圆是残差平方和 $\text{RSS}(\bw)$ 的等高线：同一个椭圆上的权重残差相同，离中心越远 RSS 越大。',
            '白点 ŵ 是无约束解，蓝色椭圆是残差平方和 RSS 等高线',
            stage=0,
        )
        self.play(
            FadeIn(div_line),
            FadeIn(axes_L),
            FadeIn(axes_R),
            FadeIn(title_ridge),
            FadeIn(title_lasso),
            FadeIn(dot_ols_L),
            FadeIn(lab_ols_L),
            FadeIn(dot_ols_R),
            FadeIn(lab_ols_R),
            FadeIn(demo_c1_L),
            FadeIn(demo_c2_L),
            FadeIn(demo_c1_R),
            FadeIn(demo_c2_R),
            FadeIn(rss_tag_L),
            run_time=1.2,
        )
        self.wait(1.8)

        # -------------------------------------------------------------
        # Step 2: Constraint regions (same radius t = 1) & role annotations
        # -------------------------------------------------------------
        self.step(
            r'加惩罚等价于约束解必须落在某个区域内（约束形式）：两边设定相同的约束半径 $t=1$。Ridge 的 $L_2$ 约束 $\|\bw\|_2^2\le 1$ 是一个光滑的圆；Lasso 的 $L_1$ 约束 $\|\bw\|_1\le 1$ 则是菱形。注意：圆没有尖角，而菱形的尖角恰好落在坐标轴上。',
            '两边使用相同约束半径 t = 1：ridge 是圆，lasso 是菱形',
            stage=1,
        )
        self.play(
            FadeIn(role_ridge, shift=UP * 0.1),
            FadeIn(role_lasso, shift=UP * 0.1),
            FadeOut(demo_c1_L),
            FadeOut(demo_c2_L),
            FadeOut(demo_c1_R),
            FadeOut(demo_c2_R),
            FadeOut(rss_tag_L),
            run_time=0.8,
        )
        self.play(
            FadeIn(region_ridge),
            FadeIn(region_lasso),
            run_time=1.0,
        )
        self.wait(2.0)

        # -------------------------------------------------------------
        # Step 3: Linked contour expansion -> Ridge makes first contact
        # -------------------------------------------------------------
        self.step(
            r'带约束的最优解，就是从 $\hat\bw$ 慢慢放大椭圆，**第一次碰到约束区域**的那一点。两边椭圆同步放大（同一个参数驱动），等高线同步向外膨胀：当膨胀到 $c\approx 1.841$ 时，左边椭圆首先碰到了圆周。触点约在 $(0.883,\ 0.470)$——两个权重都被连续缩小，但都不为 $0$。',
            '从 ŵ 同步放大椭圆：ridge 在 (0.88, 0.47) 首次相切',
            stage=2,
        )

        tk = ValueTracker(0.04)
        ell_ridge = always_redraw(lambda: make_ellipse(
            X0_L, Y0_L, min(tk.get_value(), C_RIDGE), color=BLUE, stroke_width=2.4
        ))
        ell_lasso = always_redraw(lambda: make_ellipse(
            X0_R, Y0_R, min(tk.get_value(), C_LASSO), color=BLUE, stroke_width=2.4
        ))
        self.add(ell_ridge, ell_lasso)

        # Expand both simultaneously until Ridge touches circle at C_RIDGE
        self.play(tk.animate.set_value(C_RIDGE), run_time=2.2, rate_func=lambda t: t)

        # Ridge contact point ~ (0.883, 0.470)
        pos_rc = P(X0_L + 0.883 * S_PX, Y0_L - 0.469 * S_PX)
        dot_rc = Dot(pos_rc, radius=0.09, color=YELLOW)
        lab_rc = M(r'(0.88,\, 0.47)', 22, YELLOW).move_to(P(70, 150))
        sub_rc = T('w₁、w₂ 都不为 0', 16, WHITE).next_to(lab_rc, DOWN, buff=0.06)
        lead_rc = Line(sub_rc.get_bottom() + DOWN * 0.04, pos_rc, color=YELLOW, stroke_width=1.5)

        self.play(
            FadeIn(dot_rc),
            FadeIn(lab_rc),
            FadeIn(sub_rc),
            Create(lead_rc),
            Flash(dot_rc, color=YELLOW, line_length=0.15, flash_radius=0.25),
            run_time=0.8,
        )
        self.wait(2.2)

        # -------------------------------------------------------------
        # Step 4: Lasso continues expanding -> hits diamond corner (1, 0)
        # -------------------------------------------------------------
        self.step(
            r'此时 lasso 区域还未触碰，右边椭圆继续膨胀到 $c\approx 2.518$。它第一次碰到菱形的位置，恰好是长在坐标轴上的尖角 $(1,\ 0)$！这意味着第二个特征的权重 $w_2=0$，该特征被彻底剔除，实现了稀疏性（sparsity）。',
            'lasso 椭圆继续膨胀，在尖角 (1, 0) 首次接触：w₂ = 0',
            stage=3,
        )

        # Ridge stays locked at circle contact; Lasso continues to C_LASSO
        self.play(tk.animate.set_value(C_LASSO), run_time=1.8, rate_func=lambda t: t)

        # Lasso contact point at corner (1, 0)
        pos_lc = P(X0_R + 1.0 * S_PX, Y0_R)
        dot_lc = Dot(pos_lc, radius=0.09, color=YELLOW)
        lab_lc = VGroup(
            M(r'(1,\, 0)', 18, YELLOW),
            T(' ⇒ ', 16, YELLOW),
            M(r'w_2 = 0', 18, YELLOW)
        ).arrange(RIGHT, buff=0.06).next_to(pos_lc, DR, buff=0.18)
        sub_lc = T('恰好在轴上（稀疏）', 16, GREEN).next_to(lab_lc, DOWN, buff=0.06)
        bg_lc = BackgroundRectangle(VGroup(lab_lc, sub_lc), color=BG, fill_opacity=0.9, buff=0.06)

        self.play(
            FadeIn(bg_lc),
            FadeIn(dot_lc),
            FadeIn(lab_lc),
            FadeIn(sub_lc),
            Flash(dot_lc, color=YELLOW, line_length=0.15, flash_radius=0.25),
            run_time=0.8,
        )
        self.wait(2.4)

        # Freeze updaters now that expansion is complete
        ell_ridge.clear_updaters()
        ell_lasso.clear_updaters()

        # -------------------------------------------------------------
        # Step 5: Geometric insight & contrast: sharp corner vs smooth circle
        # -------------------------------------------------------------
        self.step(
            r'几何本质在于形状：菱形的四个尖角直接长在坐标轴上。由于尖角向外凸出，不同斜率与偏置的数据等高线膨胀过来时，往往会先撞上尖角，从而使解具有稀疏性（但非绝对保证）。而圆周处处光滑，法向连续变化，触点恰好落在轴上纯属巧合，因此 ridge 通常只做连续收缩。',
            '菱形尖角在坐标轴上，往往先被碰到；圆周平滑，碰在轴上只是巧合',
            stage=4,
        )

        # Highlight diamond corners
        corners = [
            P(X0_R + S_PX, Y0_R),
            P(X0_R, Y0_R - S_PX),
            P(X0_R - S_PX, Y0_R),
            P(X0_R, Y0_R + S_PX),
        ]
        corner_dots = VGroup(*[Dot(p, radius=0.06, color=ORANGE) for p in corners])

        # Bottom summary pills inside each panel
        pill_ridge = pill('Ridge：连续收缩，碰在轴上纯属巧合', fill=DIM, color=WHITE, size=15).move_to(P(160, 298))
        pill_lasso = pill('Lasso：尖角外凸，更容易压成恰好 0', fill=DIM, color=YELLOW, size=15).move_to(P(480, 298))

        self.play(
            FadeIn(corner_dots),
            Circumscribe(dot_lc, color=YELLOW, run_time=1.0),
            Indicate(region_ridge, color=TEAL, run_time=1.0),
        )
        self.play(
            FadeIn(pill_ridge, shift=UP * 0.1),
            FadeIn(pill_lasso, shift=UP * 0.1),
            run_time=0.8,
        )
        self.wait(2.5)

        # -------------------------------------------------------------
        # Takeaway card
        # -------------------------------------------------------------
        self.takeaway(
            r'总结：约束形式下，带惩罚的解就是 RSS 椭圆与约束区域的**第一次接触点**。$L_1$ 范数区域是菱形，尖角长在坐标轴上，椭圆从很大一片方向膨胀过来都会先撞在尖角上，因此常常让某些权重恰好为 $0$（稀疏性与特征选择，但不保证）；$L_2$ 范数区域是光滑的圆，没有尖角，解连续收缩，碰在轴上纯属巧合。二者使用相同约束半径 $t=1$。',
            [
                '菱形的尖角在坐标轴上，碰点常常就是尖角',
                '‖w‖₁ ≤ t ⇒ 常得稀疏解（本例 w₂ = 0）',
                '‖w‖₂² ≤ t 是光滑圆周，碰在坐标轴上纯属巧合',
            ],
            hold=3.8,
        )
