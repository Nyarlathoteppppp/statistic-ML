"""c13: gradient descent, exact browser numbers and corrected 2-D rates.
No execution required. Formulas use common.M; Chinese is always separate.
"""
import numpy as np
from manim import (
    Arrow, Create, DashedLine, Dot, DOWN, Ellipse, FadeIn, FadeOut,
    GrowArrow, Indicate, LEFT, Line, Rectangle, RIGHT, Transform,
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
            r'训练模型，就是找让损失最小的参数。许多损失函数没法一次解出最低点，就像在大雾里下山：看不见整座山，只能摸到脚下的坡度，一步步往低处走。往哪个方向走、每步迈多大，才能越走越低，而不是越跳越远？',
            ['看不见整座山，怎样走到最低处？', '步子越大，真的越快吗？'],
        )
        self.step(
            r'黄球站在蓝色曲线 $L(\theta)=\theta^2$ 上 $\theta=4$ 的位置，高度是 $L(4)=4^2=16$；绿点是最低点 $\theta=0$。贴着黄球的红线是切线，红箭头沿切线指向右上：往右走会更高。切线的斜率在一维就是 gradient（梯度），记作 $L^{\prime}(\theta)$。这里的撇号 $L^{\prime}$ 表示求导（导数 = 切线斜率），和 $\mathbf w^{\prime}\mathbf x$ 里表示转置的撇号不是一回事。求导规则：$\theta^n$ 的导数是 $n\theta^{n-1}$，所以 $\theta^2$ 的导数是 $2\theta^{1}=2\theta$，即 $L^{\prime}(\theta)=2\theta$，代入得 $L^{\prime}(4)=2\times4=8$。**斜率 $8>0$ 说明右边是上坡，所以要下山就往左走。**',
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
        # θ readout rides under the ball: centred on the foot of the dashed drop line, pushed sideways only
        # as far as needed to clear the '0' / 'θ' axis labels (on the ball's side of 0), kept inside the frame.
        # The text itself changes only when a step lands (readout dict), exactly as the narration counts;
        # while the ball is in flight the old value is dimmed so it never claims the wrong position.
        readout = {'tex': r'\theta=4', 'color': YELLOW, 'dim': False}

        def make_pos_label():
            lab = M(readout['tex'], 25, readout['color'])
            value = theta.get_value()
            lab.move_to(P(175 + 27 * value, 316))
            gap = px(12)          # wide gap so "0 θ=0.25" or "θ=4 θ" never read as one string
            zero_l, zero_r = zero.get_left()[0] - gap, zero.get_right()[0] + gap
            if lab.get_right()[0] > zero_l and lab.get_left()[0] < zero_r:
                if value >= 0:
                    lab.shift(RIGHT * (zero_r - lab.get_left()[0]))
                else:
                    lab.shift(LEFT * (lab.get_right()[0] - zero_l))
            right_lim = min(axis_name.get_left()[0] - gap, frame.get_right()[0] - px(4))
            if lab.get_right()[0] > right_lim:
                lab.shift(LEFT * (lab.get_right()[0] - right_lim))
            left_lim = frame.get_left()[0] + px(4)
            if lab.get_left()[0] < left_lim:
                lab.shift(RIGHT * (left_lim - lab.get_left()[0]))
            if readout['dim']:
                lab.set_opacity(0.35)
            return lab

        pos_label = always_redraw(make_pos_label)
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
            r'红箭头掉头变成黄箭头，指向左下的下坡；顶部写出每一步怎么走：$\theta\leftarrow\theta-\eta\nabla L$。**逐项读：下一步 = 现在的位置 − 步长 × 上坡方向，减号把上坡变成下坡。**这就是 gradient descent（梯度下降），$\eta$ 叫 learning rate（学习率），控制步子大小；一维时 $\nabla L$ 就是斜率 $2\theta$。取 $\eta=0.25$，每到一处都重新算斜率，依次是 $2\times4=8$、$2\times2=4$、$2\times1=2$、$2\times0.5=1$，所以四步是 $4-0.25\times8=2$，$2-0.25\times4=1$，$1-0.25\times2=0.5$，$0.5-0.25\times1=0.25$。合起来每步是 $\theta-0.25\times2\theta=(1-2\times0.25)\theta=0.5\theta$，位置减半：越靠近谷底坡越缓，步子也越小。',
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
            readout['dim'] = True
            self.play(theta.animate.set_value(value), run_time=0.6)
            mark = Dot(one(value), radius=px(3), color=GREEN)
            small_marks.add(mark)
            readout.update(tex=r'\theta=' + text, dim=False)
            self.play(FadeIn(mark), Transform(arithmetic, formula(calculation, 345, 211, color=GREEN)),
                      run_time=0.5)
            self.wait(1.2)

        self.step(
            r'绿色痕迹是刚才的小步。为了看清左右跳，先把球放回 $\theta=1$（这是重新选起点，不算一步），再把步长加大到 $\eta=1.1$：红点在谷底两侧来回跳，而且一次比一次远。斜率仍是当前位置乘 $2$，四步依次是 $1-1.1\times2=-1.2$，$(-1.2)-1.1\times(-2.4)=1.44$，$1.44-1.1\times2.88=-1.728$，$(-1.728)-1.1\times(-3.456)=2.0736$。合起来每步位置乘 $1-2\times1.1=-1.2$：负号让球跨到谷底另一侧，$1.2>1$ 让离谷底的距离每步变成 $1.2$ 倍，越走越远，这叫 divergence（发散）。**方向没有错，是步长太大，一步跨过了谷底。**',
            '步子太大，跨过谷底还越跳越远', stage=2,
        )
        # This is a reset, not an optimization step; label it explicitly.
        self.play(small_marks.animate.set_opacity(0.4),
                  Transform(heading, words('重置起点，再试大步', 345, 140, RED, 20)),
                  Transform(eta_label, formula(r'\eta=1.1', 345, 170, color=RED)),
                  Transform(arithmetic, formula(r'\theta=1', 345, 211, color=RED)),
                  Transform(trend, words('绿色痕迹：刚才的小步', 345, 264)), run_time=0.5)
        readout['dim'] = True
        self.play(theta.animate.set_value(1), run_time=0.6)
        readout.update(tex=r'\theta=1', color=RED, dim=False)
        self.wait(1.2)
        large_marks = VGroup()
        large_steps = [(-1.2, '-1.2', r'1-1.1\times2=-1.2'),
                       (1.44, '1.44', r'(-1.2)-1.1\times(-2.4)=1.44'),
                       (-1.728, '-1.728', r'1.44-1.1\times2.88=-1.728'),
                       (2.0736, '2.0736', r'(-1.728)-1.1\times(-3.456)=2.0736')]
        for value, text, calculation in large_steps:
            readout['dim'] = True
            self.play(theta.animate.set_value(value), run_time=0.6)
            mark = Dot(one(value), radius=px(3), color=RED)
            large_marks.add(mark)
            readout.update(tex=r'\theta=' + text, dim=False)
            self.play(FadeIn(mark), Transform(arithmetic, formula(calculation, 345, 211, 27, RED)),
                      run_time=0.5)
            self.wait(1.2)
        self.play(Transform(trend, VGroup(words('到谷底的距离：每步变大', 345, 264, RED),
                                        formula(r'|\theta|\;\times1.2', 345, 293, color=RED))), run_time=0.5)
        self.wait(1.2)

        self.step(
            r'换成两个参数 $q_1,q_2$。左图从正上方俯视一个碗 $L=q_1^2+4q_2^2$：同一个椭圆上的点高度相同，叫 level set（等高线）；$q_2^2$ 前面乘了 $4$，沿 $q_2$ 方向更陡，所以椭圆上下扁。梯度把两个方向的斜率排在一起：$\nabla L=(2q_1,8q_2)$。算 $q_1$ 方向的斜率时把 $q_2$ 当常数，这叫 partial derivative（偏导）：$q_1^2$ 求导得 $2q_1$，$4q_2^2$ 不随 $q_1$ 变，导数是 $0$，所以 $q_1$ 方向的斜率是 $2q_1$；$q_2$ 方向同理，把 $q_1$ 当常数，$4q_2^2$ 求导得 $4\times2q_2=8q_2$。在起点 $(4,2)$，梯度是 $(2\times4,8\times2)=(8,16)$，红箭头（按比例画短了）垂直于椭圆、指向上坡（沿等高线走高度不变，所以最陡的上坡方向和等高线垂直）。更新规则不变，取 $\eta=0.1$：$q_1-0.1\times2q_1=(1-2\times0.1)q_1=0.8q_1$，$q_2-0.1\times8q_2=(1-8\times0.1)q_2=0.2q_2$。**每个方向各乘自己的因子：$q_1$ 每步乘 $0.8$，$q_2$ 每步乘 $0.2$。**首步到 $(4\times0.8,2\times0.2)=(3.2,0.4)$；绿线共走九步，第 $k$ 步在 $(4(0.8)^k,2(0.2)^k)$，两个因子都在 $0$ 和 $1$ 之间，所以不换边，平稳靠近中心。',
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
        pos_label.clear_updaters()
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
            r'淡绿色是刚才 $\eta=0.1$ 的路径。仍从 $(4,2)$ 出发，步长加到 $\eta=0.24$：红线上下来回折返，却越折越靠近中心。用同样的方法算因子：$q_1$ 每步乘 $1-2\times0.24=1-0.48=0.52$，很快缩小；$q_2$ 每步乘 $1-8\times0.24=1-1.92=-0.92$，负号让它每步换到中心另一侧，$0.92$ 只比 $1$ 小一点，所以缩得很慢。首步到 $(4\times0.52,2\times(-0.92))=(2.08,-1.84)$，九步的精确位置是 $(4(0.52)^k,2(-0.92)^k)$。两个因子的绝对值都小于 $1$，所以两个方向都 convergence（收敛）。**来回折返不等于发散，要看离中心的距离是否每步缩小。**后期拖住整体的是慢的 $q_2$（$|q_2|$ 每步还剩 $0.92$ 倍），而不是 $q_1$。',
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
            r'右侧把上一步的规律写成条件：要从任意起点都稳稳走到中心，两个方向的因子绝对值都必须小于 $1$。$q_1$ 方向：$|1-2\eta|<1$ 即 $-1<1-2\eta<1$，各减 $1$ 得 $-2<-2\eta<0$，再除以 $-2$（不等号反向）得 $0<\eta<1$。$q_2$ 方向：$|1-8\eta|<1$ 即 $-1<1-8\eta<1$，各减 $1$ 得 $-2<-8\eta<0$，除以 $-8$ 得 $0<\eta<2/8=0.25$。**两个条件要同时成立，取交集，这个碗的稳定区间是 $0<\eta<0.25$。**所以 $0.24$ 虽然折返仍收敛；在边界 $\eta=0.25$，$q_2$ 每步乘 $1-8\times0.25=-1$，只换边、不再缩小；超过边界一般会发散。这个阈值取决于损失的形状，不能当成所有问题的通用步长。',
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
            r'一句话：梯度下降就是反复“看脚下坡度，往反方向走一小步”。**更新规则 $\theta\leftarrow\theta-\eta\nabla L$：从现在的位置，朝上坡的反方向走，步长由 $\eta$ 控制。**$\eta$ 太大会发散；来回折返却未必发散，关键是离最低点的距离是否持续缩小。本例二维碗的稳定区间是 $0<\eta<0.25$，$\eta=0.24$ 时快的是 $q_1$，慢的是折返的 $q_2$。本章的目标是会写出这条更新式并手算两步，也要能说清 $\eta$ 太大会怎样。',
            ['沿负梯度，一步步下山', r'\theta\leftarrow\theta-\eta\nabla L',
             'η 太大会发散；折返未必发散'],
        )
