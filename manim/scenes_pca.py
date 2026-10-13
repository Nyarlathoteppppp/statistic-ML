r"""c37: the browser PCA cloud, linked shadows and variance, then c04 eigen.

All empirical covariances use 1/n. No simulation or render is run by this file
at import time. During the first sweep the curve is rebuilt from the angle; once
the 0-180 sweep is done it is frozen as the full curve, and only the dot moves.
Notation follows c37: unit direction p, transpose p', covariance Sigma_x.
"""
import numpy as np
from manim import (
    BackgroundRectangle, Circle, Create, DashedLine, Dot, DOWN, FadeIn,
    FadeOut, Indicate, LEFT, Line, RIGHT, Transform, UP, ValueTracker,
    VGroup, VMobject, always_redraw, linear,
)
from common import (
    BG, BLUE, GREEN, GREY, PURPLE, TEAL, WHITE, YELLOW,
    M, P, StepScene, T, px,
)


class Pca(StepScene):
    ID = 'pca'
    TITLE = 'PCA：留下影子铺得最开的方向'
    FLOW = ['中心化', '投影扫角', '找最宽', '读懂方差', '联系特征向量']

    def construct(self):
        # Exactly the browser's deterministic sample, including its whitening.
        # NumPy/JS transcendental implementations may differ at roundoff level.
        def rnd(k):
            x = np.sin(k * 12.9898 + 78.233) * 43758.5453
            return x - np.floor(x)

        raw = []
        for i in range(26):
            u1, u2 = max(1e-6, rnd(i + 300)), rnd(i + 400)
            r = np.sqrt(-2 * np.log(u1))
            raw.append([r * np.cos(2 * np.pi * u2),
                        r * np.sin(2 * np.pi * u2)])
        centered = np.array(raw) - np.mean(raw, axis=0)
        n = len(centered)
        cov = centered.T @ centered / n
        eigenvalues, eigenvectors = np.linalg.eigh(cov)
        inv_root = (eigenvectors * (1 / np.sqrt(eigenvalues))) @ eigenvectors.T
        white = centered @ inv_root
        # Rows: ((sqrt(3) z_x + z_y), (sqrt(3) z_x - z_y))/sqrt(2).
        recolour = np.array([[np.sqrt(3), np.sqrt(3)], [1., -1.]]) / np.sqrt(2)
        data = white @ recolour
        sigma = np.array([[2., 1.], [1., 2.]])
        assert np.allclose(data.mean(axis=0), 0, atol=1e-10)
        assert np.allclose(data.T @ data / n, sigma, atol=1e-10)

        # One scale in both dimensions, with a deterministic radial fit.
        scale = 92 / max(4., float(np.linalg.norm(data, axis=1).max()))
        origin = P(177, 174)

        def cp(p):
            return P(177 + scale * p[0], 174 - scale * p[1])

        def gp(a, v):
            return P(395 + 213 * a / 180, 229 - 42 * v)

        angle = ValueTracker(0.)  # the ONLY tracker, in degrees
        style = {'direction': YELLOW}

        def direction():
            a = np.deg2rad(angle.get_value())
            return np.array([np.cos(a), np.sin(a)])

        def variance(a):
            return 2 + np.sin(2 * np.deg2rad(a))

        # Cache LaTeX digit glyphs: live readouts copy these, never compile TeX
        # per frame. Both fixed formula stems and digits are built with M().
        glyphs = {c: M(c, 23, YELLOW) for c in '0123456789.'}
        angle_stem = M('a=', 23, YELLOW)
        var_stem = M(r'\mathrm{Var}=', 23, YELLOW)
        degree_glyph = M(r'{}^\circ', 23, YELLOW)

        def digits(s):
            group = VGroup(*[glyphs[c].copy() for c in s])
            group.arrange(RIGHT, buff=px(0.6), aligned_edge=DOWN)
            return group

        def angle_label():
            w = direction()
            q = origin + px(79) * np.array([w[0], w[1], 0.])
            q += px(17) * np.array([-w[1], w[0], 0.])
            num = digits(f'{angle.get_value():.0f}')
            text = VGroup(angle_stem.copy(), num, degree_glyph.copy()).arrange(RIGHT, buff=px(1))
            text[2].align_to(num, UP).shift(UP * px(1))    # a superscript, not a mid-height circle
            text.move_to(q)
            return VGroup(BackgroundRectangle(text, color=BG, fill_opacity=0.9,
                                              buff=px(2)), text)

        def line_build():
            w = direction()
            d = px(102) * np.array([w[0], w[1], 0.])
            return Line(origin - d, origin + d, color=style['direction'], stroke_width=3)

        def shadow_build():
            w = direction()
            return VGroup(*[Dot(cp(np.dot(p, w) * w), radius=px(2.7), color=YELLOW)
                            for p in data])

        def guide_build():
            w = direction()
            # Short, faint straight guides avoid hundreds of dash submobjects.
            return VGroup(*[Line(cp(p), cp(np.dot(p, w) * w), color=GREY,
                                stroke_width=1, stroke_opacity=0.3) for p in data])

        def curve_build():
            a = float(np.clip(angle.get_value(), 0, 180))
            samples = np.linspace(0, a, max(2, int(np.ceil(2 * a)) + 1))
            curve = VMobject(color=YELLOW, stroke_width=2.7)
            curve.set_points_as_corners([gp(t, variance(t)) for t in samples])
            return curve

        def variance_label():
            a = angle.get_value()
            text = VGroup(var_stem.copy(), digits(f'{variance(a):.2f}'))
            text.arrange(RIGHT, buff=px(1))
            text.next_to(gp(a, variance(a)), LEFT if a > 120 else RIGHT, buff=px(7))
            text.shift(UP * px(12))
            return VGroup(BackgroundRectangle(text, color=BG, fill_opacity=0.9,
                                              buff=px(2)), text)

        self.question(
            r'一团二维数据，如果每个点只准留一个数，也就是把平面压成一条线，怎样才能少丢信息？办法是让每个点在一条直线上留下影子，用影子的位置代替原来的点。**哪条线上的影子铺得最开，保留下来的变化就最多。**',
            ['二维压成一维，怎样少丢信息？', '试着把每个点的影子留在一条线上。'])

        self.step(
            r"蓝点是 26 个数据点，已经做过 centering（中心化）：每一列减去自己的均值，所以中心落在原点，$\bar{\bx}=\mathbf0$。黄线是一个待比较的方向，每个蓝点沿灰色细线垂直落到黄线上，留下黄色影子，这叫 projection（投影）。**方向用单位向量 $\mathbf p=(\cos a,\sin a)$ 表示，影子的坐标就是 $t_i=\mathbf p'\bx_i$，落点是 $t_i\mathbf p$。**一撇表示转置，$\mathbf p'\bx$ 就是 c03 的点积；要求 $\|\mathbf p\|=1$，是为了不能靠把 $\mathbf p$ 拉长来让影子变大。影子有多分散，用 variance（方差）衡量：中心在原点，所以方差就是影子坐标平方的平均，$\mathrm{Var}=\frac1{26}\sum_i t_i^2$。先试 $a=0^\circ$：$\mathbf p=(1,0)$，影子坐标就是每个点的横坐标，算出 $\mathrm{Var}=2$。",
            '先移到中心，再把每个点投到线上', stage=0)
        left_axes = VGroup(
            Line(P(56, 174), P(298, 174), color=GREY, stroke_opacity=0.3),
            Line(P(177, 68), P(177, 279), color=GREY, stroke_opacity=0.3),
            M('x_1', 22, GREY).move_to(P(310, 174)),
            M('x_2', 22, GREY).move_to(P(177, 64)),
        )
        heading = T('蓝：数据　黄：影子', 21).move_to(P(177, 47))
        cloud = VGroup(*[Dot(cp(p), radius=px(3.7), color=BLUE) for p in data])
        mean = VGroup(T('均值', 19, GREY), M('=0', 25, GREY))
        mean.arrange(RIGHT, buff=px(4)).move_to(P(177, 292))
        center_dot = Dot(origin, radius=px(2.5), color=WHITE)
        self.play(Create(left_axes[:2]), FadeIn(left_axes[2:]), FadeIn(heading),
                  FadeIn(cloud), run_time=1.0)
        self.play(FadeIn(center_dot), FadeIn(mean), run_time=0.6)
        self.wait(1.2)
        rotating_line = always_redraw(line_build)
        guides = always_redraw(guide_build)
        shadows = always_redraw(shadow_build)
        angle_read = always_redraw(angle_label)
        self.play(FadeIn(rotating_line), FadeIn(guides), run_time=0.7)
        falling = cloud.copy().set_color(YELLOW)
        self.add(falling)
        self.play(Transform(falling, shadow_build()), run_time=1.4)
        self.remove(falling)
        self.add(shadows, angle_read)
        projection_rule = VGroup(M(r"t=\mathbf p'\mathbf x", 28, YELLOW),
                                 M(r'\|\mathbf p\|=1', 25, GREY))
        projection_rule.arrange(RIGHT, buff=px(18)).move_to(P(177, 317))
        projection_role = T('影子的坐标　　　　只比较方向', 17, GREY).move_to(P(177, 337))
        first_var = M(r'\mathrm{Var}=2', 28, YELLOW).move_to(P(284, 204))
        self.play(FadeIn(projection_rule), FadeIn(projection_role), FadeIn(first_var), run_time=0.7)
        self.wait(1.5)

        self.step(
            r'现在让黄线绕原点转半圈：左边的影子先铺开、再挤紧，右边把每个角度的方差画成曲线。**同一团数据，换一个方向，影子的方差就不一样。**对这团数据算出来是 $\mathrm{Var}(a)=2+\sin(2a)$（后面会从协方差矩阵推出来）：$a=0^\circ,45^\circ,90^\circ,135^\circ,180^\circ$ 时，$2a=0^\circ,90^\circ,180^\circ,270^\circ,360^\circ$，正弦值依次是 $0,1,0,-1,0$，所以方差依次是 $2,3,2,1,2$。只转半圈就够了：$\mathbf p$ 和 $-\mathbf p$ 是同一条线，影子坐标只差一个负号，平方后方差一样。',
            '转动同一条线，右图同步记录影子的分散', stage=1)
        graph_axes = VGroup(
            Line(gp(0, 0), gp(180, 0), color=GREY, stroke_width=1.5),
            Line(gp(0, 0), gp(0, 3.5), color=GREY, stroke_width=1.5),
        )
        for a in (0, 45, 90, 135, 180):
            graph_axes.add(Line(gp(a, 0), gp(a, 0) + DOWN * px(3), color=GREY))
            graph_axes.add(M(rf'{a}^\circ', 20, GREY).move_to(gp(a, 0) + DOWN * px(14)))
        for v in (1, 2, 3):
            graph_axes.add(Line(gp(0, v), gp(180, v), color=GREY,
                                stroke_width=1, stroke_opacity=0.15))
            graph_axes.add(M(str(v), 21, GREY).next_to(gp(0, v), LEFT, buff=px(7)))
        graph_title = T('影子有多分散？', 22).move_to(P(501, 49))
        graph_role = T('方向角度', 17, GREY).move_to(P(502, 263))
        curve = always_redraw(curve_build)
        moving_dot = always_redraw(lambda: Dot(gp(angle.get_value(), variance(angle.get_value())),
                                               radius=px(4), color=YELLOW))
        var_read = always_redraw(variance_label)
        formula = M(r'\mathrm{Var}=2+\sin(2a)', 29, YELLOW).move_to(P(501, 290))
        self.play(FadeOut(first_var), FadeIn(graph_axes), FadeIn(graph_title),
                  FadeIn(graph_role), run_time=0.8)
        self.add(curve, moving_dot, var_read)
        for target in (45, 90, 135, 180):
            self.play(angle.animate.set_value(target), run_time=1.8, rate_func=linear)
            self.wait(1.2 if target in (45, 135) else 0.3)
        curve.clear_updaters()   # the whole 0-180 curve is known now: keep it, only the dot moves later
        self.play(FadeIn(formula), run_time=0.6)
        self.wait(1.2)

        self.step(
            r'黄线转回 $45^\circ$，停在曲线最高点：影子最分散，$\mathrm{Var}=2+\sin90^\circ=2+1=3$。这个方向叫 first principal component（第一主成分，PC1），是 principal component analysis（主成分分析，PCA）要找的方向。**PCA 留下的，就是让影子方差最大的方向。**线变成青色，沿 $(1,1)$ 方向；这个向量长 $\sqrt{1^2+1^2}=\sqrt2$，除以长度得单位方向 $\mathbf p_1=(1,1)/\sqrt2$。从这里开始，青色标记最优方向，黄色仍标记当前的影子和读数。',
            '影子铺得最开，这个方向叫第一主成分', stage=2)
        self.play(angle.animate.set_value(45), run_time=1.8)
        rotating_line.clear_updaters()
        style['direction'] = TEAL
        self.play(rotating_line.animate.set_color(TEAL),
                  Transform(heading, T('PC1：影子最分散', 21, TEAL).move_to(P(177, 47))), run_time=0.6)
        rotating_line.add_updater(lambda mob: mob.become(line_build()))
        peak = Circle(radius=px(6), color=TEAL, stroke_width=2).move_to(gp(45, 3))
        peak_label = T('PC1', 19, TEAL).move_to(P(448, 126))
        unit_direction = M(r'\mathbf p_1=(1,1)/\sqrt2', 28, TEAL).move_to(P(177, 291))
        self.play(FadeIn(peak), FadeIn(peak_label), Transform(mean, unit_direction),
                  FadeOut(projection_rule), FadeOut(projection_role), run_time=0.7)
        self.play(Indicate(shadows, color=TEAL), Indicate(peak, color=TEAL), run_time=0.8)
        self.wait(2.4)

        self.step(
            r"这个最高点不用转线去试，可以直接从数据的形状算出来。左下角是 covariance（协方差）矩阵 $\Sigma_x=\frac1n\sum_i\bx_i\bx_i'=\begin{bmatrix}2&1\\1&2\end{bmatrix}$：两个 $2$ 是两个坐标各自的方差，两个 $1$ 表示两个坐标一起变化的程度；这里除以 $n$，不是 $n-1$。**影子的方差可以写成 $\mathrm{Var}=\mathbf p'\Sigma_x\mathbf p$：$\mathbf p$ 选方向，$\Sigma_x$ 描述数据的形状。**来由是 $(\mathbf p'\bx_i)^2=\mathbf p'\bx_i\bx_i'\mathbf p$，求平均时把 $\mathbf p$ 提到外面，就得 $\frac1n\sum_i(\mathbf p'\bx_i)^2=\mathbf p'\Sigma_x\mathbf p$。代入 $\mathbf p=(\cos a,\sin a)$，矩阵每一格乘上它所在行、所在列的分量再相加：$2\cos^2a+\cos a\sin a+\sin a\cos a+2\sin^2a=2+2\sin a\cos a=2+\sin2a$（用到 $\cos^2a+\sin^2a=1$ 和 $2\sin a\cos a=\sin2a$），正是右边曲线的公式。在 $45^\circ$，两个分量都是 $1/\sqrt2$，每格乘 $\frac1{\sqrt2}\times\frac1{\sqrt2}=\frac12$，所以 $\frac12(2+1+1+2)=6/2=3$。",
            '方向和数据形状一起决定影子有多分散', stage=3)
        covariance = M(r'\Sigma_x=\begin{bmatrix}2&1\\1&2\end{bmatrix}', 29, BLUE).move_to(P(84, 323))
        calculation = M(r'\tfrac12(2+1+1+2)=3', 27, TEAL).move_to(P(246, 324))
        var_role = VGroup(M(r'\mathrm{Var}=', 24, GREY), T('影子的分散', 18, GREY))
        var_role.arrange(RIGHT, buff=px(4)).move_to(P(501, 302))
        w_role = VGroup(M(r'\mathbf p=', 24, GREY), T('方向，', 18, GREY),
                       M(r'\|\mathbf p\|=1', 24, GREY))
        w_role.arrange(RIGHT, buff=px(5)).move_to(P(501, 321))
        sigma_role = VGroup(M(r'\Sigma_x=', 24, GREY), T('数据的形状（协方差）', 18, GREY))
        sigma_role.arrange(RIGHT, buff=px(4)).move_to(P(501, 338))
        self.play(FadeIn(covariance),
                  Transform(formula, M(r"\mathrm{Var}=\mathbf p'\Sigma_x\mathbf p", 30, YELLOW)
                            .move_to(P(501, 279))), run_time=0.8)
        self.play(FadeIn(var_role), FadeIn(w_role), FadeIn(sigma_role), run_time=0.8)
        self.play(FadeIn(calculation), Indicate(peak, color=TEAL), run_time=0.8)
        self.wait(2.0)

        self.step(
            r'青色虚线留作参照，黄线转到和它垂直的 $135^\circ=45^\circ+90^\circ$，影子挤得更紧，线变成紫色。这个方向是 $\mathbf p_2=(-1,1)/\sqrt2$，叫 second principal component（第二主成分，PC2）；它和 $\mathbf p_1$ 的内积 $(1\cdot(-1)+1\cdot1)/2=0$，两者垂直。**PC2 和 PC1 垂直；本例只有二维，所以 PC2 也是方差最小的方向：$2+\sin270^\circ=2-1=1$。**逐格算也一样：两个分量是 $-1/\sqrt2$ 和 $1/\sqrt2$，对角两格乘 $\frac12$，另外两格乘 $-\frac12$，得 $\frac12(2-1-1+2)=2/2=1$。c37 写的 $(1,-1)/\sqrt2$ 和它只差一个负号，是同一条轴。',
            '转到垂直方向，影子挤在一起，只剩方差一', stage=3)
        d1 = px(102) * np.array([1., 1., 0.]) / np.sqrt(2)
        pc1_reference = DashedLine(origin - d1, origin + d1, color=TEAL,
                                   stroke_width=2, dash_length=px(6)).set_opacity(0.4)
        self.add(pc1_reference)
        self.play(FadeOut(calculation), FadeOut(mean), run_time=0.5)
        style['direction'] = YELLOW
        self.play(angle.animate.set_value(135), run_time=1.8)
        rotating_line.clear_updaters()
        style['direction'] = PURPLE
        self.play(rotating_line.animate.set_color(PURPLE),
                  Transform(heading, T('PC2：影子挤在一起', 21, PURPLE).move_to(P(177, 47))), run_time=0.6)
        rotating_line.add_updater(lambda mob: mob.become(line_build()))
        low = Circle(radius=px(6), color=PURPLE, stroke_width=2).move_to(gp(135, 1))
        low_label = T('PC2', 19, PURPLE).move_to(P(555, 209))
        mean = M(r'\mathbf p_2=(-1,1)/\sqrt2', 28, PURPLE).move_to(P(177, 291))
        calculation = M(r'\tfrac12(2-1-1+2)=1', 27, PURPLE).move_to(P(246, 324))
        self.play(FadeIn(low), FadeIn(low_label), FadeIn(mean), FadeIn(calculation), run_time=0.7)
        self.play(Indicate(low, color=PURPLE), run_time=0.7)
        self.wait(2.0)

        self.step(
            r"其实不必一个个方向去试：线转回青色的 $45^\circ$，下方写出 $\Sigma_x\mathbf p_1=3\mathbf p_1$ 和 $\Sigma_x\mathbf p_2=1\mathbf p_2$，矩阵乘上这两个方向只拉伸、不转向，正是 c04 特征向量视频里的 eigenvector（特征向量），拉伸倍数叫 eigenvalue（特征值）。验算：$\Sigma_x(1,1)=(2+1,\ 1+2)=(3,3)=3(1,1)$，$\Sigma_x(-1,1)=(-2+1,\ -1+2)=(-1,1)=1(-1,1)$，两边同除以 $\sqrt2$ 就是上面两式。沿特征方向，方差就等于特征值：$\mathbf p'\Sigma_x\mathbf p=\lambda\mathbf p'\mathbf p=\lambda$（因为 $\mathbf p'\mathbf p=1$）。**所以方差最大的方向，就是最大特征值（这里是 $3$）对应的特征向量，即 c37 的结论 $\Sigma_x\mathbf p_1=\lambda_1\mathbf p_1$。**只留 PC1、把二维压成一维，保留的方差比例是 $3/(3+1)=3/4=75\%$。丢掉的部分也能算：总方差是两个坐标的方差之和，也等于两个特征值之和，$2+2=3+1=4$；按勾股定理，每个点到原点距离的平方 = 影子坐标的平方 + 点到线距离的平方，平均下来平方重建误差是 $4-3=1$，所以最大化投影方差，也就是最小化平方重建误差。",
            '最宽方向就是最大特征值的方向', stage=4)
        d2 = px(102) * np.array([-1., 1., 0.]) / np.sqrt(2)
        pc2_reference = DashedLine(origin - d2, origin + d2, color=PURPLE,
                                   stroke_width=2, dash_length=px(6)).set_opacity(0.4)
        self.add(pc2_reference)
        style['direction'] = TEAL
        self.play(angle.animate.set_value(45), cloud.animate.set_opacity(0.4), run_time=1.8)
        self.play(Transform(heading, T('PC1：最大特征值的方向', 21, TEAL).move_to(P(177, 47))),
                  Transform(mean, unit_direction.copy()), FadeOut(calculation),
                  FadeOut(var_role), FadeOut(w_role), FadeOut(sigma_role), run_time=0.7)
        eigen1 = M(r'\Sigma_x\mathbf p_1=3\mathbf p_1', 28, TEAL).move_to(P(248, 310))
        eigen2 = M(r'\Sigma_x\mathbf p_2=1\mathbf p_2', 28, PURPLE).move_to(P(248, 334))
        eigen_role = VGroup(M(r'\lambda=', 25, GREY), T('该方向的方差', 18, GREY))
        eigen_role.arrange(RIGHT, buff=px(4)).move_to(P(501, 308))
        retained_role = T('只留青色方向，保留的方差比例', 18, GREEN).move_to(P(501, 331))
        self.play(Indicate(covariance, color=BLUE), FadeIn(eigen1), FadeIn(eigen2), run_time=0.9)
        self.play(Transform(formula, M(r'\frac{3}{3+1}=75\%', 32, GREEN).move_to(P(501, 281))),
                  FadeOut(graph_role), FadeIn(eigen_role), FadeIn(retained_role), run_time=0.8)
        self.play(Indicate(peak, color=TEAL), Indicate(shadows, color=TEAL), run_time=0.8)
        self.wait(2.4)
        for mob in (rotating_line, guides, shadows, angle_read, curve, moving_dot, var_read):
            mob.clear_updaters()
        self.takeaway(
            r"一句话：PCA 先中心化，再把数据投影到各个单位方向上，留下影子方差最大的那个方向。**$\max_{\|\mathbf p\|=1}\mathbf p'\Sigma_x\mathbf p$ 的解是最大特征值对应的单位特征向量，满足 $\Sigma_x\mathbf p=\lambda\mathbf p$，最大方差就等于这个特征值。**考试要记住的就是这个结论。本例最大方差 $3$、另一方向方差 $1$，只留 PC1 就解释 $3/(3+1)=75\%$ 的方差。",
            ['留下影子最分散的方向', '取最大特征值对应的单位方向',
             '本例只留第一主成分，保留四分之三'])
