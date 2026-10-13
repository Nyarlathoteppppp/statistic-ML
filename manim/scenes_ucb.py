r"""UCB (Upper Confidence Bound) bandit algorithm: optimism in the face of uncertainty.

Chapter c48 (W9 L17): 2026 practice Q2 numbers.
Three arms with initial N = (64, 16, 4) and reward sums (40, 10, 2).
Demonstrates how the exploration bonus balances exploitation and exploration,
and how pulling an uncertain arm naturally resolves uncertainty.
"""
import math
import numpy as np

from manim import (
    Arrow, BackgroundRectangle, Circumscribe, Create, DashedLine, DL, Dot, DOWN, DR,
    FadeIn, FadeOut, Flash, GrowFromEdge, Indicate, LEFT, Line, ORIGIN, Rectangle,
    ReplacementTransform, RIGHT, RoundedRectangle, SurroundingRectangle, Transform, UL, UP, UR,
    ValueTracker, VGroup, always_redraw,
)
from common import (
    BG, BLUE, DIM, GREEN, GREY, GRID, INK, LIFT, M, MT, ORANGE, P, pill,
    PURPLE, px, RED, SC, StepScene, T, TEAL, WHITE, YELLOW,
)


class Ucb(StepScene):
    ID = 'ucb'
    TITLE = 'UCB 置信上界：面对不确定时保持乐观'
    FLOW = ['看均值：贪心忽略', '加Bonus：探索加成', '比Q值：选臂3', '多试12次：消除不确定', '臂2超车：乐观真谛']

    def construct(self):
        self.question(
            r'有几台老虎机，每台叫一个 arm（臂）；每轮只能拉一台，也只看得到这一台的奖励。如果总是挑目前平均奖励最高的那台，一个试得少、其实可能更好的臂会被永远冷落。**UCB（upper confidence bound，置信上界）给“试得少、没把握”的臂加一份加成，让它有机会被再试；试多了加成变小，看错了也能自己纠正。**',
            ['只按目前平均奖励挑，会错过可能更好的臂', '怎么给“试得少、不确定”的臂一个翻盘机会？']
        )

        # -----------------------------------------------------------------
        # Constants and Layout Geometry
        # -----------------------------------------------------------------
        X_ARMS = [175, 320, 465]
        Y_BASE = 265.0
        SCALE_Y = 75.0      # px per Q unit (Q=2.0 -> 150 px)
        BAR_W = 60.0

        def bar_rect(x, y_bot, h_px, fill_color, fill_opacity=1.0, stroke_color=None, stroke_width=0.0):
            h = max(h_px, 0.5)
            r = Rectangle(
                width=px(BAR_W),
                height=px(h),
                fill_color=fill_color,
                fill_opacity=fill_opacity,
                stroke_color=stroke_color or fill_color,
                stroke_width=stroke_width,
            )
            r.move_to(P(x, y_bot - h / 2.0))
            return r

        # -----------------------------------------------------------------
        # Static Skeleton: Axes, Grid, Arm Base Labels
        # -----------------------------------------------------------------
        # Y-axis
        y_axis = Line(P(95, Y_BASE), P(95, 105), color=GREY, stroke_width=2)
        axis_arr = Arrow(P(95, 120), P(95, 95), buff=0, color=GREY, stroke_width=2, max_tip_length_to_length_ratio=0.25)
        axis_title = T('Q 值', 15, GREY).next_to(P(95, 95), UP, buff=0.1)

        ticks_group = VGroup()
        grid_group = VGroup()
        for q_val in [0.0, 0.5, 1.0, 1.5, 2.0]:
            y_pos = Y_BASE - q_val * SCALE_Y
            t_line = Line(P(89, y_pos), P(95, y_pos), color=GREY, stroke_width=1.8)
            t_label = T(f'{q_val:.1f}' if q_val > 0 else '0', 14, GREY).next_to(P(87, y_pos), LEFT, buff=0.06)
            ticks_group.add(t_line, t_label)
            if q_val > 0:
                g_line = DashedLine(P(95, y_pos), P(525, y_pos), color=GRID, stroke_width=1.0, stroke_opacity=0.45, dash_length=0.12)
                grid_group.add(g_line)

        # Baseline
        base_line = Line(P(80, Y_BASE), P(540, Y_BASE), color='#3a4252', stroke_width=2.5)

        # Arm labels below baseline
        arm_titles = VGroup(
            T('臂 1', 19, WHITE).move_to(P(X_ARMS[0], 282)),
            T('臂 2', 19, WHITE).move_to(P(X_ARMS[1], 282)),
            T('臂 3', 19, WHITE).move_to(P(X_ARMS[2], 282)),
        )

        arm12_footers = VGroup(
            T('N=64, s=40', 14, GREY).move_to(P(X_ARMS[0], 299)),
            T('N=16, s=10', 14, GREY).move_to(P(X_ARMS[1], 299)),
        )

        arm3_init_footer = T('N=4, s=2', 14, GREY).move_to(P(X_ARMS[2], 299))

        # Compact Legend top-right
        leg_box1 = Rectangle(width=px(14), height=px(14), fill_color=BLUE, fill_opacity=1, stroke_width=0).move_to(P(510, 52))
        leg_txt1 = T('均值 μ̂', 14, BLUE).next_to(leg_box1, RIGHT, buff=0.1)
        leg_box2 = Rectangle(width=px(14), height=px(14), fill_color=YELLOW, fill_opacity=0.75, stroke_color=YELLOW, stroke_width=1.2).move_to(P(575, 52))
        leg_txt2 = T('Bonus', 14, YELLOW).next_to(leg_box2, RIGHT, buff=0.1)
        legend = VGroup(leg_box1, leg_txt1, leg_box2, leg_txt2)

        # Mean bars (solid BLUE)
        h_mu1 = 0.625 * SCALE_Y
        h_mu2 = 0.625 * SCALE_Y
        h_mu3 = 0.500 * SCALE_Y

        bar_mu1 = bar_rect(X_ARMS[0], Y_BASE, h_mu1, BLUE, fill_opacity=0.95)
        bar_mu2 = bar_rect(X_ARMS[1], Y_BASE, h_mu2, BLUE, fill_opacity=0.95)
        bar_mu3 = bar_rect(X_ARMS[2], Y_BASE, h_mu3, BLUE, fill_opacity=0.95)

        lbl_mu1 = T('0.625', 16, WHITE).move_to(bar_mu1.get_center())
        lbl_mu2 = T('0.625', 16, WHITE).move_to(bar_mu2.get_center())
        lbl_mu3 = T('0.500', 16, WHITE).move_to(bar_mu3.get_center())

        mean_group = VGroup(bar_mu1, bar_mu2, bar_mu3, lbl_mu1, lbl_mu2, lbl_mu3)

        # -----------------------------------------------------------------
        # STEP 0: Means Only — Greedy Limitation (Stage 0)
        # -----------------------------------------------------------------
        self.step(
            r'三根蓝柱是三个臂目前的平均奖励，柱子下面写着拉过的次数 $N$ 和奖励总和 $s$：三个臂分别拉了 $(64, 16, 4)$ 次，奖励总和 $(40, 10, 2)$。'
            r'平均 = 奖励总和 ÷ 次数：$\hat\mu_1 = 40/64 = 0.625$，$\hat\mu_2 = 10/16 = 0.625$，$\hat\mu_3 = 2/4 = 0.500$。'
            r'**如果用 greedy（贪心）策略，只挑平均最高的臂，臂 3 将永远被冷落、没有翻盘机会。**'
            r'可它只拉过 4 次，0.5 这个平均并不可靠。顶部写着已拉 84 次、下一轮是 $t=85$，下一步会用到。',
            '只看均值：臂1、2最高 (0.625)，贪心会永远忽略臂3',
            stage=0
        )

        header_step0 = pill('轮数：已拉 84 次，下一轮 t = 85', '#242a35', YELLOW, 16).move_to(P(290, 52))

        self.play(
            FadeIn(base_line),
            FadeIn(y_axis),
            FadeIn(axis_arr),
            FadeIn(axis_title),
            FadeIn(ticks_group),
            FadeIn(grid_group),
            FadeIn(arm_titles),
            FadeIn(arm12_footers),
            FadeIn(arm3_init_footer),
            FadeIn(legend),
            FadeIn(header_step0),
            run_time=0.9
        )
        self.play(
            GrowFromEdge(bar_mu1, DOWN),
            GrowFromEdge(bar_mu2, DOWN),
            GrowFromEdge(bar_mu3, DOWN),
            FadeIn(lbl_mu1),
            FadeIn(lbl_mu2),
            FadeIn(lbl_mu3),
            run_time=1.0
        )
        self.wait(1.2)

        # -----------------------------------------------------------------
        # STEP 1: Add Bonuses (Stage 1)
        # -----------------------------------------------------------------
        self.step(
            r'每根蓝柱上叠了一段黄色的 bonus（探索加成）$\sqrt{2\ln t / N}$，它大致表示“真实均值最多可能比目前的平均高多少”。'
            r'$t$ 是当前轮号，等于已拉的总次数加 1：$64+16+4=84$，所以 $t = 85$；$\ln 85 \approx 4.4427$，$2\ln t \approx 8.89$（考试常给近似 $\ln 85 \approx 4.5$，得 $2\ln t \approx 9$）。'
            r'代入：臂 1 为 $\sqrt{8.89/64} \approx 0.373$，臂 2 为 $\sqrt{8.89/16} \approx 0.745$，臂 3 为 $\sqrt{8.89/4} \approx 1.490$。'
            r'**$N$ 在分母上，试得越少、越没把握，bonus 越大。** 只拉过 4 次的臂 3 加成最大，有 1.490。',
            '加上Bonus √(2 ln t / N)：臂3试得少 (N=4)，加成高达 1.49',
            stage=1
        )

        header_step1 = pill('t = 85，2 ln 85 ≈ 8.89（考试常用近似 9.0）', '#242a35', YELLOW, 16).move_to(P(290, 52))

        h_b1_init = 0.3726 * SCALE_Y
        h_b2_init = 0.7452 * SCALE_Y
        h_b3_init = 1.4904 * SCALE_Y

        top_mu1 = Y_BASE - h_mu1
        top_mu2 = Y_BASE - h_mu2
        top_mu3 = Y_BASE - h_mu3

        bar_b1_init = bar_rect(X_ARMS[0], top_mu1, h_b1_init, YELLOW, fill_opacity=0.75, stroke_color=YELLOW, stroke_width=1.5)
        bar_b2_init = bar_rect(X_ARMS[1], top_mu2, h_b2_init, YELLOW, fill_opacity=0.75, stroke_color=YELLOW, stroke_width=1.5)
        bar_b3_init = bar_rect(X_ARMS[2], top_mu3, h_b3_init, YELLOW, fill_opacity=0.75, stroke_color=YELLOW, stroke_width=1.5)

        lbl_b1_init = T('+0.373', 14, YELLOW).move_to(bar_b1_init.get_center())
        lbl_b2_init = T('+0.745', 15, YELLOW).move_to(bar_b2_init.get_center())
        lbl_b3_init = T('+1.490', 16, YELLOW).move_to(bar_b3_init.get_center())

        self.play(ReplacementTransform(header_step0, header_step1), run_time=0.4)
        self.play(
            GrowFromEdge(bar_b1_init, DOWN),
            GrowFromEdge(bar_b2_init, DOWN),
            GrowFromEdge(bar_b3_init, DOWN),
            FadeIn(lbl_b1_init),
            FadeIn(lbl_b2_init),
            FadeIn(lbl_b3_init),
            run_time=1.2
        )
        self.wait(1.2)

        # -----------------------------------------------------------------
        # STEP 2: Q = Mean + Bonus -> Pull Arm 3 (Stage 2)
        # -----------------------------------------------------------------
        self.step(
            r'柱子的总高度就是 UCB 值 $Q = \hat\mu + \text{bonus}$，可以理解为“这个臂最好可能有多好”：'
            r'$Q_1 = 0.625 + 0.373 \approx 0.998$，'
            r'$Q_2 = 0.625 + 0.745 \approx 1.370$，'
            r'$Q_3 = 0.500 + 1.490 \approx 1.990$。'
            r'若用考题近似 $\ln 85 \approx 4.5$（$2\ln t \approx 9$），根号正好开得尽：$\sqrt{9/64}=0.375$，$\sqrt{9/16}=0.75$，$\sqrt{9/4}=1.5$，$Q$ 分别是整齐的 $1.000$、$1.375$、$2.000$。'
            r'**UCB 每轮拉 $Q$ 最大的臂，所以下一轮拉臂 3：它的平均最低，但乐观估计最高。**',
            'Q = 均值 + Bonus：臂3以 1.99 胜出，乐观选择臂3',
            stage=2
        )

        top_stack1_init = top_mu1 - h_b1_init
        top_stack2_init = top_mu2 - h_b2_init
        top_stack3_init = top_mu3 - h_b3_init

        lbl_q1_init = T('Q₁ ≈ 0.998', 16, WHITE).move_to(P(X_ARMS[0], top_stack1_init - 14))
        lbl_q2_init = T('Q₂ ≈ 1.370', 16, WHITE).move_to(P(X_ARMS[1], top_stack2_init - 14))
        lbl_q3_init = T('Q₃ ≈ 1.990', 17, GREEN).move_to(P(X_ARMS[2], top_stack3_init - 14))

        self.play(FadeIn(lbl_q1_init), FadeIn(lbl_q2_init), FadeIn(lbl_q3_init), run_time=0.6)

        # Highlight Arm 3 selection
        arm3_box = SurroundingRectangle(
            VGroup(bar_mu3, bar_b3_init, lbl_q3_init),
            color=GREEN,
            buff=0.12,
            stroke_width=2.5
        )
        pick_badge = pill('选中臂 3（Q 最大）', GREEN, INK, 16).next_to(arm3_box, UP, buff=0.12)

        self.play(Create(arm3_box), FadeIn(pick_badge), Flash(P(X_ARMS[2], top_stack3_init), color=GREEN), run_time=0.9)
        self.wait(1.5)

        # -----------------------------------------------------------------
        # STEP 3: Keep Pulling Arm 3 (12 More Pulls) — ValueTracker (Stage 3)
        # -----------------------------------------------------------------
        self.step(
            r'假设接下来把臂 3 连拉 12 次，奖励交替为 $1, 0, 1, 0, \dots$，看柱子怎么变。'
            r'拉完后 $N_3 = 4+12 = 16$，12 次里有 6 次得 1，奖励总和 $2+6 = 8$，平均仍是 $8/16 = 0.500$；轮号 $t = 85+12 = 97$，$\ln 97 \approx 4.5747$。'
            r'臂 3 的 bonus 缩水到 $\sqrt{2\ln 97 / 16} \approx 0.756$，$Q_3 = 0.500 + 0.756 \approx 1.256$；'
            r'臂 2 也是 $N=16$，bonus 同样是 $0.756$，但平均更高，$Q_2 = 0.625 + 0.756 \approx 1.381$，反超臂 3'
            r'（其实 $N_3$ 到 12 时 $Q_2$ 就已更大、标签变绿，真跑 UCB 那一轮就会改拉臂 2；这里拉满 12 次是为了看清趋势）。'
            r'**多试几次，对臂 3 的不确定消失了，bonus 变小，算法自己纠正了对它的偏爱。**',
            '连试12次臂3：不确定性收窄，Bonus缩水，臂2以1.38超车！',
            stage=3
        )

        self.play(FadeOut(arm3_box), FadeOut(pick_badge), run_time=0.3)

        # Clean static objects before introducing continuous always_redraw
        self.remove(
            bar_b1_init, bar_b2_init, bar_b3_init,
            lbl_b1_init, lbl_b2_init, lbl_b3_init,
            lbl_q1_init, lbl_q2_init, lbl_q3_init,
            header_step1, arm3_init_footer
        )

        tracker = ValueTracker(0.0)

        def make_dynamic_bandit(p):
            # p from 0 to 12
            n1 = 64.0
            n2 = 16.0
            n3 = 4.0 + p
            s3 = 2.0 + 0.5 * p
            t = 85.0 + p

            ln_t = math.log(t)
            two_ln_t = 2.0 * ln_t

            b1 = math.sqrt(two_ln_t / n1)
            b2 = math.sqrt(two_ln_t / n2)
            b3 = math.sqrt(two_ln_t / n3)

            q1 = 0.625 + b1
            q2 = 0.625 + b2
            q3 = 0.500 + b3

            hb1 = b1 * SCALE_Y
            hb2 = b2 * SCALE_Y
            hb3 = b3 * SCALE_Y

            rect_b1 = bar_rect(X_ARMS[0], top_mu1, hb1, YELLOW, fill_opacity=0.75, stroke_color=YELLOW, stroke_width=1.2)
            rect_b2 = bar_rect(X_ARMS[1], top_mu2, hb2, YELLOW, fill_opacity=0.75, stroke_color=YELLOW, stroke_width=1.2)
            rect_b3 = bar_rect(X_ARMS[2], top_mu3, hb3, YELLOW, fill_opacity=0.75, stroke_color=YELLOW, stroke_width=1.2)

            txt_b1 = T(f'+{b1:.3f}', 14, YELLOW).move_to(rect_b1.get_center())
            txt_b2 = T(f'+{b2:.3f}', 15, YELLOW).move_to(rect_b2.get_center())
            txt_b3 = T(f'+{b3:.3f}', 15, YELLOW).move_to(rect_b3.get_center())

            y_top1 = top_mu1 - hb1
            y_top2 = top_mu2 - hb2
            y_top3 = top_mu3 - hb3

            col1 = WHITE
            col2 = GREEN if q2 > q3 else WHITE
            col3 = GREEN if q3 >= q2 else WHITE

            txt_q1 = T(f'Q₁ ≈ {q1:.3f}', 15, col1).move_to(P(X_ARMS[0], y_top1 - 13))
            txt_q2 = T(f'Q₂ ≈ {q2:.3f}', 16, col2).move_to(P(X_ARMS[1], y_top2 - 13))
            txt_q3 = T(f'Q₃ ≈ {q3:.3f}', 16, col3).move_to(P(X_ARMS[2], y_top3 - 13))

            hdr = pill(f'轮数 t = {int(t)}（臂3试拉 {int(p)} 次） 2 ln t = {two_ln_t:.2f}', '#242a35', YELLOW, 15).move_to(P(290, 52))
            foot3 = T(f'N={int(n3)}, s={s3:.1f}', 14, YELLOW if p > 0 else GREY).move_to(P(X_ARMS[2], 299))

            return VGroup(rect_b1, rect_b2, rect_b3, txt_b1, txt_b2, txt_b3, txt_q1, txt_q2, txt_q3, hdr, foot3)

        dyn_bandit = always_redraw(lambda: make_dynamic_bandit(tracker.get_value()))
        self.add(dyn_bandit)

        # Smooth parameter animation over 4.5 seconds
        self.play(tracker.animate.set_value(12.0), run_time=4.5)
        self.wait(1.0)

        # Highlight Arm 2 overtaking Arm 3
        final_top2 = top_mu2 - math.sqrt(2.0 * math.log(97.0) / 16.0) * SCALE_Y
        arm2_win_box = RoundedRectangle(
            corner_radius=0.12,
            width=px(82),
            height=px(138),
            color=GREEN,
            stroke_width=2.5,
            fill_opacity=0
        ).move_to(P(X_ARMS[1], 200))
        overtake_badge = pill('臂 2 成功超车！Q₂=1.381 > Q₃=1.256', GREEN, INK, 16).next_to(arm2_win_box, UP, buff=0.14)

        self.play(Create(arm2_win_box), FadeIn(overtake_badge), Flash(P(X_ARMS[1], final_top2), color=GREEN), run_time=0.9)
        self.wait(1.8)

        # -----------------------------------------------------------------
        # STEP 4: Summary & Formula Role Breakdown (Stage 4)
        # -----------------------------------------------------------------
        self.step(
            r'把公式拆开，每一项各管一件事：$Q_{t-1}(i)=\hat\mu_{t-1}(i)+\sqrt{2\ln t/N_{t-1}(i)}$，下标 $t-1$ 表示只用前 $t-1$ 轮的数据。'
            r'蓝色的平均 $\hat\mu$ 负责 exploitation（利用）：平均高的臂值高。'
            r'黄色的根号项负责 exploration（探索）：$N$ 在分母，试得少、没把握，bonus 就大，臂就有机会被试；试过发现不好，$N$ 变大、bonus 缩小，它就自然让位，不会一直浪费。'
            r'橙色标出的 $\ln t$ 在分子上，随轮数慢慢变大：没被拉的臂 $N$ 不变，bonus 会一点点补回来（刚才臂 1 就从 $0.373$ 涨到 $0.378$），所以不会永久遗漏任何臂。'
            r'**这就是 optimism in the face of uncertainty（面对不确定时保持乐观）：没把握时，先按“它最好可能有多好”来对待。**',
            '面对不确定性保持乐观：试得多变准，冷落的迟早再试',
            stage=4
        )

        # Clear dynamic updater and bars to present cleanly annotated formula
        dyn_bandit.clear_updaters()
        self.play(
            FadeOut(dyn_bandit),
            FadeOut(arm2_win_box),
            FadeOut(overtake_badge),
            FadeOut(mean_group),
            FadeOut(base_line),
            FadeOut(y_axis),
            FadeOut(axis_arr),
            FadeOut(axis_title),
            FadeOut(ticks_group),
            FadeOut(grid_group),
            FadeOut(arm_titles),
            FadeOut(arm12_footers),
            FadeOut(legend),
            run_time=0.7
        )

        # Title card for philosophy
        phil_title = T('面对不确定时保持乐观', 24, YELLOW).move_to(P(320, 65))
        phil_sub = T('Optimism in the Face of Uncertainty', 16, GREY).next_to(phil_title, DOWN, buff=0.12)

        # UCB Formula with distinct colored terms
        formula = M([r'Q_{t-1}(i)', '=', r'\hat\mu_{t-1}(i)', '+', r'\sqrt{\frac{2\ln t}{N_{t-1}(i)}}'], 38).move_to(P(320, 142))
        formula[2].set_color(BLUE)
        formula[4].set_color(YELLOW)

        # Role Annotations with pointers
        lbl_mu = T('已知的平均回报', 16, BLUE).next_to(formula[2], DOWN, buff=0.55).shift(LEFT * 0.3)
        arr_mu = Arrow(lbl_mu.get_top(), formula[2].get_bottom(), buff=0.08, color=BLUE, stroke_width=2.2, max_tip_length_to_length_ratio=0.25)

        lbl_root = T('没把握的程度：试得越少越大', 16, YELLOW).next_to(formula[4], DOWN, buff=0.55).shift(RIGHT * 0.5)
        arr_root = Arrow(lbl_root.get_top(), formula[4].get_bottom(), buff=0.08, color=YELLOW, stroke_width=2.2, max_tip_length_to_length_ratio=0.25)

        lbl_lnt = T('ln t：时间越长，\n冷落的臂慢慢补回来', 16, ORANGE).next_to(formula[4], RIGHT, buff=0.5).shift(UP * 0.35)
        arr_lnt = Arrow(lbl_lnt.get_left(), formula[4].get_corner(UR) + LEFT * 0.35 + DOWN * 0.1, buff=0.08, color=ORANGE, stroke_width=2.2, max_tip_length_to_length_ratio=0.25)

        # Bottom recap cards
        p1 = pill('试得少 (N 小) → Bonus 大 → 乐观高估获得尝试机会', YELLOW, INK, 15).move_to(P(320, 252))
        p2 = pill('试得多 (N 大) → Bonus 缩水 → 恢复真实均值，自然让位', GREEN, INK, 15).move_to(P(320, 285))

        self.play(FadeIn(phil_title), FadeIn(phil_sub), FadeIn(formula), run_time=0.8)
        self.play(
            GrowFromEdge(arr_mu, DOWN), FadeIn(lbl_mu),
            GrowFromEdge(arr_root, DOWN), FadeIn(lbl_root),
            GrowFromEdge(arr_lnt, UP), FadeIn(lbl_lnt),
            run_time=1.0
        )
        self.play(FadeIn(p1), FadeIn(p2), run_time=0.8)
        self.wait(2.2)

        # -----------------------------------------------------------------
        # Takeaway
        # -----------------------------------------------------------------
        self.takeaway(
            r'一句话：**UCB 每轮给每个臂算 $Q = \hat\mu + \sqrt{2\ln t / N}$，拉 $Q$ 最大的臂。**'
            r'试得越少 bonus 越大；时间越长，被冷落的臂 bonus 慢慢变大。'
            r'所以它先给有潜力的臂机会，多试之后不确定消失，又自然让位给真正好的臂；累积 regret（和一直拉最好的臂相比，少拿的期望奖励）只按 $O(\log t)$ 对数增长。'
            r'考试计算题（T2）就照本视频的顺序：$t$ = 已拉总次数 + 1，算每个臂的平均和 bonus，相加后选 $Q$ 最大的臂，并写一句原因。',
            [
                'UCB：Q = 均值 + √(2 ln t / N)，选 Q 最大的臂',
                '试得越少 bonus 越大；时间越长，冷落的臂慢慢变大',
                '乐观面对不确定：给潜力臂机会，多试后自然自纠',
            ]
        )
