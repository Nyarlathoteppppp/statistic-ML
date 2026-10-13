r"""BayesGrid scene (c02): Base rate fallacy and Bayes' rule with a 2000-person grid."""
import numpy as np
from manim import (
    FadeIn, FadeOut, Indicate, LaggedStart, LEFT, Line, ReplacementTransform,
    RIGHT, Square, Transform, UP, DOWN, VGroup,
)
from common import (
    BG, BLUE, DIM, GREEN, GREY, GRID, INK, M, MT, P, RED, StepScene, T, WHITE, YELLOW,
    pill, px,
)


class BayesGrid(StepScene):
    ID = 'bayes-grid'
    TITLE = '贝叶斯定理与基础率：检测阳性真的有 90% 可能患病吗？'
    FLOW = ['总体分布', '检测与误报', '汇聚阳性', '贝叶斯公式']

    def construct(self):
        # Opening question card
        self.question(
            r'体检报告显示阳性，且检测灵敏度高达 90%、误报率仅 5%。我们真的有 90% 的概率患病吗？绝大多数人都会直觉猜 90%，但真实答案让人大吃一惊。',
            ['体检阳性（灵敏度 90%、误报率 5%）', '真的有 90% 的可能患病吗？'],
            hold=2.6,
        )

        # ---------------------------------------------------------------- deterministic data
        rng = np.random.default_rng(42)
        n_total = 2000
        n_sick = 20           # 1% prevalence
        n_tp = 18             # 90% sensitivity of 20 sick
        n_fp = 99             # 5% false positive rate of 1980 healthy

        all_indices = np.arange(n_total)
        sick_indices = np.sort(rng.choice(n_total, size=n_sick, replace=False))

        tp_sub = np.sort(rng.choice(n_sick, size=n_tp, replace=False))
        tp_indices = sick_indices[tp_sub]
        fn_indices = np.setdiff1d(sick_indices, tp_indices)

        healthy_indices = np.setdiff1d(all_indices, sick_indices)
        fp_indices = np.sort(rng.choice(healthy_indices, size=n_fp, replace=False))
        tn_indices = np.setdiff1d(healthy_indices, fp_indices)

        # ---------------------------------------------------------------- population grid (50 x 40)
        squares = []
        for r in range(40):
            for c in range(50):
                x = 30.0 + c * 5.2 + 1.8
                y = 66.0 + r * 5.2 + 1.8
                sq = Square(
                    side_length=px(3.6),
                    fill_color=GREY,
                    fill_opacity=0.45,
                    stroke_color='#383e4c',
                    stroke_width=0.6,
                ).move_to(P(x, y))
                squares.append(sq)
        grid_group = VGroup(*squares)

        grid_title = T('总人群：2000 人（50 × 40 网格）', 15, GREY).move_to(P(160, 52))

        # ---------------------------------------------------------------- Step 1: All 2000 people
        self.step(
            r'假设一个 2000 人的总人群。每 1 个小方块代表 1 个人，一共 50 列 × 40 行 = 2000 人。大部分人都是健康的，此时全用灰色方块表示。',
            '总人群 2000 人：绝大多数都是健康人',
            stage=0,
        )
        # Right info cards for setup
        card_title = pill('体检场景设定', fill=BLUE, color=INK, size=18).move_to(P(465, 66))
        stat_pop = T('总体规模：2000 人', 17, WHITE).move_to(P(465, 102))
        stat_prev = T('患病率 P(D) = 1%', 17, GREY).move_to(P(465, 134))
        stat_sens = T('灵敏度 P(+|D) = 90%', 17, GREY).move_to(P(465, 166))
        stat_spec = T('误报率 P(+|¬D) = 5%', 17, GREY).move_to(P(465, 198))
        stat_guess = T('直觉猜测：阳性后患病概率 = 90%？', 16, YELLOW).move_to(P(465, 240))
        panel_step1 = VGroup(card_title, stat_pop, stat_prev, stat_sens, stat_spec, stat_guess)

        self.play(FadeIn(grid_group), FadeIn(grid_title), FadeIn(panel_step1), run_time=1.2)
        self.wait(1.2)

        # ---------------------------------------------------------------- Step 2: 20 sick ones turn RED
        self.step(
            r'该疾病的基础患病率（prior / base rate）仅为 $P(D) = 1\%$。因此在 2000 人中，真正患病的只有 $2000 \times 1\% = 20$ 人（翻红）。其余 1980 人都是健康的（灰色）。在人群中，病人极其稀少。',
            '患病率 1%：仅 20 人患病（红），1980 人健康（灰）',
            stage=0,
        )
        sick_anims = [
            squares[i].animate.set_fill(RED, opacity=0.95).set_stroke(RED, width=1.4)
            for i in sick_indices
        ]
        stat_sick = T('患病人数：2000 × 1% = 20 人', 17, RED).move_to(P(465, 134))
        stat_healthy = T('健康人群：2000 × 99% = 1980 人', 16, GREY).move_to(P(465, 162))

        self.play(
            *sick_anims,
            ReplacementTransform(stat_prev, stat_sick),
            FadeIn(stat_healthy),
            stat_sens.animate.shift(DOWN * 0.4),
            stat_spec.animate.shift(DOWN * 0.4),
            stat_guess.animate.shift(DOWN * 0.4),
            run_time=1.0,
        )
        self.wait(1.4)

        # ---------------------------------------------------------------- Step 3: Test Sensitivity 90%
        self.step(
            r'现在所有人接受体检。检测的灵敏度为 $P(+\mid D) = 90\%$（真阳性率）。在 20 名患者中，有 $20 \times 90\% = 18$ 人成功检出阳性（亮起黄色描边）；有 $20 \times 10\% = 2$ 人不幸漏检（假阴性，保持红底无黄框）。',
            '灵敏度 90%：20 名患者中 18 人检出阳性（黄框红心）',
            stage=1,
        )
        tp_anims = [
            squares[i].animate.set_stroke(YELLOW, width=2.4)
            for i in tp_indices
        ]
        stat_tp = T('真阳性：20 × 90% = 18 人（黄框）', 17, YELLOW).move_to(P(465, 206))
        stat_fn = T('漏检（假阴性）：2 人', 15, GREY).move_to(P(465, 232))

        self.play(
            *tp_anims,
            stat_sens.animate.set_color(YELLOW),
            FadeIn(stat_tp),
            FadeIn(stat_fn),
            stat_spec.animate.shift(DOWN * 0.8),
            stat_guess.animate.shift(DOWN * 0.8),
            run_time=1.0,
        )
        self.wait(1.4)

        # ---------------------------------------------------------------- Step 4: False Positive Rate 5%
        self.step(
            r'但是，检测对健康人有 $P(+\mid \neg D) = 5\%$ 的误报率（假阳性率）。虽然 5% 看起来很小，但健康人群高达 1980 人！$1980 \times 5\% = 99$ 人被误报为阳性（黄色描边亮起）。看全场：健康误报的 99 人，反而远多于真正患病的 18 人！',
            '误报率 5%：1980 名健康人产生 99 人假阳性！99 > 18',
            stage=1,
        )
        fp_anims = [
            squares[i].animate.set_stroke(YELLOW, width=2.0)
            for i in fp_indices
        ]
        stat_fp = T('假阳性：1980 × 5% = 99 人！', 17, YELLOW).move_to(P(465, 284))
        stat_shock = pill('99 假阳性  远多于  18 真阳性！', fill='#3b1d1d', color=YELLOW, size=15).move_to(P(465, 316))

        self.play(
            LaggedStart(*fp_anims, lag_ratio=0.008),
            stat_spec.animate.set_color(YELLOW),
            FadeIn(stat_fp),
            FadeIn(stat_shock),
            FadeOut(stat_guess),
            run_time=1.4,
        )
        self.wait(1.8)

        # ---------------------------------------------------------------- Step 5: Collect Positives
        self.step(
            r'现在，如果你拿到阳性报告，你就只属于这群黄框阳性者（共 $18 + 99 = 117$ 人）。把 1883 名阴性者压暗，把所有阳性者聚在一起对比：18 个真患者 vs 99 个健康人。你真正患病的概率只有 $18 / (18 + 99) = 18 / 117 \approx 15.4\%$！绝非直觉的 90%。',
            '汇聚所有阳性：18 患病 vs 99 健康，患病率仅 18/117 ≈ 15.4%',
            stage=2,
        )
        # Dim all negative squares in the population grid
        neg_indices = np.concatenate([tn_indices, fn_indices])
        neg_group = VGroup(*[squares[i] for i in neg_indices])

        # Clear right panel from steps 1-4
        panel_old = VGroup(
            card_title, stat_pop, stat_sick, stat_healthy,
            stat_sens, stat_tp, stat_fn, stat_spec, stat_fp, stat_shock,
        )

        # Build target layouts side by side on the right:
        # Group 1: 18 true positives (2 cols x 9 rows, RED fill, YELLOW stroke)
        # Group 2: 99 false positives (11 cols x 9 rows, GREY fill, YELLOW stroke)
        tp_targets = []
        for c in range(2):
            for r in range(9):
                x = 392.0 + c * 9.6 + 4.0
                y = 80.0 + r * 9.6 + 4.0
                t_sq = Square(
                    side_length=px(7.2),
                    fill_color=RED,
                    fill_opacity=0.95,
                    stroke_color=YELLOW,
                    stroke_width=2.0,
                ).move_to(P(x, y))
                tp_targets.append(t_sq)

        fp_targets = []
        for c in range(11):
            for r in range(9):
                x = 428.0 + c * 9.6 + 4.0
                y = 80.0 + r * 9.6 + 4.0
                t_sq = Square(
                    side_length=px(7.2),
                    fill_color=GREY,
                    fill_opacity=0.55,
                    stroke_color=YELLOW,
                    stroke_width=2.0,
                ).move_to(P(x, y))
                fp_targets.append(t_sq)

        lbl_g1 = T('患病阳性 18', 15, RED).move_to(P(401, 62))
        lbl_g2 = T('健康假阳性 99', 15, YELLOW).move_to(P(480, 62))

        fly_tp = [ReplacementTransform(squares[tp_indices[k]], tp_targets[k]) for k in range(18)]
        fly_fp = [ReplacementTransform(squares[fp_indices[k]], fp_targets[k]) for k in range(99)]

        self.play(
            FadeOut(panel_old),
            neg_group.animate.set_opacity(0.10),
            run_time=0.6,
        )

        self.play(
            FadeIn(lbl_g1),
            FadeIn(lbl_g2),
            LaggedStart(*fly_tp, lag_ratio=0.02),
            LaggedStart(*fly_fp, lag_ratio=0.008),
            run_time=1.8,
        )

        # Labels below the two groups
        all_pos_lbl = T('所有检测阳性者 = 18 + 99 = 117 人', 17, WHITE).move_to(P(465, 192))
        ratio_eq = M(
            r'P(D\mid +) = \frac{18}{18 + 99} = \frac{18}{117} \approx 0.154\ \ (15.4\%)',
            22,
            YELLOW,
        ).move_to(P(465, 230))
        insight_text = T('阳性者中仅约 15.4% 真正患病！', 16, GREEN).move_to(P(465, 270))

        self.play(
            FadeIn(all_pos_lbl),
            FadeIn(ratio_eq),
            FadeIn(insight_text),
            run_time=0.8,
        )
        self.wait(1.8)

        # ---------------------------------------------------------------- Step 6: Bayes' rule formula
        self.step(
            r'这正是教材中的贝叶斯公式：$P(D\mid +) = \frac{P(+\mid D)P(D)}{P(+)} = \frac{0.9\times0.01}{0.9\times0.01 + 0.05\times0.99} = \frac{0.009}{0.0585} \approx 0.154$。分子是病人阳性（0.009），分母用 sum rule 展开：病人阳性 + 健康假阳性（0.0585）。代数公式和刚才方块计数的本质完全一致！',
            '贝叶斯公式：分子为病人阳性，分母为所有阳性之和',
            stage=3,
        )
        # Assemble Bayes formula matching the colors of the two groups
        num_tex = M(r'0.9 \times 0.01', 20, RED)
        den_tp = M(r'0.9 \times 0.01', 20, RED)
        den_plus = M(r'+', 20, WHITE)
        den_fp = M(r'0.05 \times 0.99', 20, YELLOW)
        den_row = VGroup(den_tp, den_plus, den_fp).arrange(RIGHT, buff=0.1)

        f_line = Line(LEFT, RIGHT, stroke_width=2.0, color=WHITE).set_width(den_row.width + 0.25)
        f_line.move_to(P(465, 226))
        num_tex.next_to(f_line, UP, buff=0.12)
        den_row.next_to(f_line, DOWN, buff=0.12)

        bayes_lhs = M(r'P(D\mid +) =', 21, WHITE).next_to(f_line, LEFT, buff=0.14)
        bayes_rhs = M(r'= \frac{0.009}{0.0585} \approx 0.154', 21, WHITE).next_to(f_line, RIGHT, buff=0.14)

        bayes_formula = VGroup(bayes_lhs, num_tex, f_line, den_row, bayes_rhs)
        if bayes_formula.width > px(290):
            bayes_formula.scale_to_fit_width(px(290))
            bayes_formula.move_to(P(465, 226))

        # Role annotations under/above terms
        ann_num = T('病人里的阳性', 12, RED).next_to(num_tex, UP, buff=0.10)
        ann_tp = T('病人阳性', 13, RED).next_to(den_tp, DOWN, buff=0.16)
        ann_fp = T('健康假阳性', 13, YELLOW).next_to(den_fp, DOWN, buff=0.16)

        final_summary = T('罕见病体检中：假阳性人数往往反超真阳性！', 15, WHITE).move_to(P(465, 304))

        self.play(
            FadeOut(all_pos_lbl),
            FadeOut(ratio_eq),
            FadeOut(insight_text),
            run_time=0.5,
        )

        self.play(
            FadeIn(bayes_formula),
            FadeIn(ann_num),
            FadeIn(ann_tp),
            FadeIn(ann_fp),
            FadeIn(final_summary),
            run_time=1.0,
        )

        # Colour links: pulse group 1 (red) with 0.9 x 0.01, then group 2 (yellow) with 0.05 x 0.99
        g1_group = VGroup(*tp_targets)
        g2_group = VGroup(*fp_targets)

        self.play(
            Indicate(g1_group, color=RED),
            Indicate(num_tex, color=RED),
            Indicate(den_tp, color=RED),
            run_time=1.0,
        )
        self.play(
            Indicate(g2_group, color=YELLOW),
            Indicate(den_fp, color=YELLOW),
            run_time=1.0,
        )
        self.wait(2.2)

        # ---------------------------------------------------------------- Takeaway
        self.takeaway(
            r'**核心结论**：体检阳性不等于 90% 患病。因为基础患病率极低（1%），健康人群庞大（99%），5% 的假阳性人数（99 人）远超真阳性（18 人）。阳性后患病概率只有 $18 / (18 + 99) = 0.009 / 0.0585 \approx 15.4\%$。考试中遇到 Bayes 定理题，牢记分母必须用 sum rule 展开（真阳性 + 假阳性），在草稿上化成 1000 或 2000 人算自然频数最不容易错！',
            [
                '体检阳性 ≠ 90% 患病：后验受先验（基础率）强烈制约',
                'P(D|+) = 18 / (18 + 99) = 0.009 / 0.0585 ≈ 15.4%',
                '考点：Bayes 分母用 sum rule 展开，罕见病假阳性常占主体',
            ],
            hold=3.5,
        )
