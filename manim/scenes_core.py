"""Exemplar scenes (written first, used as the pattern for the others): eigen (c04), msgpass (c56), backprop (c34)."""
import numpy as np
from manim import (
    Arrow, BackgroundRectangle, Circle, Circumscribe, Create, DashedLine, DL, Dot, DOWN, DR, FadeIn, FadeOut, Flash, GrowFromEdge,
    Indicate, LEFT, Line, NumberPlane, ORIGIN, RIGHT, Rectangle, Square, Transform, UL, UP, UR, ValueTracker,
    VGroup, always_redraw, ApplyMatrix,
)
from common import (
    BG, BLUE, DIM, GREEN, GREY, GRID, PURPLE, RED, TEAL, WHITE, YELLOW, INK, M, MT, P, StepScene, T, mat, pill, px,
)


# ---------------------------------------------------------------- c04 · eigenvectors
class Eigen(StepScene):
    ID = 'eigen'
    TITLE = '特征向量：变换后仍在原来那条直线上的方向'
    FLOW = ['矩阵 = 拉扯平面', '普通向量会转向', '特殊方向不转向', '命名：A·v = λ·v', 'λ = 0 ⇒ 不可逆']

    def construct(self):
        faint = NumberPlane(x_range=[-8, 8, 1], y_range=[-5, 5, 1],
                            background_line_style={'stroke_color': '#2a2f38', 'stroke_width': 1},
                            axis_config={'stroke_color': '#2a2f38'})
        plane = NumberPlane(x_range=[-26, 26, 1], y_range=[-18, 18, 1],
                            background_line_style={'stroke_color': BLUE, 'stroke_width': 1.6, 'stroke_opacity': 0.45},
                            axis_config={'stroke_color': '#9fb3c8', 'stroke_width': 2})
        self.question(r'矩阵会把整个平面拉扯变形，大多数向量被拉扯后都会转向。那有没有一些方向，变换后**仍然躺在原来那条直线上**？这些方向就是本视频的主角。',
                      ['矩阵会把整个平面拉扯变形', '有没有哪些方向，变换后仍然在原来那条直线上？'])
        self.play(FadeIn(faint), Create(plane), run_time=1.6)
        self.M = np.eye(2)
        st = {'M0': np.eye(2), 'M1': np.eye(2)}
        tk = ValueTracker(1.0)

        def cur():
            return st['M0'] + (st['M1'] - st['M0']) * tk.get_value()

        def tip(p):
            q = cur() @ np.array(p, float)
            return np.array([q[0], q[1], 0.0])

        def vec(p, color, w=7):
            def build():
                end = tip(p)
                if np.linalg.norm(end) < 0.08:
                    return Dot(ORIGIN, radius=0.08, color=color)
                return Arrow(ORIGIN, end, buff=0, color=color, stroke_width=w,
                             max_tip_length_to_length_ratio=0.2, max_stroke_width_to_length_ratio=12)
            return always_redraw(build)

        def morph(M1, rt=1.8):
            M1 = np.array(M1, float)
            inc = M1 @ np.linalg.inv(self.M)
            st['M0'], st['M1'] = self.M.copy(), M1
            tk.set_value(0)
            self.play(ApplyMatrix(inc, plane), tk.animate.set_value(1), run_time=rt)
            self.M = M1

        def mlabel(name, rows):
            body = r'\\'.join('&'.join(str(v) for v in r) for r in rows)
            g = M(r'\mathbf %s=\begin{bmatrix}%s\end{bmatrix}' % (name, body), 38).to_corner(UL, buff=0.35).shift(DOWN * 0.45)
            return VGroup(BackgroundRectangle(g, color=BG, fill_opacity=0.88, buff=0.15), g)

        A = [[2, 1], [1, 2]]
        I2 = np.eye(2)
        ihat, jhat = vec([1, 0], GREEN), vec([0, 1], RED)
        il = always_redraw(lambda: T('î', 28, GREEN).next_to(tip([1, 0]), UR, buff=0.06))
        jl = always_redraw(lambda: T('ĵ', 28, RED).next_to(tip([0, 1]), UR, buff=0.06))
        self.play(FadeIn(ihat), FadeIn(jhat), FadeIn(il), FadeIn(jl), run_time=0.6)

        self.step(r'这是平面上的网格，绿色 $\hat\imath=(1,0)$、红色 $\hat\jmath=(0,1)$。矩阵 $\mathbf A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$ 是一种**变换**：把每个点 $\mathbf v$ 搬到 $\mathbf A\mathbf v$。看整张网格被拉扯——$\hat\imath$ 落到 $\mathbf A$ 的第 1 列 $(2,1)$，$\hat\jmath$ 落到第 2 列 $(1,2)$。',
                  '矩阵 = 对整个平面的拉扯：î、ĵ 落到 A 的两列 (2,1)、(1,2)', stage=0)
        lab = mlabel('A', A)
        self.play(FadeIn(lab))
        morph(A)
        self.wait(1)

        self.step(r'先放回原样，拿一个普通向量 $(1.5,\ 0.5)$（黄色），虚线是它所在的直线。变换后它变成 $\mathbf A(1.5,0.5)=(3.5,\ 2.5)$——**离开了原来那条线**，方向变了。大多数向量都会这样被"转向"。',
                  '普通向量被“转向”：(1.5, 0.5) → (3.5, 2.5)，离开了原来的直线', stage=1)
        morph(I2, 1.0)
        d = np.array([3.0, 1.0, 0]) / np.sqrt(10)
        yline = DashedLine(-14 * d, 14 * d, color=YELLOW, stroke_width=2, dash_length=0.15)
        yv = vec([1.5, 0.5], YELLOW)
        self.play(Create(yline), FadeIn(yv))
        morph(A)
        self.wait(1)

        self.step(r'但有一条特殊的直线：沿 $(1,1)$ 方向（青色）。这条线上的向量变换后**还在这条线上**，只是被拉长了 3 倍：$\mathbf A\begin{bmatrix}1\\1\end{bmatrix}=\begin{bmatrix}3\\3\end{bmatrix}=3\begin{bmatrix}1\\1\end{bmatrix}$。',
                  '特殊方向 (1,1)：变换后还在原线上，只是拉长 3 倍', stage=2)
        morph(I2, 1.0)
        self.play(FadeOut(yline), FadeOut(yv))
        d1 = np.array([1.0, 1.0, 0]) / np.sqrt(2)
        l1 = DashedLine(-10 * d1, 10 * d1, color=TEAL, stroke_width=2, dash_length=0.15)
        e1 = vec([1, 1], TEAL)
        self.play(Create(l1), FadeIn(e1))
        morph(A)
        k1 = T('×3', 34, TEAL).next_to(np.array([3, 3, 0]), RIGHT, buff=0.15)
        self.play(FadeIn(k1))
        self.wait(1)

        self.step(r'另一条：沿 $(1,-1)$ 方向（紫色）。这条线上的向量**一动不动**，拉伸 1 倍：$\mathbf A\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}1\\-1\end{bmatrix}$。',
                  '另一个特殊方向 (1,−1)：原地不动，倍数 1', stage=2)
        self.play(FadeOut(k1))
        morph(I2, 1.0)
        d2 = np.array([1.0, -1.0, 0]) / np.sqrt(2)
        l2 = DashedLine(-10 * d2, 10 * d2, color=PURPLE, stroke_width=2, dash_length=0.15)
        e2 = vec([1, -1], PURPLE)
        self.play(Create(l2), FadeIn(e2))
        morph(A)
        k2 = T('×1', 34, PURPLE).next_to(np.array([1, -1, 0]), RIGHT, buff=0.2)
        self.play(FadeIn(k1), FadeIn(k2))
        self.wait(1)

        self.step(r'这两个方向就是 $\mathbf A$ 的 eigenvector（特征向量），倍数叫 eigenvalue（特征值）：**变换后仍在原直线上的非零向量满足 $\mathbf A\mathbf v=\lambda\mathbf v$，$\lambda$ 就是拉伸倍数。**正数是同向缩放，负数是反向，$0$ 是压成零向量。这里 $\lambda=3$ 和 $1$。$\mathbf A$ 是对称矩阵且两个特征值都 $>0$，所以它是 PD（positive definite，正定）——正文 ⑤ 会正式定义；特征值都不为 $0$，所以可逆。',
                  '不转向的方向 = 特征向量，拉伸倍数 = 特征值：A·v = λ·v', stage=3)
        eq = M([r'\mathbf A\mathbf v', '=', r'\lambda\mathbf v'], 56, YELLOW)
        fa, fl = eq[0], eq[2]
        ra = T('变换后的 v', 18, GREY).next_to(fa, DOWN, buff=0.15).align_to(fa, RIGHT)
        rl = T('原来的 v 拉长 λ 倍', 18, GREY).next_to(fl, DOWN, buff=0.15).align_to(fl, LEFT)
        f = VGroup(eq, ra, rl).to_corner(DR, buff=0.5).shift(UP * 0.6)
        fb = BackgroundRectangle(f, color=BG, fill_opacity=0.88, buff=0.15)
        self.play(FadeIn(fb), FadeIn(eq))
        self.play(FadeIn(ra, shift=UP * 0.1), FadeIn(rl, shift=UP * 0.1))
        self.play(Flash(np.array([3, 3, 0]), color=TEAL), Flash(np.array([1, -1, 0]), color=PURPLE))
        self.wait(1.2)

        self.step(r"换成 $\mathbf B=\begin{bmatrix}1&1\\1&1\end{bmatrix}$：方向 $(1,-1)$ 的特征值是 0——整个平面被压扁成一条线。**压扁后很多不同的点落在同一位置，没法“撤销”，所以 $\mathbf B$ 没有逆。**c04 的“米 / 厘米两列”让 $\mathbf X'\mathbf X$ 不可逆，就是这种情况。",
                  'λ = 0：方向 (1,−1) 被压成零，平面塌成一条线 ⇒ 无法撤销（不可逆）', stage=4)
        self.play(FadeOut(k1), FadeOut(k2), FadeOut(f), FadeOut(fb))
        morph(I2, 1.0)
        self.play(Transform(lab, mlabel('B', [[1, 1], [1, 1]])), FadeOut(ihat), FadeOut(jhat), FadeOut(il), FadeOut(jl))
        morph([[1, 1], [1, 1]], 2.2)
        k0 = T('(1,−1) → 0，λ = 0', 30, PURPLE).next_to(ORIGIN, DR, buff=0.4)
        k2 = T('(1,1) → (2,2)：×2', 26, TEAL).next_to(np.array([2, 2, 0]), RIGHT, buff=0.2)
        self.play(FadeIn(VGroup(BackgroundRectangle(k0, color=BG, fill_opacity=0.85, buff=0.1), k0)),
                  FadeIn(VGroup(BackgroundRectangle(k2, color=BG, fill_opacity=0.85, buff=0.1), k2)))
        self.wait(2)

        self.takeaway(r"一句话：**特征向量是变换后仍在原来直线上的方向，特征值是它在这条线上被拉伸的倍数**，$\mathbf A\mathbf v=\lambda\mathbf v$。只要有一个特征值是 $0$，就有方向被压成零，矩阵不可逆——$\mathbf X'\mathbf X$ 不可逆就是这种情况。（$(1,1)$ 仍是特征向量，被拉成 $(2,2)$，$\lambda=2$。）",
                      ['特征向量：变换后仍在原来直线上的方向', '特征值 λ：在这条线上被拉伸的倍数　A·v = λ·v',
                       '有 λ = 0 ⇒ 某个方向被压成零 ⇒ 矩阵不可逆'])


