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

# Axis names and tick numbers: light grey so they stay readable at 1280x720
AXIS_C = '#9aa3b2'

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


def build_axes(x0, y0, t1_dir=DOWN):
    r"""Build coordinate axes w1 \in [-1.3, 4.15], w2 \in [-1.3, 2.2] for one panel.

    The w1 axis runs past the largest ellipse (lasso reaches w1 = 3.90) so its name sits to the right of
    every contour. Tick '1' on w2 sits above-right of its tick (the circle / diamond pass through (0, 1));
    tick '1' on w1 goes below (lasso: between diamond edge and ellipse) or below-right (ridge: the circle is
    vertical there). Returns (axes, w1 tick label) so the lasso panel can hand that tick over to its contact label."""
    x_end = x0 + 4.15 * S_PX
    x_axis = Line(P(x0 - 1.3 * S_PX, y0), P(x_end, y0), color=DIM, stroke_width=1.8)
    y_axis = Line(P(x0, y0 + 1.3 * S_PX), P(x0, y0 - 2.2 * S_PX), color=DIM, stroke_width=1.8)
    lab_w1 = M(r'w_1', 20, AXIS_C).next_to(P(x_end, y0), RIGHT, buff=0.1)
    lab_w2 = M(r'w_2', 20, AXIS_C).next_to(P(x0, y0 - 2.2 * S_PX), UR, buff=0.06)

    # Unit tick marks
    tick_w1 = Line(P(x0 + S_PX, y0 - 3), P(x0 + S_PX, y0 + 3), color=DIM, stroke_width=1.5)
    lab_t1 = M('1', 20, AXIS_C).next_to(tick_w1, t1_dir, buff=0.08)
    tick_w2 = Line(P(x0 - 3, y0 - S_PX), P(x0 + 3, y0 - S_PX), color=DIM, stroke_width=1.5)
    lab_t2 = M('1', 20, AXIS_C).next_to(tick_w2, UR, buff=0.1)
    lab_zero = M('0', 18, AXIS_C).next_to(P(x0, y0), DL, buff=0.08)

    axes = VGroup(x_axis, y_axis, lab_w1, lab_w2, tick_w1, lab_t1, tick_w2, lab_t2, lab_zero)
    return axes, lab_t1


