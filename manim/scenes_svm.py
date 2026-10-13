"""SVM and kernel intuition scenes for the exam-review videos.

The 3-D view in KernelLift is deliberately a 2-D oblique projection.  No
LaTeX-backed mobjects are used because the render environment has no TeX.
"""
import numpy as np

from manim import (
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
        from manim import Transform
        from common import M

        self.question(
            r'蓝点在中间，红点围成一圈。一条直线分不开它们；能不能换个看法，让两类容易分开？',
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
        axis_labels = VGroup()
        for tex, xyz, offset in (
            (r'x_1', (2.5, 0, 0), RIGHT * px(12)),
            (r'x_2', (0, 2.5, 0), UP * px(12)),
            (r'x_3', (0, 0, 6), (UP + RIGHT) * px(9)),
        ):
            label = M(tex, 22, GREY).set_z_index(7)
            def follow(m, p=xyz, off=offset):
                m.move_to(project(*p) + off)
                if p[2]:
                    m.set_opacity(tilt.get_value())
            follow(label)
            label.add_updater(follow)
            axis_labels.add(label)

        legend = card(T('蓝：内圈', 19, BLUE), T('红：外圈', 19, RED))
        self.step(
            r'先看原来的平面：蓝是内类，红是外类。试着平移直线，它仍会把外圈红点切到两侧；蓝点被红点包围，边界应该是弯的，而不是一条直线。',
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
            r'先只倾斜视角，点还没有抬高，所有点仍在同一个底面。原来的两个方向叫 $x_1,x_2$，现在看见的新方向叫 $x_3$；换视角不会改变数据的位置。',
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
            r'这次真的抬点：保留平面位置，把到原点的距离平方变成高度，灰色竖线连回原位置，灰色等高圆组成碗面。这个 feature map（特征映射）是 $\varphi(u)=(u_1,u_2,u_1^2+u_2^2)$，因此 $x_3=r^2$。蓝点半径由 $0.25+0.65q$ 生成（$0\le q<1$），所以 $r<0.25+0.65=0.9$、$x_3<0.9^2=0.81$；红点半径为 $1.75+0.5q$，所以 $x_3\ge1.75^2=3.0625$。',
            '离原点越远，新增的高度就越大', stage=1,
        )
        self.add(rings, drops)
        self.play(FadeOut(legend), FadeOut(view_note), ring_alpha.animate.set_value(0.45),
                  run_time=0.6)
        self.play(lift.animate.set_value(1), run_time=2)
        fmap_eq = M([r'\varphi(u)=(', r'u_1,u_2', ',', r'u_1^2+u_2^2', ')'], 24)
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
            r'现在在两类高度之间放一张黄色平面。因为 $0.81<2<3.0625$，蓝点全在 $x_3=2$ 下方，红点全在上方；这张 separating plane（分隔平面）让新空间里的数据线性可分。这里的 $2$ 是选在空隙里的方便阈值，不是算出的最大间隔解。',
            '黄色平面夹在中间：蓝在下，红在上', stage=2,
        )
        # Explicitly add the geometry BEFORE animating its visibility.
        self.add(plane)
        self.play(plane_alpha.animate.set_value(1), run_time=1)
        self.play(FadeIn(leader), FadeIn(plane_tag), run_time=0.7)
        self.wait(2)

        self.step(
            r'算法不一定需要真的抬点，它可能只要抬点后的点积。这里的 kernel（核函数）是 $K(u,v)=\varphi(u)\cdot\varphi(v)=u_1v_1+u_2v_2+(u_1^2+u_2^2)(v_1^2+v_2^2)$：前两项是原位置的点积，最后一项是新增高度相乘。SVM 的 dual（对偶）的训练和预测只用点积，所以 kernel trick（核技巧）直接计算同一个值，不必构造高维坐标，结果精确而非近似；本例的映射不同于章节后面纯二次多项式核的映射。',
            '直接算同一个点积，不必真的抬点', stage=3,
        )
        self.play(Indicate(inner_dots, color=BLUE, scale_factor=1.04),
                  Indicate(outer_dots, color=RED, scale_factor=1.02), run_time=0.8)
        kernel = card(M(r'K(u,v)=\varphi(u)\cdot\varphi(v)', 25, YELLOW),
                      T('特征空间的点积，', 17, GREY), T('但不必真的抬点', 17, GREY),
                      M(r'=u_1v_1+u_2v_2', 23),
                      M(r'\quad +(u_1^2+u_2^2)(v_1^2+v_2^2)', 23),
                      T('原位置点积＋新高度乘积', 16, GREY))
        self.play(FadeOut(fmap), FadeOut(bounds), FadeIn(kernel), run_time=0.8)
        self.wait(3)

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
            r'最后找原空间的边界：先看黄色平面与碗面的 intersection（交集），是一条在高度 $2$ 上的圆。联立 $x_3=x_1^2+x_2^2$ 和 $x_3=2$，得到 $x_1^2+x_2^2=2$，所以 $r^2=2$、$r=\sqrt2$。只把这条交圆沿竖直方向投到底面，再让点回到底面、转回俯视，黄色圆就围住蓝点、排除红点；这是投影交集，不是把整张平面压扁。',
            '只把交圆投回去，变成围住蓝点的边界', stage=4,
        )
        self.add(circle)
        self.play(circle_alpha.animate.set_value(1), run_time=0.9)
        self.play(FadeOut(kernel), FadeOut(bowl), FadeIn(intersection), run_time=0.8)
        self.wait(1.8)
        self.play(plane_alpha.animate.set_value(0), FadeOut(leader), FadeOut(plane_tag),
                  ring_alpha.animate.set_value(0.15), run_time=0.7)
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
            r'新增距离平方这个特征后，两类能被平面分开：$\varphi(u)=(u_1,u_2,u_1^2+u_2^2)$，分隔平面为 $x_3=2$。平面和碗面的交圆投回原空间得到 $x_1^2+x_2^2=2$；核直接给出 $K(u,v)=\varphi(u)\cdot\varphi(v)$，是精确的点积捷径。',
            ['新增高度，让两类能被平面分开', '交圆投回去，才是原空间的边界',
             '核直接算特征点积：精确而非近似'],
        )


