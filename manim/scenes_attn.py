"""c41 · Attention: score -> softmax -> weighted average.

Port of anim-attention in js/viz/scenes_b.js (COMP90051 exam review).
Notation follows c41: hidden states h^(j), scores e_j, exp(x) (never e^x, to avoid
confusion with the score e_j), alpha_j = exp(e_j) / sum_j' exp(e_j'), c = sum_j alpha_j h^(j).
Dual-panel layout:
- Left panel: 2D vector space with Query q = (1, 0) and candidate hidden states
  h^(1) = (1, 1.5), h^(2) = (2, -0.5), h^(3) = (0, -2).
  Dot product scores e_j = q · h^(j) = (1, 2, 0) are highlighted signed lengths along
  the axis of q from the origin to the foot of each perpendicular drop; the tick
  labels 0 / 1 / 2 turn into e_3 = 0 / e_1 = 1 / e_2 = 2 at the feet.
  Tip-to-tail addition demonstrates context vector c = sum alpha_j h^(j) ≈ (1.58, -0.15)
  landing closest to h^(2).
- Right panel: computation panel with bar charts and role-annotated Softmax formula.
  Stage 1: scores e = (1, 2, 0).
  Stage 2: exponentials (2.72, 7.39, 1.00), sum Z ≈ 11.11,
           normalized weights α = (0.245, 0.665, 0.090).
"""
import numpy as np
from manim import (
    BackgroundRectangle,
    GrowArrow,
    Transform,
    Arrow,
    Circle,
    Create,
    DashedLine,
    Dot,
    DOWN,
    FadeIn,
    FadeOut,
    Flash,
    Indicate,
    LEFT,
    Line,
    Rectangle,
    RIGHT,
    RoundedRectangle,
    ReplacementTransform,
    UP,
    VGroup,
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

# Left panel 2D coordinate system setup
X0 = 64.0
Y0 = 172.0
SCALE = 66.0


def c2p(x, y):
    """Map 2D data coordinate (x, y) to layout point via P()."""
    return P(X0 + x * SCALE, Y0 - y * SCALE)


# Right panel bar chart layout
BX = [340.0, 440.0, 540.0]
BAR_W = 44.0
Y_BASE = 265.0
COLORS = [BLUE, GREEN, PURPLE]


def make_bar(j, height_px, color=None):
    """Create a rectangular bar anchored at Y_BASE."""
    if color is None:
        color = COLORS[j]
    h = max(height_px, 2.5)
    return Rectangle(
        width=px(BAR_W),
        height=px(h),
        fill_color=color,
        fill_opacity=0.88,
        stroke_color=color,
        stroke_width=1.5,
    ).move_to(P(BX[j], Y_BASE - h / 2.0))


def mpill(s, fill=YELLOW, color=INK, size=24):
    """pill() with MT() text, for real sub/superscripts such as h<sup>(2)</sup>."""
    t = MT(s, size, color)
    box = RoundedRectangle(corner_radius=0.12, width=t.width + 0.3, height=t.height + 0.2,
                           fill_color=fill, fill_opacity=1, stroke_width=0)
    return VGroup(box, t.move_to(box))


class Attention(StepScene):
    ID = 'attention'
    TITLE = 'Attention：打分 → Softmax → 加权平均'
    FLOW = ['输入与候选向量', '第1步：点积打分', '第2步：Softmax', '第3步：加权融合']

    def construct(self):
        # -------------------------------------------------- Opening Question
        self.question(
            r'翻译一句话时，encoder（编码器）给输入的每个位置都存了一个向量，decoder（解码器）每写一个词，只需要重点看其中最相关的几个。最省事的做法是只挑一个最像的，其余都不看。**能不能按相关程度给每条记忆一份权重，各取一部分？**这就是 attention（注意力）要做的事。',
            ['面对多个记忆，怎样挑选出最相关的重点？', '只能硬选一个吗？能不能按相关程度各取一部分？'],
        )

        # -------------------------------------------------- Step 1 (Stage 0): Setup vectors
        self.step(
            r'左边的黄色箭头是 query（查询）$\mathbf q=(1,0)$，代表解码器这一步“想找什么”。q 不是凭空给的：翻译时它由解码器上一步的状态 $\mathbf s^{(i-1)}$ 得到（本章下文细讲）；这里为了好画，直接取 $(1,0)$。蓝、绿、紫三支箭头是输入三个位置的 hidden state（隐藏状态），也就是三条候选记忆：$\mathbf h^{(1)}=(1,1.5)$，$\mathbf h^{(2)}=(2,-0.5)$，$\mathbf h^{(3)}=(0,-2)$，坐标标在箭头尖旁边。上标 $(j)$ 表示输入的第 $j$ 个位置，不是次方。右边按位置 1、2、3 排好，接下来在这里画每个位置的分数和权重。',
            'Query q 提出问题，h<sup>(1)</sup>、h<sup>(2)</sup>、h<sup>(3)</sup> 是三个候选记忆向量',
            stage=0,
        )

        # 2D Coordinate axes on the left
        x_axis = Line(c2p(-0.6, 0), c2p(2.7, 0), color=GREY, stroke_width=1.5)
        y_axis = Line(c2p(0, -2.25), c2p(0, 1.8), color=GREY, stroke_width=1.5)
        x_lbl = M(r'x', 19, GREY).next_to(c2p(2.7, 0), RIGHT, buff=px(4))
        y_lbl = M(r'y', 19, GREY).next_to(c2p(0, 1.8), UP, buff=px(4))
        tick1 = Line(c2p(1, -0.06), c2p(1, 0.06), color=GREY, stroke_width=1.2)
        tick2 = Line(c2p(2, -0.06), c2p(2, 0.06), color=GREY, stroke_width=1.2)
        # Tick labels sit just under the axis (above the h(2) arrow); in step 2 they turn into the
        # score labels at the feet, so nothing is left under the axis when the score segments appear.
        tick1_lbl = T('1', 15, '#9aa3b2').next_to(c2p(1, 0), DOWN, buff=px(4))
        tick2_lbl = T('2', 15, '#9aa3b2').next_to(c2p(2, 0), DOWN, buff=px(4))
        origin_lbl = T('0', 15, '#9aa3b2').next_to(c2p(0, 0), DL, buff=px(4))
        tick_lbls = VGroup(tick1_lbl, tick2_lbl, origin_lbl)
        axes_group = VGroup(x_axis, y_axis, x_lbl, y_lbl, tick1, tick2)

        # Query vector q = (1, 0)
        q_arrow = Arrow(
            c2p(0, 0),
            c2p(1, 0),
            buff=0,
            color=YELLOW,
            stroke_width=4.5,
            max_tip_length_to_length_ratio=0.22,
        )
        q_lbl = (
            VGroup(M(r'\mathbf{q}', 20, YELLOW), T('(1, 0)', 15, YELLOW))
            .arrange(RIGHT, buff=px(4))
            .next_to(c2p(1, 0), UR, buff=px(4))      # above the axis: clear of ticks and h(2)
        )

        # Candidate vectors h1, h2, h3
        h1_arrow = Arrow(
            c2p(0, 0),
            c2p(1, 1.5),
            buff=0,
            color=BLUE,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.22,
        )
        h1_lbl = (
            VGroup(M(r'\mathbf h^{(1)}', 20, BLUE), T('(1, 1.5)', 15, BLUE))
            .arrange(RIGHT, buff=px(4))
            .next_to(c2p(1, 1.5), UR, buff=px(4))
        )

        h2_arrow = Arrow(
            c2p(0, 0),
            c2p(2, -0.5),
            buff=0,
            color=GREEN,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.22,
        )
        h2_lbl = (
            VGroup(M(r'\mathbf h^{(2)}', 20, GREEN), T('(2, −0.5)', 15, GREEN))
            .arrange(RIGHT, buff=px(4))
            .next_to(c2p(2, -0.5), RIGHT, buff=px(6))
        )

        h3_arrow = Arrow(
            c2p(0, 0),
            c2p(0, -2.0),
            buff=0,
            color=PURPLE,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.22,
        )
        h3_lbl = (
            VGroup(M(r'\mathbf h^{(3)}', 20, PURPLE), T('(0, −2)', 15, PURPLE))
            .arrange(RIGHT, buff=px(4))
            .next_to(c2p(0, -2.0), RIGHT, buff=px(6))
        )

        # Baseline and position labels for bar chart on the right
        bar_base_line = Line(P(290, Y_BASE), P(590, Y_BASE), color=GREY, stroke_width=1.5)
        pos_lbls = VGroup(
            T('位置 1', 15, GREY).move_to(P(BX[0], Y_BASE + 14)),
            T('位置 2', 15, GREY).move_to(P(BX[1], Y_BASE + 14)),
            T('位置 3', 15, GREY).move_to(P(BX[2], Y_BASE + 14)),
        )
        vec_names = VGroup(
            M(r'\mathbf h^{(1)}', 19, BLUE).move_to(P(BX[0], Y_BASE + 31)),
            M(r'\mathbf h^{(2)}', 19, GREEN).move_to(P(BX[1], Y_BASE + 31)),
            M(r'\mathbf h^{(3)}', 19, PURPLE).move_to(P(BX[2], Y_BASE + 31)),
        )

        self.play(FadeIn(axes_group), FadeIn(tick_lbls), run_time=0.6)
        self.play(
            GrowArrow(q_arrow),
            FadeIn(q_lbl),
            GrowArrow(h1_arrow),
            FadeIn(h1_lbl),
            GrowArrow(h2_arrow),
            FadeIn(h2_lbl),
            GrowArrow(h3_arrow),
            FadeIn(h3_lbl),
            FadeIn(bar_base_line),
            FadeIn(pos_lbls),
            FadeIn(vec_names),
            run_time=1.2,
        )
        self.wait(1.2)

        # -------------------------------------------------- Step 2 (Stage 1): Dot product scores
        self.step(
            r'第 1 步打分：从每支箭头的尖向横轴画虚线，找到垂足；原点到垂足的那段彩色线段就是这条记忆的分数，轴上的刻度 $0,1,2$ 变成了三个分数。分数用 dot product（点积）算，$e_j=\mathbf q\cdot\mathbf h^{(j)}$；c03 讲过：点积 = 投影长度 × 另一支箭头的长度；这里 $\mathbf q=(1,0)$ 的长度 $|\mathbf q|=1$，所以点积正好等于这段带正负号的投影长度。**和 query 越像的记忆，分数越高。**逐个算：$e_1=1\times1+0\times1.5=1$，$e_2=1\times2+0\times(-0.5)=2$，$e_3=1\times0+0\times(-2)=0$，右边柱子画出 $(1,2,0)$，位置 2 最高。',
            '点积 e<sub>j</sub> = q·h<sup>(j)</sup>：q 是单位向量，分数 = 投影的有符号长度',
            stage=1,
        )

        # Perpendiculars dropped from h_j to q's axis (x-axis)
        perp1 = DashedLine(
            c2p(1, 1.5),
            c2p(1, 0),
            color=BLUE,
            stroke_width=2,
            stroke_opacity=0.65,
            dash_length=px(4),
        )
        perp2 = DashedLine(
            c2p(2, -0.5),
            c2p(2, 0),
            color=GREEN,
            stroke_width=2,
            stroke_opacity=0.65,
            dash_length=px(4),
        )
        perp3 = DashedLine(
            c2p(0, -2.0),
            c2p(0, 0),
            color=PURPLE,
            stroke_width=2,
            stroke_opacity=0.65,
            dash_length=px(4),
        )
        foot_dots = VGroup(
            Dot(c2p(1, 0), radius=px(3.5), color=BLUE),
            Dot(c2p(2, 0), radius=px(3.5), color=GREEN),
            Dot(c2p(0, 0), radius=px(3.5), color=PURPLE),
        )

        # Highlighted score projection segments from origin to foot along q's axis
        proj1 = Line(c2p(0, 0.08), c2p(1, 0.08), color=BLUE, stroke_width=5.5)
        proj1_lbl = M(r'e_1=1', 20, BLUE).next_to(c2p(0.63, 0.08), UP, buff=px(3))

        proj2 = Line(c2p(0, -0.08), c2p(2, -0.08), color=GREEN, stroke_width=5.5)
        proj2_lbl = M(r'e_2=2', 20, GREEN).next_to(c2p(2, 0), UR, buff=px(4))     # at the green foot

        proj3_lbl = M(r'e_3=0', 20, PURPLE).next_to(c2p(0, 0), DL, buff=px(4))    # replaces the origin's 0

        score_pedagogy = pill('虚线找垂足，轴上线段才是得分！', YELLOW, INK, 16).move_to(P(150, 333))

        # Right panel: score header and score bars
        score_header = VGroup(
            M(r'e_j = \mathbf{q} \cdot \mathbf h^{(j)}', 24, YELLOW),
            T('（打分：与 query 越像的分数越高）', 15, GREY),
        ).arrange(RIGHT, buff=px(6)).move_to(P(440, 72))

        # Bar heights for scores: scale 50 px/unit
        bars_step2 = [
            make_bar(0, 50.0),
            make_bar(1, 100.0),
            make_bar(2, 2.5),
        ]
        bar_vals_step2 = VGroup(
            T('1.0', 18, BLUE).move_to(P(BX[0], Y_BASE - 50.0 - 13)),
            T('2.0', 18, GREEN).move_to(P(BX[1], Y_BASE - 100.0 - 13)),
            T('0.0', 18, PURPLE).move_to(P(BX[2], Y_BASE - 2.5 - 13)),
        )

        self.play(
            Create(perp1),
            Create(perp2),
            Create(perp3),
            FadeIn(foot_dots),
            FadeIn(score_pedagogy),
            run_time=0.8,
        )
        self.play(
            Create(proj1),
            ReplacementTransform(tick1_lbl, proj1_lbl),
            Create(proj2),
            ReplacementTransform(tick2_lbl, proj2_lbl),
            ReplacementTransform(origin_lbl, proj3_lbl),
            FadeIn(score_header),
            *[FadeIn(b) for b in bars_step2],
            FadeIn(bar_vals_step2),
            run_time=1.0,
        )
        self.wait(1.5)

        # -------------------------------------------------- Step 3 (Stage 2): Softmax exp
        self.step(
            r'第 2 步是 softmax（归一化指数函数），先做前半：给每个分数取指数。这里 $\exp(x)$ 就是 $e^x$，$e\approx2.718$ 是一个固定的常数（自然常数）；本章写成 exp，是为了不和分数 $e_j$ 混淆。于是柱子变成 $\exp(1)=e\approx2.72$，$\exp(2)=e\times e\approx2.718\times2.718\approx7.39$，$\exp(0)=1$（任何数的 0 次方都是 1）。**取指数有两个作用：分数哪怕是负的，结果也一定是正数；大的分数被放得更大，差距迅速拉开。**再把三个数加起来，得总和 $Z=2.72+7.39+1.00\approx11.11$，下一步要用。',
            '取指数 exp(e<sub>j</sub>)：把所有分数变成正数，并迅速拉开差距',
            stage=2,
        )

        exp_header = VGroup(
            M(r'\exp(e_j)', 24, YELLOW),
            T('分子：把分数变成正数、拉开差距', 15, YELLOW),
        ).arrange(RIGHT, buff=px(8)).move_to(P(440, 72))

        # Bars for exponentials: scale 15 px/unit
        # exp(1) = 2.718 -> 40.8 px, exp(2) = 7.389 -> 110.8 px, exp(0) = 1.0 -> 15.0 px
        bars_step3 = [
            make_bar(0, 40.8),
            make_bar(1, 110.8),
            make_bar(2, 15.0),
        ]
        bar_vals_step3 = VGroup(
            T('2.72', 18, BLUE).move_to(P(BX[0], Y_BASE - 40.8 - 13)),
            T('7.39', 18, GREEN).move_to(P(BX[1], Y_BASE - 110.8 - 13)),
            T('1.00', 18, PURPLE).move_to(P(BX[2], Y_BASE - 15.0 - 13)),
        )
        sum_note = (
            VGroup(
                T('总和 ', 16, GREY),
                M(r'Z = 2.72 + 7.39 + 1.00 \approx 11.11', 18, WHITE),
            )
            .arrange(RIGHT, buff=px(4))
            .move_to(P(440, 126))
        )

        self.play(
            ReplacementTransform(score_header, exp_header),
            ReplacementTransform(bars_step2[0], bars_step3[0]),
            ReplacementTransform(bars_step2[1], bars_step3[1]),
            ReplacementTransform(bars_step2[2], bars_step3[2]),
            ReplacementTransform(bar_vals_step2, bar_vals_step3),
            FadeIn(sum_note),
            run_time=1.0,
        )
        self.wait(1.5)

        # -------------------------------------------------- Step 4 (Stage 2): Softmax normalization
        self.step(
            r'后半：每个指数除以总和 $Z\approx11.11$，得到 attention weight（注意力权重）$\alpha_j$；右上方的公式里，分子是自己的指数，分母是所有位置的指数之和。分母里的 $j^\prime$ 只是求和用的计数字母：$\sum_{j^\prime}$ 表示让 $j^\prime$ 依次取 1、2、3，把三个指数全加起来；换个字母，是为了和分子里那个固定的 $j$ 分开。$\alpha_1=2.72/11.11\approx0.245$（$24.5\%$），$\alpha_2=7.39/11.11\approx0.665$（$66.5\%$），$\alpha_3=1.00/11.11\approx0.090$（$9.0\%$）。**除以总和以后，权重都是正数，而且加起来正好等于 1。**分数 $e_2$ 只是 $e_1$ 的 2 倍，位置 2 却拿走了将近三分之二的权重，这就是取指数拉开差距的效果。',
            '除以总和 11.11 归一化为权重 α：位置 2 独占 66.5%',
            stage=2,
        )

        # Role-annotated Softmax formula
        sm_formula = M(
            r'\alpha_j = \frac{\exp(e_j)}{\sum_{j^\prime} \exp(e_{j^\prime})}',
            28,
            WHITE,
        ).move_to(P(440, 84))

        num_annot = T('分子：把分数变成正数、拉开差距', 17, YELLOW).next_to(sm_formula, UP, buff=0.1)
        num_arrow = VGroup()

        den_annot = T('分母：除以总和 ⇒ 加起来等于 1', 17, TEAL).next_to(sm_formula, DOWN, buff=0.1)
        den_arrow = VGroup()

        sm_group = VGroup(sm_formula, num_annot, num_arrow, den_annot, den_arrow)

        # Bars for normalized weights: scale 165 px/unit
        # α = (0.2447, 0.6652, 0.0900) -> heights (40.4, 109.8, 14.8) px
        bars_step4 = [
            make_bar(0, 40.4),
            make_bar(1, 109.8),
            make_bar(2, 14.8),
        ]
        bar_vals_step4 = VGroup(
            VGroup(T('0.245', 18, BLUE), T('24.5%', 14, GREY))
            .arrange(DOWN, buff=px(2))
            .move_to(P(BX[0], Y_BASE - 40.4 - 18)),
            VGroup(T('0.665', 18, GREEN), T('66.5%', 14, GREEN))
            .arrange(DOWN, buff=px(2))
            .move_to(P(BX[1], Y_BASE - 109.8 - 18)),
            VGroup(T('0.090', 18, PURPLE), T('9.0%', 14, GREY))
            .arrange(DOWN, buff=px(2))
            .move_to(P(BX[2], Y_BASE - 14.8 - 18)),
        )

        self.play(
            FadeOut(exp_header),
            FadeOut(sum_note),
            FadeIn(sm_group),
            ReplacementTransform(bars_step3[0], bars_step4[0]),
            ReplacementTransform(bars_step3[1], bars_step4[1]),
            ReplacementTransform(bars_step3[2], bars_step4[2]),
            ReplacementTransform(bar_vals_step3, bar_vals_step4),
            run_time=1.0,
        )
        self.play(Indicate(bars_step4[1], color=YELLOW), run_time=0.8)
        self.wait(1.5)

        # -------------------------------------------------- Step 5 (Stage 3): Tip-to-tail context vector
        self.step(
            r'第 3 步加权平均：每支箭头先乘上自己的权重、变短，再首尾相接连成一串。两个向量相加就是横、纵坐标分别相加；画在图上，等于把第二支箭头的尾巴接到第一支的尖上，终点就是和。三支依次接上，终点就是三者之和。缩短后的三支是 $\alpha_1\mathbf h^{(1)}=0.245\times(1,1.5)=(0.245,0.3675)$，$\alpha_2\mathbf h^{(2)}=0.665\times(2,-0.5)=(1.33,-0.3325)$，$\alpha_3\mathbf h^{(3)}=0.090\times(0,-2)=(0,-0.18)$。从原点指向这串终点的红色箭头就是 context vector（上下文向量）$\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$：横坐标 $0.245+1.33+0=1.575$，纵坐标 $0.3675-0.3325-0.18=-0.145$，所以 $\mathbf c\approx(1.58,-0.15)$。**$\mathbf h^{(2)}$ 的权重最大、贡献最多，所以 $\mathbf c$ 在三条记忆里最靠近 $\mathbf h^{(2)}$。**query 找到了和它最匹配的那条记忆。',
            '按权重缩短后首尾相接（= 向量相加）：c 最靠近 h<sup>(2)</sup>',
            stage=3,
        )

        # Dim previous annotations and vectors on the left
        self.play(
            FadeOut(perp1),
            FadeOut(perp2),
            FadeOut(perp3),
            FadeOut(foot_dots),
            FadeOut(proj1),
            FadeOut(proj1_lbl),
            FadeOut(proj2),
            FadeOut(proj2_lbl),
            FadeOut(proj3_lbl),
            FadeOut(score_pedagogy),
            q_arrow.animate.set_opacity(0.28),
            FadeOut(q_lbl),        # its spot is crossed by the tip-to-tail chain
            h1_arrow.animate.set_opacity(0.28),
            h1_lbl.animate.set_opacity(0.28),
            h2_arrow.animate.set_opacity(0.28),
            h2_lbl.animate.set_opacity(0.28),
            h3_arrow.animate.set_opacity(0.28),
            h3_lbl.animate.set_opacity(0.28),
            run_time=0.8,
        )

        # Scaled vectors:
        # α₁ h₁ = 0.2447 * (1, 1.5) = (0.245, 0.367)
        # α₂ h₂ = 0.6652 * (2, -0.5) = (1.330, -0.333)
        # α₃ h₃ = 0.0900 * (0, -2.0) = (0.000, -0.180)
        # Tip-to-tail chain:
        # P0 = (0, 0)
        # P1 = (0.245, 0.367)
        # P2 = (0.245 + 1.330, 0.367 - 0.333) = (1.575, 0.035)
        # P3 = (1.575, 0.035 - 0.180) = (1.575, -0.145) ≈ (1.58, -0.15)
        p0 = c2p(0, 0)
        p1 = c2p(0.245, 0.367)
        p2 = c2p(1.575, 0.035)
        p3 = c2p(1.575, -0.145)

        # Temporary scaled arrows starting from origin
        v1_origin = Arrow(
            p0,
            p1,
            buff=0,
            color=BLUE,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.3,
        )
        v2_origin = Arrow(
            p0,
            c2p(1.330, -0.333),
            buff=0,
            color=GREEN,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.25,
        )
        v3_origin = Arrow(
            p0,
            c2p(0, -0.180),
            buff=0,
            color=PURPLE,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.35,
        )

        # Tip-to-tail target arrows
        v2_shifted = Arrow(
            p1,
            p2,
            buff=0,
            color=GREEN,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.25,
        )
        v3_shifted = Arrow(
            p2,
            p3,
            buff=0,
            color=PURPLE,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.35,
        )

        # Show scaled vectors
        self.play(
            GrowArrow(v1_origin),
            GrowArrow(v2_origin),
            GrowArrow(v3_origin),
            run_time=0.9,
        )

        # Add tip-to-tail
        self.play(
            Transform(v2_origin, v2_shifted),
            Transform(v3_origin, v3_shifted),
            run_time=1.2,
        )

        # Context vector c
        c_arrow = Arrow(
            p0,
            p3,
            buff=0,
            color=RED,
            stroke_width=5.0,
            max_tip_length_to_length_ratio=0.22,
        )
        # Labels go into the clear wedge between the h(3) axis and the faded h(2) arrow,
        # not on top of the arrow tips near the axis.
        c_txt = M(r'\mathbf{c} \approx (1.58, -0.15)', 21, RED).move_to(c2p(0.95, -0.6))
        c_lbl = VGroup(
            BackgroundRectangle(c_txt, color=BG, fill_opacity=0.85, buff=px(2)),
            c_txt,
            mpill('最靠近 h<sup>(2)</sup>（权重 66.5%）', YELLOW, INK, 15).move_to(c2p(1.05, -0.97)),
        )

        self.play(GrowArrow(c_arrow), FadeIn(c_lbl), run_time=1.0)
        self.play(
            Indicate(c_arrow, color=YELLOW),
            Indicate(h2_arrow, color=GREEN),
            run_time=1.2,
        )
        self.wait(1.5)

        # -------------------------------------------------- Takeaway
        self.takeaway(
            r'一句话：attention 就是打分、softmax、加权平均三步。**先用点积打分 $e_j=\mathbf q\cdot\mathbf h^{(j)}$，再用 softmax 变成权重 $\alpha_j=\exp(e_j)/\sum_{j^\prime}\exp(e_{j^\prime})$，最后求加权和 $\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$。**softmax 分母里的 $j^\prime$ 走遍所有位置，所以分母就是全部指数之和。权重都是正数、加起来等于 1，最相关的记忆占最大份额。解码器拿 $\mathbf c$ 去写下一个词；写完这个词，query 就变了，三步要重新算一遍，得到新的权重和新的 $\mathbf c$。考试要能写出这三步并手算，例如本例：分数 $(1,2,0)$，权重约 $(0.245,0.665,0.090)$，$\mathbf c\approx(1.58,-0.15)$。',
            [
                'Query 提问，点积打分，Softmax 定权重',
                'α<sub>j</sub> = exp(e<sub>j</sub>) / Σ<sub>j′</sub> exp(e<sub>j′</sub>) ⇒ 加起来为 1',
                '上下文 c = Σ<sub>j</sub> α<sub>j</sub> h<sup>(j)</sup>：最相关的候选占主角',
            ],
            hold=3.5,
        )
