"""1D convolution sliding window, weight sharing, and parameter counting (c38)."""
from manim import (
    BackgroundRectangle,
    Circumscribe,
    Create,
    DOWN,
    FadeIn,
    FadeOut,
    Indicate,
    LaggedStart,
    LEFT,
    Line,
    ReplacementTransform,
    Transform,
    RIGHT,
    RoundedRectangle,
    UP,
    VGroup,
)
from common import (
    BG,
    BLUE,
    DIM,
    GREEN,
    GREY,
    INK,
    M,
    ORANGE,
    PURPLE,
    RED,
    TEAL,
    WHITE,
    YELLOW,
    P,
    StepScene,
    T,
    pill,
    px,
)


class Conv1D(StepScene):
    ID = 'conv'
    TITLE = '卷积：同一个小模板滑过每个位置'
    FLOW = ['设定与对准', '逐位相乘求和', '滑动算完全程', '权重共享', '对比全连接']

    def construct(self):
        # Opening question card
        self.question(
            r'把一张图拉平成一长串数字、再喂给全连接网络，会出两个问题：原来哪些像素挨在一起的信息丢了；每个输入都连到每个输出，参数多到爆炸。CNN（convolutional neural network，卷积神经网络）换了个办法：拿一个只有几格的小模板，叫 filter（卷积核），在输入上一格一格滑过去，每个位置都用它检查一遍。**能不能只用模板里这几个数，就看遍整张图？**',
            ['把图像拉平成向量，参数爆炸且丢了空间结构', '能不能拿一个小检测器，滑过每个位置？'],
        )

        def cx(i):
            return 150 + i * 80

        in_vals = [1, 2, 3, 4, 5]
        weights = [1, 0, -1]
        weight_colors = [TEAL, PURPLE, ORANGE]

        # -------------------------------------------------------------
        # Step 1: Setting & Alignment
        self.step(
            r'上排是输入 $\mathbf a=[1,2,3,4,5]$，中间一排是卷积核 $\mathbf w=[1,0,-1]$（宽 $k=3$），下排三个空格等着放输出；黄框标出模板现在盖住的是输入的前三格。设定尽量简单：一个输入通道（$C_{\text{in}}=1$），一个 filter（$C_{\text{out}}=1$）。channel（通道）就是每个位置叠了几层数：彩色图每个像素有 R、G、B 三个数，就是 3 个输入通道；这里每格只有一个数，所以 $C_{\text{in}}=1$。用几个 filter 就得到几层输出，所以 $C_{\text{out}}=1$。另外不加 bias（偏置）；stride（步长）$s=1$，即每次挪一格；不做 padding（补零），两端不补 0。数学课本里的卷积要先把模板左右倒过来再滑，深度学习里的卷积不倒，直接盖上去算，严格说这叫 cross-correlation（互相关）：模板盖住哪三格，就和那三格对应相乘，以 $a_i$ 为中心时输出 $b_i=w_1a_{i-1}+w_2a_i+w_3a_{i+1}$。',
            '单通道、单 filter、无偏置：宽 3 模板对准输入前三格',
            stage=0,
        )

        # Persistent Skeleton: Input row (y=66) and Output row (y=280)
        in_label = VGroup(T('输入', 20, GREY), M(r'\mathbf{a}', size=22, color=GREY)).arrange(RIGHT, buff=0.08).move_to(P(62, 66))
        in_boxes = []
        in_texts = []
        for i, val in enumerate(in_vals):
            box = RoundedRectangle(
                corner_radius=px(6),
                width=px(52),
                height=px(52),
                stroke_color=BLUE,
                stroke_width=2,
                fill_color='#20232b',
                fill_opacity=1,
            ).move_to(P(cx(i), 66))
            txt = M(str(val), size=30, color=WHITE).move_to(P(cx(i), 66))
            in_boxes.append(box)
            in_texts.append(txt)
        input_row = VGroup(in_label, *in_boxes, *in_texts)

        out_label = VGroup(T('输出', 20, GREY), M(r'\mathbf{b}', size=22, color=GREY)).arrange(RIGHT, buff=0.08).move_to(P(62, 280))
        out_boxes = []
        for j in range(3):
            box = RoundedRectangle(
                corner_radius=px(6),
                width=px(52),
                height=px(52),
                stroke_color=DIM,
                stroke_width=2,
                fill_color='#20232b',
                fill_opacity=1,
            ).move_to(P(cx(j + 1), 280))
            out_boxes.append(box)
        output_row = VGroup(out_label, *out_boxes)

        # Filter at position 0 (y=172)
        filt_label = VGroup(T('卷积核', 19, GREY), M(r'\mathbf{w}', size=22, color=GREY)).arrange(RIGHT, buff=0.08).move_to(P(62, 172))
        filt_boxes = []
        filt_texts = []
        for k, (w, col) in enumerate(zip(weights, weight_colors)):
            box = RoundedRectangle(
                corner_radius=px(6),
                width=px(52),
                height=px(42),
                stroke_color=col,
                stroke_width=2.5,
                fill_color='#20232b',
                fill_opacity=1,
            ).move_to(P(cx(k), 172))
            txt = M(str(w), size=28, color=col).move_to(P(cx(k), 172))
            filt_boxes.append(box)
            filt_texts.append(txt)
        filter_group = VGroup(*filt_boxes, *filt_texts)

        # Window highlight covering input cells 0, 1, 2
        win_box = RoundedRectangle(
            corner_radius=px(8),
            width=px(222),
            height=px(62),
            stroke_color=YELLOW,
            stroke_width=2.5,
            fill_opacity=0,
        ).move_to(P(cx(1), 66))

        self.play(
            FadeIn(input_row),
            FadeIn(output_row),
            FadeIn(filt_label),
            FadeIn(filter_group),
            Create(win_box),
            run_time=0.9,
        )
        self.wait(1.0)

        # -------------------------------------------------------------
        # Step 2: Multiply & Add at Position 0
        self.step(
            r'黄框里的三个输入 $[1,2,3]$ 和正下方的三个权重 $[1,0,-1]$ 上下配对，各乘一次：$1\times1=1$，$2\times0=0$，$3\times(-1)=-3$。三个乘积加起来：$1+0+(-3)=-2$，放进第 1 个输出格。**卷积在每个位置做的都是这件事：逐格相乘，再求和。**课件按模板中心的下标给输出编号，这次中心是 $a_2$，所以记作 $b_2=a_1w_1+a_2w_2+a_3w_3=-2$。',
            '逐格相乘再求和：1×1 + 2×0 + 3×(−1) = −2',
            stage=1,
        )

        p0_0 = M(r'1\times 1 = 1', size=22, color=TEAL).move_to(P(cx(0), 120))
        p0_1 = M(r'2\times 0 = 0', size=22, color=PURPLE).move_to(P(cx(1), 120))
        p0_2 = M(r'3\times (-1) = -3', size=22, color=ORANGE).move_to(P(cx(2), 120))
        prods0 = VGroup(p0_0, p0_1, p0_2)

        self.play(FadeIn(prods0), run_time=0.5)
        self.wait(0.4)

        sum0 = M(r'1 + 0 + (-3) = -2', size=26, color=YELLOW).move_to(P(cx(1), 226))
        self.play(FadeIn(sum0), run_time=0.5)
        self.wait(0.4)

        out_val0 = M(r'-2', size=32, color=YELLOW).move_to(P(cx(1), 280))
        self.play(
            ReplacementTransform(sum0, out_val0),
            out_boxes[0].animate.set_stroke(YELLOW, width=2.5),
            run_time=0.6,
        )
        self.play(Indicate(out_boxes[0], color=YELLOW), FadeOut(prods0), run_time=0.4)
        self.wait(1.2)

        # -------------------------------------------------------------
        # Step 3: Slide to Positions 1 & 2, Output Completed, Intuition
        self.step(
            r'模板整体右移一格（步长 $1$），盖住 $[2,3,4]$，权重还是同一组 $[1,0,-1]$：$2\times1+3\times0+4\times(-1)=2+0-4=-2$。再右移一格盖住 $[3,4,5]$：$3\times1+4\times0+5\times(-1)=3+0-5=-2$。宽 3 的模板在 5 格输入上能停几个位置？模板最左端能停在第 1、2、3 格：从第 1 格出发每次挪 $s=1$ 格，最多挪 $(5-3)/1=2$ 次（再挪就伸出输入了），加上出发那一格共 $2+1=3$ 个位置，所以输出有 $\lfloor(5-3)/1\rfloor+1=3$ 格；$\lfloor\ \rfloor$ 是向下取整，挪不满一步的零头不算。三个输出都是 $-2$，原因写在卡片上：模板算的是 1×左 + 0×中 + (−1)×右 = 左 − 右。**卷积核 $[1,0,-1]$ 问的是“左边比右边大多少”：输入每格比前一格大 1，模板最左格和最右格相距两个位置，数值相差 2，所以左减右处处是 $-2$。**',
            '模板右移：输入处处递增 1，“左−右”差分处处为 −2',
            stage=2,
        )

        # Slide to Position 1
        self.play(
            win_box.animate.move_to(P(cx(2), 66)),
            filter_group.animate.shift(RIGHT * px(80)),
            run_time=0.6,
        )
        p1_0 = M(r'2\times 1 = 2', size=22, color=TEAL).move_to(P(cx(1), 120))
        p1_1 = M(r'3\times 0 = 0', size=22, color=PURPLE).move_to(P(cx(2), 120))
        p1_2 = M(r'4\times (-1) = -4', size=22, color=ORANGE).move_to(P(cx(3), 120))
        prods1 = VGroup(p1_0, p1_1, p1_2)

        sum1 = M(r'2 + 0 + (-4) = -2', size=26, color=YELLOW).move_to(P(cx(2), 226))
        self.play(FadeIn(prods1), FadeIn(sum1), run_time=0.4)

        out_val1 = M(r'-2', size=32, color=YELLOW).move_to(P(cx(2), 280))
        self.play(
            ReplacementTransform(sum1, out_val1),
            out_boxes[1].animate.set_stroke(YELLOW, width=2.5),
            FadeOut(prods1),
            run_time=0.5,
        )
        self.play(Indicate(out_boxes[1], color=YELLOW), run_time=0.3)

        # Slide to Position 2
        self.play(
            win_box.animate.move_to(P(cx(3), 66)),
            filter_group.animate.shift(RIGHT * px(80)),
            run_time=0.6,
        )
        p2_0 = M(r'3\times 1 = 3', size=22, color=TEAL).move_to(P(cx(2), 120))
        p2_1 = M(r'4\times 0 = 0', size=22, color=PURPLE).move_to(P(cx(3), 120))
        p2_2 = M(r'5\times (-1) = -5', size=22, color=ORANGE).move_to(P(cx(4), 120))
        prods2 = VGroup(p2_0, p2_1, p2_2)

        sum2 = M(r'3 + 0 + (-5) = -2', size=26, color=YELLOW).move_to(P(cx(3), 226))
        self.play(FadeIn(prods2), FadeIn(sum2), run_time=0.4)

        out_val2 = M(r'-2', size=32, color=YELLOW).move_to(P(cx(3), 280))
        self.play(
            ReplacementTransform(sum2, out_val2),
            out_boxes[2].animate.set_stroke(YELLOW, width=2.5),
            FadeOut(prods2),
            run_time=0.5,
        )
        self.play(Indicate(out_boxes[2], color=YELLOW), run_time=0.3)

        # Intuition card
        int_t1 = T('为什么输出全都是 −2？', 20, YELLOW)
        int_t2 = VGroup(
            T('卷积核 ', 18, WHITE),
            M(r'\mathbf{w} = [1, 0, -1]', size=22, color=WHITE),
            T(' 问的是：“左边比右边大多少？”', 18, WHITE),
        ).arrange(RIGHT, buff=0.08)
        int_t3 = VGroup(
            T('输入 ', 16, GREY),
            M(r'\mathbf{a} = [1, 2, 3, 4, 5]', size=20, color=GREY),
            T(' 处处递增 1 ⇒ 差分处处为 −2', 16, GREY),
        ).arrange(RIGHT, buff=0.08)
        intuition_card = VGroup(int_t1, int_t2, int_t3).arrange(DOWN, buff=0.15).move_to(P(310, 172))
        intuition_bg = BackgroundRectangle(intuition_card, color=BG, fill_opacity=0.92, buff=0.16)
        intuition = VGroup(intuition_bg, intuition_card)

        self.play(
            FadeOut(win_box),
            FadeOut(filter_group),
            FadeOut(filt_label),
            FadeIn(intuition),
            run_time=0.6,
        )
        self.wait(1.6)

        # -------------------------------------------------------------
        # Step 4: Network View & Weight Sharing (Aha moment)
        self.step(
            r'把刚才的计算画成网络：每个输出格只连它上方相邻的 3 个输入，一共 $3\times3=9$ 条线。线按用到的权重上色：青色都是 $w_1=1$，紫色都是 $w_2=0$，橙色都是 $w_3=-1$。同一种颜色的线在每个位置共用同一个数，这叫 weight sharing（权重共享）。**所以不管输出有多少格，这一层只有 3 个权重。**如果再加 1 个所有位置共用的 bias，就是 4 个参数。',
            '权重共享：同色边共用同一参数，本层仅 3 个权重',
            stage=3,
        )

        self.play(FadeOut(intuition), run_time=0.3)

        # 9 convolution connection lines (3 outputs × 3 inputs)
        conv_lines = []
        for j in range(3):
            for k in range(3):
                line = Line(
                    P(cx(j + k), 92),
                    P(cx(j + 1), 254),
                    color=weight_colors[k],
                    stroke_width=2.6,
                )
                conv_lines.append(line)
        conv_edges = VGroup(*conv_lines)

        # Legend & parameter badge on the right
        leg_title = T('3 个共享权重', 17, YELLOW)
        leg_w1 = VGroup(M(r'w_1 = 1', size=20, color=TEAL), T('（青）', 15, TEAL)).arrange(RIGHT, buff=0.06)
        leg_w2 = VGroup(M(r'w_2 = 0', size=20, color=PURPLE), T('（紫）', 15, PURPLE)).arrange(RIGHT, buff=0.06)
        leg_w3 = VGroup(M(r'w_3 = -1', size=20, color=ORANGE), T('（橙）', 15, ORANGE)).arrange(RIGHT, buff=0.06)
        param_badge = pill('参数量 = 3', GREEN, INK, 17)
        param_note = T('含 bias 则为 4', 13, GREY)

        param_card = VGroup(
            leg_title,
            leg_w1,
            leg_w2,
            leg_w3,
            param_badge,
            param_note,
        ).arrange(DOWN, buff=0.12).move_to(P(555, 172))
        param_bg = BackgroundRectangle(param_card, color=BG, fill_opacity=0.9, buff=0.14)
        param_group = VGroup(param_bg, param_card)

        self.play(
            LaggedStart(*[Create(e) for e in conv_edges], lag_ratio=0.06),
            FadeIn(param_group),
            run_time=0.9,
        )
        self.play(Indicate(param_badge, color=YELLOW), run_time=0.5)
        self.wait(1.5)

        # -------------------------------------------------------------
        # Step 5: Contrast with Fully Connected
        self.step(
            r'再对比 fully connected layer（全连接层）：5 个输入每个都连到 3 个输出，灰线一共 $5\times3=15$ 条，每条线一个独立的权重，共 15 个。这 15 个权重没有给定，所以输出格暂时换成了问号。卷积层靠“只连相邻几格”（局部连接）加“各位置共用一组权重”（权重共享），只需要 3 个。**往年 T3 常考的参数计数题，关键就在这里：卷积层只数 3 个权重，不能数成 15。**',
            '对比全连接：5×3 = 15 条独立连线 vs 卷积仅 3 个参数',
            stage=4,
        )

        # 15 Fully Connected lines (5 inputs × 3 outputs)
        fc_lines = []
        for i in range(5):
            for j in range(3):
                fc_lines.append(
                    Line(
                        P(cx(i), 92),
                        P(cx(j + 1), 254),
                        color='#505868',
                        stroke_width=1.4,
                    )
                )
        fc_edges = VGroup(*fc_lines)

        fc_math = M(r'5 \times 3 = 15', size=30, color=RED)
        fc_card = VGroup(
            T('全连接层 FC', 22, RED),
            fc_math,
            T('每条边一个独立参数', 17, GREY),
            Line(LEFT * 0.8, RIGHT * 0.8, color=GREY, stroke_width=1),
            T('卷积层 Conv', 22, GREEN),
            pill('仅 3 个共享权重', GREEN, INK, 20),
            T('与输出长度无关', 17, GREY),
        ).arrange(DOWN, buff=0.12).move_to(P(560, 172))
        fc_bg = BackgroundRectangle(fc_card, color=BG, fill_opacity=0.92, buff=0.14)
        fc_group = VGroup(fc_bg, fc_card)

        # In the fully connected view the 15 weights are unknown, so its outputs are unknown too
        fc_q = [M(r'?', size=32, color=GREY).move_to(v) for v in (out_val0, out_val1, out_val2)]
        self.play(
            conv_edges.animate.set_opacity(0.12),
            FadeOut(param_group),
            LaggedStart(*[Create(e) for e in fc_edges], lag_ratio=0.03),
            *[Transform(v, q) for v, q in zip((out_val0, out_val1, out_val2), fc_q)],
            *[b.animate.set_stroke(GREY, width=1.5) for b in out_boxes],
            run_time=0.9,
        )
        self.play(FadeIn(fc_group), run_time=0.6)
        self.play(Circumscribe(fc_group, color=YELLOW), run_time=0.8)
        self.wait(2.0)

        # -------------------------------------------------------------
        # Takeaway
        self.takeaway(
            r'一句话：卷积就是拿同一个小模板滑过输入，在每个位置做一次点积（逐格相乘再求和）。输出格数 $=\lfloor(n+2p-k)/s\rfloor+1$，其中 $n$ 是输入长度、$p$ 是每端补零的格数、$k$ 是模板宽、$s$ 是步长。补零就是在输入两头各添 $p$ 个 0，让模板能盖到边上的格子；两头都添，输入长度变成 $n+2p$。本例不补零（$p=0$）：$\lfloor(5+0-3)/1\rfloor+1=3$。**因为权重共享，参数个数只由 filter 决定（大小、个数、输入通道数），不随输入和输出的格子数增长。**本例单通道、一个宽 3 的 filter，就是 3 个权重；一般的 2D 卷积是 $C_{\text{out}}C_{\text{in}}K^2$ 个权重（见本章上文）。数卷积层参数时，只数 filter 里的权重，不按输出格子重复计数——这是 CNN 比全连接省参数的关键，也是往年 T3 计算题的考点。',
            [
                '卷积 = 小模板滑过输入做点积：同一检测器到处复用',
                '输出尺寸 ⌊(n + 2p − k)/s⌋ + 1 = 3（与步长、补零相关）',
                '参数只有 3 个（权重共享）：绝不按输出格子重复计数！',
            ],
            hold=3.5,
        )
