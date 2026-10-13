r"""c19 · Bias–variance trade-off (COMP90051 exam review).

Side-by-side comparison of underfitting vs overfitting across three training sets ("Mon / Tue / Wed"):
- Left panel: degree-1 line -> high bias, low variance
- Right panel: degree-7 polynomial -> low bias, high variance
- Data: f(x) = sin(2.5x) plus N(0, SD^2) noise at 10 points on [-0.95, 0.95]. The three days come from
  np.random.default_rng(DAY_SEED); the seed was found by a search so that the three days look like the long-run
  behaviour (line predictions at x0 clustered and about 0.3 too low; polynomial predictions spread about 0.5 around
  the truth, their mean close to it). Assertions below guard the claims the captions make.
- Every number on screen and in the captions is computed here: from the three fits, and from an N_SIM-dataset
  simulation (bias / sd at x0 for both models, expected test error for degrees 1, 3, 7, 9).
- Test point x0 = 0.6, f(0.6) = sin(1.5) ~ 0.997; predictions at x0 are moved onto a zoomed number line
- Final bias-variance decomposition and U-shaped error curve
"""
import warnings

import numpy as np
from manim import (
    Axes,
    Create,
    DashedLine,
    Dot,
    DOWN,
    FadeIn,
    FadeOut,
    Indicate,
    LEFT,
    Line,
    Rectangle,
    RIGHT,
    RoundedRectangle,
    TransformFromCopy,
    UL,
    UP,
    UR,
    VGroup,
    VMobject,
)
from common import (
    BG,
    BLUE,
    DIM,
    GREEN,
    GREY,
    M,
    P,
    PURPLE,
    RED,
    StepScene,
    T,
    WHITE,
    YELLOW,
    px,
)

SD = 0.25          # noise standard deviation of every observation
DAY_SEED = 7532    # Mon / Tue / Wed training sets (representative of the simulation, see docstring)
SIM_SEED = 0       # long-run simulation
N_SIM = 4000       # simulated training sets ("days")
N_CLOUD = 300      # of which this many are drawn as grey dots on the number lines
X0 = 0.6           # test point


def sgn(v):
    """Signed 2-dp number with a real minus sign; +-0.00 shows as 0.00."""
    s = f'{v:+.2f}'
    return '0.00' if s in ('+0.00', '-0.00') else s.replace('-', '−')


def make_clipped_curve(ax, poly, color, stroke_width=2.4):
    r"""Draw polynomial curve only where it lies inside y-range [-2, 2].

    Densely samples 400 points, linearly interpolates edge crossings,
    and splits into valid segments inside the panel bounds.
    """
    xs = np.linspace(-1.0, 1.0, 400)
    ys = np.polyval(poly, xs)
    segments = []
    current_run = []
    for i in range(len(xs)):
        xi, yi = xs[i], ys[i]
        if -2.0 <= yi <= 2.0:
            if len(current_run) == 0 and i > 0:
                y_prev, x_prev = ys[i - 1], xs[i - 1]
                target_y = 2.0 if y_prev > 2.0 else -2.0
                if yi != y_prev:
                    t = (target_y - y_prev) / (yi - y_prev)
                    x_enter = x_prev + t * (xi - x_prev)
                    current_run.append(ax.c2p(x_enter, target_y))
            current_run.append(ax.c2p(xi, yi))
        else:
            if len(current_run) > 0:
                y_prev, x_prev = ys[i - 1], xs[i - 1]
                target_y = 2.0 if yi > 2.0 else -2.0
                if yi != y_prev:
                    t = (target_y - y_prev) / (yi - y_prev)
                    x_exit = x_prev + t * (xi - x_prev)
                    current_run.append(ax.c2p(x_exit, target_y))
                if len(current_run) >= 2:
                    seg = VMobject(color=color, stroke_width=stroke_width)
                    seg.set_points_as_corners(current_run)
                    segments.append(seg)
                current_run = []
    if len(current_run) >= 2:
        seg = VMobject(color=color, stroke_width=stroke_width)
        seg.set_points_as_corners(current_run)
        segments.append(seg)
    return VGroup(*segments)