class RidgeLasso(StepScene):
    ID = 'ridge-lasso'
    TITLE = 'Ridge vs Lasso：为什么 Lasso 能产生稀疏解'
    FLOW = ['无约束与等高线', '约束：圆 vs 菱形', '等高线同步膨胀', '触点：圆周 vs 尖角', '尖角造就稀疏解']

    def construct(self):
        # 0. Opening question card
        self.question(
            r'Ridge（岭回归）和 lasso 都在最小二乘的损失后面加一个惩罚项，这叫 regularisation（正则化），用来防止 overfitting（过拟合）：ridge 罚权重的平方和 $\|\bw\|_2^2=w_1^2+w_2^2$，lasso 罚权重的绝对值之和 $\|\bw\|_1=|w_1|+|w_2|$。两者都把权重往 $0$ 压，但 ridge 通常只把权重压小，lasso 却能把一些权重压成恰好 $0$，等于自动扔掉这些特征，叫 feature selection（特征选择）。只换了一种惩罚，为什么差这么多？**把两种惩罚画在权重平面上，答案就在形状里：一个是光滑的圆，一个是带尖角的菱形。**',
            [
                '同是控制过拟合的正则化，',
                '为什么只有 lasso 能把权重压成恰好 0？',
            ],
            hold=2.8,
        )

        # Dividing line between panels (x = 320 px)
        div_line = Line(P(320, 48), P(320, 338), color=DIM, stroke_width=1.5)

        # Coordinate axes (ridge tick '1' on w1 goes below-right, clear of the circle)
        axes_L, _ = build_axes(X0_L, Y0_L, t1_dir=DR)
        axes_R, tick1_R = build_axes(X0_R, Y0_R)

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
        ).arrange(RIGHT, buff=0.06).next_to(P(222, 168), RIGHT, buff=0)   # outside the outer demo contour

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
            r'左右两块面板画的是同一个问题：横轴 $w_1$、纵轴 $w_2$，平面上每个点代表一组权重 $(w_1,w_2)$。白点 $\hat\bw=(2.2,\ 0.55)$ 是不加惩罚时的解，即 ordinary least squares（最小二乘，OLS）解：它让 residual sum of squares（残差平方和，RSS）$\text{RSS}(\bw)=\|\by-\mathbf X\bw\|_2^2$ 最小。两边浅蓝色的椭圆是 RSS 的等高线，以白点为中心。**同一个椭圆上的权重 RSS 相同，椭圆越大（离白点越远），RSS 越大。**两个标题里的不等式是下一步要加的约束。',
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
            r'浅色椭圆淡出，两边各画出一块允许区域。加惩罚 $\text{RSS}+\lambda\cdot\text{惩罚}$（$\lambda$ 是正则化强度，c16）可以等价地改写成约束形式：只在区域“惩罚 $\le t$”里面找 RSS 最小的点；适当选 $t$，两种写法得到同一个解。为什么等价：设惩罚形式的解是 $\bw_\lambda$，让 $t$ 等于它的惩罚值；区域里别的 $\bw$ 惩罚都不超过 $t$，如果它的 RSS 还比 $\bw_\lambda$ 小，那它的 $\text{RSS}+\lambda\cdot\text{惩罚}$ 也会更小，和 $\bw_\lambda$ 最小矛盾，所以 $\bw_\lambda$ 也是约束形式的解。$\lambda$ 越大，对应的 $t$ 越小（或不变），区域越紧。两边都取 $t=1$。左边 ridge 的 $L_2$ 约束 $\|\bw\|_2^2=w_1^2+w_2^2\le1$ 是半径为 $1$ 的圆（青色）。右边 lasso 的 $L_1$ 约束 $\|\bw\|_1=|w_1|+|w_2|\le1$ 是菱形（橙色）：在第一象限它的边界就是直线 $w_1+w_2=1$，从 $(1,0)$ 连到 $(0,1)$，四个象限拼起来正好四条边。**圆处处光滑、没有尖角；菱形的四个尖角 $(\pm1,0)$、$(0,\pm1)$ 正好落在坐标轴上。**',
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
            r'两边的蓝色椭圆从白点开始同步长大，由同一个数 $c$ 控制：$c$ 是这一圈等高线的值，$c$ 越大，椭圆越大，RSS 越大。**带约束的解，就是椭圆第一次碰到约束区域的那个点。**原因是：碰到之前，椭圆里面的权重 RSS 更小，但都不在区域里；碰到的那一刻，这个点就是区域里 RSS 最小的点。$c$ 长到约 $1.84$ 时，左边椭圆先碰到圆，切点（黄点）约为 $(0.883,\ 0.470)$，屏幕上写作 $(0.88,\ 0.47)$；验算它在圆上：$0.883^2+0.470^2\approx0.780+0.221\approx1.00$。和 $\hat\bw=(2.2,\ 0.55)$ 相比，两个权重都被压小了，但都不是 $0$。这时右边的椭圆还没碰到菱形：菱形整个装在圆里面，椭圆要再长大一些才够得着。',
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
        # label block sits left of the w2 axis (right edge x = 90 px) and above the w2 tick label
        sub_rc = T('w₁、w₂ 都不为 0', 16, WHITE)
        lab_rc = M(r'(0.88,\, 0.47)', 22, YELLOW).next_to(sub_rc, UP, buff=0.06)
        VGroup(lab_rc, sub_rc).move_to(P(47, 148))
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
            r'左边停在切点不动；右边椭圆继续长大，到 $c\approx2.518$ 时第一次碰到菱形，碰到的正好是坐标轴上的尖角 $(1,\ 0)$（黄点）。验算它在菱形的边界上：$|1|+|0|=1$。**这个解里 $w_2$ 恰好等于 $0$，第二个特征被整个扔掉了。**一部分权重恰好为 $0$ 的解叫 sparse（稀疏）解，这种性质叫 sparsity（稀疏性）。',
            'lasso 椭圆继续膨胀，在尖角 (1, 0) 首次接触：w₂ = 0',
            stage=3,
        )

        # Ridge stays locked at circle contact; Lasso continues to C_LASSO
        self.play(tk.animate.set_value(C_LASSO), run_time=1.8, rate_func=lambda t: t)

        # Lasso contact point at corner (1, 0)
        pos_lc = P(X0_R + 1.0 * S_PX, Y0_R)
        dot_lc = Dot(pos_lc, radius=0.09, color=YELLOW)
        lab_lc = VGroup(
            M(r'(1,\, 0)', 20, YELLOW),
            T(' ⇒ ', 17, YELLOW),
            M(r'w_2 = 0', 20, YELLOW)
        ).arrange(RIGHT, buff=0.06)
        sub_lc = T('恰好在轴上（稀疏）', 17, GREEN).next_to(lab_lc, DOWN, buff=0.06)
        # The label hangs below the wedge between the diamond edge and the ellipse arc (both leave the corner
        # downwards), so its box covers neither; a short vertical leader ties it to the corner. The lone tick
        # '1' under the corner fades out: the label now names that point as (1, 0).
        block_lc = VGroup(lab_lc, sub_lc)
        block_lc.next_to(P(480, 268), DOWN, buff=0.06)
        bg_lc = BackgroundRectangle(block_lc, color=BG, fill_opacity=0.9, buff=0.06)
        lead_lc = Line(pos_lc + DOWN * 0.1, P(X0_R + S_PX, 268), color=YELLOW, stroke_width=1.5)

        self.play(
            FadeOut(tick1_R),
            FadeIn(bg_lc),
            FadeIn(dot_lc),
            FadeIn(lab_lc),
            FadeIn(sub_lc),
            Create(lead_lc),
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
            r'菱形的四个尖角被标成橙点，下方是两边的小结。为什么 lasso 常常碰在尖角上？尖角向外凸出，椭圆从很多不同的位置长过来，最先碰到的往往就是凸出的尖角；尖角都在坐标轴上，碰到尖角就有一个权重为 $0$。但这不是保证：$\hat\bw$ 在某些位置时，椭圆也会先碰到菱形的一条边，这时两个权重都不为 $0$。圆周处处光滑，没有哪个点特别凸出，切点随 $\hat\bw$ 的位置连续移动，恰好落在坐标轴上只是巧合，所以 ridge 通常只是把权重连续压小。**菱形的尖角向外凸、又正好在坐标轴上，这就是 lasso 常得到稀疏解的原因。**',
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
        pill_ridge = pill('Ridge：连续收缩，碰在轴上纯属巧合', fill=DIM, color=WHITE, size=15).move_to(P(160, 326))
        pill_lasso = pill('Lasso：尖角外凸，更容易压成恰好 0', fill=DIM, color=YELLOW, size=15).move_to(P(480, 326))

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
            r'一句话：带惩罚的解，就是 RSS 椭圆从 $\hat\bw$ 往外长、第一次碰到约束区域的那个点。Lasso 的区域 $\|\bw\|_1\le t$ 是菱形，尖角在坐标轴上，椭圆常常先撞上尖角，于是某些权重恰好为 $0$（本例 $w_2=0$），得到稀疏解、自动做特征选择，但不保证每次都这样；ridge 的区域 $\|\bw\|_2^2\le t$ 是光滑的圆，权重只是连续变小，落在坐标轴上只是巧合。本例两边都取 $t=1$。**$L_1$ 的菱形有尖角在坐标轴上，所以 lasso 常得到恰好为 $0$ 的权重；$L_2$ 的圆没有尖角，ridge 只把权重压小。**复习时要能画出这张“圆 vs 菱形”的图，并用它解释为什么 $L_1$ 惩罚会产生稀疏解。',
            [
                '菱形的尖角在坐标轴上，碰点常常就是尖角',
                '‖w‖₁ ≤ t ⇒ 常得稀疏解（本例 w₂ = 0）',
                '‖w‖₂² ≤ t 是光滑圆周，碰在坐标轴上纯属巧合',
            ],
            hold=3.8,
        )
