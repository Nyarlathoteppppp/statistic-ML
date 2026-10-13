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
            r"体检报告是阳性。这种检测能查出 90% 的病人，对健康人只有 5% 会误报。那你真的有 90% 的可能患病吗？多数人凭直觉回答 90%，真实答案却远没有这么高。要算对，就要用 Bayes' theorem（贝叶斯定理）：把“有病时阳性”的概率，反过来变成“阳性时有病”的概率。",
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
            r'左边每个灰色小方块代表 1 个人，50 列 × 40 行，共 $50\times40=2000$ 人。右边是题目给的三个数：患病率 $P(D)=1\%$，灵敏度 $P(+\mid D)=90\%$，误报率 $P(+\mid\neg D)=5\%$。$D$ 表示有病，$\neg D$ 表示没病，$+$ 表示检测阳性；$P(+\mid D)$ 读作“有病的前提下检测阳性的概率”。下面不直接套公式，而是把百分比换成人数一个个数。',
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
            r'有 20 个方块变红：他们是真正有病的人。患病率 $P(D)=1\%$ 是做检测之前就知道的比例，叫 prior（先验），也叫 base rate（基础率）。所以 2000 人里有病的是 $2000\times1\%=20$ 人，健康的是 $2000\times99\%=1980$ 人（仍是灰色）。病人只是一小撮，健康人占了绝大多数。',
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
            r'现在所有人都做检测。20 个红色病人里有 18 个加上了黄框：他们被查出阳性。灵敏度 $P(+\mid D)=90\%$ 的意思是“有病的人里有 90% 检测阳性”，所以 $20\times90\%=18$ 人，叫 true positive（真阳性）。剩下 $20\times10\%=2$ 人有病却没查出来，叫 false negative（假阴性），他们仍是红色、没有黄框。',
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
            r'接着，灰色的健康人里也有很多方块亮起黄框。误报率 $P(+\mid\neg D)=5\%$ 的意思是“没病的人里也有 5% 检测阳性”，这些人叫 false positive（假阳性）。5% 听起来很小，但它乘的是 1980 个健康人：$1980\times5\%=99$ 人。**健康人里的假阳性有 99 人，比病人里的真阳性 18 人多得多。**',
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
            r'假设你拿到了阳性报告，那你一定是黄框中的一个。所以把阴性的 $2000-117=1883$ 人压暗，只把阳性的人搬到右边：18 个红色病人，99 个灰色健康人，共 $18+99=117$ 人。你患病的概率就是病人在其中占的比例：$P(D\mid +)=\frac{18}{18+99}=\frac{18}{117}\approx0.154$。这叫 posterior（后验），读作“阳性的前提下有病的概率”。**阳性后真正患病的概率只有约 15.4%，不是 90%：90% 是 $P(+\mid D)$，我们要的是反过来的 $P(D\mid +)$。**',
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
            r'把人数换回概率，就是贝叶斯公式 $P(D\mid +)=\frac{P(+\mid D)P(D)}{P(+)}$。红色分子 $P(+\mid D)P(D)=0.9\times0.01=0.009$ 是“患病且阳性”的 joint probability（联合概率）$P(+,D)$：注意 $0.9$ 只是 $P(+\mid D)$（病人里有多少阳性），乘上患病率 $P(D)=0.01$ 后才是“随便抽一人，既患病又阳性”的概率。分母 $P(+)$ 是所有阳性的概率，用 sum rule（求和规则）拆成两条路相加：$P(+)=P(+,D)+P(+,\neg D)$（分母下方那一行），即红色的患病且阳性 $0.009$，加黄色的健康但假阳性 $P(+\mid\neg D)P(\neg D)=0.05\times0.99=0.0495$，合计 $0.009+0.0495=0.0585$。所以 $P(D\mid +)=\frac{0.009}{0.0585}\approx0.154$，和数方块的结果一样：乘以 2000 人，$0.009\times2000=18$，$0.0495\times2000=99$。**分母必须把“患病且阳性”和“健康但假阳性”两条路都加上。**',
            '分子：患病且阳性；分母：所有阳性 = 患病阳性 + 健康假阳性',
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
        ann_num = T('患病且阳性（联合概率）', 15, RED).next_to(num_tex, UP, buff=0.10)
        ann_tp = T('患病且阳性', 15, RED)
        ann_fp = T('健康但假阳性', 15, YELLOW)
        ann_den = VGroup(ann_tp, T('+', 15, WHITE), ann_fp).arrange(RIGHT, buff=0.1).next_to(den_row, DOWN, buff=0.16)
        # the same split in symbols: P(+) = P(+, D) + P(+, not D)
        sum_rule = M([r'P(+)=', r'P(+,D)', r'+', r'P(+,\neg D)'], 19, WHITE)
        sum_rule[1].set_color(RED)
        sum_rule[3].set_color(YELLOW)
        sum_rule.next_to(ann_den, DOWN, buff=0.16)

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
            FadeIn(ann_den),
            FadeIn(sum_rule),
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
            r'**阳性后患病的概率 $P(D\mid +)$ 不等于灵敏度 $P(+\mid D)$，它还受患病率这个先验的强烈影响。**患病率只有 1%，健康人占 99%，所以 5% 的误报也有 99 人，多过 18 个真阳性。公式：$P(D\mid +)=\frac{P(+\mid D)P(D)}{P(+\mid D)P(D)+P(+\mid\neg D)P(\neg D)}=\frac{0.009}{0.0585}\approx15.4\%$，也就是 $18/(18+99)$。考试的 Bayes 计算题，关键是分母用 sum rule 展开成“真阳性 + 假阳性”；草稿上先换成 1000 或 2000 人来数，最不容易错。',
            [
                '体检阳性 ≠ 90% 患病：后验受先验（基础率）强烈制约',
                'P(D|+) = 18 / (18 + 99) = 0.009 / 0.0585 ≈ 15.4%',
                '考点：Bayes 分母用 sum rule 展开，罕见病假阳性常占主体',
            ],
            hold=3.5,
        )