# ---------------------------------------------------------------- c56 · message passing on the 5-room tree
NODES = {'x1': (110, 62), 'x2': (110, 182), 'x3': (290, 182), 'x4': (110, 302), 'x5': (290, 302)}
EDGES = [('x1', 'x2', 'ψ₁₂'), ('x2', 'x3', 'ψ₂₃'), ('x2', 'x4', 'ψ₂₄'), ('x4', 'x5', 'ψ₄₅')]
SUB = {'x1': 'x₁', 'x2': 'x₂', 'x3': 'x₃', 'x4': 'x₄', 'x5': 'x₅'}
R_NODE = px(21)


def tree(root='x4', root_color=RED):
    """The L21 5-node tree; returns (dict of node circles, VGroup of everything to show)."""
    g = VGroup()
    for a, b, lab in EDGES:
        pa, pb = P(*NODES[a]), P(*NODES[b])
        g.add(Line(pa, pb, color=GREY, stroke_width=3))
        mid = (pa + pb) / 2
        off = LEFT * 0.5 if pa[0] == pb[0] else UP * 0.3
        g.add(T(lab, 20, GREY).move_to(mid + off))
    nodes = {}
    for k, (x, y) in NODES.items():
        c = Circle(radius=R_NODE, fill_color='#20232b', fill_opacity=1, stroke_color=root_color if k == root else WHITE,
                   stroke_width=6 if k == root else 3).move_to(P(x, y))
        nodes[k] = c
        g.add(c, T(SUB[k], 26).move_to(P(x, y)))
    return nodes, g