class BiasVariance(StepScene):
    ID = 'bias-variance'
    TITLE = 'Bias–Variance 权衡：为什么模型不是越复杂越好？'
    FLOW = ['真实与采样', '换数据拟合', '测试点表现', '偏差与方差', '误差分解']

    def construct(self):
        # ----------------------------------------------------
        # Data, fits and the long-run simulation (all numbers shown come from here)
        # ----------------------------------------------------
        x_grid = np.linspace(-0.95, 0.95, 10)
        y_true = np.sin(2.5 * x_grid)

        rng = np.random.default_rng(DAY_SEED)
        days = ['周一', '周二', '周三']
        cols = [BLUE, GREEN, PURPLE]
        ys_days = [y_true + rng.normal(0, SD, 10) for _ in days]

        fits_deg1 = [np.polyfit(x_grid, y, deg=1) for y in ys_days]
        fits_deg7 = [np.polyfit(x_grid, y, deg=7) for y in ys_days]
        resid1 = float(np.sqrt(np.mean((np.polyval(fits_deg1[0], x_grid) - ys_days[0]) ** 2)))
        resid7 = float(np.sqrt(np.mean((np.polyval(fits_deg7[0], x_grid) - ys_days[0]) ** 2)))

        x0 = X0
        y0_true = float(np.sin(2.5 * x0))  # approx 0.997495

        val_deg1 = [float(np.polyval(p, x0)) for p in fits_deg1]
        mean_deg1 = float(np.mean(val_deg1))
        bias_deg1 = mean_deg1 - y0_true
        range_deg1 = max(val_deg1) - min(val_deg1)

        val_deg7 = [float(np.polyval(p, x0)) for p in fits_deg7]
        mean_deg7 = float(np.mean(val_deg7))
        bias_deg7 = mean_deg7 - y0_true
        range_deg7 = max(val_deg7) - min(val_deg7)

        sim_rng = np.random.default_rng(SIM_SEED)
        y_sim = y_true + sim_rng.normal(0, SD, (N_SIM, 10))
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            sim = {d: np.polyval(np.polyfit(x_grid, y_sim.T, d), x0) for d in (1, 3, 7, 9)}
        sim_bias = {d: float(p.mean() - y0_true) for d, p in sim.items()}
        sim_sd = {d: float(p.std()) for d, p in sim.items()}
        sim_err = {d: sim_bias[d] ** 2 + sim_sd[d] ** 2 + SD ** 2 for d in sim}
        best_deg = min(sim_err, key=sim_err.get)

        # the captions below make these claims; fail loudly if a seed change breaks them
        assert all(v < y0_true - 0.15 for v in val_deg1), 'lines must all be clearly below the truth'
        assert range_deg7 > 2.5 * range_deg1 and range_deg7 > 0.4, 'polynomials must spread far more than lines'
        assert min(val_deg7) < y0_true < max(val_deg7) and abs(bias_deg7) < 0.08, 'polys must straddle the truth'
        assert sim_bias[1] < -0.2 and sim_sd[7] > 1.5 * sim_sd[1], 'simulation must back the 3-day picture'
        assert best_deg == 3 and sim_err[9] > sim_err[1], 'U-shape claim in the decomposition step'

        # ----------------------------------------------------
        # 0. Opening Question Card
        # ----------------------------------------------------
        self.question(
            r"复杂的模型能把训练数据拟合得更好，为什么测试时却不一定更好？原因在于训练数据是随机采来的：换一批数据，学到的模型也跟着变。bias–variance trade-off（偏差–方差权衡）把测试误差拆成“平均偏了多少”和“换数据晃多大”两部分，用来回答这个问题。",
            ['为什么模型不是越复杂越好？', '换一份数据，学到的模型到底会怎么变？'],
            hold=2.5,
        )

        # ----------------------------------------------------
        # Panel layout setup
        # ----------------------------------------------------
        # Left Panel (Simple Model - Degree 1)
        box_l = RoundedRectangle(
            corner_radius=0.12, width=px(264), height=px(154),
            stroke_color=DIM, stroke_width=1.2, fill_color='#191a20', fill_opacity=0.6,
        ).move_to(P(170, 135))
        ax_l = Axes(
            x_range=[-1.0, 1.0, 0.5], y_range=[-2.0, 2.0, 1.0],
            x_length=px(240), y_length=px(130),
            axis_config={'include_numbers': False, 'include_tip': False, 'stroke_color': GREY, 'stroke_opacity': 0.35, 'stroke_width': 1.2},
        ).move_to(P(170, 135))
        title_l = T('简单模型（直线）', 18, YELLOW).move_to(P(170, 48))

        # Right Panel (Complex Model - Degree 7)
        box_r = RoundedRectangle(
            corner_radius=0.12, width=px(264), height=px(154),
            stroke_color=DIM, stroke_width=1.2, fill_color='#191a20', fill_opacity=0.6,
        ).move_to(P(470, 135))
        ax_r = Axes(
            x_range=[-1.0, 1.0, 0.5], y_range=[-2.0, 2.0, 1.0],
            x_length=px(240), y_length=px(130),
            axis_config={'include_numbers': False, 'include_tip': False, 'stroke_color': GREY, 'stroke_opacity': 0.35, 'stroke_width': 1.2},
        ).move_to(P(470, 135))
        title_r = T('复杂模型（7 次多项式）', 18, YELLOW).move_to(P(470, 48))

        # True function curves f(x) = sin(2.5x)
        xs_dense = np.linspace(-1.0, 1.0, 300)
        ys_dense = np.sin(2.5 * xs_dense)
        true_curve_l = VMobject(color=WHITE, stroke_width=1.6, stroke_opacity=0.85)
        true_curve_l.set_points_as_corners([ax_l.c2p(x, y) for x, y in zip(xs_dense, ys_dense)])
        true_curve_r = VMobject(color=WHITE, stroke_width=1.6, stroke_opacity=0.85)
        true_curve_r.set_points_as_corners([ax_r.c2p(x, y) for x, y in zip(xs_dense, ys_dense)])

        # the "true f(x)" tag sits just under the trough of the white curve (x = -0.63), where no fit passes
        tag_tl = T('真实 f(x)', 13, '#9096a2').move_to(ax_l.c2p(-0.63, -1.62))
        tag_tr = T('真实 f(x)', 13, '#9096a2').move_to(ax_r.c2p(-0.63, -1.62))

        # Data dots per day
        dots_l = []
        dots_r = []
        for col, y_d in zip(cols, ys_days):
            dl = VGroup(*[Dot(ax_l.c2p(x, y), radius=0.045, color=col) for x, y in zip(x_grid, y_d)])
            dr = VGroup(*[Dot(ax_r.c2p(x, y), radius=0.045, color=col) for x, y in zip(x_grid, y_d)])
            dots_l.append(dl)
            dots_r.append(dr)

        # Fits curves per day
        curves_l = [make_clipped_curve(ax_l, p1, col, stroke_width=2.4) for p1, col in zip(fits_deg1, cols)]
        curves_r = [make_clipped_curve(ax_r, p7, col, stroke_width=2.4) for p7, col in zip(fits_deg7, cols)]

        # ----------------------------------------------------
        # Step 1: Ground truth + Monday data
        # ----------------------------------------------------
        self.step(
            r"两个面板里的细白线是真实函数 $f(x)=\sin(2.5x)$，$x\in[-1,1]$；现实中我们看不到它，只能看到数据。周一采到 10 个蓝点，每个点 = 真值 + 一点随机噪声，噪声的标准差是 "
            + f"$\\sigma = {SD}$。左边准备用简单模型（直线），右边用复杂模型（7 次多项式），两边用的是同一份数据。",
            '真实函数 f(x)=sin(2.5x)，周一采样 10 个含噪数据点',
            stage=0,
        )
        self.play(
            FadeIn(box_l), FadeIn(ax_l), FadeIn(title_l), FadeIn(true_curve_l), FadeIn(tag_tl),
            FadeIn(box_r), FadeIn(ax_r), FadeIn(title_r), FadeIn(true_curve_r), FadeIn(tag_tr),
            run_time=0.8,
        )
        self.play(FadeIn(dots_l[0]), FadeIn(dots_r[0]), run_time=0.7)
        self.wait(1.2)

        # ----------------------------------------------------
        # Step 2: Fit both models to Monday's data
        # ----------------------------------------------------
        self.step(
            "两边都用最小二乘法拟合周一的数据。左边直线只有 2 个参数，弯不过来，明显跟不上白线，这叫 underfitting（欠拟合）；"
            "右边 7 次多项式有 8 个参数，几乎贴着每个蓝点走。"
            f"用残差的均方根（每个点到曲线的竖直距离先平方、再平均、再开根号）衡量贴得多紧：直线 {resid1:.2f}，多项式只有 {resid7:.2f}。",
            '用周一数据拟合：直线欠拟合，多项式几乎贴着每个点',
            stage=1,
        )
        self.play(Create(curves_l[0]), Create(curves_r[0]), run_time=1.0)
        self.wait(1.2)

        # ----------------------------------------------------
        # Step 3: Add Tuesday and Wednesday data
        # ----------------------------------------------------
        self.step(
            "再做一个思想实验：周二（绿）和周三（紫）各采一份新数据，各自重新拟合。左边三条直线几乎叠在一起；"
            "右边三条 7 次多项式明显分开，两端和弯折处尤其明显。"
            "**换一份训练数据，模型跟着晃动的程度，就叫 variance（方差）。**",
            '换周二、周三的数据：三条直线几乎重合，三条多项式明显分开',
            stage=1,
        )
        self.play(
            FadeIn(dots_l[1]), FadeIn(dots_r[1]), Create(curves_l[1]), Create(curves_r[1]),
            run_time=0.9,
        )
        self.play(
            FadeIn(dots_l[2]), FadeIn(dots_r[2]), Create(curves_l[2]), Create(curves_r[2]),
            run_time=0.9,
        )
        self.wait(1.3)

        # ----------------------------------------------------
        # Step 4: Focus on test point x0 = 0.6, zoom its predictions onto number lines
        # ----------------------------------------------------
        self.step(
            r"现在只盯一个测试点 $x_0 = 0.6$（竖直虚线），真值是 $f(0.6)=\sin(2.5\times0.6)=\sin(1.5)\approx0.997$（白色短线）。"
            r"三天的模型在 $x_0$ 处各给一个预测（彩色点）。面板里这些点挤在一小段上看不清，"
            "所以把它们搬到下面放大的数轴上；左右两条数轴刻度相同，可以直接比较。",
            '固定测试点 x₀=0.6，把三天的预测搬到下方数轴上',
            stage=2,
        )
        # Vertical dashed lines
        vline_l = DashedLine(ax_l.c2p(x0, -2.0), ax_l.c2p(x0, 2.0), color=GREY, stroke_width=1.4, dash_length=0.08)
        vline_r = DashedLine(ax_r.c2p(x0, -2.0), ax_r.c2p(x0, 2.0), color=GREY, stroke_width=1.4, dash_length=0.08)
        lbl_x0_l = T('x₀=0.6', 13, GREY).next_to(ax_l.c2p(x0, -1.75), LEFT, buff=0.06)
        lbl_x0_r = T('x₀=0.6', 13, GREY).next_to(ax_r.c2p(x0, -1.75), LEFT, buff=0.06)

        # True value ticks (white)
        tick_true_l = Line(ax_l.c2p(0.53, y0_true), ax_l.c2p(0.67, y0_true), color=WHITE, stroke_width=3.2)
        tick_true_r = Line(ax_r.c2p(0.53, y0_true), ax_r.c2p(0.67, y0_true), color=WHITE, stroke_width=3.2)

        # Crossing dots
        cross_dots_l = VGroup(*[Dot(ax_l.c2p(x0, v), radius=0.06, color=c) for v, c in zip(val_deg1, cols)])
        cross_dots_r = VGroup(*[Dot(ax_r.c2p(x0, v), radius=0.06, color=c) for v, c in zip(val_deg7, cols)])

        # Zoomed number lines under the panels (same scale on both sides)
        spread = [y0_true + sim_bias[d] + k * 2.5 * sim_sd[d] for d in (1, 7) for k in (-1, 1)]
        lo = float(np.floor(min(spread + val_deg1 + val_deg7) * 10) / 10)
        hi = float(np.ceil(max(spread + val_deg1 + val_deg7) * 10) / 10)
        strip_y, half = 238, 100

        def strip_pt(cx, v):
            return P(cx - half + (v - lo) / (hi - lo) * 2 * half, strip_y)

        def make_strip(cx):
            axis = Line(strip_pt(cx, lo), strip_pt(cx, hi), color=GREY, stroke_width=1.6)
            ticks = VGroup(*[Line(strip_pt(cx, v) + UP * px(3), strip_pt(cx, v) + DOWN * px(3),
                                  color=GREY, stroke_width=1.2)
                             for v in np.arange(lo, hi + 1e-9, 0.1)])
            end_lo = T(f'{lo:.1f}', 14, GREY).next_to(axis, LEFT, buff=0.08)
            end_hi = T(f'{hi:.1f}', 14, GREY).next_to(axis, RIGHT, buff=0.08)
            t_tick = Line(strip_pt(cx, y0_true) + UP * px(8), strip_pt(cx, y0_true) + DOWN * px(8),
                          color=WHITE, stroke_width=3)
            t_lbl = T(f'真值 {y0_true:.3f}', 15, WHITE).next_to(t_tick, UP, buff=0.04)
            return VGroup(axis, ticks, end_lo, end_hi, t_tick, t_lbl)

        strip_l = make_strip(170)
        strip_r = make_strip(470)
        # z_index 1: the three days stay on top of the truth / mean ticks drawn later
        sdots_l = VGroup(*[Dot(strip_pt(170, v), radius=0.065, color=c) for v, c in zip(val_deg1, cols)]).set_z_index(1)
        sdots_r = VGroup(*[Dot(strip_pt(470, v), radius=0.065, color=c) for v, c in zip(val_deg7, cols)]).set_z_index(1)

        self.play(
            Create(vline_l), Create(vline_r),
            FadeIn(lbl_x0_l), FadeIn(lbl_x0_r),
            Create(tick_true_l), Create(tick_true_r),
            run_time=0.8,
        )
        self.play(FadeIn(cross_dots_l), FadeIn(cross_dots_r), run_time=0.5)
        self.play(FadeIn(strip_l), FadeIn(strip_r), run_time=0.5)
        self.play(TransformFromCopy(cross_dots_l, sdots_l), TransformFromCopy(cross_dots_r, sdots_r), run_time=1.0)
        self.wait(1.2)

        # ----------------------------------------------------
        # Mean tick, bias band and readout rows for one model
        # ----------------------------------------------------
        def make_mean(cx, m):
            tick = Line(strip_pt(cx, m) + UP * px(8), strip_pt(cx, m) + DOWN * px(8), color=YELLOW, stroke_width=3)
            lbl = T(f'平均 {m:.2f}', 15, YELLOW).next_to(tick, DOWN, buff=0.04)
            a, b = sorted([m, y0_true])
            band = Rectangle(width=max((b - a) / (hi - lo) * px(2 * half), 0.01), height=px(10),
                             fill_color=YELLOW, fill_opacity=0.28, stroke_width=0)
            band.move_to((strip_pt(cx, a) + strip_pt(cx, b)) / 2).set_z_index(-2)
            return VGroup(band, tick, lbl)

        def make_rows(cx, vals, b, r, bias_word, var_word):
            vals_row = VGroup(*[T(f'{d} {v:.2f}', 16, c) for d, v, c in zip(days, vals, cols)])
            vals_row.arrange(RIGHT, buff=0.3).move_to(P(cx, 270))
            bias_row = T(f'平均偏 {sgn(b)} → {bias_word} Bias', 16, YELLOW).move_to(P(cx, 292))
            var_row = T(f'3 天相差最多 {r:.2f} → {var_word} Variance', 16, GREEN).move_to(P(cx, 314))
            return VGroup(vals_row, bias_row, var_row)

        # ----------------------------------------------------
        # Step 5: Simple model -> High Bias, Low Variance
        # ----------------------------------------------------
        mean_l = make_mean(170, mean_deg1)
        rows_l = make_rows(170, val_deg1, bias_deg1, range_deg1, '高', '低')

        self.step(
            rf"先看左边直线：三天在 $x_0$ 处的预测是 {val_deg1[0]:.2f}、{val_deg1[1]:.2f}、{val_deg1[2]:.2f}，"
            rf"最高减最低只差 {range_deg1:.2f}，三天几乎一样，这是低方差。"
            rf"它们的平均值（黄色短线）是 $({val_deg1[0]:.2f}+{val_deg1[1]:.2f}+{val_deg1[2]:.2f})/3\approx{mean_deg1:.3f}$，屏幕上显示为 {mean_deg1:.2f}。"
            rf"平均预测减真值叫 bias（偏差）：${mean_deg1:.3f}-{y0_true:.3f}\approx-{abs(bias_deg1):.2f}$，"
            rf"也就是低了 {abs(bias_deg1):.2f}（黄色色带），三天全都偏低。"
            "**直线弯不过来，换多少份数据都一样偏：这就是高偏差、低方差。**",
            f'直线：三天挤在一起，但平均偏 {sgn(bias_deg1)} ⇒ 低方差、高偏差',
            stage=3,
        )
        self.play(Indicate(box_l, color=YELLOW), run_time=0.6)
        self.play(FadeIn(mean_l), run_time=0.6)
        self.play(FadeIn(rows_l), run_time=0.6)
        self.wait(1.6)

        # ----------------------------------------------------
        # Step 6: Complex model -> Low Bias, High Variance
        # ----------------------------------------------------
        mean_r = make_mean(470, mean_deg7)
        rows_r = make_rows(470, val_deg7, bias_deg7, range_deg7, '低', '高')

        self.step(
            rf"再看右边 7 次多项式：三天的预测是 {val_deg7[0]:.2f}、{val_deg7[1]:.2f}、{val_deg7[2]:.2f}，"
            rf"最高减最低相差 {range_deg7:.2f}（用没有四舍五入的预测相减），"
            rf"是直线的 ${range_deg7:.2f}/{range_deg1:.2f}\approx{range_deg7 / range_deg1:.1f}$ 倍：这是高方差，单看某一天，可能偏出去很远。"
            rf"但它们落在真值两侧，平均 $({val_deg7[0]:.2f}+{val_deg7[1]:.2f}+{val_deg7[2]:.2f})/3\approx{mean_deg7:.3f}$（显示为 {mean_deg7:.2f}），"
            rf"与真值 {y0_true:.3f} 只差 {abs(bias_deg7):.2f}。"
            "**这就是低偏差、高方差：平均起来很准，但每一次都可能晃得很远。**",
            f'多项式：三天散开 {range_deg7:.2f}（高方差），平均只偏 {sgn(bias_deg7)}（低偏差）',
            stage=3,
        )
        self.play(Indicate(box_r, color=GREEN), run_time=0.6)
        self.play(FadeIn(mean_r), run_time=0.6)
        self.play(FadeIn(rows_r), run_time=0.6)
        self.wait(1.6)

        # ----------------------------------------------------
        # Step 7: Long-run simulation backs the 3-day picture
        # ----------------------------------------------------
        jit = np.random.default_rng(1).uniform(-1, 1, N_CLOUD) * px(5)

        def make_cloud(cx, preds):
            ds = [Dot(strip_pt(cx, v) + UP * j, radius=0.022, color='#aab1bd', fill_opacity=0.5)
                  for v, j in zip(preds[:N_CLOUD], jit) if lo <= v <= hi]
            return VGroup(*ds).set_z_index(-1)

        cloud_l = make_cloud(170, sim[1])
        cloud_r = make_cloud(470, sim[7])
        sim_txt = T(
            f'模拟 {N_SIM} 天：直线 偏 {sgn(sim_bias[1])}、晃 ±{sim_sd[1]:.2f}；'
            f'多项式 偏 {sgn(sim_bias[7])}、晃 ±{sim_sd[7]:.2f}',
            15, WHITE,
        ).move_to(P(320, 328))
        sim_box = RoundedRectangle(corner_radius=0.1, width=sim_txt.width + 0.4, height=sim_txt.height + 0.2,
                                   stroke_color=GREY, stroke_width=1.2, fill_color=BG, fill_opacity=0.9).move_to(sim_txt)
        sim_group = VGroup(sim_box, sim_txt)

        self.step(
            rf"只看 3 天，也可能是碰巧。所以把同样的实验重复 {N_SIM} 次：{N_SIM} 份独立的训练数据各拟合一次，数轴上的灰点画出其中 {N_CLOUD} 天在 $x_0$ 处的预测。"
            rf"直线在 $x_0$ 处平均偏 {sgn(sim_bias[1])}，上下晃动的标准差是 ±{sim_sd[1]:.2f}；"
            rf"7 次多项式平均偏 {sgn(sim_bias[7])}，标准差是 ±{sim_sd[7]:.2f}。"
            "**长期规律和这 3 天一致：直线稳定地偏（高偏差、低方差），多项式围着真值大幅晃动（低偏差、高方差）。**",
            f'不是巧合：换 {N_SIM} 份数据，直线总是偏低，多项式总在真值两侧晃',
            stage=3,
        )
        self.play(FadeIn(cloud_l), FadeIn(cloud_r), run_time=0.9)
        self.play(FadeIn(sim_group, shift=UP * 0.1), run_time=0.6)
        self.wait(2.2)

        # ----------------------------------------------------
        # Step 8: Error Decomposition and U-Curve
        # ----------------------------------------------------
        # Pack everything from panels to fade out
        panels_all = VGroup(
            box_l, ax_l, title_l, true_curve_l, tag_tl, *dots_l, *curves_l,
            vline_l, lbl_x0_l, tick_true_l, cross_dots_l, strip_l, sdots_l, mean_l, rows_l, cloud_l,
            box_r, ax_r, title_r, true_curve_r, tag_tr, *dots_r, *curves_r,
            vline_r, lbl_x0_r, tick_true_r, cross_dots_r, strip_r, sdots_r, mean_r, rows_r, cloud_r,
            sim_group,
        )

        self.step(
            r"**期望测试误差拆成三项：$\mathrm{E}[(Y-\hat f)^2] = \text{bias}^2 + \text{variance} + \mathrm{Var}[Y]$。**"
            r"上方公式里，$\text{bias}^2$ 是平均预测偏离真值的平方，$\text{variance}$ 是换数据时预测晃动的方差（标准差的平方），"
            r"$\mathrm{Var}[Y]$ 是数据本身的噪声的方差，本例里就是第一步噪声标准差的平方 $\sigma^2$（公式下方注释写着 σ²），叫 irreducible error（不可约误差），任何模型都消不掉。"
            r"中间是示意图：模型越复杂，黄线 $\text{bias}^2$ 越低、绿线 $\text{variance}$ 越高，加上灰色虚线 $\mathrm{Var}[Y]$，红色的总误差通常呈 U 形。"
            rf"下方是本例在 $x_0$ 处模拟 {N_SIM} 天的结果：1 次 ≈ {sim_err[1]:.2f}，3 次 ≈ {sim_err[3]:.2f}（最低），"
            rf"7 次 ≈ {sim_err[7]:.2f}，9 次 ≈ {sim_err[9]:.2f}：直线输在偏差，9 次输在方差，中间的 3 次最好。"
            rf"每个数都是三项相加（用未取整的偏差和标准差算；拿两位小数手算 1 次会得 $0.16$），以 7 次为例：${abs(sim_bias[7]):.2f}^2+{sim_sd[7]:.2f}^2+{SD}^2\approx{sim_err[7]:.2f}$。",
            '期望测试误差 = bias² + variance + 噪声，总误差通常呈 U 形',
            stage=4,
        )
        self.play(FadeOut(panels_all), run_time=0.6)

        # Formula with role annotations
        term_err = M(r'\mathrm{E}[(Y-\hat f)^2]', 28, WHITE).move_to(P(105, 68))
        term_eq = M(r'=', 28, WHITE).move_to(P(205, 68))
        term_bias = M(r'\text{bias}^2', 28, YELLOW).move_to(P(275, 68))
        term_plus1 = M(r'+', 28, WHITE).move_to(P(340, 68))
        term_var = M(r'\text{variance}', 28, GREEN).move_to(P(425, 68))
        term_plus2 = M(r'+', 28, WHITE).move_to(P(510, 68))
        term_noise = M(r'\mathrm{Var}[Y]', 28, GREY).move_to(P(560, 68))
        formula_row = VGroup(term_err, term_eq, term_bias, term_plus1, term_var, term_plus2, term_noise)

        role_err = T('期望测试误差', 15, WHITE).next_to(term_err, DOWN, buff=0.16)
        role_bias = T('平均偏得多远', 15, YELLOW).next_to(term_bias, DOWN, buff=0.16)
        role_var = T('换一份数据晃得多厉害', 15, GREEN).next_to(term_var, DOWN, buff=0.16)
        role_noise = T('数据噪声 σ²，谁也消不掉', 15, GREY).next_to(term_noise, DOWN, buff=0.16)
        roles = VGroup(role_err, role_bias, role_var, role_noise)

        # Schematic U-shaped curve plot
        ax_u = Axes(
            x_range=[0, 10, 2], y_range=[0, 4.6, 1],
            x_length=px(380), y_length=px(112),
            axis_config={'include_numbers': False, 'include_tip': True, 'tip_width': 0.16, 'tip_height': 0.16,
                         'stroke_color': GREY, 'stroke_width': 1.4, 'stroke_opacity': 0.6},
        ).move_to(P(320, 212))
        lab_x = T('模型复杂度 (自由度)', 14, WHITE).next_to(ax_u.x_axis, DOWN, buff=0.12)
        lab_y = T('误差', 14, WHITE).next_to(ax_u.y_axis.get_top(), LEFT, buff=0.08)

        def f_bias(u):
            return 3.2 * np.exp(-0.48 * (u - 0.8))

        def f_var(u):
            return 0.04 + 0.038 * (u - 0.8)**2

        def f_tot(u):
            return f_bias(u) + f_var(u) + 0.5

        c_noise = DashedLine(ax_u.c2p(0.8, 0.5), ax_u.c2p(9.2, 0.5), color=GREY, stroke_width=1.8, dash_length=0.1)
        lbl_c_noise = M(r'\mathrm{Var}[Y]', 20, GREY).next_to(ax_u.c2p(9.2, 0.5), RIGHT, buff=0.08)

        c_bias = ax_u.plot(f_bias, x_range=[0.8, 9.2], color=YELLOW, stroke_width=2.5)
        lbl_c_bias = M(r'\text{bias}^2', 22, YELLOW).next_to(ax_u.c2p(1.2, f_bias(1.2)), UR, buff=0.06)

        c_var = ax_u.plot(f_var, x_range=[0.8, 9.2], color=GREEN, stroke_width=2.5)
        lbl_c_var = M(r'\text{variance}', 22, GREEN).next_to(ax_u.c2p(8.8, f_var(8.8)), UL, buff=0.08)

        c_tot = ax_u.plot(f_tot, x_range=[0.8, 9.2], color=RED, stroke_width=3.2)
        lbl_c_tot = T('总测试误差 (U 形)', 15, RED).next_to(ax_u.c2p(5.0, f_tot(5.0)), UP, buff=0.12)

        u_grid = np.linspace(0.8, 9.2, 2001)
        u_opt = float(u_grid[np.argmin(f_tot(u_grid))])      # true minimum of the drawn total curve
        dot_opt = Dot(ax_u.c2p(u_opt, f_tot(u_opt)), radius=0.07, color=YELLOW)
        lbl_opt = T('最佳平衡', 15, YELLOW).next_to(dot_opt, DOWN, buff=0.05)

        # the same U in this example's numbers (simulated expected test error at x0)
        ex_parts = [T(f'本例 x₀ 处（模拟 {N_SIM} 天）期望误差：', 14, GREY)]
        for d in (1, 3, 7, 9):
            word = f'{d} 次 {sim_err[d]:.2f}' + ('（最低）' if d == best_deg else '')
            ex_parts.append(T(word, 14, YELLOW if d == best_deg else WHITE))
        ex_row = VGroup(*ex_parts).arrange(RIGHT, buff=0.22).move_to(P(320, 306))

        self.play(FadeIn(formula_row), FadeIn(roles), run_time=0.8)
        self.play(
            FadeIn(ax_u), FadeIn(lab_x), FadeIn(lab_y),
            Create(c_noise), FadeIn(lbl_c_noise),
            Create(c_bias), FadeIn(lbl_c_bias),
            Create(c_var), FadeIn(lbl_c_var),
            run_time=1.1,
        )
        self.play(Create(c_tot), FadeIn(lbl_c_tot), FadeIn(dot_opt), FadeIn(lbl_opt), run_time=1.0)
        self.play(FadeIn(ex_row, shift=UP * 0.1), run_time=0.6)
        self.wait(2.0)

        # ----------------------------------------------------
        # Takeaway closing card
        # ----------------------------------------------------
        self.takeaway(
            r"**简单模型高偏差、低方差，复杂模型低偏差、高方差。**Bias 是平均预测离真值多远（模型太简单时大），variance 是换训练集时预测晃多大（模型太复杂时大）。期望测试误差 $=\text{bias}^2+\text{variance}+\mathrm{Var}[Y]$，其中 $\mathrm{Var}[Y]$ 是谁也消不掉的噪声（本例为 $\sigma^2$）；调正则化强度、选模型复杂度，都是在找 U 形曲线的最低点。简答题常考：写出这个分解，并说明模型变简单或变复杂时哪一项变大。",
            [
                '简单模型：高偏差、低方差；复杂模型：低偏差、高方差',
                '测试误差 = bias² + variance + 噪声',
                '调正则 / 选模型：寻找 U 形谷底最佳平衡',
            ],
            hold=3.5,
        )
