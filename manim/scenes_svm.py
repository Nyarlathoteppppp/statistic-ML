"""SVM and kernel intuition scenes for the exam-review videos.

The 3-D view in KernelLift is deliberately a 2-D oblique projection.  No
LaTeX-backed mobjects are used because the render environment has no TeX.
"""
import numpy as np

from manim import (
    Arrow,
    BackgroundRectangle,
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
    Polygon,
    RIGHT,
    Square,
    UL,
    UP,
    UR,
    ValueTracker,
    VGroup,
    always_redraw,
)
from common import (
    BG,
    BLUE,
    DIM,
    GREEN,
    GREY,
    GRID,
    RED,
    TEAL,
    WHITE,
    YELLOW,
    MT,
    P,
    StepScene,
    T,
    px,
)


# The browser scene uses this deterministic pseudo-random generator.
def _rnd(k):
    x = np.sin(k * 12.9898 + 78.233) * 43758.5453
    return float(x - np.floor(x))


INNER = []
OUTER = []
for _i in range(14):
    _r = 0.25 + 0.65 * _rnd(_i)
    _a = 2 * np.pi * _rnd(_i + 50)
    INNER.append((_r * np.cos(_a), _r * np.sin(_a)))
for _i in range(20):
    _r = 1.75 + 0.5 * _rnd(_i + 100)
    _a = 2 * np.pi * (_i / 20 + 0.03 * _rnd(_i + 150))
    OUTER.append((_r * np.cos(_a), _r * np.sin(_a)))


