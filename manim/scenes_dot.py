r"""Dot product intuition scene (c03): two perspectives unify into geometric projection.

Notation follows c03: dot product u'v (prime = transpose; u·v is mentioned once as the same thing),
length ‖u‖. Letter subscripts on screen use MT(), never a literal underscore."""
import numpy as np

from manim import (
    Arrow,
    BackgroundRectangle,
    Circumscribe,
    Create,
    DashedLine,
    DL,
    Dot,
    DOWN,
    DR,
    FadeIn,
    FadeOut,
    Flash,
    Indicate,
    LEFT,
    Line,
    ORIGIN,
    ReplacementTransform,
    RIGHT,
    RoundedRectangle,
    Square,
    Transform,
    UL,
    UP,
    UR,
    ValueTracker,
    VGroup,
    always_redraw,
    linear,
)
from common import (
    BG,
    BLUE,
    DIM,
    GREEN,
    GREY,
    GRID,
    INK,
    M,
    MT,
    P,
    PURPLE,
    RED,
    StepScene,
    T,
    TEAL,
    WHITE,
    YELLOW,
    pill,
    px,
)

# 2D Plane layout constants
OX, OY = 168.0, 185.0
SCALE = 36.0


def c2p(x, y):
    """Convert 2D math coordinates to screen coordinates via P(px, py)."""
    return P(OX + x * SCALE, OY - y * SCALE)


