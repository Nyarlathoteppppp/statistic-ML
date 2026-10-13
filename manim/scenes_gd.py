"""c13: gradient descent, exact browser numbers and corrected 2-D rates.
No execution required. Formulas use common.M; Chinese is always separate.
"""
import numpy as np
from manim import (
    Arrow, Create, DashedLine, Dot, DOWN, Ellipse, FadeIn, FadeOut,
    GrowArrow, Indicate, Line, Rectangle, RIGHT, Transform,
    ValueTracker, VGroup, VMobject, always_redraw,
)
from common import BLUE, GREEN, GREY, RED, WHITE, YELLOW, M, P, StepScene, T, px


class GradDescent(StepScene):
    ID = 'gd'
    TITLE = '梯度下降：小步下山，大步可能发散'
    FLOW = ['看脚下坡度', '反向小步走', '大步会怎样', '二维看方向', '检查收敛']

    def _lines(self, lines, big=34, small=26):
        # Keep StepScene's question/takeaway pacing, but typeset its formula.
        rows = []
        for i, text in enumerate(lines):
            size, color = (big, YELLOW) if i == 0 else (small, WHITE)
            rows.append(M(text, max(size, 34), color) if text.startswith('\\')
                        else T(text, size, color))
        group = VGroup(*rows).arrange(DOWN, buff=0.32)
        if group.width > 12.4:
            group.scale_to_fit_width(12.4)
        return group

    def construct(self):
        def formula(tex, x, y, size=28, color=WHITE, width=270):
            mob = M(tex, size, color)
            if mob.width > px(width):
                mob.scale_to_fit_width(px(width))
            return mob.next_to(P(x, y), RIGHT, buff=0)

        def words(text, x, y, color=GREY, size=18):
            return T(text, size, color).next_to(P(x, y), RIGHT, buff=0)

        def one(t):
            return P(175 + 27 * t, 298 - 8 * t * t)

        def two(q):
            # Equal scales: the gradient is genuinely normal to contours.
            return P(175 + 27 * q[0], 236 - 27 * q[1])

        self.question(
            r'许多损失函数无法一次解出最低点，只能利用脚下的坡度一步步走。怎样选方向和步子大小，才能越走越低，而不是越跳越远？',
            ['看不见整座山，怎样走到最低处？', '步子越大，真的越快吗？'],
        )
        self.step(
            r'脚下向右上坡，要下山就先向左走：这条蓝色曲线是 $L(\theta)=\theta^2$，最低点 $\theta=0$，起点 $\theta=4$ 的高度为 $4^2=16$。红线是切线，gradient（梯度）在一维就是斜率，$L^{\prime}(\theta)=2\theta$，所以 $L^{\prime}(4)=2\times4=8>0$，指向右侧上坡。',
            '脚下向右上坡，就向左下山', stage=0,
        )
        frame = Rectangle(width=px(306), height=px(207), stroke_color=GREY,
                          stroke_opacity=0.25, stroke_width=1).move_to(P(175, 226.5))
        axis = Line(P(35, 298), P(315, 298), color=GREY, stroke_width=1.5)
        curve = VMobject(color=BLUE, stroke_width=3)
        curve.set_points_smoothly([one(t) for t in np.linspace(-4.4, 4.4, 100)])
        loss_label = M(r'L(\theta)=\theta^2', 27, BLUE).move_to(P(175, 136))
        minimum = Dot(one(0), radius=px(3), color=GREEN)
        zero = M('0', 22, GREY).move_to(P(175, 316))
        axis_name = M(r'\theta', 24, GREY).move_to(P(309, 316))
        self.play(FadeIn(frame), Create(axis), Create(curve), FadeIn(loss_label),
                  FadeIn(minimum), FadeIn(zero), FadeIn(axis_name), run_time=1)
        theta = ValueTracker(4)
        ball = always_redraw(lambda: Dot(one(theta.get_value()), radius=px(5), color=YELLOW))
        projection = always_redraw(lambda: DashedLine(
            one(theta.get_value()), P(175 + 27 * theta.get_value(), 298),
            color=GREY, stroke_opacity=0.4, stroke_width=1, dash_length=px(4)))
        tangent = always_redraw(lambda: Line(
            P(175 + 27 * (theta.get_value() - 0.5),
              298 - 8 * (theta.get_value() ** 2 - theta.get_value())),
            P(175 + 27 * (theta.get_value() + 0.5),
              298 - 8 * (theta.get_value() ** 2 + theta.get_value())),
            color=RED, stroke_width=2))
        pos_label = M(r'\theta=4', 25, YELLOW).move_to(P(276, 316))
        self.play(FadeIn(ball), FadeIn(projection), FadeIn(pos_label), run_time=0.5)
        uphill = Arrow(one(3.6), one(4.2), color=RED, buff=0, stroke_width=3)
        self.play(Create(tangent), GrowArrow(uphill), run_time=0.6)
        panel = VGroup(words('脚下的切线：向右上坡', 345, 155, RED),
                       formula(r'L(4)=4^2=16', 345, 191),
                       formula(r'L^{\prime}(4)=2\times4=8', 345, 227, color=RED),
                       words('斜率告诉我们上坡方向', 345, 266))
        self.play(FadeIn(panel), run_time=0.5)
        self.wait(1.2)

        self.step(
            r'朝上坡的反方向走一小步，就得到 gradient descent（梯度下降）：$\theta\leftarrow\theta-\eta\nabla L$，其中 $\eta$ 是 learning rate（学习率），控制步长。取 $\eta=0.25$，每步重新算斜率：$4-0.25\times8=2$，$2-0.25\times4=1$，$1-0.25\times2=0.5$，$0.5-0.25\times1=0.25$；斜率依次是 $2\times4=8$、$2\times2=4$、$2\times1=2$、$2\times0.5=1$。因此每步位置乘 $1-2\times0.25=0.5$，越近谷底步子越小。',
            '小步向下走，越接近谷底步子越小', stage=1,
        )
        downhill = Arrow(one(4), one(3.3), color=YELLOW, buff=0, stroke_width=3)
        self.play(Transform(uphill, downhill), FadeOut(panel), run_time=0.6)
        rule_parts = VGroup(
            M(r'\theta', 34, GREEN).move_to(P(63, 61)),
            M(r'\leftarrow', 34).move_to(P(119, 61)),
            M(r'\theta', 34, YELLOW).move_to(P(190, 61)),
            M('-', 34).move_to(P(251, 61)),
            M(r'\eta', 34, YELLOW).move_to(P(310, 61)),
            M(r'\nabla L', 34, RED).move_to(P(471, 61)),
        )
        roles = VGroup(T('下一步', 17, GREY).move_to(P(63, 90)),
                       T('现在的位置', 17, GREY).move_to(P(190, 90)),
                       T('步长', 17, GREY).move_to(P(310, 90)),
                       T('上坡方向（取负 = 下坡）', 17, GREY).move_to(P(471, 90)))
        self.play(FadeIn(rule_parts), FadeIn(roles), FadeOut(uphill), run_time=0.6)
        heading = words('小步：逐渐靠近', 345, 140, GREEN, 20)
        eta_label = formula(r'\eta=0.25', 345, 170, color=GREEN)
        arithmetic = formula(r'\theta=4', 345, 211, color=YELLOW)
        trend = words('每一步都重新计算脚下坡度', 345, 264)
        self.play(FadeIn(heading), FadeIn(eta_label), FadeIn(arithmetic), FadeIn(trend), run_time=0.5)
        small_marks = VGroup(Dot(one(4), radius=px(2.5), color=GREEN))
        self.add(small_marks)
        small_steps = [(2, '2', r'4-0.25\times8=2'),
                       (1, '1', r'2-0.25\times4=1'),
                       (0.5, '0.5', r'1-0.25\times2=0.5'),
                       (0.25, '0.25', r'0.5-0.25\times1=0.25')]
        for value, text, calculation in small_steps:
            self.play(theta.animate.set_value(value), run_time=0.6)
            mark = Dot(one(value), radius=px(3), color=GREEN)
            small_marks.add(mark)
            self.play(FadeIn(mark), Transform(arithmetic, formula(calculation, 345, 211, color=GREEN)),
                      Transform(pos_label, M(r'\theta=' + text, 25, YELLOW)
                                .move_to(P(235, 316))), run_time=0.5)
            self.wait(1.2)

        self.step(
            r'把步子加大，同样的下坡方向却会越走越远；为看清左右跳，先重置到 $\theta=1$，取 $\eta=1.1$。四步是 $1-1.1\times2=-1.2$，$(-1.2)-1.1\times(-2.4)=1.44$，$1.44-1.1\times2.88=-1.728$，$(-1.728)-1.1\times(-3.456)=2.0736$，各处斜率仍是当前位置乘 $2$。位置每步乘 $1-2\times1.1=-1.2$，符号交替而距离每步乘 $1.2>1$，所以 divergence（发散）；不是方向错，而是步长太大。',
            '步子太大，跨过谷底还越跳越远', stage=2,
        )
        # This is a reset, not an optimization step; label it explicitly.
        self.play(small_marks.animate.set_opacity(0.4),
                  Transform(heading, words('重置起点，再试大步', 345, 140, RED, 20)),
                  Transform(eta_label, formula(r'\eta=1.1', 345, 170, color=RED)),
                  Transform(arithmetic, formula(r'\theta=1', 345, 211, color=RED)),
                  Transform(trend, words('绿色痕迹：刚才的小步', 345, 264)), run_time=0.5)
        self.play(theta.animate.set_value(1),
                  Transform(pos_label, M(r'\theta=1', 25, RED).move_to(P(235, 316))), run_time=0.6)
        self.wait(1.2)
        large_marks = VGroup()
        large_steps = [(-1.2, '-1.2', r'1-1.1\times2=-1.2'),
                       (1.44, '1.44', r'(-1.2)-1.1\times(-2.4)=1.44'),
                       (-1.728, '-1.728', r'1.44-1.1\times2.88=-1.728'),
                       (2.0736, '2.0736', r'(-1.728)-1.1\times(-3.456)=2.0736')]
        for value, text, calculation in large_steps:
            self.play(theta.animate.set_value(value), run_time=0.6)
            mark = Dot(one(value), radius=px(3), color=RED)
            large_marks.add(mark)
            self.play(FadeIn(mark), Transform(arithmetic, formula(calculation, 345, 211, 27, RED)),
                      Transform(pos_label, M(r'\theta=' + text, 25, RED)
                                .move_to(P(235, 316))), run_time=0.5)
            self.wait(1.2)
        self.play(Transform(trend, VGroup(words('到谷底的距离：每步变大', 345, 264, RED),
                                        formula(r'|\theta|\;\times1.2', 345, 293, color=RED))), run_time=0.5)
        self.wait(1.2)

        self.step(
            r'两个方向也用同一条更新规则：俯视碗 $L=q_1^2+4q_2^2$，每圈是相同高度的 level set（等高线），gradient（梯度）$\nabla L=(2q_1,8q_2)$ 垂直于圈并指向上坡。这里 $2$ 来自 $q_1^2$ 求导，$8=4\times2$；从 $(4,2)$ 出发，梯度为 $(2\times4,8\times2)=(8,16)$。取 $\eta=0.1$，两方向每步分别乘 $1-2\times0.1=0.8$ 和 $1-8\times0.1=0.2$，首步 $(4\times0.8,2\times0.2)=(3.2,0.4)$；图中重复九步，第 $k$ 步为 $(4(0.8)^k,2(0.2)^k)$，平稳靠近中心。',
            '两个方向都缩小，平稳走向中心', stage=3,
        )
        contours = VGroup(*[
            Ellipse(width=px(54 * np.sqrt(c)), height=px(27 * np.sqrt(c)),
                    color=BLUE, stroke_width=1.5, stroke_opacity=0.4).move_to(two((0, 0)))
            for c in (1, 4, 9, 16, 25, 32)
        ])
        # Morph the SAME left-hand diagram. Frame, axis, and minimum persist.
        ball.clear_updaters()
        tangent.clear_updaters()
        projection.clear_updaters()
        self.play(Transform(curve, contours),
                  Transform(axis, Line(P(35, 236), P(315, 236), color=GREY, stroke_width=1.5)),
                  minimum.animate.move_to(two((0, 0))),
                  Transform(zero, M('0', 20, GREY).move_to(P(163, 250))),
                  Transform(axis_name, M('q_1', 24, GREY).move_to(P(309, 250))),
                  Transform(loss_label, M(r'L=q_1^2+4q_2^2', 27, BLUE).move_to(P(175, 136))),
                  FadeOut(ball), FadeOut(tangent), FadeOut(projection), FadeOut(pos_label),
                  FadeOut(small_marks), FadeOut(large_marks), FadeOut(arithmetic), FadeOut(trend),
                  Transform(heading, words('俯视：每圈高度相同', 345, 140, BLUE, 20)),
                  Transform(eta_label, formula(r'\eta=0.1', 345, 170, color=GREEN)), run_time=1.2)
        vertical = Line(P(175, 159), P(175, 311), color=GREY, stroke_opacity=0.4, stroke_width=1)
        vertical_name = M('q_2', 23, GREY).move_to(P(188, 321))
        start = np.array([4.0, 2.0])
        moving = Dot(two(start), radius=px(4.5), color=GREEN)
        start_label = M('(4,2)', 22, BLUE).move_to(P(282, 146))
        # At (4,2), gradient (8,16). This short arrow is a scaled copy.
        grad_arrow = Arrow(two(start), two(start + 0.055 * np.array([8, 16])),
                           color=RED, buff=0, stroke_width=3)
        g_label = formula(r'\nabla L=(2q_1,8q_2)', 345, 202, 26, RED)
        factors = VGroup(formula(r'q_1\leftarrow0.8q_1,\quad0.8=1-2\times0.1', 345, 236, 25, GREEN),
                         formula(r'q_2\leftarrow0.2q_2,\quad0.2=1-8\times0.1', 345, 269, 25, GREEN))
        self.play(Create(vertical), FadeIn(vertical_name), FadeIn(moving), FadeIn(start_label),
                  GrowArrow(grad_arrow), run_time=0.6)
        self.play(FadeIn(g_label), FadeIn(factors), run_time=0.5)
        self.wait(1.2)
        self.play(FadeOut(grad_arrow), run_time=0.5)
        first_result = formula(r'(4\times0.8,\;2\times0.2)=(3.2,0.4)', 345, 309, 25, GREEN)
        green_path = VGroup()
        q = start.copy()
        for i in range(9):
            nxt = q * np.array([0.8, 0.2])
            segment = Line(two(q), two(nxt), color=GREEN, stroke_width=2.5)
            green_path.add(segment)
            self.play(Create(segment), moving.animate.move_to(two(nxt)), run_time=0.5)
            if i == 0:
                self.play(FadeIn(first_result), run_time=0.5)
                self.wait(1.2)
            q = nxt
        self.wait(1.2)

        self.step(
            r'来回横跳不一定发散，要看每次离谷底的距离有没有缩小；仍从 $(4,2)$ 出发，改用 $\eta=0.24$。$q_1$ 每步乘 $1-2\times0.24=1-0.48=0.52$，快速缩小；$q_2$ 每步乘 $1-8\times0.24=1-1.92=-0.92$，换边却只缓慢缩小，首步是 $(4\times0.52,2\times(-0.92))=(2.08,-1.84)$。图中九步的精确位置为 $(4(0.52)^k,2(-0.92)^k)$：两个因子的绝对值都小于 $1$，所以都 convergence（收敛），但 $|q_2|$ 每次还剩 $0.92$ 倍，慢的 $q_2$ 主导后期，而不是 $q_1$ 慢。',
            '折返也能收敛，慢的方向拖住整体', stage=3,
        )
        self.play(green_path.animate.set_opacity(0.4), moving.animate.set_opacity(0.4),
                  Transform(heading, words('同一起点，改用较大步长', 345, 140, YELLOW, 20)),
                  Transform(eta_label, formula(r'\eta=0.24', 345, 170, color=YELLOW)),
                  FadeOut(factors), FadeOut(first_result), FadeOut(g_label), run_time=0.6)
        red_ball = Dot(two(start), radius=px(4.5), color=RED)
        self.play(FadeIn(red_ball), run_time=0.5)
        red_path = VGroup()
        q = start.copy()
        corrected = VGroup(
            formula(r'q_1:\;1-2\times0.24=0.52', 345, 209, 26, GREEN),
            words('每步乘此数：快速缩小', 345, 235, GREEN, 17),
            formula(r'q_2:\;1-8\times0.24=-0.92', 345, 263, 26, RED),
            words('每步乘此数：换边、缓慢缩小', 345, 289, RED, 17),
        )
        first_red = formula(r'(4\times0.52,\;2\times(-0.92))=(2.08,-1.84)', 345, 318, 24, RED)
        for i in range(9):
            nxt = q * np.array([0.52, -0.92])
            segment = Line(two(q), two(nxt), color=RED, stroke_width=2.5)
            red_path.add(segment)
            self.play(Create(segment), red_ball.animate.move_to(two(nxt)), run_time=0.5)
            if i == 0:
                self.play(FadeIn(corrected), FadeIn(first_red), run_time=0.5)
                self.wait(1.2)
            q = nxt
        slow_note = words('两者都收敛；慢的方向主导', 345, 318, YELLOW, 18)
        self.play(Transform(first_red, slow_note), Indicate(red_ball, color=YELLOW), run_time=0.6)
        self.wait(1.8)

        self.step(
            r'要从任意起点稳定到达中心，两个方向都必须每步缩小：$|1-2\eta|<1$ 给出 $-1<1-2\eta<1$，即 $0<\eta<1$；$|1-8\eta|<1$ 给出 $-1<1-8\eta<1$，即 $0<\eta<2/8=0.25$。交集就是这个二维碗的稳定区间 $0<\eta<0.25$，所以 $0.24$ 虽折返仍收敛；边界 $\eta=0.25$ 时 $q_2$ 乘 $-1$，不再衰减，超过边界则一般会发散。这个阈值依赖损失的形状，不能当成所有问题的通用步长。',
            '两个方向都要缩小，才会稳稳到谷底', stage=4,
        )
        self.play(FadeOut(corrected), FadeOut(first_red),
                  Transform(heading, words('这个碗：两个方向都要缩小', 345, 140, YELLOW, 19)),
                  Transform(eta_label, formula(r'|1-2\eta|<1\;\Rightarrow\;0<\eta<1', 345, 185, 26)), run_time=0.5)
        self.wait(1.2)
        steep_condition = formula(r'|1-8\eta|<1\;\Rightarrow\;0<\eta<0.25', 345, 226, 26)
        self.play(FadeIn(steep_condition), run_time=0.5)
        self.wait(1.2)
        stable = formula(r'0<\eta<\frac{2}{8}=0.25', 345, 275, 31, GREEN)
        boundary = words('只针对这个碗；边界不再衰减', 345, 315, GREY, 17)
        self.play(FadeIn(stable), FadeIn(boundary), run_time=0.5)
        self.wait(1.8)
        self.takeaway(
            r'记住 gradient descent（梯度下降）的更新规则：$\theta\leftarrow\theta-\eta\nabla L$，从现在的位置，沿上坡方向的反方向走，$\eta$ 控制步长。$\eta$ 太大会发散；来回折返却未必发散，关键是到最低点的距离是否持续缩小。这个二维碗的稳定区间为 $0<\eta<0.25$，$\eta=0.24$ 时快的是 $q_1$，慢的是折返的 $q_2$。',
            ['沿负梯度，一步步下山', r'\theta\leftarrow\theta-\eta\nabla L',
             'η 太大会发散；折返未必发散'],
        )
