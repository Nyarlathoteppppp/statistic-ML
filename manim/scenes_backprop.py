r"""c34 · backpropagation on the T10 network (x₀=1 bias, x₁=1; ReLU hidden u₁, u₂ + bias u₀=1; identity output; y=0).

Blue dots carry values forward, red dots carry sensitivities back. The forward cache (yellow r→ReLU→u, s→z) stays on
screen; the red ε of each hidden unit sits on the other side of its node. Red pills on edges are gradients, never new
weights (the grey weight labels keep their old values until every gradient is known). A final step nudges v₀₂ by
0.01 and checks ΔL against the gradient.
"""
import numpy as np
from manim import (
    Arrow, BackgroundRectangle, Circle, Circumscribe, DL, DOWN, Dot, FadeIn, FadeOut, FadeTransform, Indicate, LEFT, Line,
    ReplacementTransform, RIGHT, RoundedRectangle, Transform, TransformFromCopy, UP, VGroup,
)
from common import BG, BLUE, DIM, GREEN, GREY, INK, RED, TEAL, WHITE, YELLOW, M, MT, P, StepScene, T, pill, px


# ---------------------------------------------------------------- layout (640×360 px, see common.P)
NN = {'x0': (50, 118), 'x1': (50, 262), 'u0': (250, 62), 'u1': (250, 178), 'u2': (250, 288), 'z': (470, 178)}
NNAME = {'x0': 'x₀', 'x1': 'x₁', 'u0': 'u₀', 'u1': 'u₁', 'u2': 'u₂', 'z': 'z'}
NR = 21                                         # node radius
VE = [('x0', 'u1', 'v₀₁', '0.5'), ('x1', 'u1', 'v₁₁', '1'), ('x0', 'u2', 'v₀₂', '−0.5'), ('x1', 'u2', 'v₁₂', '1')]
WE = [('u0', 'z', 'w₀', '0'), ('u1', 'z', 'w₁', '1'), ('u2', 'z', 'w₂', '−1')]
V_LAB, V_PILL = 0.3, 0.7                        # weight label / gradient pill, as a fraction of the way from x_i
W_LAB, W_PILL = 0.35, 0.65                      # same on the output edges, from u_j
LOSS = (470, 262)                               # loss box centre
OFF = 15                                        # distance of a riding tag from its dot


def C(k):
    return P(*NN[k])


def along(a, b, t):
    return C(a) + (C(b) - C(a)) * t


def rim(k, toward):
    """Point on node k's circle facing node `toward`."""
    d = C(toward) - C(k)
    return C(k) + d / np.linalg.norm(d) * px(NR)


def side(a, b, up=True, n=OFF):
    """Offset of length n px perpendicular to edge a→b, on its upper (or lower) side."""
    d = C(b) - C(a)
    v = np.array([-d[1], d[0], 0.0]) / np.linalg.norm(d)
    if (v[1] < 0) == up:
        v = -v
    return v * px(n)


def label(s, size=17, color=GREY, opacity=1.0):
    """Text on a background patch, so it can sit on an edge without the line running through it."""
    t = T(s, size, color)
    return VGroup(BackgroundRectangle(t, color=BG, fill_opacity=opacity, buff=0.05), t)


def relu_gate():
    t = T('ReLU', 13, TEAL)
    box = RoundedRectangle(corner_radius=0.05, width=t.width + 0.14, height=t.height + 0.12, stroke_color=TEAL,
                           stroke_width=1.5, fill_color=BG, fill_opacity=1)
    return VGroup(T('→', 14, TEAL), VGroup(box, t.move_to(box)), T('→', 14, TEAL)).arrange(RIGHT, buff=0.04)


def hcache(j, r, u, color=YELLOW):
    """Forward cache of hidden unit j: r_j → ReLU → u_j  (parts: [0] r, [1] gate, [2] u)."""
    return VGroup(T(f'r{j}={r}', 18, color), relu_gate(), T(f'u{j}={u}', 18, color)).arrange(RIGHT, buff=0.06)


def zcache(s, color=YELLOW):
    return VGroup(T(f's={s}', 18, color), T('→', 14, GREY), T(f'z={s}', 18, color)).arrange(RIGHT, buff=0.06)