def panel(scene, old, lines, x=372, y0=60, dy=34, size=22):
    """Replace the right-hand working panel with new lines (first line yellow)."""
    if old:
        scene.play(*[FadeOut(m) for m in old], run_time=0.3)
    def style(i, s):
        if i == 0:
            return size, YELLOW
        return (18, GREY) if s.startswith('ψ') else (size, WHITE)
    new = [T(s, *style(i, s)).next_to(P(x, y0 + i * dy), RIGHT, buff=0) for i, s in enumerate(lines)]
    for m in new:
        scene.play(FadeIn(m, shift=RIGHT * 0.1), run_time=0.35)
    return new


class MsgPass(StepScene):
    ID = 'msgpass'
    TITLE = '树上的消息传递：从叶子把求和一路"打包"送到 x₄'
    FLOW = ['笨办法：枚举', '叶子：加掉自己 → 消息', '中间点：乘来信再加掉', '根：相乘、归一化']

    def construct(self):
        self.question(r'5 个房间连成一棵树，每条边上有一张"相容性"分数表 $\psi$。想知道 $x_4$ 热的概率，就要把其余 4 个房间**所有热 / 冷组合**的分数加起来。组合数随房间数指数增长——能不能每条边只算一次？',
                      ['想知道 x₄ 热的概率，要把其余房间的所有组合加起来', '能不能每条边只算一次？'])
        nodes, g = tree()
        self.play(FadeIn(g), FadeIn(T('每条消息 =（x 热时，x 冷时）两个数', 18, GREY).next_to(P(372, 338), RIGHT, buff=0)), run_time=1.0)
        pan = []

        def send(a, b, text, fill=YELLOW, color=INK):
            pa, pb = P(*NODES[a]), P(*NODES[b])
            m = pill(text, fill, color, 22).move_to(pa)
            park = pa + (pb - pa) * 0.55 + (RIGHT * 0.75 if pa[0] == pb[0] else DOWN * 0.42)
            self.play(FadeIn(m, scale=0.6), run_time=0.3)
            self.play(m.animate.move_to(park), run_time=1.0)
            return m

        self.step(r'笨办法：**先固定 $x_4$ 为热**，其余 4 个房间 $x_1,x_2,x_3,x_5$ 各有热 / 冷两种，共 $2^4=16$ 种组合，每种把 4 张表的分数相乘再加起来；再固定 $x_4$ 为冷、再算 16 种，最后才能归一化。房间一多，这个数会爆炸。',
                  '笨办法：固定 x₄，把其余房间的 2⁴ = 16 种组合逐个相乘再相加', stage=0)
        pan = panel(self, pan, ['逐个枚举：16 种组合', '每种：4 个分数相乘', '再全部加起来'])
        cells = VGroup(*[Square(side_length=px(24), fill_color=BLUE, fill_opacity=1, stroke_width=0)
                         .move_to(P(392 + (i % 8) * 30, 152 + (i // 8) * 30)) for i in range(16)])
        for c in cells:
            self.play(FadeIn(c), run_time=0.08)
        self.wait(1)

        self.step(r'换个做法：**从叶子开始**。$x_5$ 只连着 $x_4$，所以先把 $x_5$ 的两种情况加掉——$x_4$ 热时 $\psi_{45}(\text{热},\text{热})+\psi_{45}(\text{热},\text{冷})=3+1=4$，冷时 $1+2=3$。打包成一条消息（message） $m_{5\to4}=(4,3)$ 送给 $x_4$。',
                  '聪明办法：叶子 x₅ 先把自己加掉，结果打包成“消息”送给 x₄', stage=1)
        self.play(FadeOut(cells), run_time=0.4)
        self.play(nodes['x5'].animate.set_fill('#5a4a16'), run_time=0.3)
        pan = panel(self, pan, ['m₅→₄：把 x₅ 加掉', 'ψ₄₅(x₄,x₅) 表：热热 3 · 热冷 1 · 冷热 1 · 冷冷 2', 'x₄ 热：3 + 1 = 4', 'x₄ 冷：1 + 2 = 3'])
        m54 = send('x5', 'x4', '(4,3)')
        self.wait(0.8)

        self.step(r'同样，叶子 $x_1$ 把自己加掉，送给 $x_2$：$x_2$ 热时 $3+1=4$，冷时 $1+1=2$，消息 $(4,2)$。',
                  '叶子 x₁ 也把自己加掉，消息 (4, 2) 送给 x₂', stage=1)
        self.play(nodes['x1'].animate.set_fill('#5a4a16'), run_time=0.3)
        pan = panel(self, pan, ['m₁→₂：把 x₁ 加掉', 'ψ₁₂(x₁,x₂) 表：热热 3 · 热冷 1 · 冷热 1 · 冷冷 1', 'x₂ 热：3 + 1 = 4', 'x₂ 冷：1 + 1 = 2'])
        m12 = send('x1', 'x2', '(4,2)')
        self.wait(0.6)

        self.step(r'叶子 $x_3$ 也送给 $x_2$：热 $1+2=3$，冷 $1+1=2$，消息 $(3,2)$。',
                  '叶子 x₃ 同样处理，消息 (3, 2) 送给 x₂', stage=1)
        self.play(nodes['x3'].animate.set_fill('#5a4a16'), run_time=0.3)
        pan = panel(self, pan, ['m₃→₂：把 x₃ 加掉', 'ψ₂₃(x₂,x₃) 表：热热 1 · 热冷 2 · 冷热 1 · 冷冷 1', 'x₂ 热：1 + 2 = 3', 'x₂ 冷：1 + 1 = 2'])
        m32 = send('x3', 'x2', '(3,2)')
        self.wait(0.6)

        self.step(r'$x_2$ 收齐了两条来信，先**逐项相乘**：热 $4\times3=12$，冷 $2\times2=4$。再乘上通往 $x_4$ 的 $\psi_{24}$、把 $x_2$ 加掉：$x_4$ 热 $4\times12+1\times4=52$，冷 $1\times12+2\times4=20$。',
                  'x₂ 收齐来信：先相乘，再把自己加掉，打包成 (52, 20) 送给 x₄', stage=2)
        meet = P(*NODES['x2']) + RIGHT * 1.15 + UP * 0.66
        self.play(m12.animate.move_to(meet), m32.animate.move_to(meet), run_time=0.7)
        merged = pill('(12,4)', YELLOW, INK, 22).move_to(meet)
        self.play(FadeOut(m12), Transform(m32, merged), run_time=0.4)
        self.play(Indicate(m32), nodes['x2'].animate.set_fill('#5a4a16'), run_time=0.6)
        pan = panel(self, pan, ['m₂→₄：乘来信，再把 x₂ 加掉', '来信相乘：(4·3, 2·2) = (12, 4)', 'ψ₂₄(x₂,x₄) 表：热热 4 · 热冷 1 · 冷热 1 · 冷冷 2',
                                'x₄ 热：4·12 + 1·4 = 52', 'x₄ 冷：1·12 + 2·4 = 20'])
        self.play(FadeOut(m32), run_time=0.3)
        m24 = send('x2', 'x4', '(52,20)')
        self.wait(0.6)

        self.step(r'到达 $x_4$：两条来信相乘 $(52\times4,\ 20\times3)=(208,\ 60)$，归一化：$P(x_4=\text{热})=\frac{208}{268}\approx0.78$。和逐个枚举 16 种组合**结果完全一样**，但只做了十来次小加法和乘法——把求和"往里推"，就是 variable elimination。',
                  'x₄ 收齐来信：相乘得 (208, 60)，归一化 ⇒ P(热) ≈ 0.78', stage=3)
        at = P(200, 245)
        self.play(m24.animate.move_to(at), m54.animate.move_to(at), run_time=0.7)
        res = pill('(208,60)', RED, WHITE, 22).move_to(at)
        self.play(FadeOut(m24), Transform(m54, res), run_time=0.4)
        pan = panel(self, pan, ['x₄：来信相乘', '(52·4, 20·3) = (208, 60)', '归一化：208/268 ≈ 0.78'])
        base = P(400, 300)
        hot = Rectangle(width=px(46), height=0.78 * px(120), fill_color=RED, fill_opacity=1, stroke_width=0)
        cold = Rectangle(width=px(46), height=0.22 * px(120), fill_color=BLUE, fill_opacity=1, stroke_width=0)
        hot.move_to(P(423, 300 - 0.78 * 60))
        cold.move_to(P(493, 300 - 0.22 * 60))
        self.play(GrowFromEdge(hot, DOWN), GrowFromEdge(cold, DOWN), run_time=0.9)
        self.play(FadeIn(T('热 0.78', 22, RED).next_to(hot, UP, buff=0.1)), FadeIn(T('冷 0.22', 22, BLUE).next_to(cold, UP, buff=0.1)))
        self.wait(2)

        self.takeaway(r'一句话：**消息就是“把一片叶子（或一整棵子树）提前加掉”后剩下的两个数。**每条边只传一次消息，到达 $x_4$ 后相乘再归一化，结果和暴力枚举 16 + 16 种组合完全一样——这就是 variable elimination / sum-product 在树上的样子。',
                      ['消息 = 把一棵子树提前加掉后剩下的（热，冷）两个数', '每条边只传一次：先乘来信，再把自己加掉，送给下一个',
                       '结果与暴力枚举完全相同，但计算量只随房间数线性增长'])


# ---------------------------------------------------------------- c34 · backpropagation (T10 numbers)
NN = {'x0': (70, 120), 'x1': (70, 260), 'u0': (300, 64), 'u1': (300, 180), 'u2': (300, 298), 'z': (520, 180)}
NE = [('x0', 'u1', '0.5'), ('x0', 'u2', '−0.5'), ('x1', 'u1', '1'), ('x1', 'u2', '1'), ('u0', 'z', '0'), ('u1', 'z', '1'), ('u2', 'z', '−1')]
NNAME = {'x0': 'x₀', 'x1': 'x₁', 'u0': 'u₀', 'u1': 'u₁', 'u2': 'u₂', 'z': 'z'}


class Backprop(StepScene):
    ID = 'backprop'
    TITLE = '反向传播：数值先往前流，误差再往回流'
    FLOW = ['前向算值', '损失', '输出误差 δ', '输出层梯度', '隐藏误差 ε', '输入层梯度']

    def construct(self):
        self.question(r'网络里每个权重都要知道：**改它一点点，损失会变多少**（梯度）。逐个权重单独求导会把同样的东西重复算很多遍。反向传播的想法：数值先往前流一次，误差再往回流一次，所有梯度就都有了。',
                      ['每个权重都要知道：改它一点点，损失变多少？', '逐个求导太慢——能不能一次全算完？'])
        net = VGroup()
        edge = {}
        for a, b, w in NE:
            pa, pb = P(*NN[a]), P(*NN[b])
            edge[a + b] = Line(pa, pb, color=DIM, stroke_width=4)
            net.add(edge[a + b])
            off = UP * 0.22 if pb[1] >= pa[1] else DOWN * 0.24 + LEFT * 0.12   # keep the label off its own edge
            net.add(T(w, 18, GREY).move_to(pa + (pb - pa) * 0.3 + off))
        node, val = {}, {}
        for k, (x, y) in NN.items():
            node[k] = Circle(radius=px(22), fill_color='#20232b', fill_opacity=1, stroke_color=WHITE, stroke_width=3).move_to(P(x, y))
            net.add(node[k], T(NNAME[k], 26).move_to(P(x, y)))
        start = {'x0': '1', 'x1': '1', 'u0': '1（偏置）'}
        for k, s in start.items():
            val[k] = T(s, 20, YELLOW).move_to(P(NN[k][0], NN[k][1] + 38))
            net.add(val[k])
        self.play(FadeIn(net), run_time=1.0)

        def flow(a, b, color, back=False):
            pa, pb = P(*NN[a]), P(*NN[b])
            s, e = (pb, pa) if back else (pa, pb)
            d = Dot(s, radius=0.12, color=color)
            return [edge[a + b].animate.set_color(color), d.animate.move_to(e)], d

        def run_flows(pairs, color, back=False):
            anims, dots = [], []
            for a, b in pairs:
                an, d = flow(a, b, color, back)
                self.add(d)
                anims += an
                dots.append(d)
            self.play(*anims, run_time=1.0)
            self.play(*[FadeOut(d) for d in dots], run_time=0.2)

        def rule(err, val, err_c, val_c, err_job, val_job):
            tex = {'δ': r'\delta', 'ε': r'\varepsilon'}[err]
            head = VGroup(T('每条边的梯度', 22, WHITE),
                          M([r'\frac{\partial L}{\partial %s}=' % ('w' if err == 'δ' else 'v'), tex, r'\times', val], 34))
            head[1][1].set_color(err_c)
            head[1][3].set_color(val_c)
            head.arrange(RIGHT, buff=0.18)
            g = VGroup(head,
                       T(f'{err}：终点的误差（往回流）' if err_job is None else err_job, 16, err_c),
                       T(f'{val}：起点的值（往前流）' if val_job is None else val_job, 16, val_c)).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
            return g.next_to(P(626, 44), DL, buff=0)

        def grad(a, b, text, t=0.66, down=0.26):
            pa, pb = P(*NN[a]), P(*NN[b])
            return pill(text, RED, INK, 18).move_to(pa + (pb - pa) * t + DOWN * down)

        self.step(r'前向第 1 步：每个隐藏单元先算加权和 $r_j=\sum_i x_iv_{ij}$。$r_1=0.5\cdot1+1\cdot1=1.5$，$r_2=-0.5\cdot1+1\cdot1=0.5$。ReLU 让正数原样通过：$u_1=1.5$，$u_2=0.5$。',
                  '前向：每个隐藏单元 = 输入的加权和，再过 ReLU（正数原样通过）', stage=0)
        run_flows([('x0', 'u1'), ('x1', 'u1'), ('x0', 'u2'), ('x1', 'u2')], BLUE)
        val['u1'] = T('r₁ = 1.5 → u₁ = 1.5', 20, YELLOW).move_to(P(300, 218))
        val['u2'] = T('r₂ = 0.5 → u₂ = 0.5', 20, YELLOW).move_to(P(300, 336))
        self.play(FadeIn(val['u1']), FadeIn(val['u2']))
        self.wait(0.8)

        self.step(r'前向第 2 步：输出 $s=w_0u_0+w_1u_1+w_2u_2=0\cdot1+1\cdot1.5+(-1)\cdot0.5=1$，恒等输出 $z=s=1$。损失 $L=\frac12(z-y)^2=\frac12(1-0)^2=0.5$。',
                  '输出 = 隐藏值的加权和 z = 1；和真实值 y = 0 比，损失 L = 0.5', stage=1)
        run_flows([('u0', 'z'), ('u1', 'z'), ('u2', 'z')], BLUE)
        val['z'] = T('z = 1，L = 0.5', 20, YELLOW).move_to(P(520, 220))
        self.play(FadeIn(val['z']))
        self.wait(0.8)

        self.step(r'反向从输出开始。损失对输出的敏感度 $\delta=\dfrac{\partial L}{\partial s}=z-y=1$（平方损失 + 恒等输出时）。**这个 $\delta$ 只算一次，后面所有梯度都会反复用到它。**',
                  '反向从输出开始：δ = z − y 衡量“输出偏了多少”', stage=2)
        self.play(*[e.animate.set_color(DIM) for e in edge.values()], run_time=0.4)
        self.play(node['z'].animate.set_stroke(RED, width=6), run_time=0.4)
        dl = M(r'\delta=z-y=1', 34, RED).move_to(P(520, 290))
        self.play(FadeIn(dl), Indicate(node['z'], color=RED))
        self.wait(0.8)

        self.step(r'输出层：**每条边的梯度 = $\delta\times$ 这条边“上游送进来的值”**：$\dfrac{\partial L}{\partial w_j}=\delta\,u_j$，所以三条边分别是 $1\times1=1$、$1\times1.5=1.5$、$1\times0.5=0.5$。',
                  '输出层每条边的梯度 = δ × 这条边送进来的值 u<sub>j</sub>', stage=3)
        run_flows([('u0', 'z'), ('u1', 'z'), ('u2', 'z')], RED, back=True)
        self.play(*[FadeIn(grad(a, 'z', t)) for a, t in [('u0', '1'), ('u1', '1.5'), ('u2', '0.5')]])
        card = rule('δ', 'u', RED, YELLOW, None, None)
        self.play(FadeIn(card, shift=DOWN * 0.1))
        self.wait(0.8)

        self.step(r"继续往回传到隐藏单元：**误差沿着权重 $w_j$ 往回分给隐藏单元**。令 $g(r)=\max(0,r)$ 是 ReLU，$\varepsilon_j=\partial L/\partial r_j$ 是损失对隐藏单元加权和的导数。链式法则：$\varepsilon_j=\delta\cdot w_j\cdot g'(r_j)$。ReLU 在正数处导数为 1，所以 $\varepsilon_1=1\cdot1\cdot1=1$，$\varepsilon_2=1\cdot(-1)\cdot1=-1$。",
                  '误差沿权重往回分：ε<sub>j</sub> = δ · w<sub>j</sub> · g′(r<sub>j</sub>)', stage=4)
        e1 = T('ε₁ = 1', 22, RED).move_to(P(300, 218))
        e2 = T('ε₂ = −1', 22, RED).move_to(P(300, 336))
        self.play(Transform(val['u1'], e1), Transform(val['u2'], e2),
                  node['u1'].animate.set_stroke(RED, width=5), node['u2'].animate.set_stroke(RED, width=5))
        self.play(Indicate(node['u1'], color=RED), Indicate(node['u2'], color=RED))
        self.wait(0.8)

        self.step(r'最后是输入→隐藏层权重的梯度：$\dfrac{\partial L}{\partial v_{ij}}=\varepsilon_j\,x_i$，四条边都是 $\pm1$。每个梯度都只是“往回流的误差 × 往前流的值”——**同一个 $\varepsilon_j$ 被该隐藏单元的所有输入边复用**，$\delta$ 也被所有输出边复用，这就是 backprop 比逐个求导省的原因。',
                  '输入层每条边的梯度 = 终点的误差 ε<sub>j</sub> × 起点的值 x<sub>i</sub>', stage=5)
        run_flows([('x0', 'u1'), ('x1', 'u1'), ('x0', 'u2'), ('x1', 'u2')], RED, back=True)
        self.play(*[FadeIn(grad(a, b, t, 0.8, 0)) for a, b, t in [('x0', 'u1', '1'), ('x1', 'u1', '1'), ('x0', 'u2', '−1'), ('x1', 'u2', '−1')]])
        self.play(Transform(card, rule('ε', 'x', RED, YELLOW, None, None)))
        self.play(Circumscribe(card, color=YELLOW))
        self.wait(2)

        self.takeaway(r'一句话：前向时数值从左往右流，记下每个单元的值；反向时误差信号 $\delta$、$\varepsilon$ 从右往左流，每个只算一次。每条边的梯度 = **终点处往回流的误差 × 起点处往前流的值**，所以一次前向 + 一次反向就得到全部梯度。',
                      ['前向：数值从左往右流（记下每个 u）', '反向：误差 δ、ε 从右往左流（每个只算一次）', '每条边的梯度 = 终点的误差 × 起点的值'])