class DotProduct(StepScene):
    ID = 'dot'
    TITLE = '点积：代数乘积与几何投影的统一'
    FLOW = ['定义两向量', '投影与点积', '360°旋转', '正交：积为0', '连接分类器']

    def construct(self):
        # -------------------------------------------------- Opening Question
        self.question(
            r'两个向量的点积，为什么既能按坐标相乘相加，又能算投影长度？代数与几何为什么必然给出同一个数字？这和线性分类器又有什么关系？',
            ['点积：坐标相乘还是几何投影？', '两个看似无关的算式，为什么给出同一个数字？'],
        )

        # -------------------------------------------------- Static Skeleton: Grid & Axes
        grid = VGroup()
        for x in range(-3, 4):
            grid.add(Line(c2p(x, -2.6), c2p(x, 2.6), color=GRID, stroke_width=1, stroke_opacity=0.35))
        for y in range(-2, 3):
            grid.add(Line(c2p(-3, y), c2p(3.5, y), color=GRID, stroke_width=1, stroke_opacity=0.35))

        x_axis = Arrow(c2p(-3.2, 0), c2p(3.8, 0), stroke_width=2, color=GREY, buff=0, max_tip_length_to_length_ratio=0.06)
        y_axis = Arrow(c2p(0, -2.8), c2p(0, 2.8), stroke_width=2, color=GREY, buff=0, max_tip_length_to_length_ratio=0.06)
        x_lab = T('x₁', 16, GREY).next_to(c2p(3.8, 0), DOWN, buff=0.08)
        y_lab = T('x₂', 16, GREY).next_to(c2p(0, 2.8), LEFT, buff=0.08)

        ticks = VGroup(
            T('1', 15, '#9aa3b2').next_to(c2p(1, 0), DOWN, buff=0.06),
            T('2', 15, '#9aa3b2').next_to(c2p(2, 0), DOWN, buff=0.06),
            T('3', 15, '#9aa3b2').next_to(c2p(3, 0), DOWN, buff=0.06),
            T('1', 15, '#9aa3b2').next_to(c2p(0, 1), LEFT, buff=0.06),
            T('2', 15, '#9aa3b2').next_to(c2p(0, 2), LEFT, buff=0.06),
        )
        origin_dot = Dot(c2p(0, 0), radius=0.05, color=GREY)
        origin_lab = T('O', 15, '#9aa3b2').next_to(c2p(0, 0), DL, buff=0.08)

        # Fixed vector u = (3, 1), length = sqrt(10) ≈ 3.16
        u_vec = Arrow(c2p(0, 0), c2p(3, 1), buff=0, color=BLUE, stroke_width=4.5, max_tip_length_to_length_ratio=0.16)
        u_lab = T('u = (3, 1)', 17, BLUE).next_to(c2p(3, 1), UR, buff=0.08)
        u_len = T('‖u‖ ≈ 3.16', 15, BLUE).next_to(u_lab, DOWN, buff=0.06).align_to(u_lab, LEFT)

        # Long dashed line along u
        u_line_start = c2p(-2.6 * 3 / np.sqrt(10), -2.6 * 1 / np.sqrt(10))
        u_line_end = c2p(3.6 * 3 / np.sqrt(10), 3.6 * 1 / np.sqrt(10))
        u_guide = DashedLine(u_line_start, u_line_end, color='#384d63', stroke_width=1.6, dash_length=0.1)

        skeleton_geo = VGroup(grid, x_axis, y_axis, x_lab, y_lab, ticks, origin_dot, origin_lab, u_guide, u_vec, u_lab, u_len)

        # -------------------------------------------------- Step 1: Define both vectors
        self.step(
            r"给定固定向量 $\mathbf u = (3, 1)$，其长度 $\|\mathbf u\| = \sqrt{3^2 + 1^2} = \sqrt{10} \approx 3.16$；旋转向量 $\mathbf v$ 的长度固定为 $2.5$。点积课件写作 $\mathbf u'\mathbf v$（一撇是转置，也常写成 $\mathbf u\cdot\mathbf v$，同一个数），有两个等价视角：代数视角是各分量乘积之和 $\mathbf u'\mathbf v=u_1 v_1 + u_2 v_2 = 3v_1 + 1v_2$；几何视角是模长乘积乘以夹角余弦 $\mathbf u'\mathbf v=\|\mathbf u\|\|\mathbf v\|\cos\theta$。注意 $\|\mathbf v\|\cos\theta$ 正是 $\mathbf v$ 在 $\mathbf u$ 方向上的**标量投影（影子）**。",
            '两视角：代数乘积 u₁v₁ + u₂v₂ 还是几何投影？',
            stage=0,
        )
        self.play(FadeIn(skeleton_geo), run_time=1.0)

        # ValueTracker for v's rotation angle (starts at 45° = pi/4)
        tk_angle = ValueTracker(np.pi / 4)

        # Dynamic vector v and label
        def get_v_tip():
            a = tk_angle.get_value()
            return np.array([2.5 * np.cos(a), 2.5 * np.sin(a)])

        v_arrow = always_redraw(
            lambda: Arrow(c2p(0, 0), c2p(*get_v_tip()), buff=0, color=YELLOW, stroke_width=4, max_tip_length_to_length_ratio=0.18)
        )
        v_lab = always_redraw(
            lambda: T('v', 18, YELLOW).move_to(
                c2p(*get_v_tip()) + np.array([np.cos(tk_angle.get_value()), np.sin(tk_angle.get_value()), 0]) * 0.26
            )
        )

        self.play(Create(v_arrow), FadeIn(v_lab), run_time=0.8)

        # Right side: Formula card with role annotations
        eq_box_title = pill('点积的两套定义', fill='#20242e', color=YELLOW, size=18)
        eq_box_title.move_to(P(480, 56))

        # Algebra formula
        eq_alg = M([r"\mathbf u'\mathbf v", '=', r'u_1 v_1 + u_2 v_2'], 28)
        eq_alg[0].set_color(YELLOW)
        eq_alg[2].set_color(WHITE)
        eq_alg.move_to(P(480, 91))
        role_alg = T('代数：各分量乘积相加（也写作 u·v）', 15, GREY).next_to(eq_alg, DOWN, buff=0.12)

        # Geometric formula with role annotations
        eq_geom = M([r"\mathbf u'\mathbf v", '=', r'\|\mathbf u\|', r'\|\mathbf v\|\cos\theta'], 28)
        eq_geom[0].set_color(YELLOW)
        eq_geom[2].set_color(BLUE)
        eq_geom[3].set_color(GREEN)
        eq_geom.move_to(P(480, 135))

        # two separate rows (a narrow ‖u‖ term made the two notes run together on one row)
        role_u = T('‖u‖：u 的长度', 15, BLUE).next_to(eq_geom, DOWN, buff=0.1).set_x(eq_geom[2].get_x())
        role_shadow = T('‖v‖cosθ：v 在 u 方向上的影子', 15, GREEN).next_to(role_u, DOWN, buff=0.06)
        role_shadow.set_x(eq_geom[3].get_x())

        formula_group = VGroup(eq_box_title, eq_alg, role_alg, eq_geom, role_u, role_shadow)
        formula_bg = BackgroundRectangle(formula_group, color=BG, fill_opacity=0.9, buff=0.14)

        self.play(FadeIn(formula_bg), FadeIn(formula_group), run_time=1.0)
        self.wait(1.2)

        # -------------------------------------------------- Step 2: Concrete position 45°, shadow, readouts
        self.step(
            r"将 $\mathbf v$ 置于 $45^\circ$ 位置，此时 $\mathbf v = 2.5(\cos 45^\circ, \sin 45^\circ) \approx (1.77, 1.77)$。代数算：$3 \times 1.77 + 1 \times 1.77 = 7.07$。几何算：从 $\mathbf v$ 向 $\mathbf u$ 的延伸线作垂直投影，影子长度为 $\|\mathbf v\|\cos\theta \approx 2.24$；点积即 $\|\mathbf u\| \times (\text{影子}) = 3.16 \times 2.24 \approx 7.07$。两套完全不同的算式，结果毫厘不差！",
            'v 投影到 u 上得到影子：3.16 × 2.24 ≈ 7.07',
            stage=1,
        )

        # Helper calculations for shadow
        def get_drop_and_proj():
            v = get_v_tip()
            # u = (3, 1), projection param t on u's line:
            t = (3.0 * v[0] + 1.0 * v[1]) / 10.0
            proj = np.array([3.0 * t, 1.0 * t])
            # scalar shadow with sign
            s = (3.0 * v[0] + 1.0 * v[1]) / np.sqrt(10.0)
            return v, proj, s

        # Dynamic perpendicular drop
        drop_line = always_redraw(
            lambda: DashedLine(c2p(*get_drop_and_proj()[0]), c2p(*get_drop_and_proj()[1]), color=GREY, stroke_width=2, dash_length=0.07)
        )

        # Dynamic thick shadow segment
        def build_shadow():
            _, proj, s = get_drop_and_proj()
            if abs(s) < 0.03:
                return Dot(c2p(0, 0), radius=0.06, color=YELLOW)
            col = GREEN if s > 0 else RED
            return Line(c2p(0, 0), c2p(*proj), color=col, stroke_width=6)

        shadow_seg = always_redraw(build_shadow)

        # Live Readouts Card setup
        card_bg = RoundedRectangle(
            corner_radius=0.12, width=px(280), height=px(125),
            fill_color='#181c24', fill_opacity=0.92, stroke_color='#333c4d', stroke_width=1.5
        ).move_to(P(480, 250))

        def make_readout_alg():
            v, _, _ = get_drop_and_proj()
            v1, v2 = v[0], v[1]
            dot_val = 3.0 * v1 + 1.0 * v2
            if abs(dot_val) < 0.005:
                dot_val = 0.0
            col = GREEN if dot_val > 0.05 else RED if dot_val < -0.05 else YELLOW
            g = VGroup(
                T('代数：', 16, GREY),
                T(f'3×({v1:.2f}) + 1×({v2:.2f})', 16, WHITE),
                T(f'= {dot_val:.2f}', 18, col),
            ).arrange(RIGHT, buff=0.1)
            g.move_to(P(350, 226), aligned_edge=LEFT)
            return g

        def make_readout_geom():
            _, _, s = get_drop_and_proj()
            dot_val = np.sqrt(10.0) * s
            if abs(dot_val) < 0.005:
                dot_val = 0.0
                s = 0.0
            col = GREEN if dot_val > 0.05 else RED if dot_val < -0.05 else YELLOW
            g = VGroup(
                T('几何：', 16, GREY),
                T(f'3.16 × ({s:.2f})', 16, WHITE),
                T(f'= {dot_val:.2f}', 18, col),
            ).arrange(RIGHT, buff=0.1)
            g.move_to(P(350, 260), aligned_edge=LEFT)
            return g

        def make_badge():
            _, _, s = get_drop_and_proj()
            dot_val = np.sqrt(10.0) * s
            if dot_val > 0.15:
                b = pill('锐角 · 影子同向 ( > 0 )', fill='#18382b', color=GREEN, size=15)
            elif dot_val < -0.15:
                b = pill('钝角 · 影子反向 ( < 0 )', fill='#3d1c1c', color=RED, size=15)
            else:
                b = pill('直角 · 影子为零 ( = 0 )', fill='#3d371a', color=YELLOW, size=15)
            b.move_to(P(480, 296))
            return b

        def make_shadow_lab():
            _, proj, s = get_drop_and_proj()
            if abs(s) < 0.4:
                return VGroup()
            mid = c2p(proj[0] / 2.0, proj[1] / 2.0)
            perp = np.array([-1.0 / np.sqrt(10.0), 3.0 / np.sqrt(10.0), 0]) * 0.24
            col = GREEN if s > 0 else RED
            txt = T(f'影子 {s:.2f}', 13, col)
            bg = BackgroundRectangle(txt, color=BG, fill_opacity=0.85, buff=0.05)
            return VGroup(bg, txt).move_to(mid - perp)

        readout_title = T('实时双读数对比（分秒恒等）', 15, GREY).move_to(P(350, 198), aligned_edge=LEFT)
        live_alg = always_redraw(make_readout_alg)
        live_geom = always_redraw(make_readout_geom)
        live_badge = always_redraw(make_badge)
        live_shadow_lab = always_redraw(make_shadow_lab)

        self.play(Create(drop_line), Create(shadow_seg), FadeIn(live_shadow_lab), run_time=0.8)
        self.play(FadeIn(card_bg), FadeIn(readout_title), FadeIn(live_alg), FadeIn(live_geom), FadeIn(live_badge), run_time=0.8)
        self.play(Indicate(live_alg), Indicate(live_geom), run_time=1.0)
        self.wait(1.5)

        # -------------------------------------------------- Step 3: Rotate 360°
        self.step(
            r"让 $\mathbf v$ 绕原点匀速旋转 $360^\circ$：夹角为锐角时，影子与 $\mathbf u$ 同向（绿色），点积为正；夹角为钝角时，影子反向落在负半轴（红色），点积为负。观察右侧的双读数：无论 $\mathbf v$ 转到哪个角度，代数分量计算与几何投影乘积都分秒不差、实时恒等。",
            '360°旋转：锐角影子同向为正，钝角反向为负',
            stage=2,
        )
        self.play(tk_angle.animate.set_value(np.pi / 4 + 2 * np.pi), run_time=6.5, rate_func=linear)
        self.wait(1.2)

        # -------------------------------------------------- Step 4: Orthogonal: dot = 0
        self.step(
            r"当旋转到垂直位置时，$\mathbf v \approx (-0.79, 2.37)$，代数计算 $3 \times (-0.79) + 1 \times 2.37 = 0.00$。几何上看，垂线正好落在原点，影子长度为 $0.00$，因此 $3.16 \times 0.00 = 0.00$。两个非零向量点积为 $0$，充要条件是它们互相垂直，在线代中称为**正交（orthogonal）**。",
            '垂直时影子为 0：u′v = 0 ⇔ 正交（orthogonal）',
            stage=3,
        )
        # Move to exact perpendicular angle: arctan(1/3) + pi/2 + 2*pi
        perp_angle = np.arctan(1.0 / 3.0) + np.pi / 2 + 2 * np.pi
        self.play(tk_angle.animate.set_value(perp_angle), run_time=1.4)

        # Right angle marker at origin
        sz = 0.28
        u_hat = np.array([3.0, 1.0]) / np.sqrt(10.0)
        v_hat = np.array([-1.0, 3.0]) / np.sqrt(10.0)
        c1 = c2p(*(sz * u_hat))
        c2 = c2p(*(sz * (u_hat + v_hat)))
        c3 = c2p(*(sz * v_hat))
        right_angle_sq = VGroup(
            Line(c1, c2, color=YELLOW, stroke_width=2),
            Line(c2, c3, color=YELLOW, stroke_width=2),
        )

        ortho_pill = pill('u′v = 0 ⇔ 正交 (orthogonal)', fill=YELLOW, color=INK, size=18)
        ortho_pill.move_to(P(480, 56))

        self.play(FadeIn(right_angle_sq), ReplacementTransform(eq_box_title, ortho_pill), run_time=0.6)
        self.play(Circumscribe(ortho_pill, color=YELLOW), run_time=1.0)
        self.wait(1.5)

        # -------------------------------------------------- Step 5: Link to Classifiers
        self.step(
            r"这正是线性分类器的几何本质：将 $\mathbf u$ 视为分类器的权重向量 $\mathbf w$。平面上所有点 $\mathbf x$，其 $\mathbf w'\mathbf x$ 就是 $\mathbf x$ 在 $\mathbf w$ 方向上的投影长乘模长。因此，所有满足 $\mathbf w'\mathbf x = c$ 的点都拥有完全相同的投影，排成一条垂直于 $\mathbf w$ 的直线（等值线）。决策边界 $\mathbf w'\mathbf x + b = 0$ 正是其中一条，$\mathbf w$ 是它的法向量；线性分类器本质上就是在测量 $\mathbf x$ 沿着 $\mathbf w$ 方向走了多远。",
            '分类器 w′x + b = 0：本质是看 x 在 w 方向走多远',
            stage=4,
        )

        # Clean up dynamic v and right panel elements
        self.play(
            FadeOut(v_arrow),
            FadeOut(v_lab),
            FadeOut(drop_line),
            FadeOut(shadow_seg),
            FadeOut(live_shadow_lab),
            FadeOut(right_angle_sq),
            FadeOut(ortho_pill),
            FadeOut(formula_bg),
            FadeOut(eq_alg),
            FadeOut(role_alg),
            FadeOut(eq_geom),
            FadeOut(role_u),
            FadeOut(role_shadow),
            FadeOut(card_bg),
            FadeOut(readout_title),
            FadeOut(live_alg),
            FadeOut(live_geom),
            FadeOut(live_badge),
            run_time=0.6,
        )

        # Re-label u as weight vector w
        w_lab = T('w = (3, 1)', 17, BLUE).next_to(c2p(3, 1), UR, buff=0.08)
        w_role = T('法向量 (normal)', 14, BLUE).next_to(w_lab, DOWN, buff=0.06).align_to(w_lab, LEFT)
        self.play(FadeOut(u_lab), FadeOut(u_len), FadeIn(w_lab), FadeIn(w_role), run_time=0.5)

        # Draw 3 parallel classifier level lines perpendicular to w
        # Level line 1: w·x = 6 (c = 6)
        line_c6 = Line(c2p(1.13, 2.6), c2p(2.87, -2.6), color=TEAL, stroke_width=2.5)
        lab_c6 = T('w′x = 6', 16, TEAL).next_to(c2p(1.13, 2.6), UR, buff=0.06)

        # Decision boundary: w·x - 3 = 0 (c = 3)
        line_bd = Line(c2p(0.13, 2.6), c2p(1.87, -2.6), color=YELLOW, stroke_width=3.5)
        # the boundary pill hangs under the bottom end of its line, so it never covers the w′x = 6 label at the top
        badge_bd = pill('边界：w′x - 3 = 0', fill=YELLOW, color=INK, size=16).next_to(c2p(1.87, -2.6), DOWN, buff=0.08)

        # Level line 2: w·x = 0 (c = 0)
        line_c0 = Line(c2p(-0.87, 2.6), c2p(0.87, -2.6), color=PURPLE, stroke_width=2.5)
        lab_c0 = T('w′x = 0', 16, PURPLE).next_to(c2p(-0.87, 2.6), UL, buff=0.06)

        self.play(Create(line_bd), FadeIn(badge_bd), run_time=0.7)
        self.play(Create(line_c6), FadeIn(lab_c6), Create(line_c0), FadeIn(lab_c0), run_time=0.7)

        # Pick two sample points on w·x = 6: x_A = (1.5, 1.5) and x_B = (2.0, 0.0)
        dot_a = Dot(c2p(1.5, 1.5), radius=0.08, color=TEAL)
        lab_a = MT('x<sub>A</sub>', 17, TEAL).next_to(c2p(1.5, 1.5), RIGHT, buff=0.1)
        dot_b = Dot(c2p(2.0, 0.0), radius=0.08, color=TEAL)
        lab_b = MT('x<sub>B</sub>', 17, TEAL).move_to(c2p(1.55, -0.32))   # below-left: clear of ticks and lines

        # Projection drop to w: both land on (1.8, 0.6)
        proj_land = c2p(1.8, 0.6)
        drop_a = DashedLine(c2p(1.5, 1.5), proj_land, color=GREY, stroke_width=1.5, dash_length=0.06)
        drop_b = DashedLine(c2p(2.0, 0.0), proj_land, color=GREY, stroke_width=1.5, dash_length=0.06)
        dot_land = Dot(proj_land, radius=0.07, color=GREEN)
        lab_land = T('投影点完全相同！', 15, GREEN).next_to(proj_land, DR, buff=0.08).shift(RIGHT * 0.14)

        self.play(FadeIn(dot_a), FadeIn(lab_a), FadeIn(dot_b), FadeIn(lab_b), run_time=0.5)
        self.play(Create(drop_a), Create(drop_b), FadeIn(dot_land), FadeIn(lab_land), run_time=0.8)

        # Right side: Classifier core intuition card
        clf_header = pill('线性分类器的几何本质', fill='#20242e', color=YELLOW, size=18)
        clf_header.move_to(P(468, 60))

        clf_eq = M(r"\hat y = \operatorname{sgn}(\mathbf w'\mathbf x + b)", 28, WHITE)
        clf_eq.move_to(P(468, 105))

        clf_body = VGroup(
            T('• 同一条线上的点，w′x 都相同 (= c)', 16, TEAL),
            T('• 线性分类器就是在问：', 17, WHITE),
            T('  “x 沿法向量 w 走了多远？”', 18, YELLOW),
            T('• 跨过分界线判为正类，未跨过为负类', 16, WHITE),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        clf_body.move_to(P(372, 205), aligned_edge=LEFT)

        clf_group = VGroup(clf_header, clf_eq, clf_body)
        clf_bg = BackgroundRectangle(clf_group, color=BG, fill_opacity=0.92, buff=0.14)

        self.play(FadeIn(clf_bg), FadeIn(clf_group), run_time=0.9)
        self.play(Indicate(clf_body[2]), run_time=1.2)
        self.wait(1.8)

        # -------------------------------------------------- Closing Takeaway
        self.takeaway(
            r"**一句话总结**：点积 $\mathbf u'\mathbf v$ 本质上是“目标向量长度 × 影子长度”，几何投影与代数坐标计算实时完全等价。点积为 $0$ 是向量正交（垂直）的充要条件。在机器学习中，线性分类器 $\mathbf w'\mathbf x + b = 0$ 的本质就是测量样本点 $\mathbf x$ 沿法向量 $\mathbf w$ 走了多远，越过分界线即判定为正类。",
            [
                '点积是投影长乘模长：代数与几何完全统一',
                '正交充要条件：u′v = 0 ⇔ 两向量垂直',
                '线性分类器：w′x + b 是看 x 在法向 w 走了多远',
            ],
        )