def card(*rows):
    """Rule card, top right: rows stacked left-aligned on a framed patch."""
    g = VGroup(*rows).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
    box = RoundedRectangle(corner_radius=0.1, width=g.width + 0.3, height=g.height + 0.24, stroke_color=GREY,
                           stroke_width=1, fill_color=BG, fill_opacity=0.92).move_to(g)
    return VGroup(box, *rows).next_to(P(632, 46), DL, buff=0)


def pill_dim(g, on):
    """Dim / restore a gradient pill while keeping it opaque (the edge must not show through it)."""
    return [g[0].animate.set_fill('#5a2c29' if on else RED, opacity=1), g[1].animate.set_color('#b98a84' if on else INK)]


def pulse(g):
    """Pulse a gradient pill: the box grows, the number flashes white (a plain Indicate would whiten the box)."""
    return [Indicate(g[0], color=RED, scale_factor=1.15), Indicate(g[1], color=WHITE, scale_factor=1.15)]


def colored(parts, size, colors):
    m = M(parts, size)
    for i, c in colors.items():
        m[i].set_color(c)
    return m


class Backprop(StepScene):
    ID = 'backprop'
    TITLE = '反向传播：数值先往前流，误差再往回流'
    FLOW = ['前向算值', '损失', '输出误差 δ', '输出层梯度', '隐藏误差 ε', '输入层梯度', '验证']

    def travel(self, specs, rt=0.9, extra=()):
        """Move dots (and riding tags) at once. spec = (p0, p1, edge key or None, tag text or None, offset, colour)."""
        dots, tags, anims = VGroup(), VGroup(), list(extra)
        for p0, p1, ek, text, off, color in specs:
            d = Dot(p0, radius=0.09, color=color).set_z_index(6)
            dots.add(d)
            anims.append(d.animate.move_to(p1))
            if text:
                tg = label(text, 17, color, 0.9).move_to(p0 + off).set_z_index(6)
                tags.add(tg)
                anims.append(tg.animate.move_to(p1 + off))
            if ek:
                anims.append(self.edge[ek].animate.set_color(color))
        self.play(FadeIn(dots), *([FadeIn(tags)] if len(tags) else []), run_time=0.25)
        self.play(*anims, run_time=rt)
        return dots, tags

    def forward(self, specs, into, rt=1.0):
        """Forward flow into node `into`. Blue dots leave their nodes; once past the weight label each picks up its
        'a×b' tag (the label flashes) and carries it on to t_end; then the dots sink into the node and the tags fade,
        so the sum line can appear in a clean frame. spec = (a, b, t_pick, t_end, tag, upper side?, offset px)."""
        offs = [side(a, b, up, n) for a, b, _, _, _, up, n in specs]
        dots = VGroup(*[Dot(rim(a, b), radius=0.09, color=BLUE).set_z_index(6) for a, b, *_ in specs])
        tags = VGroup(*[label(tag, 17, BLUE, 0.9).move_to(along(a, b, tp) + o).set_z_index(6)
                        for (a, b, tp, _, tag, _, _), o in zip(specs, offs)])
        self.play(FadeIn(dots), run_time=0.2)
        self.play(*[d.animate.move_to(along(a, b, tp)) for d, (a, b, tp, *_) in zip(dots, specs)],
                  *[self.edge[a + b].animate.set_color(BLUE) for a, b, *_ in specs], run_time=0.5 * rt)
        self.play(FadeIn(tags, scale=0.8), *[Indicate(self.wl[a + b][1], color=BLUE) for a, b, *_ in specs],
                  run_time=0.4)
        self.play(*[d.animate.move_to(along(a, b, te)) for d, (a, b, _, te, *_) in zip(dots, specs)],
                  *[t.animate.move_to(along(a, b, te) + o) for t, (a, b, _, te, *_), o in zip(tags, specs, offs)],
                  run_time=0.6 * rt)
        self.play(FadeOut(tags), *[d.animate.move_to(C(into)).set_opacity(0) for d in dots], run_time=0.35)
        self.remove(dots)

    def construct(self):
        self.question(r'网络里每个权重都要知道：**改它一点点，损失会变多少**，这个数叫 gradient（梯度）。逐个权重单独求导，会把同样的中间量重复算很多遍。backpropagation（反向传播）的想法：数值先往前流一次并记下来，误差再往回流一次，所有梯度就都有了。',
                      ['每个权重都要知道：改它一点点，损失变多少？', '逐个求导太慢——能不能一次全算完？'], hold=2.4)

        # ------------------------------------------------ skeleton: nodes, edges, weight names, input values
        self.edge, wl = {}, {}
        net = VGroup()
        for a, b, name, w in VE + WE:
            self.edge[a + b] = e = Line(C(a), C(b), color=DIM, stroke_width=4)
            net.add(e)
        for a, b, name, w in VE:
            wl[a + b] = label(f'{name}={w}', 18).move_to(along(a, b, V_LAB))
        for a, b, name, w in WE:
            wl[a + b] = label(f'{name}={w}', 18).move_to(along(a, b, W_LAB))
        net.add(*wl.values())
        self.wl = wl
        node = {}
        for k in NN:
            node[k] = Circle(radius=px(NR), fill_color='#20232b', fill_opacity=1, stroke_color=WHITE,
                             stroke_width=3).move_to(C(k))
            net.add(node[k], T(NNAME[k], 26).move_to(C(k)))
        vals = VGroup(T('1（偏置）', 17, YELLOW).next_to(node['x0'], UP, buff=px(4)),
                      T('1', 17, YELLOW).next_to(node['x1'], DOWN, buff=px(4)),
                      T('1（偏置）', 17, YELLOW).next_to(node['u0'], LEFT, buff=px(6)))
        net.add(vals)
        self.play(FadeIn(net), run_time=0.8)
        edge = self.edge

        fc = {'u1': hcache('₁', '1.5', '1.5').move_to(P(268, 132)),
              'u2': hcache('₂', '0.5', '0.5').move_to(P(268, 326))}

        def show_sum(text, pos, hold=1.2):
            """The weighted sum on its own line (FadeIn, held so it can be read), then it clears its place."""
            m = T(text, 19, BLUE).move_to(P(*pos))
            self.play(FadeIn(m, shift=UP * 0.08), run_time=0.4)
            self.wait(hold)
            return m

        # ------------------------------------------------ 1 · forward: weighted sums and ReLU
        self.step(r'最左边是两个输入：$x_0=1$ 是 bias（偏置），$x_1=1$；每条边旁的灰字是它的 weight（权重）。$v$ 的第一个下标是起点输入、第二个是终点隐藏单元：$v_{02}$ 是 $x_0\to u_2$ 那条边。蓝点从输入出发，经过边上的权重后，带着“输入 × 权重”流向隐藏单元。流进 $u_1$ 的两份是 $x_0v_{01}=1\times0.5$ 和 $x_1v_{11}=1\times1$，相加得到 weighted sum（加权和）：$r_1=x_0v_{01}+x_1v_{11}=1\times0.5+1\times1=1.5$。再过 ReLU 门 $g(r)=\max(0,r)$，正数原样通过：$u_1=g(1.5)=1.5$。$u_2$ 同理：$r_2=x_0v_{02}+x_1v_{12}=1\times(-0.5)+1\times1=0.5$，$u_2=g(0.5)=0.5$。**黄色标签是前向时记下来的中间值，反向时还要用。**',
                  '前向：输入×权重相加得 r，过 ReLU 得 u，并记下来', stage=0)
        self.forward([('x0', 'u1', 0.5, 0.8, '1×0.5', True, 28), ('x1', 'u1', 0.45, 0.8, '1×1', False, 28)], 'u1')
        r1sum = show_sum('r₁ = 1×0.5 + 1×1 = 1.5', (268, 132))
        self.play(FadeOut(r1sum), run_time=0.3)
        self.play(FadeIn(fc['u1'][0]), FadeIn(fc['u1'][1]), run_time=0.4)
        self.play(TransformFromCopy(fc['u1'][0], fc['u1'][2]), Indicate(fc['u1'][1][1][1], color=WHITE), run_time=0.7)
        self.forward([('x0', 'u2', 0.72, 0.85, '1×(−0.5)', True, 28), ('x1', 'u2', 0.45, 0.8, '1×1', False, 28)], 'u2')
        r2sum = show_sum('r₂ = 1×(−0.5) + 1×1 = 0.5', (268, 326))
        self.play(FadeOut(r2sum), run_time=0.3)
        self.play(FadeIn(fc['u2'][0]), FadeIn(fc['u2'][1]), run_time=0.4)
        self.play(TransformFromCopy(fc['u2'][0], fc['u2'][2]), Indicate(fc['u2'][1][1][1], color=WHITE), run_time=0.7)
        self.wait(0.6)

        # ------------------------------------------------ 2 · forward: output and the loss box
        self.step(r'三个隐藏值（包括常数 $u_0=1$）流向输出，蓝点经过权重后带着“权重 × 隐藏值”：$s=w_0u_0+w_1u_1+w_2u_2=0\times1+1\times1.5+(-1)\times0.5=1$。输出用 identity（恒等函数），$z=s=1$。然后 $z=1$ 和真实值 $y=0$ 一起进入下面的损失盒，算出 loss（损失）：$L=\frac12(z-y)^2=\frac12(1-0)^2=\frac12\times1=0.5$。',
                  '输出 z 是加权和；z 和 y 进入损失盒，得到 L = 0.5', stage=1)
        self.forward([('u0', 'z', 0.5, 0.72, '0×1', True, 28), ('u1', 'z', 0.5, 0.62, '1×1.5', True, 24),
                      ('u2', 'z', 0.55, 0.75, '(−1)×0.5', False, 28)], 'z', rt=0.9)
        zsum = show_sum('s = 0×1 + 1×1.5 + (−1)×0.5 = 1', (520, 128))
        zc = zcache('1').next_to(P(497, 178), RIGHT, buff=0)
        self.play(FadeOut(zsum), FadeIn(zc), run_time=0.45)

        box = RoundedRectangle(corner_radius=0.08, width=px(150), height=px(54), stroke_color=WHITE, stroke_width=2,
                               fill_color='#20232b', fill_opacity=1).move_to(P(*LOSS))
        line1 = M(r'L=\tfrac12(z-y)^2', 26).move_to(P(LOSS[0], LOSS[1] - 12))
        line2 = M(r'=\tfrac12(1-0)^2=0.5', 26).move_to(P(LOSS[0], LOSS[1] + 13))
        zb_top, zb_bot = P(470, 199), P(470, 235)
        zarrow = Arrow(zb_top, zb_bot, buff=0, color=DIM, stroke_width=3, max_tip_length_to_length_ratio=0.3)
        ylab = T('y = 0', 18, YELLOW).move_to(P(598, 262))
        yarrow = Arrow(P(578, 262), P(546, 262), buff=0, color=DIM, stroke_width=3, max_tip_length_to_length_ratio=0.3)
        self.play(FadeIn(box), FadeIn(line1), FadeIn(zarrow), FadeIn(yarrow), FadeIn(ylab), run_time=0.5)
        dots, tags = self.travel([
            (zb_top, P(470, 229), None, 'z=1', RIGHT * px(24) + UP * px(4), BLUE),
            (P(578, 262), P(546, 262), None, None, 0, YELLOW)], rt=0.6,
            extra=[zarrow.animate.set_color(BLUE), yarrow.animate.set_color(YELLOW)])
        # the values sink into the box, then the evaluated line fades in (no glyph morph)
        self.play(FadeOut(tags), dots[0].animate.move_to(zb_bot).set_opacity(0), dots[1].animate.set_opacity(0),
                  run_time=0.3)
        self.remove(dots)
        self.play(FadeIn(line2, shift=UP * 0.08), run_time=0.4)
        self.play(Indicate(line2, color=YELLOW), run_time=0.6)
        self.wait(0.8)

        # ------------------------------------------------ 3 · δ leaves the loss box
        self.step(r'反向从损失盒开始。先问：输出的加权和 $s$ 变一点点，损失 $L$ 变多少？这个 sensitivity（敏感度）记作 $\delta=\dfrac{\partial L}{\partial s}$。平方损失 $\frac12(z-y)^2$ 对 $z$ 求导：平方带下来一个 2，和 $\frac12$ 抵消，剩 $z-y$（这正是损失前放 $\frac12$ 的原因）；恒等输出 $z=s$ 的导数是 1，所以 $\delta=(z-y)\times1=1-0=1$。课件把 $\delta$（和后面的 $\varepsilon$）叫 error term（误差项）：本例 $\delta=z-y$ 恰好是预测减真值，所以得名；它的本义是敏感度 $\partial L/\partial s$。**$\delta$ 只算这一次，后面所有梯度都会复用它。**',
                  'δ 从损失盒出来：s 动一点点，L 跟着动多少', stage=2)
        self.play(*[e.animate.set_color(DIM) for e in edge.values()], zarrow.animate.set_color(DIM),
                  yarrow.animate.set_color(DIM), box.animate.set_stroke(RED, width=3), run_time=0.4)
        d = Dot(zb_bot, radius=0.09, color=RED).set_z_index(6)
        self.play(FadeIn(d), run_time=0.2)
        self.play(d.animate.move_to(zb_top), zarrow.animate.set_color(RED), run_time=0.6)
        dlab = M(r'\delta=\tfrac{\partial L}{\partial s}=z-y=1', 26, RED).next_to(P(484, 218), RIGHT, buff=0)
        self.play(FadeIn(dlab, shift=UP * 0.1), FadeOut(d), node['z'].animate.set_stroke(RED, width=5), run_time=0.5)
        self.play(Indicate(dlab, color=RED), run_time=0.6)
        self.wait(0.8)

        # ------------------------------------------------ 4 · output-layer gradients: δ meets u_j on each edge
        self.step(r'红点带着 $\delta$ 从 $z$ 往回走，黄点带着前向记下的 $u_j$ 往前走，两者在每条输出边上相遇。为什么相乘？$w_j$ 变一点点，$s$ 就变 $u_j$ 倍；$s$ 变一点点，$L$ 再变 $\delta$ 倍。chain rule（链式法则）把两步乘起来：$\dfrac{\partial L}{\partial w_j}=\delta\,u_j$。三条边：$1\times1=1$、$1\times1.5=1.5$、$1\times0.5=0.5$。**红色小框是梯度，灰色的权重这时一个都没改。**',
                  '输出层梯度 = 往回的 δ × 往前的 u<sub>j</sub>（红框）', stage=3)
        hid = ('u0', 'u1', 'u2')
        spot = {a: along(a, 'z', W_PILL) for a in hid}
        specs = [(rim('z', a), spot[a], a + 'z', None, 0, RED) for a in hid]
        specs += [(rim(a, 'z'), spot[a], None, None, 0, YELLOW) for a in hid]
        dots, _ = self.travel(specs, rt=0.9, extra=[Indicate(vals[2], color=YELLOW), Indicate(fc['u1'][2], color=YELLOW),
                                                    Indicate(fc['u2'][2], color=YELLOW)])
        prod = {'u0': '1×1', 'u1': '1×1.5', 'u2': '1×0.5'}
        res = {'u0': '1', 'u1': '1.5', 'u2': '0.5'}
        gw = {a: pill(prod[a], RED, INK, 17).move_to(spot[a]).set_z_index(4) for a in hid}
        self.play(FadeOut(dots), *[FadeIn(g) for g in gw.values()], run_time=0.4)
        self.play(*[Transform(gw[a], pill(res[a], RED, INK, 17).move_to(spot[a]).set_z_index(4)) for a in hid], run_time=0.4)
        legend = VGroup(RoundedRectangle(corner_radius=0.05, width=px(16), height=px(11), fill_color=RED, fill_opacity=1,
                                         stroke_width=0),
                        T('红色小框 = 梯度（不是新权重）', 16, WHITE)).arrange(RIGHT, buff=0.1).next_to(P(632, 314), LEFT, buff=0)
        rule = card(colored([r'\frac{\partial L}{\partial w_j}=', r'\delta', r'u_j'], 30, {1: RED, 2: YELLOW}),
                    MT('δ：输出端往回流的误差', 16, RED),
                    MT('u<sub>j</sub>：前向记下的、边起点的值', 16, YELLOW))
        self.play(FadeIn(legend), FadeIn(rule, shift=DOWN * 0.1), run_time=0.5)
        self.wait(1.0)

        # ------------------------------------------------ 5 · hidden errors ε_j: chain-rule multiplication along each branch
        self.step(r"红点带着 $\delta=1$ 从 $z$ 沿 $w_1$ 这条边往回走：经过权重，乘 $w_1=1$，得 $1$；进入 $u_1$，再乘 ReLU 在前向记下的 $r_1=1.5$ 处的 slope（斜率）$g'(1.5)=1$，得 $\varepsilon_1=1$。第二条边：$\delta=1$ 乘 $w_2=-1$ 得 $-1$，再乘 $g'(0.5)=1$，得 $\varepsilon_2=-1$。为什么这样乘？$\varepsilon_j=\dfrac{\partial L}{\partial r_j}$ 问的是“$r_j$ 动一点点，$L$ 动多少”：$r_j$ 动一点点，$u_j$ 动 $g'(r_j)$ 倍；$u_j$ 动一点点，$s$ 动 $w_j$ 倍；$s$ 动一点点，$L$ 动 $\delta$ 倍。**沿边乘权重、再乘激活函数的斜率，这就是链式法则：$\varepsilon_j=\delta\,w_j\,g'(r_j)$。** 代入：$\varepsilon_1=1\times1\times1=1$，$\varepsilon_2=1\times(-1)\times1=-1$（ReLU 在正数处斜率为 1）。偏置 $u_0$ 是常数 1，前面没有边，误差不用传进去；只有它的权重 $w_0$ 需要梯度（上一步已算好）。",
                  '往回传的是敏感度：沿边乘权重，再乘激活函数的斜率', stage=4)
        e_rows = [colored([r'\varepsilon_j=', r'\delta', r'\cdot', r'w_j', r'\cdot', r"g'(r_j)"], 30,
                          {0: RED, 1: RED, 3: WHITE, 5: TEAL}),
                  colored([r'\varepsilon_1=', r'1', r'\times', r'1', r'\times', r'1', r'=1'], 24,
                          {0: RED, 1: RED, 3: WHITE, 5: TEAL, 6: RED}),
                  colored([r'\varepsilon_2=', r'1', r'\times', r'(-1)', r'\times', r'1', r'=-1'], 24,
                          {0: RED, 1: RED, 3: WHITE, 5: TEAL, 6: RED})]
        rule_e = card(*e_rows)
        self.play(ReplacementTransform(rule, VGroup(rule_e[0], rule_e[1])), fc['u1'].animate.set_opacity(0.55),
                  fc['u2'].animate.set_opacity(0.55), zc.animate.set_opacity(0.55),
                  *[a for g in gw.values() for a in pill_dim(g, True)], run_time=0.5)
        rule = rule_e
        eps = {}

        def send_back(h, wname, wval, after_w, gtxt, etxt, up, n, e_pos, rt):
            """Red dot z → u_h. Once past the gradient pill it shows its 'δ=1' tag (so the tag never crosses a pill);
            past the weight label it picks up ×w; entering u_h it picks up ×g′(r). The tag waits at 0.22 of the edge,
            clear of the node circle, while the dot goes on into the node."""
            off = side(h, 'z', up, n)
            pa, p1 = along(h, 'z', 0.5), along(h, 'z', 0.22)
            dot = Dot(rim('z', h), radius=0.09, color=RED).set_z_index(6)
            tg = label('δ=1', 19, RED, 0.9).move_to(pa + off).set_z_index(6)
            self.play(FadeIn(dot), run_time=0.2 * rt)
            self.play(dot.animate.move_to(pa), run_time=0.5 * rt)
            self.play(FadeIn(tg, scale=0.8), Indicate(dlab, color=RED, scale_factor=1.08), run_time=0.4 * rt)
            self.play(dot.animate.move_to(p1), tg.animate.move_to(p1 + off), run_time=0.7 * rt)
            bw = label(f'×{wname}={wval}', 19, WHITE, 0.9).next_to(tg, RIGHT, buff=0.05).set_z_index(6)
            self.play(Indicate(wl[h + 'z'][1], color=WHITE), TransformFromCopy(wl[h + 'z'], bw), run_time=0.6 * rt)
            self.wait(0.3 * rt)
            tg2 = label(after_w, 19, RED, 0.9).move_to(p1 + off).set_z_index(6)
            self.play(FadeTransform(VGroup(tg, bw), tg2, stretch=False), run_time=0.5 * rt)
            self.play(dot.animate.move_to(rim(h, 'z')), fc[h][0].animate.set_opacity(1), run_time=0.4 * rt)
            bg = label(gtxt, 19, TEAL, 0.9).next_to(tg2, RIGHT, buff=0.05).set_z_index(6)
            self.play(Indicate(fc[h][0], color=TEAL), FadeTransform(fc[h][0].copy(), bg, stretch=False), run_time=0.6 * rt)
            self.wait(0.3 * rt)
            eps[h] = T(etxt, 22, RED).move_to(P(*e_pos))
            self.play(FadeTransform(VGroup(tg2, bg), eps[h], stretch=False), dot.animate.move_to(C(h)).set_opacity(0),
                      node[h].animate.set_stroke(RED, width=5), fc[h][0].animate.set_opacity(0.55), run_time=0.6 * rt)
            self.remove(dot)

        send_back('u1', 'w₁', '1', '1', '×g′(1.5)=1', 'ε₁ = 1', True, 26, (250, 215), 0.85)
        self.play(FadeIn(rule[2], shift=LEFT * 0.1), run_time=0.35)
        send_back('u2', 'w₂', '−1', '−1', '×g′(0.5)=1', 'ε₂ = −1', False, 32, (256, 250), 0.85)
        self.play(FadeIn(rule[3], shift=LEFT * 0.1), run_time=0.35)
        self.wait(0.8)

        # ------------------------------------------------ 6 · input-layer gradients: ε_j meets x_i
        self.step(r'同样的“相遇”再做一次：红点带着 $\varepsilon_j$ 从隐藏单元往回走，黄点带着输入 $x_i$ 往前走，$\dfrac{\partial L}{\partial v_{ij}}=\varepsilon_j\,x_i$。为什么是这两个相乘？$v_{ij}$ 变一点点，$r_j$ 变 $x_i$ 倍（因为 $r_j=\sum_ix_iv_{ij}$）；$r_j$ 变一点点，$L$ 变 $\varepsilon_j$ 倍；相乘得 $\varepsilon_j x_i$。四条边：$\partial L/\partial v_{01}=1\times1=1$，$\partial L/\partial v_{11}=1\times1=1$，$\partial L/\partial v_{02}=(-1)\times1=-1$，$\partial L/\partial v_{12}=(-1)\times1=-1$。$\varepsilon_1$ 被连向 $u_1$ 的两条边复用，$\varepsilon_2$ 也一样，这就是反向传播省力的原因。**全部梯度算完，再统一更新权重**：更新用的是同一组旧权重算出的梯度。',
                  '输入层梯度 = ε<sub>j</sub> × x<sub>i</sub>：同一个 ε 被两条边复用', stage=5)
        vspot = {(a, b): along(a, b, V_PILL) for a, b, _, _ in VE}
        specs = [(rim(b, a), vspot[(a, b)], a + b, None, 0, RED) for a, b in vspot]
        specs += [(rim(a, b), vspot[(a, b)], None, None, 0, YELLOW) for a, b in vspot]
        dots, _ = self.travel(specs, rt=0.9, extra=[Indicate(eps['u1'], color=RED), Indicate(eps['u2'], color=RED),
                                                    Indicate(vals[0], color=YELLOW), Indicate(vals[1], color=YELLOW)])
        vprod = {'u1': ('1×1', '1'), 'u2': ('−1×1', '−1')}
        gv = {k: pill(vprod[k[1]][0], RED, INK, 17).move_to(vspot[k]).set_z_index(4) for k in vspot}
        self.play(FadeOut(dots), *[FadeIn(g) for g in gv.values()], run_time=0.4)
        self.play(*[Transform(gv[k], pill(vprod[k[1]][1], RED, INK, 17).move_to(vspot[k]).set_z_index(4)) for k in vspot],
                  run_time=0.4)
        rule_v = card(colored([r'\frac{\partial L}{\partial v_{ij}}=', r'\varepsilon_j', r'x_i'], 30, {1: RED, 2: YELLOW}),
                      MT('ε<sub>j</sub>：终点（隐藏单元）的误差', 16, RED),
                      MT('x<sub>i</sub>：起点（输入）的值', 16, YELLOW))
        self.play(ReplacementTransform(rule, rule_v), run_time=0.6)
        rule = rule_v
        final = T('全部梯度算完，再统一更新权重', 17, YELLOW).next_to(P(632, 336), LEFT, buff=0)
        self.play(*[a for g in gw.values() for a in pill_dim(g, False)], fc['u1'].animate.set_opacity(1),
                  fc['u2'].animate.set_opacity(1), zc.animate.set_opacity(1), FadeIn(final, shift=UP * 0.1), run_time=0.5)
        self.play(*[a for g in list(gw.values()) + list(gv.values()) for a in pulse(g)],
                  Circumscribe(final, color=YELLOW), run_time=0.9)
        self.wait(0.8)

        # ------------------------------------------------ 7 · check: nudge v02 by 0.01
        self.step(r'回到开头的问题：把 $v_{02}$ 改一点点，损失变多少？画面上 $v_{02}$ 变成绿色的 $-0.49$，绿点把这个改动一路往前传：$r_2$、$u_2$、$z$ 和损失盒里的数都跟着变；红色的 $\delta$、$\varepsilon$ 和梯度小框仍是改动前（$z=1$）算出的值，不跟着变。梯度说 $\partial L/\partial v_{02}=-1$，所以预测 $\Delta L\approx(-1)\times0.01=-0.01$。真的改一下：$v_{02}=-0.5+0.01=-0.49$，$r_2=1\times(-0.49)+1\times1=0.51$，$u_2=0.51$，$s=0\times1+1\times1.5+(-1)\times0.51=0.99$，$z=0.99$，$L=\frac12(0.99-0)^2=\frac12\times0.9801=0.49005$。实际变化 $0.49005-0.5=-0.00995$，**和梯度的预测 $-0.01$ 几乎一样**。差的 $0.00005$ 从哪来？$L=\frac12(0.99)^2=\frac12(1-0.01)^2=\frac12(1-2\times0.01+0.01^2)=\frac12-0.01+\frac12\times0.01^2=0.5-0.01+0.00005$：梯度把 $L$ 的变化当成一条直线来估，只给出前面的 $-0.01$；最后的 $0.00005$ 是二阶小项，正是直线近似漏掉的部分。这里只是单独改 $v_{02}$ 来检验梯度，不是训练时的权重更新。',
                  'v₀₂ 加 0.01，L 少了约 0.01：正是梯度 −1 的预测', stage=6)
        check = card(colored([r'\Delta L=0.49005-0.5=', r'-0.00995'], 24, {0: GREEN, 1: GREEN}),
                     colored([r'\approx', r'\frac{\partial L}{\partial v_{02}}', r'\times0.01=(-1)\times0.01=-0.01'], 24,
                             {1: RED}),
                     T('梯度 × 改动量 ≈ 损失的变化', 16, YELLOW))
        k02 = ('x0', 'u2')
        # cross-fade the numbers (a Transform between different digit strings scrambles the glyphs)
        cur = {'w': wl['x0u2'], 'c': fc['u2'], 'z': zc, 'l': line2}
        nud = {'w': label('v₀₂=−0.49', 18, GREEN).move_to(along('x0', 'u2', V_LAB)),
               'c': hcache('₂', '0.51', '0.51', GREEN).move_to(fc['u2']),
               'z': zcache('0.99', GREEN).next_to(P(497, 178), RIGHT, buff=0),
               'l': M(r'=\tfrac12(0.99)^2=0.49005', 26, GREEN).move_to(line2)}

        def swap(k, rt=0.5, *extra):
            self.play(FadeTransform(cur[k], nud[k], stretch=False), *extra, run_time=rt)

        swap('w', 0.7, FadeOut(rule), FadeOut(final), edge['x0u2'].animate.set_color(GREEN), *pulse(gv[k02]))
        dots, _ = self.travel([(rim('x0', 'u2'), rim('u2', 'x0'), None, None, 0, GREEN)], rt=0.6)
        swap('c', 0.5, FadeOut(dots))
        dots, _ = self.travel([(rim('u2', 'z'), rim('z', 'u2'), 'u2z', None, 0, GREEN)], rt=0.6)
        swap('z', 0.5, FadeOut(dots))
        dots, _ = self.travel([(zb_top, zb_bot, None, None, 0, GREEN)], rt=0.4, extra=[zarrow.animate.set_color(GREEN)])
        swap('l', 0.5, FadeOut(dots))
        self.play(FadeIn(check[0]), FadeIn(check[1]), run_time=0.5)
        self.play(FadeIn(check[2]), *pulse(gv[k02]), run_time=0.7)
        self.play(FadeIn(check[3]), run_time=0.4)
        # no revert here: the nudged (green) values and the check card stay until the takeaway veil covers them
        self.wait(1.8)

        self.takeaway(r'一句话：前向时数值从左往右流，保存每个单元的 $r$、$u$ 以及 $s$、$z$；反向时敏感度 $\delta$、$\varepsilon$ 从右往左流，沿边乘权重、再乘激活斜率，每个只算一次并被复用。**每条边的梯度 = 终点往回流的误差 × 起点往前流的值**：$\partial L/\partial w_j=\delta u_j$，$\partial L/\partial v_{ij}=\varepsilon_jx_i$。全部梯度算完，再统一更新权重。',
                      ['前向保存 r、u、s、z；反向计算并复用各节点的导数',
                       'ε<sub>j</sub> = δ · w<sub>j</sub> · g′(r<sub>j</sub>)：沿边乘权重，再乘激活斜率',
                       '每条边的梯度 = 终点往回的误差 × 起点往前的值',
                       '∂L/∂w<sub>j</sub> = δ · u<sub>j</sub>        ∂L/∂v<sub>ij</sub> = ε<sub>j</sub> · x<sub>i</sub>',
                       '全部梯度算完，再统一更新权重'])