# ---------------------------------------------------------------------------
# c29 - kernel lift
class KernelLift(StepScene):
    ID = 'kernel-lift'
    TITLE = 'Kernel 的直觉：抬到高维，弯的边界就变成平的'
    FLOW = ['直线不够', '倾斜抬点', '平面分开', '点积捷径', '交圆投回']

    def construct(self):
        # Local imports keep the other scene and its helpers entirely unchanged.
        from manim import RoundedRectangle, SurroundingRectangle, Transform
        from common import M

        self.question(
            r'一类点（蓝）聚在中间，另一类点（红）在外面围成一圈。不管直线怎么放，都会把外圈切开，所以一条直线分不开它们。可是 SVM 这样的线性分类器，在原来的平面上只能画直线。能不能给每个点换一种描述方式，让两类变得容易分开？',
            ['一条直线分不开两类点', '换个看法，能不能分开？'],
        )

        tilt = ValueTracker(0)
        lift = ValueTracker(0)
        ring_alpha = ValueTracker(0)
        plane_alpha = ValueTracker(0)
        circle_alpha = ValueTracker(0)
        circle_z = ValueTracker(2)

        def project(x, y, z=0):
            # Browser projection, rescaled into a dedicated left-hand viewport.
            # Only tilt controls the view; lift and circle_z control geometry.
            t = tilt.get_value()
            az = 0.5 * t
            el = np.pi / 2 + (0.32 - np.pi / 2) * t
            xr = x * np.cos(az) - y * np.sin(az)
            yr = x * np.sin(az) + y * np.cos(az)
            return P(225 + 54 * xr,
                     200 + 70 * t - 54 * (yr * np.sin(el) + 0.55 * z * np.cos(el)))

        # For r<2.25, the complete dot stays within y=85..339 throughout.
        # Cards occupy x=425..619; even the plane's rightmost corner is x<405.
        def card(*rows, x=430, y=52):
            for row in rows:
                if row.width > px(184):
                    row.scale_to_fit_width(px(184))
            body = VGroup(*rows).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
            body.move_to(P(x, y), aligned_edge=UL)
            bg = BackgroundRectangle(body, color=BG, fill_opacity=0.96, buff=px(5))
            return VGroup(bg, body).set_z_index(20)

        def point_mob(x, y, color, layer):
            dot = Dot(project(x, y), radius=px(4), color=color).set_z_index(layer)
            dot.add_updater(lambda m: m.move_to(project(x, y, lift.get_value() * (x*x + y*y))))
            return dot

        inner_dots = VGroup(*[point_mob(x, y, BLUE, 3) for x, y in INNER])
        outer_dots = VGroup(*[point_mob(x, y, RED, 5) for x, y in OUTER])
        axes = VGroup(
            always_redraw(lambda: Line(project(-2.25, 0), project(2.5, 0),
                                       color=GREY, stroke_width=1.5, stroke_opacity=0.5)),
            always_redraw(lambda: Line(project(0, -2.25), project(0, 2.5),
                                       color=GREY, stroke_width=1.5, stroke_opacity=0.5)),
            always_redraw(lambda: Line(project(0, 0), project(0, 0, 6),
                                       color=GREY, stroke_width=1.5,
                                       stroke_opacity=0.6 * tilt.get_value())),
        )
        # Build MathTex once, then move labels with the same projection.
        # x3 sits LEFT of the axis tip: right of the tip is a lifted red dot (OUTER[3]) and the top
        # of the r=2.25 bowl ring passes just above it.  z=9 keeps every label above dots (3/5) and plane (4).
        axis_labels = VGroup()
        for tex, xyz, offset in (
            (r'x_1', (2.5, 0, 0), RIGHT * px(12)),
            (r'x_2', (0, 2.5, 0), UP * px(12)),
            (r'x_3', (0, 0, 6), LEFT * px(13) + DOWN * px(3)),
        ):
            label = M(tex, 22, GREY).set_z_index(9)
            def follow(m, p=xyz, off=offset):
                m.move_to(project(*p) + off)
                if p[2]:
                    m.set_opacity(tilt.get_value())
            follow(label)
            label.add_updater(follow)
            axis_labels.add(label)

        legend = card(T('蓝：内圈', 19, BLUE), T('红：外圈', 19, RED))
        self.step(
            r'这是原来的平面，两条坐标轴是 $x_1,x_2$：蓝点（内圈）聚在中间，红点（外圈）围成一圈。灰色直线先竖在正中，再向右平移：不管停在哪里，都有红点落在线的两侧，直线总会切错。**蓝点被红点整圈包住，能分开它们的边界只能是弯的，不能是一条直线。**',
            '蓝在里面、红在外面，直线总会切错', stage=0,
        )
        self.play(FadeIn(axes), FadeIn(axis_labels), FadeIn(inner_dots),
                  FadeIn(outer_dots), FadeIn(legend), run_time=1)
        trial = Line(P(225, 80), P(225, 320), color=GREY, stroke_width=2).set_z_index(6)
        self.play(Create(trial), run_time=0.7)
        self.play(Transform(trial, Line(P(270, 80), P(270, 320), color=GREY,
                                        stroke_width=2).set_z_index(6)), run_time=1.2)
        self.wait(1.2)
        self.play(FadeOut(trial), run_time=0.5)

        self.step(
            r'画面倾斜，改从斜上方看同一张平面；右侧提示“先换视角，还没抬点”。所有点仍贴在底面上，位置一点没变：换视角不会改变数据。竖起来的第三条轴叫 $x_3$，此刻每个点的 $x_3$ 都还是 $0$；倾斜是为了下一步能看见“高度”。',
            '先倾斜看：所有点仍在原来的底面', stage=1,
        )
        view_note = card(T('先换视角', 19, YELLOW), T('还没抬点', 17, GREY), y=137)
        self.play(FadeIn(view_note), tilt.animate.set_value(1), run_time=2)
        self.wait(1.5)

        rings = VGroup()
        for radius in (0.5, 1, 1.5, 2.25):
            def ring_build(r=radius):
                pts = [project(r*np.cos(a), r*np.sin(a), lift.get_value()*r*r)
                       for a in np.linspace(0, 2*np.pi, 81, endpoint=False)]
                return Polygon(*pts, fill_opacity=0, stroke_color=GREY,
                               stroke_width=1.3, stroke_opacity=ring_alpha.get_value()).set_z_index(1)
            rings.add(always_redraw(ring_build))
        drops = VGroup()
        for x, y in INNER + OUTER:
            def drop_build(a=x, b=y):
                z = max(1e-6, lift.get_value()) * (a*a + b*b)
                return Line(project(a, b), project(a, b, z), color=GREY,
                            stroke_width=0.8, stroke_opacity=0.3*lift.get_value()).set_z_index(2)
            drops.add(always_redraw(drop_build))

        self.step(
            r'现在真的抬点：每个点在平面上的位置不变，只往上升，升高的量等于它到原点距离的平方。灰色竖线连回原位置，每个灰色圆圈上的点高度相同，叠起来是一只碗，左上角写着碗面 $x_3=x_1^2+x_2^2$。这一步叫 feature map（特征映射）：把二维点 $\mathbf u=(u_1,u_2)$ 变成三维点 $\varphi(\mathbf u)=(u_1,u_2,u_1^2+u_2^2)$。$\mathbf u$ 只是某个点的名字，$u_1,u_2$ 是它在 $x_1,x_2$ 轴上的坐标；$\varphi$ 读作 phi，表示“把点变成新坐标”的规则。前两个坐标保留位置，第三个是新增的高度；由勾股定理 $u_1^2+u_2^2=r^2$（$r$ 是到原点的距离），所以 $x_3=r^2$。蓝点半径由 $0.25+0.65q$ 生成（$q$ 是满足 $0\le q<1$ 的随机数），所以 $r<0.25+0.65=0.9$，高度 $x_3<0.9^2=0.81$；红点半径为 $1.75+0.5q\ge1.75$，所以 $x_3\ge1.75^2=3.0625$。**离原点越远抬得越高：蓝点都很低，红点都很高。**',
            '离原点越远，新增的高度就越大', stage=1,
        )
        self.add(rings, drops)
        self.play(FadeOut(legend), FadeOut(view_note), ring_alpha.animate.set_value(0.45),
                  run_time=0.6)
        self.play(lift.animate.set_value(1), run_time=2)
        fmap_eq = M([r'\varphi(\mathbf u)=(', r'u_1,u_2', ',', r'u_1^2+u_2^2', ')'], 24)
        fmap_eq[1].set_color(BLUE)
        fmap_eq[3].set_color(YELLOW)
        kept = VGroup(M(r'u_1,u_2', 22, BLUE), T('保留位置', 16, GREY)).arrange(RIGHT, buff=0.15)
        fmap = card(fmap_eq, kept, M(r'u_1^2+u_2^2', 22, YELLOW),
                    T('新增：到原点的距离²', 16, GREY))
        bounds = card(M(r'r<0.9\ \Rightarrow\ x_3<0.81', 22, BLUE),
                      M(r'r\ge1.75\ \Rightarrow\ x_3\ge3.0625', 22, RED),
                      T('高度就是距离的平方', 16, GREY), y=184)
        bowl = card(VGroup(T('碗面', 16, GREY), M(r'x_3=x_1^2+x_2^2', 23, GREY))
                    .arrange(RIGHT, buff=0.12), x=26, y=49)
        self.play(FadeIn(fmap), FadeIn(bounds), FadeIn(bowl), run_time=0.9)
        self.wait(2)

        def plane_build():
            side = 2.45
            return Polygon(*[project(x, y, 2) for x, y in
                             [(-side, -side), (side, -side), (side, side), (-side, side)]],
                           fill_color=YELLOW, fill_opacity=0.18*plane_alpha.get_value(),
                           stroke_color=YELLOW, stroke_width=2,
                           stroke_opacity=plane_alpha.get_value()).set_z_index(4)

        plane = always_redraw(plane_build)
        plane_tag = card(VGroup(T('分隔平面', 16, YELLOW), M(r'x_3=2', 25, YELLOW))
                         .arrange(RIGHT, buff=0.12),
                         M(r'0.81<2<3.0625', 24, YELLOW), y=278)
        leader = Line(project(2.45, -2.45, 2), P(424, 285), color=YELLOW,
                      stroke_width=1.2).set_z_index(6)
        self.step(
            r'在蓝点和红点的高度之间放一张水平的黄色平面 $x_3=2$。因为 $0.81<2<3.0625$，所有蓝点都在平面下方，所有红点都在上方。这张 separating plane（分隔平面）把两类完全分开，也就是说，在新的三维空间里数据 linearly separable（线性可分）。**原来要一条弯曲线才能分开，抬高之后一张平的平面就够了。**这里的 $2$ 只是在空隙里挑的方便值，不是按最大间隔算出来的解。',
            '黄色平面夹在中间：蓝在下，红在上', stage=2,
        )
        # Explicitly add the geometry BEFORE animating its visibility.
        self.add(plane)
        self.play(plane_alpha.animate.set_value(1), run_time=1)
        self.play(FadeIn(leader), FadeIn(plane_tag), run_time=0.7)
        self.wait(2)

        # ---- kernel step: two REAL data points, the same number by two routes ----
        # u = INNER[12] (blue), v = OUTER[0] (red).  Chosen so that the 2-dp numbers on screen, re-multiplied
        # by hand along either route, still round to the shown total (checked against numpy when authoring).
        iu, iv = 12, 0
        U, V = INNER[iu], OUTER[iv]
        hu, hv = U[0] ** 2 + U[1] ** 2, V[0] ** 2 + V[1] ** 2
        k_lift = float(np.dot([U[0], U[1], hu], [V[0], V[1], hv]))   # (a) build phi(u), phi(v), then dot
        k_direct = U[0] * V[0] + U[1] * V[1] + hu * hv                 # (b) K(u,v) from the 2-D coordinates only
        assert abs(k_lift - k_direct) < 1e-9

        def n2(v):
            return f'{v:.2f}'

        def p2(v):          # negatives get brackets inside products and squares
            return f'({v:.2f})' if v < 0 else f'{v:.2f}'

        u1, u2, v1, v2, hu2, hv2, k2 = (n2(U[0]), n2(U[1]), n2(V[0]), n2(V[1]),
                                        n2(hu), n2(hv), n2(k_lift))
        # Hand arithmetic with the 2-dp numbers on screen: each product to 3 dp, then their sum.
        r1, r2, rv1, rv2 = (round(c, 2) for c in (U[0], U[1], V[0], V[1]))
        t_first = round(r1 * rv1, 3), round(r2 * rv2, 3)
        t_a = round(round(hu, 2) * round(hv, 2), 3)                       # route (a): height x height
        t_b = round((r1 ** 2 + r2 ** 2) * (rv1 ** 2 + rv2 ** 2), 3)       # route (b): the two brackets
        sum_a, sum_b = sum(t_first) + t_a, sum(t_first) + t_b
        assert n2(sum_a) == k2 and n2(sum_b) == k2                        # both still round to the shown total

        def terms(ts):     # 1.224-0.036+1.756
            return ''.join((f'{t:.3f}' if i == 0 else (f'-{-t:.3f}' if t < 0 else f'+{t:.3f}'))
                           for i, t in enumerate(ts))

        sum_a_terms = '=' + terms(t_first + (t_a,))
        sum_b_terms = '=' + terms(t_first + (t_b,))
        sum_a_tex = sum_a_terms + f'={sum_a:.3f}'
        sum_b_tex = sum_b_terms + f'={sum_b:.3f}'
        first_two = '=' + u1 + r'\times' + v1 + '+' + p2(U[1]) + r'\times' + v2
        heights = '+' + hu2 + r'\times' + hv2
        squares = '+(' + u1 + '^2+' + p2(U[1]) + '^2)(' + v1 + '^2+' + v2 + '^2)'

        # 3-D markers: floor point (white) -> yellow riser -> lifted point (yellow ring)
        pu0, pu1 = project(U[0], U[1]), project(U[0], U[1], hu)
        pv0, pv1 = project(V[0], V[1]), project(V[0], V[1], hv)
        lift_rings = VGroup(*[Circle(radius=px(7.5), stroke_color=YELLOW, stroke_width=2.5).move_to(p)
                              for p in (pu1, pv1)]).set_z_index(9)
        base_rings = VGroup(*[Circle(radius=px(4.5), stroke_color=WHITE, stroke_width=2).move_to(p)
                              for p in (pu0, pv0)]).set_z_index(9)
        risers = VGroup(*[DashedLine(a, b, color=YELLOW, stroke_width=1.6, dash_length=px(4))
                          for a, b in ((pu0, pu1), (pv0, pv1))]).set_z_index(8)

        def tag(tex, color, at):
            m = M(tex, 20, color).move_to(at)
            return VGroup(BackgroundRectangle(m, color=BG, fill_opacity=0.85, buff=px(2)), m).set_z_index(10)

        tags = VGroup(tag(r'\varphi(\mathbf u)', BLUE, pu1 + RIGHT * px(24) + UP * px(5)),
                      tag(r'\mathbf u', BLUE, pu0 + RIGHT * px(13) + DOWN * px(6)),
                      tag(r'\varphi(\mathbf v)', RED, pv1 + LEFT * px(25) + UP * px(6)),
                      tag(r'\mathbf v', RED, pv0 + RIGHT * px(11) + DOWN * px(9)))

        # Two stacked cards in the free right-hand column (x 410..626).  `align` lines rows up on the "=" column
        # before the frame is sized, so every row stays inside its card.
        def kcard(rows, y, align=None):
            for row in rows:
                if row.width > px(212):
                    row.scale_to_fit_width(px(212))
            body = VGroup(*rows).arrange(DOWN, aligned_edge=LEFT, buff=px(6))
            body.move_to(P(416, y), aligned_edge=UL)
            if align:
                align()
            frame = RoundedRectangle(corner_radius=px(5), width=body.width + px(14), height=body.height + px(12),
                                     fill_color=BG, fill_opacity=0.96, stroke_color=DIM, stroke_width=1.5)
            frame.move_to(body)
            return VGroup(frame, body).set_z_index(20)

        def result_row(total):     # "=2.944 ≈ 2.94": the hand sum, then the rounded total that gets boxed
            res = VGroup(M(r'\approx', 23, YELLOW), M(k2, 23, YELLOW)).arrange(RIGHT, buff=px(6))
            return VGroup(M(f'={total:.3f}', 21), res).arrange(RIGHT, buff=px(6)), res

        a_phi_u = M([r'\varphi(\mathbf u)', '=(' + u1 + r',\ ' + u2 + r',\ ', hu2, ')'], 21)
        a_phi_v = M([r'\varphi(\mathbf v)', '=(' + v1 + r',\ ' + v2 + r',\ ', hv2, ')'], 21)
        a_phi_u[0].set_color(BLUE)
        a_phi_v[0].set_color(RED)
        a_phi_u[2].set_color(YELLOW)
        a_phi_v[2].set_color(YELLOW)
        a_dot = M([r"\varphi(\mathbf u)'\varphi(\mathbf v)", first_two], 21)
        a_last = M(heights, 21, YELLOW)
        a_terms = M(sum_a_terms, 21)
        a_total, a_res = result_row(sum_a)

        def align_a():
            a_last.align_to(a_dot[1], LEFT).shift(RIGHT * px(7))
            a_terms.align_to(a_dot[1], LEFT)
            a_total.align_to(a_dot[1], LEFT)

        card_a = kcard([T('① 先抬高成 3-D 点，再点积', 18, YELLOW), a_phi_u, a_phi_v, a_dot, a_last, a_terms,
                        a_total], 50, align_a)

        b_k = M([r'K(\mathbf u,\mathbf v)=u_1v_1+u_2v_2', r'+(u_1^2+u_2^2)(v_1^2+v_2^2)'], 20)
        b_k[1].set_color(YELLOW)
        b_first = M(first_two, 21)
        b_sq = M(squares, 21, YELLOW)
        b_terms = M(sum_b_terms, 21)
        b_total, b_res = result_row(sum_b)

        def align_b():
            for row in (b_first, b_terms, b_total):      # same "=" column as route (a)
                row.align_to(a_dot[1], LEFT)
            b_sq.shift(RIGHT * px(8))

        card_b = kcard([T('② 直接用核：只用二维的 u、v', 18, YELLOW), b_k, b_first, b_sq, b_terms, b_total,
                        T('没有造出 3-D 点', 16, GREY)], 60 + card_a.height / px(1), align_b)
        same = VGroup(SurroundingRectangle(a_res[1], color=YELLOW, buff=px(3), stroke_width=2),
                      SurroundingRectangle(b_res[1], color=YELLOW, buff=px(3), stroke_width=2)).set_z_index(21)
        same_note = T('两条路，同一个数', 17, YELLOW).set_z_index(21)
        same_note.next_to(card_b, DOWN, buff=px(8)).align_to(card_b, LEFT)

        others = [d for k, d in enumerate(inner_dots) if k != iu] + [d for k, d in enumerate(outer_dots) if k != iv]
        say_kernel = (
            r'其余点变暗，只留两个真实数据点：白圈是它们在底面的位置，蓝点 $\mathbf u=('
            + u1 + ',' + u2 + r')$、红点 $\mathbf v=(' + v1 + ',' + v2 + r')$；黄虚线向上连到黄圈，'
            + r'是抬高后的 $\varphi(\mathbf u)$ 和 $\varphi(\mathbf v)$。'
            + r'SVM 的 dual（对偶）训练和预测只用到两点之间的点积'
            + r"（上一章 c28：dual 的目标里，数据只以点积 $\bx_i'\bx_j$ 的形式出现，预测式里也只有点积 $\bx_i'\bx$，所以只要能算出点积就够了），"
            + r'所以算法不一定需要真的抬点，它只要抬点后的点积。'
            + r'卡片 ① 先抬高再点积：$\varphi(\mathbf u)=(' + u1 + ',' + u2 + ',' + hu2 + r')$，$\varphi(\mathbf v)=('
            + v1 + ',' + v2 + ',' + hv2 + r')$（第三个数是新高度，即两个坐标的平方和），'
            + r"对应坐标相乘再相加，就是点积 $\varphi(\mathbf u)'\varphi(\mathbf v)$（一撇表示转置）：$"
            + first_two[1:] + heights + sum_a_tex + r'\approx' + k2 + '$。'
            + r'卡片 ② 直接用 kernel（核函数）$K(\mathbf u,\mathbf v)=u_1v_1+u_2v_2+(u_1^2+u_2^2)(v_1^2+v_2^2)$，只代入二维坐标：$'
            + first_two[1:] + squares + sum_b_tex + r'\approx' + k2 + '$。'
            + r"**两条路得到同一个数，因为 $K(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$，而 ② 全程没有造出 3-D 点。**"
            + r'对照两式：前两项都是原位置的点积；② 最后的两个括号正是两个新高度，相乘就是 ① 的最后一项。'
            + r'屏幕上的坐标都保留两位小数，每个乘积再保留三位：① 得 $' + f'{sum_a:.3f}' + r'$，② 得 $' + f'{sum_b:.3f}'
            + r'$，差别只来自这些舍入，四舍五入都是 $' + k2 + r'$；用不舍入的坐标算，两条路完全相等，都是 $'
            + f'{k_lift:.4f}' + r'\ldots$。'
            + r'直接算 $K$ 来代替抬高后的点积，就叫 kernel trick（核技巧），结果精确而非近似。'
            + r'本例只有 3 维，两条路算得一样快；特征维数很高甚至无限（多项式核、RBF，这两种核本章后面马上讲）时，直接用核就省得多。'
            + r'本例的映射也不同于章节后面纯二次多项式核的映射。'
        )
        self.step(say_kernel, '两条路算出同一个数：核不用造 3-D 点', stage=3)
        self.play(FadeOut(fmap), FadeOut(bounds), FadeOut(plane_tag), FadeOut(leader),
                  plane_alpha.animate.set_value(0.35), ring_alpha.animate.set_value(0.2),
                  *[d.animate.set_opacity(0.2) for d in others],
                  Create(lift_rings), Create(base_rings), Create(risers), FadeIn(tags), run_time=0.8)
        self.play(FadeIn(card_a, shift=LEFT * 0.1), Indicate(lift_rings, color=YELLOW, scale_factor=1.35),
                  run_time=0.9)
        self.wait(1.0)
        self.play(FadeIn(card_b, shift=LEFT * 0.1), Indicate(base_rings, color=WHITE, scale_factor=1.5),
                  run_time=0.9)
        self.wait(0.8)
        self.play(Create(same), FadeIn(same_note), run_time=0.6)
        self.wait(1.5)
        kernel_marks = VGroup(card_a, card_b, same, same_note, lift_rings, base_rings, risers, tags)

        def circle_build():
            r = np.sqrt(2)
            pts = [project(r*np.cos(a), r*np.sin(a), circle_z.get_value())
                   for a in np.linspace(0, 2*np.pi, 121, endpoint=False)]
            return Polygon(*pts, fill_opacity=0, stroke_color=YELLOW,
                           stroke_width=3.5, stroke_opacity=circle_alpha.get_value()).set_z_index(8)

        circle = always_redraw(circle_build)
        intersection = card(T('先取碗面与平面的交集', 18, YELLOW),
                            M(r'x_3=x_1^2+x_2^2,\quad x_3=2', 23),
                            M(r'\Rightarrow x_1^2+x_2^2=2', 26, YELLOW),
                            M(r'r^2=2\ \Rightarrow\ r=\sqrt{2}', 23, YELLOW),
                            T('只投影交圆', 18, YELLOW),
                            T('不是把整张平面压扁', 16, GREY))
        self.step(
            r'最后回到原平面找边界。黄色平面和碗面相交出一圈黄色的圆，高度是 $2$，这叫 intersection（交集）。右侧卡片联立碗面 $x_3=x_1^2+x_2^2$ 和平面 $x_3=2$，两者相等得 $x_1^2+x_2^2=2$，即 $r^2=2$、$r=\sqrt2\approx1.41$，正好夹在蓝点的 $r<0.9$ 和红点的 $r\ge1.75$ 之间。接着平面淡去，黄圆沿竖直方向落到底面，点也落回原位，视角转回俯视：黄圆围住蓝点，把红点挡在外面。**三维里平的分隔平面，投回原平面就成了弯的边界：半径 $\sqrt2$ 的圆。**只投影这一圈交线，不是把整张平面压扁。',
            '只把交圆投回去，变成围住蓝点的边界', stage=4,
        )
        self.add(circle)
        # Clear the kernel example and restore the full scene while the intersection circle appears.
        self.play(circle_alpha.animate.set_value(1), FadeOut(kernel_marks),
                  plane_alpha.animate.set_value(1), ring_alpha.animate.set_value(0.45),
                  *[d.animate.set_opacity(1) for d in others], run_time=0.9)
        self.play(FadeOut(bowl), FadeIn(intersection), run_time=0.8)
        self.wait(1.8)
        self.play(plane_alpha.animate.set_value(0), ring_alpha.animate.set_value(0.15), run_time=0.7)
        # Keep the oblique view fixed: the SAME intersection visibly descends.
        self.play(circle_z.animate.set_value(0), run_time=2)
        self.wait(1.2)
        self.play(lift.animate.set_value(0), ring_alpha.animate.set_value(0), run_time=1.5)
        self.play(tilt.animate.set_value(0), run_time=2)
        self.wait(2)

        # Stop all live geometry before the standard closing veil.  Custom
        # z-indices must not put points/cards in front of StepScene.takeaway().
        for mob in list(self.mobjects):
            mob.clear_updaters()
            mob.set_z_index(0)
        self.takeaway(
            r"一句话：给每个点加一个新特征（到原点距离的平方），原来只能用弯曲线分开的两类，在三维里一张平面就能分开。本例 $\varphi(\mathbf u)=(u_1,u_2,u_1^2+u_2^2)$，分隔平面为 $x_3=2$；平面和碗面的交圆投回原平面，得到边界 $x_1^2+x_2^2=2$。**kernel 直接算出特征空间的点积，$K(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$，是精确的捷径，不是近似。**本章的目标是能解释核技巧为什么精确而不是近似，并能为给定的核写出对应的特征映射，再代入数字验证 $K$ 等于特征的点积。",
            ['新增高度，让两类能被平面分开', '交圆投回去，才是原空间的边界',
             '核直接算特征点积：精确而非近似'],
        )


