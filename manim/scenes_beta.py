r"""c51 · Beta–Binomial conjugacy (COMP90051 exam review).

Visualizes Bayesian belief updating for coin tossing:
- Horizontal axis: parameter q in [0, 1] (probability of heads)
- Vertical axis: probability density p(q) on a fixed y-range [0, 3.5]
- Prior: Beta(2, 2), representing "roughly fair, but high uncertainty"
- Sequential flips: 10 flips (H, H, T, H, H, T, H, H, T, H)
  - First 3 flips slowly: curve leans right on H (alpha + 1), left on T (beta + 1)
  - Next 7 flips faster: curve sharpens, narrows, variance decreases
- Final posterior Beta(9, 5) point estimates comparison:
  - MLE: 7/10 = 0.700 (ORANGE line)
  - MAP: (9-1)/(9+5-2) = 8/12 approx 0.667 (YELLOW line at peak)
  - Posterior mean: 9/14 approx 0.643 (GREEN line)
  - Intuition: Beta(2, 2) acts like pseudo-flips pulling toward 0.5 (1H+1T for the MAP, 2H+2T for the mean)
- The prior stays on screen from the first flip on as a grey dashed reference ("先验（对照）").
- Conjugacy formula:
  Beta(alpha, beta) -> Beta(alpha + k, beta + n - k) with Chinese role labels.
"""
import numpy as np
from manim import (
    Axes,
    Circle,
    Arrow,
    Create,
    DashedLine,
    DashedVMobject,
    Dot,
    DOWN,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    Indicate,
    LEFT,
    Line,
    ReplacementTransform,
    RIGHT,
    RoundedRectangle,
    Transform,
    UL,
    UP,
    UR,
    ValueTracker,
    VGroup,
    VMobject,
    always_redraw,
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
    ORANGE,
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


class BetaCoin(StepScene):
    ID = 'beta'
    TITLE = 'Beta–Binomial 共轭：抛硬币与后验更新'
    FLOW = ['先验分布', '初见数据', '持续更新', '三种估计', '共轭性质']

    def construct(self):
        # ---------------------------------------------------------------- Step 0: Question card
        self.question(
            r'抛 10 次硬币出了 7 次正面，最直接的答案是正面概率 $q=7/10=0.7$。可如果事先相信这枚硬币大致公平，只凭 10 次就说 0.7，会不会太相信这一小批数据？**办法是用一条曲线表示“$q$ 取各个值有多可信”：先画出事先的看法，再随着每一次抛掷更新这条曲线。**',
            [
                '抛硬币 10 次出 7 次正面，正面概率就是 0.7 吗？',
                '如何把“先验常识”和“观测数据”融合成一条曲线？',
            ],
            hold=2.6,
        )

        # ---------------------------------------------------------------- Layout & Coordinates
        # Axes in left panel: q in [0, 1], p(q) in [0, 3.5]
        ax = Axes(
            x_range=[0.0, 1.0, 0.2],
            y_range=[0.0, 3.5, 1.0],
            x_length=px(330),
            y_length=px(180),
            axis_config={
                'include_numbers': False,
                'include_tip': False,
                'stroke_color': GREY,
                'stroke_width': 1.6,
            },
        ).move_to(P(220, 195))

        x_ticks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
        x_labels = VGroup(*[
            T(f'{xt:.1f}' if xt > 0 else '0', 14, GREY).next_to(ax.c2p(xt, 0), DOWN, buff=0.12)
            for xt in x_ticks
        ])

        y_ticks = [1.0, 2.0, 3.0]
        y_labels = VGroup(*[
            T(f'{int(yt)}', 14, GREY).next_to(ax.c2p(0, yt), LEFT, buff=0.12)
            for yt in y_ticks
        ])

        q_label = M(r'q', 22, WHITE).next_to(ax.c2p(1.0, 0), RIGHT, buff=0.14)
        y_label = T('密度 p(q)', 15, GREY).next_to(ax.c2p(0, 3.5), UP, buff=0.1).shift(RIGHT * 0.4)

        axes_group = VGroup(ax, x_labels, y_labels, q_label, y_label)

        # Helper function: build Beta(a, b) curve VMobjects
        def get_beta_mobs(a, b):
            qs = np.linspace(0.002, 0.998, 160)
            log_vals = (a - 1.0) * np.log(qs) + (b - 1.0) * np.log(1.0 - qs)
            vals = np.exp(log_vals - np.max(log_vals))
            area = float(np.sum((vals[:-1] + vals[1:]) * 0.5 * np.diff(qs)))
            density = vals / area
            pts = [ax.c2p(q, d) for q, d in zip(qs, density)]

            fill_pts = [ax.c2p(qs[0], 0)] + pts + [ax.c2p(qs[-1], 0)]
            fill_mob = VMobject(fill_color=BLUE, fill_opacity=0.22, stroke_width=0)
            fill_mob.set_points_as_corners(fill_pts)

            line_mob = VMobject(color=BLUE, stroke_width=3.2)
            line_mob.set_points_smoothly(pts)
            return VGroup(fill_mob, line_mob)

        # Right panel setup
        coins_title = T('抛掷序列（10 次）', 15, GREY).move_to(P(512, 54))

        # Helper to construct coin token
        def make_coin(label, center_px):
            if label == 'H':
                bg_color = YELLOW
                txt = T('正', 13, INK, weight='BOLD')
                border_color = '#e8cb52'
            else:
                bg_color = '#35526e'
                txt = T('反', 13, WHITE, weight='BOLD')
                border_color = BLUE
            c = Circle(
                radius=px(9.5),
                fill_color=bg_color,
                fill_opacity=1.0,
                stroke_color=border_color,
                stroke_width=1.5,
            ).move_to(P(center_px[0], center_px[1]))
            txt.move_to(c.get_center())
            return VGroup(c, txt)

        # 10 flips data: 7 Heads, 3 Tails
        flips = ['H', 'H', 'T', 'H', 'H', 'T', 'H', 'H', 'T', 'H']
        coin_x_coords = [418 + k * 21.0 for k in range(10)]
        coins_created = []

        # ValueTrackers for parameters alpha and beta
        alpha_tk = ValueTracker(2.0)
        beta_tk = ValueTracker(2.0)

        # Dynamic curve bound to trackers
        dynamic_curve = always_redraw(
            lambda: get_beta_mobs(alpha_tk.get_value(), beta_tk.get_value())
        )

        # Status box in right panel
        status_box = RoundedRectangle(
            corner_radius=0.12,
            width=px(204),
            height=px(68),
            fill_color='#1c202a',
            fill_opacity=0.92,
            stroke_color=DIM,
            stroke_width=1.5,
        ).move_to(P(512, 118))

        dist_readout = always_redraw(
            lambda: T(
                f'当前后验：Beta({alpha_tk.get_value():.0f}, {beta_tk.get_value():.0f})',
                16,
                YELLOW,
                weight='BOLD',
            ).move_to(P(512, 106))
        )

        count_readout = always_redraw(
            lambda: T(
                f'已观测：{int(round(alpha_tk.get_value())) - 2} 正  ·  {int(round(beta_tk.get_value())) - 2} 反',
                14,
                WHITE,
            ).move_to(P(512, 130))
        )

        # ---------------------------------------------------------------- Step 1: Prior Beta(2, 2)
        self.step(
            r'横轴是正面概率 $q$（从 0 到 1），纵轴是密度 $p(q)$：曲线越高的地方，那个 $q$ 越可信。抛硬币之前，用 $\mathrm{Beta}(2,2)$ 作 prior（先验）：$\mathrm{Beta}(\alpha,\beta)$ 的密度正比于 $q^{\alpha-1}(1-q)^{\beta-1}$，这里就是 $q(1-q)$，在 $q=0.5$ 最高（虚线），表示“大致公平”。**但曲线很宽，$q=0.2$、$0.8$ 处也不低，说明我们对 $q$ 并没有多大把握。** 右边方框记录当前的分布和已看到的正反次数，现在是 0 正 0 反。方框里的“当前后验”指 posterior（后验，看过数据之后的看法）；还没看数据时，“当前后验”就是先验。',
            '先验 Beta(2,2)：大致公平（峰值 0.5），两边宽表示不确定',
            stage=0,
        )

        initial_curve = get_beta_mobs(2.0, 2.0)
        prior_center_guide = DashedLine(
            ax.c2p(0.5, 0),
            ax.c2p(0.5, 1.5),
            color=GREY,
            stroke_width=1.8,
            dash_length=0.08,
        )
        prior_tag = T('先验中心 q = 0.5', 14, GREY).next_to(ax.c2p(0.5, 1.5), UP, buff=0.1)

        self.play(Create(axes_group), run_time=1.0)
        self.play(
            Create(initial_curve[1]),
            FadeIn(initial_curve[0]),
            Create(prior_center_guide),
            FadeIn(prior_tag),
            FadeIn(coins_title),
            FadeIn(status_box),
            run_time=1.0,
        )
        self.remove(initial_curve[0], initial_curve[1])     # Create/FadeIn added the two parts, not the group
        self.add(dynamic_curve, dist_readout, count_readout)
        self.wait(1.4)

        # ---------------------------------------------------------------- Step 2: First 3 flips (Slow)
        self.step(
            r'前 3 次依次是 正、正、反，看右上方的硬币一枚枚出现。图上不动的灰色虚线是原来的先验 $\mathrm{Beta}(2,2)$，留作对照；会动的那条是当前后验。每出现一次正面，$\alpha$ 加 1，曲线往右偏；出现反面，$\beta$ 加 1，曲线被拉回左边：$\mathrm{Beta}(2,2)\to\mathrm{Beta}(3,2)\to\mathrm{Beta}(4,2)\to\mathrm{Beta}(4,3)$。原因是：看到一次正面，就给曲线乘上“出正面的概率” $q$；看到反面就乘 $(1-q)$。这就是“后验 ∝ 似然 × 先验”（∝ 读作“正比于”）：一次正面的 likelihood（似然）是 $q$，一次反面是 $1-q$；乘完后整体缩放，让曲线下面积回到 1。乘完后 $q$ 或 $(1-q)$ 的指数正好多 1，形状还是 Beta：比如 $q(1-q)\times q=q^{2}(1-q)$，正是 $\mathrm{Beta}(3,2)$ 的样子（指数比参数少 1）。**所以 $(\alpha,\beta)$ 就是正、反面次数的计数器。**',
            '前 3 次（正、正、反）：出正 α+1 曲线右偏，出反 β+1 曲线左拉',
            stage=1,
        )
        # the prior stays as a fixed grey dashed reference; only the blue posterior moves from here on
        prior_ref = DashedVMobject(get_beta_mobs(2.0, 2.0)[1], num_dashes=44, dashed_ratio=0.55)
        prior_ref.set_stroke(GREY, width=2.4)
        prior_ref_tag = T('先验（对照）', 13, GREY).move_to(ax.c2p(0.16, 1.36))
        self.play(FadeOut(prior_center_guide), FadeOut(prior_tag), FadeIn(prior_ref), FadeIn(prior_ref_tag),
                  run_time=0.5)

        # Flip 1: H
        coin0 = make_coin('H', (coin_x_coords[0], 76))
        coins_created.append(coin0)
        self.play(GrowFromCenter(coin0), run_time=0.35)
        self.play(alpha_tk.animate.set_value(3.0), run_time=0.85)
        self.wait(0.35)

        # Flip 2: H
        coin1 = make_coin('H', (coin_x_coords[1], 76))
        coins_created.append(coin1)
        self.play(GrowFromCenter(coin1), run_time=0.35)
        self.play(alpha_tk.animate.set_value(4.0), run_time=0.85)
        self.wait(0.35)

        # Flip 3: T
        coin2 = make_coin('T', (coin_x_coords[2], 76))
        coins_created.append(coin2)
        self.play(GrowFromCenter(coin2), run_time=0.35)
        self.play(beta_tk.animate.set_value(3.0), run_time=0.85)
        self.wait(0.6)

        # ---------------------------------------------------------------- Step 3: Remaining 7 flips (Faster)
        self.step(
            r'剩下 7 次快速放完：正、正、反、正、正、反、正，曲线每次照样右偏或左拉。10 次合计 7 正 3 反，所以 $\alpha=2+7=9$，$\beta=2+3=5$，后验是 $\mathrm{Beta}(9,5)$。**总的趋势：数据越多，曲线越窄、越高，表示对 $q$ 越来越有把握。** 曲线下的面积始终是 1，宽度大幅收窄后峰就抬高：先验 $\mathrm{Beta}(2,2)$ 峰值 1.5，后验 $\mathrm{Beta}(9,5)$ 峰值约 3.1。但不是每一次都变高：出反面时峰可能略降，例如 $\mathrm{Beta}(4,2)\to\mathrm{Beta}(4,3)$，峰值从 2.11 降到 2.07。',
            '后 7 次快速完成：数据变多，曲线显著变窄、变高（更确信）',
            stage=2,
        )

        for i in range(3, 10):
            label = flips[i]
            coin = make_coin(label, (coin_x_coords[i], 76))
            coins_created.append(coin)
            if label == 'H':
                target = alpha_tk.get_value() + 1.0
                self.play(GrowFromCenter(coin), alpha_tk.animate.set_value(target), run_time=0.45)
            else:
                target = beta_tk.get_value() + 1.0
                self.play(GrowFromCenter(coin), beta_tk.animate.set_value(target), run_time=0.45)

        self.wait(1.2)

        # ---------------------------------------------------------------- Step 4: Three estimates at Beta(9, 5)
        self.step(
            r'后验是一整条曲线；要报一个数时，有三种常见读法，就是图上的三条竖线。MLE（maximum likelihood estimate，最大似然估计）只看数据：$7/10=0.70$（橙线）。MAP（maximum a posteriori，最大后验估计）取曲线最高点，也就是众数：$\mathrm{Beta}(9,5)$ 正比于 $q^{8}(1-q)^{4}$。$q^a(1-q)^b$ 的最高点在 $q=\frac{a}{a+b}$（取对数得 $a\ln q+b\ln(1-q)$，求导令它等于 0：$\frac{a}{q}-\frac{b}{1-q}=0$，即 $a(1-q)=bq$）。这里 $a=8,b=4$，所以峰值在 $\frac{8}{8+4}=\frac{8}{12}\approx0.667$（黄线），也就是公式 $\frac{9-1}{9+5-2}$。后验均值是曲线的平均位置：$\frac{9}{9+5}=\frac{9}{14}\approx0.643$（绿线）。**MAP 和均值都小于 0.7，因为先验 $\mathrm{Beta}(2,2)$ 就像预先多加的假想抛掷，把估计拉向 0.5。** 右边卡片下方两行：对 MAP，先验像多了 1 正 1 反，$\frac{8}{12}=\frac{7+1}{10+2}$；对均值，像多了 2 正 2 反，$\frac{9}{14}=\frac{7+2}{10+4}$。',
            '三种估计：MLE=0.70，MAP=0.67，均值=0.64；先验将其拉向 0.5',
            stage=3,
        )

        # Freeze the curve and status readouts at Beta(9, 5)
        static_curve = get_beta_mobs(9.0, 5.0)
        static_dist = T('当前后验：Beta(9, 5)', 16, YELLOW, weight='BOLD').move_to(P(512, 106))
        static_count = T('已观测：7 正  ·  3 反', 14, WHITE).move_to(P(512, 130))
        self.remove(dynamic_curve, dist_readout, count_readout)
        self.add(static_curve, static_dist, static_count)

        # 1. MLE: 7/10 = 0.700
        mle_line = DashedLine(
            ax.c2p(0.70, 0),
            ax.c2p(0.70, 3.00),
            color=ORANGE,
            stroke_width=2.4,
            dash_length=0.08,
        )
        mle_dot = Dot(ax.c2p(0.70, 0), radius=0.06, color=ORANGE)
        # MLE / mean tags sit one row BELOW the tick labels (clear of "0.6" / "0.8"), each hung on a short
        # dashed leader that continues its estimate line below the axis
        tags_top = x_labels.get_bottom()[1] - 0.14
        mle_x = ax.c2p(0.70, 0)[0]
        mle_tag = M(r'\hat{q}_{\text{MLE}} = 0.70', 17, ORANGE)
        mle_tag.move_to([mle_x + 0.1 + mle_tag.width / 2, tags_top - mle_tag.height / 2, 0])
        mle_lead = DashedLine(ax.c2p(0.70, 0) + DOWN * 0.08, np.array([mle_x, mle_tag.get_center()[1], 0.0]),
                              color=ORANGE, stroke_width=1.4, dash_length=0.05)

        # 2. MAP: (9-1)/(9+5-2) = 8/12 = 2/3 approx 0.667 (Peak)
        map_line = DashedLine(
            ax.c2p(2.0 / 3.0, 0),
            ax.c2p(2.0 / 3.0, 3.10),
            color=YELLOW,
            stroke_width=2.4,
            dash_length=0.08,
        )
        map_dot = Dot(ax.c2p(2.0 / 3.0, 3.10), radius=0.07, color=YELLOW)
        map_tag = T('MAP 峰值: 8/12 ≈ 0.67', 14, YELLOW).next_to(ax.c2p(2.0 / 3.0, 3.10), UP, buff=0.08)

        # 3. Posterior mean: 9/14 approx 0.643
        mean_line = DashedLine(
            ax.c2p(9.0 / 14.0, 0),
            ax.c2p(9.0 / 14.0, 3.03),
            color=GREEN,
            stroke_width=2.4,
            dash_length=0.08,
        )
        mean_dot = Dot(ax.c2p(9.0 / 14.0, 0), radius=0.06, color=GREEN)
        mean_x = ax.c2p(9.0 / 14.0, 0)[0]
        mean_tag = M(r'E[q] = \frac{9}{14} \approx 0.64', 17, GREEN)
        mean_tag.move_to([mean_x - 0.1 - mean_tag.width / 2, tags_top - mean_tag.height / 2, 0])
        mean_lead = DashedLine(ax.c2p(9.0 / 14.0, 0) + DOWN * 0.08, np.array([mean_x, mean_tag.get_center()[1], 0.0]),
                               color=GREEN, stroke_width=1.4, dash_length=0.05)

        estimates_axis_group = VGroup(
            mle_line, mle_dot, mle_tag, mle_lead,
            map_line, map_dot, map_tag,
            mean_line, mean_dot, mean_tag, mean_lead,
        )

        # Comparison card in right panel
        compare_box = RoundedRectangle(
            corner_radius=0.12,
            width=px(204),
            height=px(160),
            fill_color='#1c202a',
            fill_opacity=0.96,
            stroke_color=DIM,
            stroke_width=1.5,
        ).move_to(P(512, 240))

        card_title = T('三种点估计对比', 15, WHITE, weight='BOLD').move_to(P(512, 172))
        card_mle = M(r'\hat{q}_{\text{MLE}} = \frac{7}{10} = 0.700', 16, ORANGE).move_to(P(512, 196))
        card_map = M(r'q_{\text{MAP}} = \frac{8}{12} \approx 0.667', 16, YELLOW).move_to(P(512, 222))
        card_mean = M(r'E[q] = \frac{9}{14} \approx 0.643', 16, GREEN).move_to(P(512, 248))
        card_note1 = T('对 MAP：像多 1 正 1 反', 13, '#e6d58c').move_to(P(512, 274))
        card_note2 = T('对均值：像多 2 正 2 反', 13, '#a8d49a').move_to(P(512, 291))
        card_note3 = T('先验温和地把估计拉向 0.5', 12, '#a0b0c4').move_to(P(512, 308))

        compare_card_group = VGroup(
            compare_box, card_title, card_mle, card_map, card_mean, card_note1, card_note2, card_note3,
        )

        self.play(
            Create(mle_line), FadeIn(mle_dot), FadeIn(mle_tag), FadeIn(mle_lead),
            Create(map_line), FadeIn(map_dot), FadeIn(map_tag),
            Create(mean_line), FadeIn(mean_dot), FadeIn(mean_tag), FadeIn(mean_lead),
            FadeIn(compare_card_group),
            run_time=1.4,
        )
        self.play(Indicate(card_note1), Indicate(card_note2), run_time=1.0)
        self.wait(1.8)

        # ---------------------------------------------------------------- Step 5: Conjugacy formula & Chinese roles
        self.step(
            r'把刚才的过程写成一条公式：$\mathrm{Beta}(\alpha,\beta)$ 看到 $k$ 次正面、$n-k$ 次反面后，变成 $\mathrm{Beta}(\alpha+k,\ \beta+n-k)$，公式下方标着先验、数据、后验。代入本例：$\mathrm{Beta}(2+7,\ 2+10-7)=\mathrm{Beta}(9,5)$。形状不变的原因：似然 $q^k(1-q)^{n-k}$ 乘先验 $q^{\alpha-1}(1-q)^{\beta-1}$，只是指数相加，得到 $q^{k+\alpha-1}(1-q)^{n-k+\beta-1}$，仍是 Beta 的样子。**先验是 Beta、似然是 Binomial（二项分布）时，后验仍是 Beta，这叫 Beta–Binomial 共轭，Beta 是 Binomial 的 conjugate prior（共轭先验）。** 所以更新只要把正面数加到 $\alpha$、反面数加到 $\beta$，不用去算归一化积分。',
            '共轭先验：后验仍是 Beta，更新只需把正面数加到 α、反面数加到 β',
            stage=4,
        )

        # Dim previous elements
        coins_all = VGroup(*coins_created)
        self.play(
            FadeOut(estimates_axis_group),
            FadeOut(compare_card_group),
            FadeOut(static_dist),
            FadeOut(static_count),
            FadeOut(status_box),
            static_curve.animate.set_opacity(0.18),
            prior_ref.animate.set_stroke(opacity=0.18),
            prior_ref_tag.animate.set_opacity(0.18),
            axes_group.animate.set_opacity(0.18),
            coins_all.animate.set_opacity(0.25),
            coins_title.animate.set_opacity(0.25),
            run_time=0.6,
        )

        # Conjugacy banner
        conj_box = RoundedRectangle(
            corner_radius=0.15,
            width=px(520),
            height=px(144),
            fill_color='#181a24',
            fill_opacity=0.96,
            stroke_color=PURPLE,
            stroke_width=2,
        ).move_to(P(320, 195))

        conj_badge = pill('Beta–Binomial 共轭更新', fill=PURPLE, color=WHITE, size=17).move_to(P(320, 142))

        # MathTex cannot hold Chinese, so the arrow label is T() + M() pieces sitting on a plain arrow
        arrow_lab = VGroup(
            M(r'k', 20, YELLOW), T('次正面，', 16, YELLOW), M(r'n-k', 20, YELLOW), T('次反面', 16, YELLOW),
        ).arrange(RIGHT, buff=0.07)
        arrow_lab[2:].shift(RIGHT * 0.14)     # Text boxes are ink-tight: give the full-width comma its space back
        half = arrow_lab.width / 2 + 0.2
        f_arrow = Arrow(LEFT * half, RIGHT * half, buff=0, color=YELLOW, stroke_width=3,
                        max_tip_length_to_length_ratio=0.1)
        formula = VGroup(
            M(r'\text{Beta}(\alpha,\beta)', 24, BLUE),
            f_arrow,
            M(r'\text{Beta}(\alpha+k,\ \beta+n-k)', 24, GREEN),
        ).arrange(RIGHT, buff=0.22).move_to(P(320, 194))
        arrow_lab.next_to(f_arrow, UP, buff=0.1)

        prior_role = T('先验', 16, BLUE, weight='BOLD').next_to(formula[0], DOWN, buff=0.18)
        data_role = T('数据', 16, YELLOW, weight='BOLD').next_to(formula[1], DOWN, buff=0.18)
        post_role = T('后验还是 Beta', 16, GREEN, weight='BOLD').next_to(formula[2], DOWN, buff=0.18)
        roles = VGroup(prior_role, data_role, post_role)

        summary_note = T('后验参数直接等于先验计数加实际计数，无需繁琐积分！', 15, '#c8d4e4').move_to(P(320, 245))

        banner_group = VGroup(conj_box, conj_badge, formula, arrow_lab, roles, summary_note)

        self.play(FadeIn(conj_box), FadeIn(conj_badge), FadeIn(formula), FadeIn(arrow_lab), run_time=0.8)
        self.play(FadeIn(roles), FadeIn(summary_note), run_time=0.7)
        self.play(Indicate(post_role), run_time=1.0)
        self.wait(2.2)

        # ---------------------------------------------------------------- Takeaway
        self.takeaway(
            r'一句话：**先验 $\mathrm{Beta}(\alpha,\beta)$ 的 $\alpha,\beta$ 就像事先假想的正、反面次数，看到 $k$ 次正面、$n-k$ 次反面后，后验就是 $\mathrm{Beta}(\alpha+k,\ \beta+n-k)$。** 后验均值 $\frac{k+\alpha}{n+\alpha+\beta}$（本例 $\frac{9}{14}\approx0.643$），MAP $\frac{k+\alpha-1}{n+\alpha+\beta-2}$（本例 $\frac{8}{12}\approx0.667$），MLE 只看 $k/n$（本例 $0.7$）。数据越多，先验的影响越小，但不会完全消失。考试常用这个例子：写出后验参数，算后验均值或 MAP，或解释什么是共轭先验。',
            [
                'Beta–Binomial：先验计数 + 观测计数 = 后验计数',
                '后验均值 (k+α)/(n+α+β)，MAP (k+α-1)/(n+α+β-2)',
                '先验相当于假想数据，数据越多先验越弱但不消失',
            ],
            hold=3.5,
        )