# ---------------------------------------------------------------------------
# c25 - maximum margin
BLUE_DATA = [(3, 9), (3, 4), (1, 2)]
RED_DATA = [(8, 8), (6, 6), (9, 3)]
POINT_NUM = {(3, 9): 1, (3, 4): 2, (1, 2): 6, (8, 8): 3, (6, 6): 4, (9, 3): 5}


def _separator(angle):
    normal = np.array([np.cos(angle), np.sin(angle)])
    blue_proj = [np.dot(normal, p) for p in BLUE_DATA]
    red_proj = [np.dot(normal, p) for p in RED_DATA]
    far_blue = max(blue_proj)
    near_red = min(red_proj)
    return normal, (far_blue + near_red) / 2, (near_red - far_blue) / 2


def _chart_point(x, y):
    # A square 0..10 chart, preserving the browser scene's data coordinates.
    return P(145 + 28 * x, 315 - 28 * y)


def _clipped_segment(normal, c):
    """Endpoints of normal·p=c clipped to the [0,10] square."""
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
        return _chart_point(0, 0), _chart_point(10, 10)
    return _chart_point(*candidates[0]), _chart_point(*candidates[-1])


class SvmMargin(StepScene):
    ID = 'svm-margin'
    TITLE = '最大 margin：把分界线放到离两类都最远的地方'
    FLOW = ['先找分界', '画出街道', '旋转变宽', '支持向量']

    def construct(self):
        self.question(
            r'有很多条线都能把两类点分开。哪一条对新数据更可靠？我们要让边界离两类点都尽量远。',
            ['很多条线都能分开数据', '哪一条对新点更可靠？'],
        )

        grid = VGroup()
        for k in range(0, 11, 2):
            grid.add(Line(_chart_point(k, 0), _chart_point(k, 10), color=GRID, stroke_width=1))
            grid.add(Line(_chart_point(0, k), _chart_point(10, k), color=GRID, stroke_width=1))
        grid.set_opacity(0.45)

        blue_dots = VGroup(*[Dot(_chart_point(x, y), radius=px(9), color=BLUE) for x, y in BLUE_DATA])
        red_squares = VGroup(*[
            Square(side_length=px(16), fill_color=RED, fill_opacity=1, stroke_width=0).move_to(_chart_point(x, y))
            for x, y in RED_DATA
        ])
        point_labels = VGroup()
        for point in BLUE_DATA:
            point_labels.add(T(str(POINT_NUM[point]), 21, WHITE).next_to(_chart_point(*point), UL, buff=0.24))
        for point in RED_DATA:
            point_labels.add(T(str(POINT_NUM[point]), 21, WHITE).next_to(_chart_point(*point), UR, buff=0.24))
        skeleton = VGroup(grid, blue_dots, red_squares, point_labels)
        self.play(FadeIn(grid), FadeIn(blue_dots), FadeIn(red_squares), FadeIn(point_labels), run_time=1.0)

        angle = ValueTracker(0.6)

        def dynamic_readout():
            margin = _separator(angle.get_value())[2]
            text = T(f'单侧 margin = {margin:.2f}', 23, BLUE)
            text.move_to(P(448, 58), aligned_edge=LEFT)
            return VGroup(BackgroundRectangle(text, color=BG, fill_opacity=0.9, buff=0.1), text)

        def dynamic_boundary():
            normal, center, _ = _separator(angle.get_value())
            a, b = _clipped_segment(normal, center)
            return Line(a, b, color=GREEN, stroke_width=3)

        def dynamic_margin_line(which):
            def build():
                normal, center, margin = _separator(angle.get_value())
                a, b = _clipped_segment(normal, center + which * margin)
                return DashedLine(a, b, color=BLUE, stroke_width=2, dash_length=px(7))
            return always_redraw(build)

        def dynamic_band():
            normal, center, margin = _separator(angle.get_value())
            upper_a, upper_b = _clipped_segment(normal, center + margin)
            lower_a, lower_b = _clipped_segment(normal, center - margin)
            return Polygon(upper_a, upper_b, lower_b, lower_a,
                           fill_color=BLUE, fill_opacity=0.14, stroke_width=0)

        def dynamic_margin_marker():
            normal, center, margin = _separator(angle.get_value())
            a, b = _clipped_segment(normal, center)
            mid = (a + b) / 2
            tip = mid + np.array([normal[0], normal[1], 0.0]) * margin * px(28)
            seg = Line(mid, tip, color=YELLOW, stroke_width=5)
            ends = VGroup(*[Dot(q, radius=px(2.6), color=YELLOW) for q in (mid, tip)])
            return VGroup(seg, ends)

        boundary = always_redraw(dynamic_boundary)
        upper_margin = dynamic_margin_line(1)
        lower_margin = dynamic_margin_line(-1)
        band = always_redraw(dynamic_band)

        self.step(
            r'这六个点来自题目：蓝圆是一类，红方是另一类。先画一条能分开的 boundary（分界线）；这样的线很多，训练错误都可以是 0，所以“分对”还不够。',
            '先画一条能分开的线：分对不等于最稳',
            stage=0,
        )
        self.play(FadeIn(boundary), run_time=0.8)
        self.wait(1.0)

        street_note = VGroup(
            T('街道：两条虚线之间', 19, BLUE),
            T('黄线：边界 → 一条虚线', 19, YELLOW),
            T('= margin（单侧）', 19, YELLOW),
            T('街道总宽 = 2 × margin', 17, GREY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1).move_to(P(448, 240), aligned_edge=LEFT)
        street_bg = BackgroundRectangle(street_note, color=BG, fill_opacity=0.84, buff=0.1)
        self.step(
            r'把 boundary 往两边平移，直到碰到两类中最近的点，得到两条 dashed margin lines（虚线间隔线）。两条虚线围出一条空街道；但 **margin（间隔）** 按课件 L08 p13 的定义是**边界到最近点的距离**，也就是边界到任一条虚线的距离（单侧，图中黄色短线），这里约 0.391。街道的总宽度是它的 2 倍。',
            '空街道：边界到一条虚线（黄线）= 单侧 margin ≈ 0.391',
            stage=1,
        )
        readout = always_redraw(dynamic_readout)
        marker = always_redraw(dynamic_margin_marker)
        self.play(FadeIn(band), FadeIn(upper_margin), FadeIn(lower_margin), FadeIn(readout), FadeIn(street_bg), FadeIn(street_note), run_time=0.9)
        self.play(FadeIn(marker), run_time=0.5)
        self.wait(1.4)

        self.step(
            r'现在只旋转这条线，并且每个角度都把它放在两类的正中间。把每个点投影到边界的法向上：$p_r$ 是红类里离边界最近的投影，$p_b$ 是蓝类里离边界最近（投影最大）的那个，单侧 margin $m=(p_r-p_b)\div2$（中间的空隙两侧各分一半）。方向一变，投影就变，所以街道会变宽或变窄。',
            '旋转边界：街道会随方向变宽或变窄',
            stage=2,
        )
        self.play(angle.animate.set_value(-0.45), run_time=2.1)
        self.play(angle.animate.set_value(0.0), run_time=1.8)
        self.wait(1.4)

        formula = VGroup(
            MT('m = (p<sub>r</sub> − p<sub>b</sub>) ÷ 2', 25, YELLOW),
            MT('p<sub>r</sub>：红类离边界最近的投影', 18, WHITE),
            MT('p<sub>b</sub>：蓝类离边界最近的投影', 18, WHITE),
            T('÷ 2：两侧各一半', 18, GREY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        formula.move_to(P(448, 0), aligned_edge=LEFT).align_to(P(0, 82), UP)
        formula_bg = BackgroundRectangle(formula, color=BG, fill_opacity=0.9, buff=0.1)
        support_rings = VGroup(*[
            Circle(radius=px(15), color=YELLOW, stroke_width=2.5).move_to(_chart_point(*point))
            for point in ((3, 9), (3, 4), (6, 6))
        ])
        support_text = VGroup(
            T('support vectors', 20, YELLOW),
            T('（支持向量）', 19, YELLOW),
            T('点 1、2、4 在虚线上', 19, WHITE),
            T('点 3、5、6 不决定边界', 18, GREY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1).move_to(P(448, 0), aligned_edge=LEFT).align_to(P(0, 212), UP)
        support_bg = BackgroundRectangle(support_text, color=BG, fill_opacity=0.88, buff=0.1)
        self.step(
            r'最宽的位置是竖直的 boundary：$x=4.5$。这时法向就是 $x$ 轴：蓝类最靠右的 $x$ 坐标是 3（$p_b=3$），红类最靠左的是 6（$p_r=6$），所以单侧 margin $m=(6-3)\div2=1.5$（边界到任一条虚线的距离；街道总宽 3）。正好落在虚线上的点 1、2、4 叫 support vectors（支持向量）；只有它们决定这条线。',
            '最佳线 x = 4.5：margin = (6 − 3) ÷ 2 = 1.5',
            stage=3,
        )
        self.play(FadeOut(street_note), FadeOut(street_bg), run_time=0.4)
        self.play(FadeIn(formula_bg), FadeIn(formula), run_time=0.7)
        self.play(FadeIn(support_bg), FadeIn(support_text), run_time=0.7)
        self.play(FadeIn(support_rings), run_time=0.6)
        self.play(*[Indicate(ring, color=YELLOW) for ring in support_rings], run_time=0.8)
        self.play(Flash(_chart_point(3, 9), color=YELLOW), run_time=0.7)
        self.wait(1.8)

        self.takeaway(
            r'一句话：许多 boundary 都能分开训练点，SVM（支持向量机）选择 empty street（空街道）最宽的那条。这里 x = 4.5，单侧 margin = 1.5；只有点 1、2、4 在街道边缘，所以它们决定答案。',
            ['先分开，再把街道尽量变宽', 'x = 4.5，单侧 margin = 1.5', '支持向量 1、2、4 决定边界'],
        )