# ---------------------------------------------------------------------------
# c25 - maximum margin
BLUE_DATA = [(3, 9), (3, 4), (1, 2)]
RED_DATA = [(8, 8), (6, 6), (9, 3)]
POINT_NUM = {(3, 9): 1, (3, 4): 2, (1, 2): 6, (8, 8): 3, (6, 6): 4, (9, 3): 5}
# Label placement per point: (side, distance[, right edge in data x]). Checked against every line that moves
# (boundary, both street edges, the shadow axis and the six perpendiculars) at the held angles 0.6 and 0, and against
# the support-vector rings: all clear there (while the line rotates, a line may pass behind a label's dark backing).
# 2 sits below-left, right edge at x=2.85: on its left the perpendicular from 6 rises along x=1 at angle 0, and the
# ring around 2 leaves no room in between. 6 sits up-left (the y ticks are on its left, the shadow axis passes just
# below it at angle 0.6). 4 ends left of x=8, where the perpendicular from 3 drops at angle 0.
LABEL_SIDE = {(3, 9): (LEFT, 0.38), (3, 4): (DOWN, 0.35, 2.85), (1, 2): (UL, 0.22), (8, 8): (UP, 0.3),
              (6, 6): (UR, 0.27), (9, 3): (UR, 0.3)}
