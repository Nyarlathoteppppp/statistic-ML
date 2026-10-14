"""c04 · eigenvectors (exemplar scene)."""
import numpy as np
from manim import (
    ApplyMatrix, Arrow, BackgroundRectangle, Create, DashedLine, DL, Dot, DOWN, DR, FadeIn, FadeOut, Flash, LEFT, Line,
    NumberPlane, ORIGIN, RIGHT, Transform, UL, UP, ValueTracker, VGroup, always_redraw,
)
from common import BG, BLUE, GREEN, GREY, INK, PURPLE, RED, TEAL, WHITE, YELLOW, M, StepScene, T, pill


# ---------------------------------------------------------------- c04 · eigenvectors
class Eigen(StepScene):
    ID = 'eigen'
    TITLE = '特征向量：变换后仍在原来那条直线上的向量'
    FLOW = ['矩阵 = 拉扯平面', '普通向量离开原线', '特殊向量仍在原直线上', '命名：A·v = λ·v', 'λ = 0 ⇒ 不可逆']

    def construct(self):
        faint = NumberPlane(x_range=[-8, 8, 1], y_range=[-5, 5, 1],
                            background_line_style={'stroke_color': '#2a2f38', 'stroke_width': 1},
                            axis_config={'stroke_color': '#2a2f38'})
        plane = NumberPlane(x_range=[-26, 26, 1], y_range=[-18, 18, 1],
                            background_line_style={'stroke_color': BLUE, 'stroke_width': 1.6, 'stroke_opacity': 0.45},
                            axis_config={'stroke_color': '#9fb3c8', 'stroke_width': 2})
        self.question(r'矩阵会把整个平面拉扯变形，大多数向量被拉扯后都会离开自己原来那条直线。那有没有一些向量，变换后**仍然躺在原来那条直线上**？它们就是本视频的主角。最后还会顺带回答卡片上的另一个问题：一个矩阵什么时候能被“撤销”（有逆）？',
                      ['矩阵会把整个平面拉扯变形', '有没有向量，变换后仍在原来那条直线上？', '顺带回答：矩阵什么时候能“撤销”？'], hold=3.0)
        self.play(FadeIn(faint), Create(plane), run_time=1.6)
        self.M = np.eye(2)
        st = {'M0': np.eye(2), 'M1': np.eye(2)}
        tk = ValueTracker(1.0)

        def cur():
            return st['M0'] + (st['M1'] - st['M0']) * tk.get_value()

        def tip(p):
            q = cur() @ np.array(p, float)
            return np.array([q[0], q[1], 0.0])

        def vec(p, color, alpha=None, sty=None):
            """Live arrow A·p that follows the grid. alpha: ValueTracker for its opacity; sty: mutable dict that can
            change its width / tip later (used when î and ĵ land on the same point)."""
            def build():
                end = tip(p)
                a = 1.0 if alpha is None else alpha.get_value()
                if np.linalg.norm(end) < 0.08:
                    return Dot(ORIGIN, radius=0.08, color=color).set_opacity(a)
                s = sty or {}
                return Arrow(ORIGIN, end, buff=0, color=color, stroke_width=s.get('w', 7), tip_length=s.get('tip', 0.35),
                             max_tip_length_to_length_ratio=s.get('ratio', 0.2),
                             max_stroke_width_to_length_ratio=12).set_opacity(a)
            return always_redraw(build)

        def ghost(p, color):
            """Translucent copy of the vector before the transform: a wide halo with a big head, so it still shows
            when the live arrow lies on top of it."""
            return Arrow(ORIGIN, np.array([p[0], p[1], 0.0]), buff=0, color=color, stroke_width=16, tip_length=0.42,
                         max_tip_length_to_length_ratio=0.3, max_stroke_width_to_length_ratio=12).set_opacity(0.42)

        def morph(M1, rt=1.8, *extra):
            """Grid and live arrows go from the current matrix to M1; extra animations run in the same play."""
            M1 = np.array(M1, float)
            inc = M1 @ np.linalg.inv(self.M)
            st['M0'], st['M1'] = self.M.copy(), M1
            tk.set_value(0)
            self.play(ApplyMatrix(inc, plane), tk.animate.set_value(1), *extra, run_time=rt)
            self.M = M1

        def mlabel(name, rows):
            body = r'\\'.join('&'.join(str(v) for v in r) for r in rows)
            g = M(r'\mathbf %s=\begin{bmatrix}%s\end{bmatrix}' % (name, body), 38).to_corner(UL, buff=0.35).shift(DOWN * 0.45)
            return VGroup(BackgroundRectangle(g, color=BG, fill_opacity=0.88, buff=0.15), g)

        def tag(s, at, side, color, size=28, buff=0.15, **kw):
            t = T(s, size, color, **kw).next_to(at, side, buff=buff)
            return VGroup(BackgroundRectangle(t, color=BG, fill_opacity=0.85, buff=0.08), t)

        def back(*labels):
            """Undo the transform before the next vector: result labels and the old subtitle go first, a label says
            what is happening, the grid morphs back to the identity, then a short pause. Returns the label."""
            outs = [FadeOut(m) for m in labels]
            if self._cap is not None:
                outs.append(FadeOut(self._cap))
                self._cap = None
            if outs:
                self.play(*outs, run_time=0.4)
            note = pill('回到变换前', fill='#cfd6e0', color=INK, size=26).move_to(UP * 2.85).set_z_index(5)
            self.play(FadeIn(note, scale=0.9), run_time=0.35)
            morph(np.eye(2), 1.1)
            self.wait(0.6)
            return note

        A = [[2, 1], [1, 2]]
        ija = ValueTracker(1.0)                 # î, ĵ step back (dim) while the yellow / teal / purple vectors are studied
        sty_i, sty_j = {}, {}
        ihat, jhat = vec([1, 0], GREEN, ija, sty_i), vec([0, 1], RED, ija, sty_j)
        # î below-right of its tip, ĵ above-left: when B sends both to (1,1) the two glyphs do not stack
        il = always_redraw(lambda: T('î', 28, GREEN).next_to(tip([1, 0]), DR, buff=0.06).set_opacity(ija.get_value()))
        jl = always_redraw(lambda: T('ĵ', 28, RED).next_to(tip([0, 1]), UL, buff=0.06).set_opacity(ija.get_value()))
        self.play(FadeIn(ihat), FadeIn(jhat), FadeIn(il), FadeIn(jl), run_time=0.6)

        # ---- 1 · a matrix stretches the whole plane
        self.step(r'这是平面上的网格（背后暗色的网格是变换前的样子，留作对照），绿色 $\hat\imath=(1,0)$、红色 $\hat\jmath=(0,1)$（读作 i-hat、j-hat，只是 $x$、$y$ 方向上长度为 1 的箭头的名字，和“估计值”的帽子无关）。矩阵 $\mathbf A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$ 是一种**变换**：把每个点 $\mathbf v$ 搬到 $\mathbf A\mathbf v$。矩阵乘向量的算法：结果第 1 个数 = $\mathbf A$ 的第 1 行和 $\mathbf v$ 做点积（对应相乘再相加），第 2 个数 = 第 2 行和 $\mathbf v$ 做点积。看整张网格被拉扯——$\hat\imath$ 落到 $\mathbf A\begin{bmatrix}1\\0\end{bmatrix}=\begin{bmatrix}2\cdot1+1\cdot0\\1\cdot1+2\cdot0\end{bmatrix}=\begin{bmatrix}2\\1\end{bmatrix}$，正好是 $\mathbf A$ 的第 1 列；$\hat\jmath$ 同理落到第 2 列 $(1,2)$。',
                  '矩阵 = 对整个平面的拉扯：î、ĵ 落到 A 的两列 (2,1)、(1,2)', stage=0)
        lab = mlabel('A', A)
        self.play(FadeIn(lab))
        morph(A)
        self.wait(1.2)

        # ---- 2 · an ordinary vector leaves its line
        self.step(r'网格先回到变换前。拿一个普通向量 $\mathbf v=(1.5,\ 0.5)$（黄色），虚线是它所在的直线（$\mathbf v$ 的所有倍数都在这条线上）。再做一次变换：淡黄色留在原处，表示变换前的 $\mathbf v$；亮黄色是 $\mathbf A\mathbf v=\begin{bmatrix}2\cdot1.5+1\cdot0.5\\1\cdot1.5+2\cdot0.5\end{bmatrix}=\begin{bmatrix}3.5\\2.5\end{bmatrix}$。**它离开了原来那条虚线**：$(3.5,\ 2.5)$ 不是 $(1.5,\ 0.5)$ 的倍数（$3.5\div1.5\approx2.3$，$2.5\div0.5=5$，两个分量放大的倍数不一样）。大多数向量都会这样。',
                  stage=1)
        note = back()
        self.caption('普通向量 (1.5, 0.5) → (3.5, 2.5)：离开了原来的直线')
        d = np.array([3.0, 1.0, 0]) / np.sqrt(10)
        yline = DashedLine(-14 * d, 14 * d, color=YELLOW, stroke_width=2, dash_length=0.15)
        yg, yv = ghost([1.5, 0.5], YELLOW), vec([1.5, 0.5], YELLOW)
        self.play(FadeOut(note), Create(yline), FadeIn(yg), FadeIn(yv), ija.animate.set_value(0.3))
        morph(A)
        ky = tag('A·v = (3.5, 2.5)', np.array([3.5, 2.5, 0]), UP, YELLOW, 26)
        self.play(FadeIn(ky))
        self.wait(1.4)

        # ---- 3 · a special vector stays on its line: ×3
        self.step(r'再回到变换前。这次取 $\mathbf v=(1,1)$（青色），虚线是它的直线。变换后它**还在这条虚线上**，长度正好是淡青色原向量的 3 倍——两道白色刻度把它分成相等的 3 段：$\mathbf A\begin{bmatrix}1\\1\end{bmatrix}=\begin{bmatrix}2\cdot1+1\cdot1\\1\cdot1+2\cdot1\end{bmatrix}=\begin{bmatrix}3\\3\end{bmatrix}=3\begin{bmatrix}1\\1\end{bmatrix}$。',
                  stage=2)
        note = back(ky)
        self.play(FadeOut(note), FadeOut(yline), FadeOut(yg), FadeOut(yv), run_time=0.5)
        self.caption('特殊向量 (1,1)：变换后仍在原直线上，正好 ×3')
        d1 = np.array([1.0, 1.0, 0]) / np.sqrt(2)
        l1 = DashedLine(-10 * d1, 10 * d1, color=TEAL, stroke_width=2, dash_length=0.15)
        g1, e1 = ghost([1, 1], TEAL), vec([1, 1], TEAL)
        self.play(Create(l1), FadeIn(g1), FadeIn(e1))
        morph(A)
        nrm = np.array([-1.0, 1.0, 0]) / np.sqrt(2)
        ticks = VGroup(*[Line(np.array([k, k, 0.0]) - 0.2 * nrm, np.array([k, k, 0.0]) + 0.2 * nrm,
                              color=WHITE, stroke_width=3.5) for k in (1, 2)])
        k1 = tag('×3', np.array([3, 3, 0]), RIGHT, TEAL, 34)
        self.play(Create(ticks), FadeIn(k1))
        self.wait(1.4)

        # ---- 4 · another special vector: ×1, every point of its line stays put
        self.step(r'再回到变换前，取 $\mathbf v=(1,-1)$（紫色），线上再放几个紫点。变换时周围的网格都在动，紫色箭头和紫点却一动不动，和淡紫色的原向量重合：$\mathbf A\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}2\cdot1+1\cdot(-1)\\1\cdot1+2\cdot(-1)\end{bmatrix}=\begin{bmatrix}1\\-1\end{bmatrix}=1\cdot\begin{bmatrix}1\\-1\end{bmatrix}$。**倍数是 1，这条线上每个点都停在原地**——当然也还在原来那条直线上。',
                  stage=2)
        note = back(k1, ticks)
        self.caption('特殊向量 (1,−1)：倍数是 1，这条线上每个点都停在原地')
        d2 = np.array([1.0, -1.0, 0]) / np.sqrt(2)
        l2 = DashedLine(-10 * d2, 10 * d2, color=PURPLE, stroke_width=2, dash_length=0.15)
        g2, e2 = ghost([1, -1], PURPLE), vec([1, -1], PURPLE)
        pdots = [always_redraw(lambda s=s: Dot(tip([s, -s]), radius=0.075, color=PURPLE)) for s in (-2, -1, 2)]
        self.play(FadeOut(note), Create(l2), FadeIn(g2), FadeIn(e2), *[FadeIn(p) for p in pdots])
        morph(A)
        k2 = tag('×1', np.array([1, -1, 0]), RIGHT, PURPLE, 34, buff=0.2)
        self.play(FadeIn(k1), FadeIn(k2))
        self.wait(1.4)

        # ---- 5 · naming: A v = λ v (v ≠ 0); λ may be positive, negative or 0
        self.step(r'青色和紫色的共同点：变换后仍在自己原来那条直线上，只是被乘了一个数（$3$ 和 $1$）。给它们起名字：**一个非零向量 $\mathbf v$ 如果满足 $\mathbf A\mathbf v=\lambda\mathbf v$，它就叫 eigenvector（特征向量），那个数 $\lambda$ 叫 eigenvalue（特征值）。**左边 $\mathbf A\mathbf v$ 是变换后的 $\mathbf v$，右边 $\lambda\mathbf v$ 是原来的 $\mathbf v$ 乘以 $\lambda$。必须要求 $\mathbf v\neq\mathbf 0$：零向量对任何 $\lambda$ 都满足 $\mathbf A\mathbf 0=\lambda\mathbf 0$，说明不了什么。$\lambda$ 可以是正数、负数或 $0$（左下小图，淡色是 $\mathbf v$，亮色是 $\lambda\mathbf v$）：$\lambda>0$ 同方向伸缩，$\lambda<0$ 翻到反方向（仍在同一条直线上），$\lambda=0$ 被压成零点。所以这里 $\mathbf A$ 的特征值是 $3$ 和 $1$。（正文 ⑤ 会用特征值的正负来定义 PSD（positive semidefinite，半正定）/ PD（positive definite，正定）。）',
                  '非零向量 v 满足 A·v = λ·v：v 叫特征向量，λ 叫特征值', stage=3)
        self.play(Transform(k1, tag('λ = 3', ORIGIN, RIGHT, TEAL, 32).move_to(k1, aligned_edge=LEFT)),
                  Transform(k2, tag('λ = 1', ORIGIN, RIGHT, PURPLE, 32).move_to(k2, aligned_edge=LEFT)))
        eq = M([r'\mathbf A', r'\mathbf v', '=', r'\lambda', r'\mathbf v'], 56, YELLOW)
        nz = M(r'\mathbf v\neq\mathbf 0', 34, WHITE).next_to(eq, RIGHT, buff=0.5)
        # names above the symbols (with short connectors), roles below the two sides
        tv = T('特征向量', 21, WHITE).next_to(eq, UP, buff=0.36)
        tv.set_x(eq[1].get_x() - 0.22)
        tl = T('特征值', 21, WHITE).next_to(eq, UP, buff=0.36)
        tl.set_x(eq[3].get_x() + 0.22)
        cv = Line(tv.get_bottom() + DOWN * 0.04, eq[1].get_top() + UP * 0.06, color=GREY, stroke_width=2)
        cl = Line(tl.get_bottom() + DOWN * 0.04, eq[3].get_top() + UP * 0.06, color=GREY, stroke_width=2)
        ra = T('变换后的 v', 20, GREY).next_to(eq, DOWN, buff=0.18).align_to(eq[1], RIGHT)
        rl = T('原来的 v 乘以 λ', 20, GREY).next_to(eq, DOWN, buff=0.18).align_to(eq[3], LEFT)
        form = VGroup(eq, nz, tv, tl, cv, cl, ra, rl)

        def cell(lam, label):
            # one tiny case: dashed = v's line, faint halo = v, bright = λv (same convention as the big picture)
            line = DashedLine(LEFT * 0.9, RIGHT * 0.9, color=GREY, stroke_width=1.5, dash_length=0.08)
            gh = Arrow(ORIGIN, RIGHT * 0.45, buff=0, color=YELLOW, stroke_width=14, tip_length=0.26,
                       max_tip_length_to_length_ratio=0.6, max_stroke_width_to_length_ratio=40).set_opacity(0.42)
            live = Dot(ORIGIN, radius=0.08, color=YELLOW) if lam == 0 else \
                Arrow(ORIGIN, RIGHT * 0.45 * lam, buff=0, color=YELLOW, stroke_width=5, tip_length=0.17,
                      max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=40)
            return VGroup(line, gh, live, T(label, 20, WHITE).next_to(line, DOWN, buff=0.22))
        inset = VGroup(cell(1.9, 'λ > 0：同向'), cell(-1, 'λ < 0：反向'), cell(0, 'λ = 0：变成零点')).arrange(RIGHT, buff=0.3)
        VGroup(form, inset).arrange(DOWN, buff=0.45).to_corner(DL, buff=0.4).shift(UP * 0.75)
        fb = BackgroundRectangle(form, color=BG, fill_opacity=0.9, buff=0.18)
        ib = BackgroundRectangle(inset, color=BG, fill_opacity=0.9, buff=0.15)
        self.play(FadeIn(fb), FadeIn(eq), FadeIn(nz))
        self.play(FadeIn(tv, shift=DOWN * 0.1), FadeIn(tl, shift=DOWN * 0.1), Create(cv), Create(cl),
                  FadeIn(ra, shift=UP * 0.1), FadeIn(rl, shift=UP * 0.1))
        self.play(Flash(np.array([3, 3, 0]), color=TEAL), Flash(np.array([1, -1, 0]), color=PURPLE))
        self.play(FadeIn(ib), FadeIn(inset), run_time=0.6)
        self.wait(3.6)

        # ---- 6 · λ = 0: B squashes the plane, î and ĵ land on the same point ⇒ no undo
        self.step(r"再回到变换前，换一个矩阵 $\mathbf B=\begin{bmatrix}1&1\\1&1\end{bmatrix}$。整张网格被压扁成一条斜线。紫色方向：$\mathbf B\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}1-1\\1-1\end{bmatrix}=\begin{bmatrix}0\\0\end{bmatrix}=0\cdot\begin{bmatrix}1\\-1\end{bmatrix}$，特征值 $\lambda=0$：这条紫线上的箭头和紫点都被压到原点（紫色虚线和淡紫色的原向量也跟着缩进原点，只剩原点那一个紫点）。后果看绿、红两个箭头：$\mathbf B$ 的两列都是 $(1,1)$，所以 $\hat\imath$ 和 $\hat\jmath$ 都落到 $(1,1)$。**两个不同的输入变成同一个输出，看到 $(1,1)$ 分不清它原来是谁，所以这个变换撤不回：$\mathbf B$ 没有逆（不可逆）。**青色 $(1,1)$ 仍是特征向量：$\mathbf B\begin{bmatrix}1\\1\end{bmatrix}=\begin{bmatrix}1+1\\1+1\end{bmatrix}=\begin{bmatrix}2\\2\end{bmatrix}$，$\lambda=2$。本章 ② 的“米 / 厘米两列”让 $\mathbf X'\mathbf X$ 不可逆，就是这种情况。",
                  stage=4)
        note = back(k1, k2, fb, form, ib, inset)
        self.caption('λ = 0：紫箭头和紫点被压到原点，î、ĵ 都落到 (1,1) ⇒ 撤不回')
        # î and ĵ back to full strength; ĵ drawn wide underneath, î thin on top, so both stay visible once they coincide
        sty_j.update(w=13, tip=0.5, ratio=0.36)
        sty_i.update(w=5)
        self.play(FadeOut(note), FadeOut(g1), Transform(lab, mlabel('B', [[1, 1], [1, 1]])), ija.animate.set_value(1.0))
        self.bring_to_front(jhat, ihat, il, jl)
        # the purple dashed line and the purple ghost ride the same transform: the whole line shrinks into the origin
        Bm = np.array([[1.0, 1.0], [1.0, 1.0]])
        morph(Bm, 2.4, ApplyMatrix(Bm, l2), g2.animate.apply_matrix(Bm).set_opacity(0))
        self.remove(l2, g2)
        z0 = Dot(ORIGIN, radius=0.12, color=PURPLE).set_z_index(3)
        k0 = tag('(1,−1) → 0：λ = 0', z0, DR, PURPLE, 28, buff=0.12)
        kt = tag('(1,1) → (2,2)：λ = 2', np.array([2, 2, 0]), RIGHT, TEAL, 24, buff=0.2).shift(DOWN * 0.35)
        self.play(FadeIn(z0, scale=0.5), Flash(ORIGIN, color=PURPLE), FadeIn(k0), FadeIn(kt))
        self.wait(0.8)
        # î / ĵ letters stay on the two sides of the shared tip, so the paused frame still shows two inputs
        kij = tag('î 和 ĵ 都变成 (1,1)：撤不回', np.array([1, 1, 0]), LEFT, WHITE, 28, buff=0.3,
                  t2c={'î': GREEN, 'ĵ': RED, '撤不回': YELLOW}).shift(UP * 0.75)
        self.play(FadeIn(kij), Flash(np.array([1, 1, 0]), color=WHITE))
        self.wait(2.2)

        self.takeaway(r"一句话：**特征向量是变换后仍在原来那条直线上的非零向量 $\mathbf v$，满足 $\mathbf A\mathbf v=\lambda\mathbf v$；特征值 $\lambda$ 是它被乘的倍数，可以是正数、负数或 $0$。**只要有一个特征值是 $0$，就有方向被压成零点，不同的输入会落到同一个输出，矩阵撤不回（不可逆）——$\mathbf X'\mathbf X$ 不可逆就是这种情况。",
                      ['特征向量：非零向量 v，变换后仍在原来那条直线上', '特征值 λ：它被乘的倍数　A·v = λ·v（λ 可正、可负、可为 0）',
                       '有 λ = 0 ⇒ 某个方向被压成零点 ⇒ 撤不回（不可逆）'])