# Last step: how far the non-support points 3, 5, 6 are pushed outward (away from the street).
OUTWARD = {(8, 8): (0.5, 0.0), (9, 3): (0.4, -0.4), (1, 2): (-0.5, 0.0)}
TICK = '#a3aab6'


def _separator(angle, blue=BLUE_DATA, red=RED_DATA):
    """Unit normal (pointing from the blue class to the red class), centre offset and one-sided margin of the
    best boundary with this normal direction: the middle of the gap between the shadows n'p of the two classes."""
    normal = np.array([np.cos(angle), np.sin(angle)])
    blue_proj = [np.dot(normal, p) for p in blue]
    red_proj = [np.dot(normal, p) for p in red]
    far_blue = max(blue_proj)
    near_red = min(red_proj)
    return normal, (far_blue + near_red) / 2, (near_red - far_blue) / 2


def _chart_point(x, y):
    # A square 0..10 chart, preserving the browser scene's data coordinates.
    return P(145 + 28 * x, 315 - 28 * y)


def _clip_data(normal, c):
    """Data-space endpoints of normal·p=c (normal a unit vector) clipped to the [0,10] square, or None."""
    direction = np.array([-normal[1], normal[0]])
    candidates = []
    for coordinate in (0.0, 10.0):
        for axis in (0, 1):
            if abs(direction[axis]) < 1e-8:
                continue
            t = (coordinate - normal[axis] * c) / direction[axis]
            point = normal * c + direction * t
            if -1e-7 <= point[1 - axis] <= 10.0 + 1e-7:
                candidates.append(point)
    if len(candidates) < 2:
        return None
    return candidates[0], candidates[-1]


def _clipped_segment(normal, c):
    """Endpoints of normal·p=c clipped to the [0,10] square (scene coordinates)."""
    ends = _clip_data(normal, c)
    if ends is None:
        return _chart_point(0, 0), _chart_point(10, 10)
    return _chart_point(*ends[0]), _chart_point(*ends[1])


class SvmMargin(StepScene):
    ID = 'svm-margin'
    TITLE = '最大 margin：把分界线放到离两类都最远的地方'
    FLOW = ['先找分界', '画出街道', '旋转变宽', '支持向量']

    def construct(self):
        self.question(
            r'能把两类点分开的直线有很多条，它们在训练点上都不出错。可新来的点会落在训练点附近，分界线如果贴得太近，新点稍偏一点就可能被分错。哪一条对新数据最可靠？**直觉上，离两类点都尽量远的那条最稳。**',
            ['很多条线都能分开数据', '哪一条对新点更可靠？'],
        )

        angle = ValueTracker(0.6)
        nudge4 = ValueTracker(0.0)      # x-offset of support vector 4 (last step)
        spread = ValueTracker(0.0)      # 0 -> 1 pushes the non-support points 3, 5, 6 outward (last step)
        shadow_alpha = ValueTracker(0.0)

        def live(p):
            """Current position of data point p (the last step moves some of them)."""
            dx, dy = OUTWARD.get(p, (0.0, 0.0))
            s = spread.get_value()
            return (p[0] + dx * s + (nudge4.get_value() if p == (6, 6) else 0.0), p[1] + dy * s)

        def sep():
            return _separator(angle.get_value(), [live(p) for p in BLUE_DATA], [live(p) for p in RED_DATA])

        grid = VGroup()
        for k in range(0, 11, 2):
            grid.add(Line(_chart_point(k, 0), _chart_point(k, 10), color=GRID, stroke_width=1))
            grid.add(Line(_chart_point(0, k), _chart_point(10, k), color=GRID, stroke_width=1))
        grid.set_opacity(0.45)
        # Tick numbers outside the chart (x along the bottom edge, y along the left edge), one per grid line.
        ticks = VGroup()
        for k in range(0, 11, 2):
            q = _chart_point(k, 0)
            ticks.add(Line(q, q + DOWN * px(4), color=TICK, stroke_width=1.2),
                      T(str(k), 16, TICK).next_to(q + DOWN * px(4), DOWN, buff=px(2)))
            q = _chart_point(0, k)
            ticks.add(Line(q, q + LEFT * px(4), color=TICK, stroke_width=1.2),
                      T(str(k), 16, TICK).next_to(q + LEFT * px(4), LEFT, buff=px(3)))

        def follow(m, p):
            m.add_updater(lambda mob: mob.move_to(_chart_point(*live(p))))
            return m

        blue_dots = VGroup(*[follow(Dot(_chart_point(x, y), radius=px(9), color=BLUE), (x, y))
                             for x, y in BLUE_DATA]).set_z_index(3)
        red_squares = VGroup(*[
            follow(Square(side_length=px(16), fill_color=RED, fill_opacity=1, stroke_width=0)
                   .move_to(_chart_point(x, y)), (x, y))
            for x, y in RED_DATA
        ]).set_z_index(3)
        # "1 (3,9)": number + coordinates, on a dark backing so a line passing behind never hides it.
        point_labels = VGroup()
        for point in BLUE_DATA + RED_DATA:
            coord = f'({point[0]},{point[1]})'
            text = T(f'{POINT_NUM[point]} {coord}', 17, WHITE, t2c={coord: '#c3c9d4'})
            label = VGroup(BackgroundRectangle(text, color=BG, fill_opacity=0.8, buff=px(2)), text)
            side, gap, *right_x = LABEL_SIDE[point]
            label.next_to(_chart_point(*point), side, buff=gap)
            if right_x:
                label.align_to(_chart_point(right_x[0], 0), RIGHT)
            point_labels.add(label)
        point_labels.set_z_index(4)

        def dynamic_readout():
            margin = sep()[2]
            text = T(f'单侧 margin = {margin:.2f}', 23, BLUE)
            text.move_to(P(448, 58), aligned_edge=LEFT)
            return VGroup(BackgroundRectangle(text, color=BG, fill_opacity=0.9, buff=0.1), text)

        def dynamic_boundary():
            normal, center, _ = sep()
            a, b = _clipped_segment(normal, center)
            return Line(a, b, color=GREEN, stroke_width=3)

        def dynamic_margin_line(which):
            def build():
                normal, center, margin = sep()
                a, b = _clipped_segment(normal, center + which * margin)
                return DashedLine(a, b, color=BLUE, stroke_width=2, dash_length=px(7))
            return always_redraw(build)

        def dynamic_band():
            normal, center, margin = sep()
            upper_a, upper_b = _clipped_segment(normal, center + margin)
            lower_a, lower_b = _clipped_segment(normal, center - margin)
            return Polygon(upper_a, upper_b, lower_b, lower_a,
                           fill_color=BLUE, fill_opacity=0.14, stroke_width=0)

        def dynamic_margin_marker():
            normal, center, margin = sep()
            a, b = _clipped_segment(normal, center)
            mid = (a + b) / 2
            tip = mid + np.array([normal[0], normal[1], 0.0]) * margin * px(28)
            seg = Line(mid, tip, color=YELLOW, stroke_width=5)
            ends = VGroup(*[Dot(q, radius=px(2.6), color=YELLOW) for q in (mid, tip)])
            return VGroup(seg, ends).set_z_index(2)

        def dynamic_shadows():
            """Normal axis through the middle of the boundary (arrow: blue side -> red side); every point drops a
            perpendicular onto it, the foot is its shadow (projection). Same gaps as the shadows n'p from the origin."""
            alpha = shadow_alpha.get_value()
            g = VGroup()
            if alpha < 1e-3:
                return g
            normal, center, _ = sep()
            ends = _clip_data(normal, center)
            mid = (ends[0] + ends[1]) / 2
            along = np.array([-normal[1], normal[0]])
            axis_ends = sorted(_clip_data(along, float(np.dot(along, mid))), key=lambda q: float(np.dot(normal, q)))
            g.add(Arrow(_chart_point(*axis_ends[0]), _chart_point(*axis_ends[1]), buff=0, color=GREY,
                        stroke_width=2.5, tip_length=px(10), max_tip_length_to_length_ratio=0.1,
                        max_stroke_width_to_length_ratio=20).set_opacity(0.95 * alpha))
            for data, color in ((BLUE_DATA, BLUE), (RED_DATA, RED)):
                for p in data:
                    q = np.array(live(p))
                    foot = mid + (np.dot(normal, q) - center) * normal
                    if np.linalg.norm(foot - q) > 1e-3:
                        g.add(DashedLine(_chart_point(*q), _chart_point(*foot), color=GREY, stroke_width=1.3,
                                         dash_length=px(4)).set_opacity(0.8 * alpha))
                    mark = (Dot(radius=px(4), color=color) if color == BLUE else
                            Square(side_length=px(7.5), fill_color=color, fill_opacity=1, stroke_width=0))
                    g.add(mark.move_to(_chart_point(*foot)).set_opacity(alpha))
            return g.set_z_index(1)

        boundary = always_redraw(dynamic_boundary)
        upper_margin = dynamic_margin_line(1)
        lower_margin = dynamic_margin_line(-1)
        band = always_redraw(dynamic_band)

        self.step(
            r'这六个点来自一道题。蓝色圆点是一类：点 1 $(3,9)$、点 2 $(3,4)$、点 6 $(1,2)$；红色方块是另一类：点 3 $(8,8)$、点 4 $(6,6)$、点 5 $(9,3)$。每个点旁边写着编号和坐标 $(x,y)$；底边的数字是横坐标 $x$，左边的数字是纵坐标 $y$，网格线每隔 2 个单位一条。绿线是一条能把两类分开的 boundary（分界线），所有训练点都分对了。但这样的线有很多条，训练错误都可以是 0。**所以光“分对”还不够，还要挑出最稳的那条。**',
            '先画一条能分开的线：分对不等于最稳',
            stage=0,
        )
        self.play(FadeIn(grid), FadeIn(ticks), FadeIn(blue_dots), FadeIn(red_squares), FadeIn(point_labels),
                  run_time=1.0)
        self.wait(1.2)
        self.play(FadeIn(boundary), run_time=0.8)
        self.wait(1.2)

        street_note = VGroup(
            T('街道：两条虚线之间', 19, BLUE),
            T('黄线：边界 → 一条虚线', 19, YELLOW),
            T('= margin（单侧）', 19, YELLOW),
            T('街道总宽 = 2 × margin', 17, GREY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        street_note.move_to(P(448, 0), aligned_edge=LEFT).align_to(P(0, 232), UP)
        street_bg = BackgroundRectangle(street_note, color=BG, fill_opacity=0.84, buff=0.1)
        self.step(
            r'把绿线往两边平行移动，直到碰到两类中最近的点，得到两条虚线；两条虚线中间的浅蓝色带子是一条“空街道”，里面没有点。图中的黄色短线是绿线到一条虚线的距离，叫 margin（间隔）。**按课件 L08 p13 的定义，margin 是分界线到最近点的距离（单侧），不是整条街道的宽度。**这条线的 margin 约为 $0.391$（这个数先当读数看，下一步讲怎么算），右上角读数显示 $0.39$；街道总宽是它的 2 倍。',
            '空街道：边界到一条虚线（黄线）= 单侧 margin ≈ 0.391',
            stage=1,
        )
        readout = always_redraw(dynamic_readout)
        marker = always_redraw(dynamic_margin_marker)
        self.play(FadeIn(band), FadeIn(upper_margin), FadeIn(lower_margin), FadeIn(readout), FadeIn(street_bg), FadeIn(street_note), run_time=0.9)
        self.play(FadeIn(marker), run_time=0.5)
        self.wait(1.4)

        shadows = always_redraw(dynamic_shadows)
        shadow_note = VGroup(
            T('灰箭头：法向（蓝 → 红）', 18, '#c3c9d4'),
            T('小圆点、小方块：影子', 18, WHITE),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        shadow_note.move_to(P(448, 0), aligned_edge=LEFT).align_to(P(0, 86), UP)
        shadow_bg = BackgroundRectangle(shadow_note, color=BG, fill_opacity=0.88, buff=0.1)
        self.step(
            r'现在只转动绿线，每转到一个角度，都重新把它放在两类的正中间，右上角的读数跟着变。灰色箭头是垂直于绿线的方向，叫 normal（法向）；每个点沿灰色虚线垂直落到箭头线上，落点（蓝色小圆点、红色小方块）就是它的投影。投影就是 c03 点积视频里的“影子”：从点向方向线作垂线，量垂足离原点多远（图里把方向线平移到街道中间来画，平移不改变影子之间的距离）。法向取从蓝类指向红类的方向，所以蓝点影子小、红点影子大；蓝类最大的影子和红类最小的影子之间，就是空隙。绿线放在空隙正中，单侧 margin 就是这段空隙的一半。**方向一变，影子就变，空隙跟着变，所以街道会变宽或变窄。**',
            '转动方向：影子之间的空隙变，街道跟着变',
            stage=2,
        )
        self.add(shadows)
        self.play(shadow_alpha.animate.set_value(1), FadeIn(shadow_bg), FadeIn(shadow_note), run_time=0.8)
        self.wait(1.6)
        self.play(angle.animate.set_value(-0.35), run_time=2.4)
        self.play(angle.animate.set_value(0.0), run_time=2.0)
        self.wait(1.6)

        formula = VGroup(
            MT('m = (p<sub>r</sub> − p<sub>b</sub>) ÷ 2', 25, YELLOW),
            MT('p<sub>r</sub>：红类离边界最近的投影', 18, WHITE),
            MT('p<sub>b</sub>：蓝类离边界最近的投影', 18, WHITE),
            T('÷ 2：两侧各一半', 18, GREY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        formula.move_to(P(448, 0), aligned_edge=LEFT).align_to(P(0, 82), UP)
        formula_bg = BackgroundRectangle(formula, color=BG, fill_opacity=0.9, buff=0.1)
        support_rings = VGroup(*[
            follow(Circle(radius=px(15), color=YELLOW, stroke_width=2.5).move_to(_chart_point(*point)), point)
            for point in ((3, 9), (3, 4), (6, 6))
        ]).set_z_index(3)
        support_text = VGroup(
            T('support vectors', 20, YELLOW),
            T('（支持向量）', 19, YELLOW),
            T('点 1、2、4 在虚线上', 19, WHITE),
            T('点 3、5、6 不决定边界', 18, GREY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1).move_to(P(448, 0), aligned_edge=LEFT).align_to(P(0, 232), UP)
        support_bg = BackgroundRectangle(support_text, color=BG, fill_opacity=0.88, buff=0.1)
        self.step(
            r'绿线停在竖直位置 $x=4.5$（对照底边刻度），这时街道最宽。为什么竖直最好：蓝点 1 $(3,9)$、2 $(3,4)$ 上下排成一竖，红点 4 $(6,6)$ 的高度 $6$ 夹在它们的高度 $9$ 和 $4$ 之间；线往任一边歪，1 或 2 就会离线更近，空隙变窄；只有竖直时三个点离线一样远，都是 $1.5$。竖直线的法向就是 $x$ 轴方向，影子就是横坐标：灰箭头上蓝类最大的影子在 $x=3$，红类最小的影子在 $x=6$。右上方的公式把上一步写成符号：$p_r$ 是红类离边界最近的投影，$p_b$ 是蓝类离边界最近的投影，单侧 margin $m=(p_r-p_b)\div2$，空隙两侧各分一半。这里 $p_b=3$、$p_r=6$，所以 $m=(6-3)\div2=1.5$，这是边界到任一条虚线的距离，街道总宽 $3$。**正好落在虚线上、离分界线最近的点 1、2、4 叫 support vector（支持向量），图中用黄圈标出。**',
            '最佳线 x = 4.5：margin = (6 − 3) ÷ 2 = 1.5',
            stage=3,
        )
        self.play(FadeOut(street_note), FadeOut(street_bg), FadeOut(shadow_note), FadeOut(shadow_bg), run_time=0.4)
        self.play(FadeIn(formula_bg), FadeIn(formula), run_time=0.7)
        self.play(FadeIn(support_bg), FadeIn(support_text), run_time=0.7)
        self.play(FadeIn(support_rings), run_time=0.6)
        self.play(*[Indicate(ring, color=YELLOW) for ring in support_rings], run_time=0.8)
        self.play(Flash(_chart_point(3, 9), color=YELLOW), run_time=0.7)
        self.wait(1.8)

        self.step(
            r'动手验证谁决定边界。先把点 3、5、6 往外挪一点（不进街道）：绿线、虚线和右上角读数都不动，最佳线不变，因为离线最近的还是 1、2、4。再把支持向量 4 往左挪半格到 $(5.5,6)$，也就是往街道里推：最佳线马上左移到空隙正中 $x=(3+5.5)\div2=4.25$，读数变成 $(5.5-3)\div2=1.25$，街道变窄；挪回 $(6,6)$ 又恢复 $1.5$。同理，把 1、2、4 中任何一个往街道里推或往外拉，街道都会马上变窄或变宽。**只有支持向量决定这条线，点 3、5、6 不决定边界。**',
            '挪 3、5、6 线不动；挪支持向量 4，街道马上变窄',
        )
        def ghost(p):
            # grey outline left at the original position while a point is moved (its label keeps naming that spot)
            g = (Circle(radius=px(9), color=GREY, stroke_width=2) if p in BLUE_DATA else
                 Square(side_length=px(16), color=GREY, stroke_width=2, fill_opacity=0))
            return g.move_to(_chart_point(*p)).set_z_index(2)

        ghosts_out = VGroup(*[ghost(p) for p in OUTWARD])
        ghost4 = ghost((6, 6))
        self.play(shadow_alpha.animate.set_value(0), run_time=0.5)
        self.remove(shadows)
        self.add(ghosts_out)
        self.play(spread.animate.set_value(1), Indicate(support_text[3], color=YELLOW, scale_factor=1.12),
                  run_time=1.2)
        self.wait(0.9)
        self.play(spread.animate.set_value(0), run_time=0.8)
        self.remove(ghosts_out)
        self.wait(0.3)
        self.add(ghost4)
        self.play(nudge4.animate.set_value(-0.5), run_time=1.3)
        self.wait(1.4)
        self.play(nudge4.animate.set_value(0.0), run_time=0.9)
        self.remove(ghost4)
        self.wait(1.0)

        self.takeaway(
            r'一句话：许多分界线都能分开训练点，SVM（support vector machine，支持向量机）选空街道最宽的那条。**margin 是分界线到最近点的距离（单侧），SVM 要让它最大。**本例最佳线是 $x=4.5$，单侧 margin $=(6-3)\div2=1.5$；只有落在街道边缘的点 1、2、4（支持向量）决定答案，把 3、5、6 往外挪一点（不进街道）答案不变。往年 T4 题型就是看图找支持向量、算 margin。',
            ['先分开，再把街道尽量变宽', 'x = 4.5，单侧 margin = 1.5', '支持向量 1、2、4 决定边界'],
        )
