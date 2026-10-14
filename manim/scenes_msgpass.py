"""c56 · message passing on the 5-room tree (exemplar scene).

Every ψ is drawn as a 2×2 table oriented rows = sender, columns = recipient (transposed on screen when ψ's first
argument is the recipient), so summing out the sender is always "add each column top to bottom". Messages are yellow
pills that name the recipient's values, e.g. "x₄热 4，x₄冷 3", and travel along the edges of the tree.
"""
from manim import (
    Circle, Circumscribe, Create, DOWN, FadeIn, FadeOut, GrowFromEdge, Indicate, LaggedStart, LEFT, Line, PI, Rectangle,
    RIGHT, RoundedRectangle, Square, SurroundingRectangle, Transform, TransformFromCopy, UP, VGroup, smooth,
    squish_rate_func,
)
from common import BLUE, DIM, GREY, INK, MT, P, PURPLE, RED, StepScene, T, TEAL, WHITE, YELLOW, px


# ---------------------------------------------------------------- c56 · message passing on the 5-room tree
NODES = {'x1': (110, 62), 'x2': (110, 182), 'x3': (290, 182), 'x4': (110, 302), 'x5': (290, 302)}
EDGES = [('x1', 'x2', 'ψ₁₂'), ('x2', 'x3', 'ψ₂₃'), ('x2', 'x4', 'ψ₂₄'), ('x4', 'x5', 'ψ₄₅')]
SUB = {'x1': 'x₁', 'x2': 'x₂', 'x3': 'x₃', 'x4': 'x₄', 'x5': 'x₅'}
R_NODE = px(21)
NODE_FILL = '#20232b'
GONE_FILL = DIM                  # grey fill = room already summed out (not brown: brown reads as "hot")
SND, RCV = PURPLE, TEAL          # sender = table rows, recipient = table columns
TAG = {'x1': (58, 62), 'x2': (58, 182), 'x3': (290, 150), 'x4': (110, 334), 'x5': (290, 270)}   # small tags by a room
PARK = {'x5': (200, 325), 'x1': (172, 122), 'x3': (200, 205), 'x2': (176, 262)}             # where a sent message waits
# where a message is packed when not on the sender itself: m₂→₄ starts just below x₂, right of the x₂–x₄ edge (clear
# of the parked m₃→₂), and slides straight down along that edge, so it never heads towards x₃
START = {'x2': (176, 231)}
X0 = 352                         # left edge of the working panel


def tree():
    """The L21 5-node tree. Returns circles, names, edge lines, edge labels (keyed 'x1x2' …) and the VGroup to show."""
    g, nodes, names, lines, labs = VGroup(), {}, {}, {}, {}
    for a, b, lab in EDGES:
        pa, pb = P(*NODES[a]), P(*NODES[b])
        lines[a + b] = Line(pa, pb, color=GREY, stroke_width=3)
        off = LEFT * 0.5 if pa[0] == pb[0] else UP * 0.3
        labs[a + b] = T(lab, 20, GREY).move_to((pa + pb) / 2 + off)
        g.add(lines[a + b], labs[a + b])
    for k, (x, y) in NODES.items():
        nodes[k] = Circle(radius=R_NODE, fill_color=NODE_FILL, fill_opacity=1, stroke_color=RED if k == 'x4' else WHITE,
                          stroke_width=6 if k == 'x4' else 3).move_to(P(x, y))
        names[k] = T(SUB[k], 26).move_to(P(x, y))
        g.add(nodes[k], names[k])
    return nodes, names, lines, labs, g


def ekey(a, b, lines):
    return a + b if a + b in lines else b + a


def msg_pill(rcv, hot, cold, size=18):
    """A message pill 'x₄热 4，x₄冷 3' (values for the recipient). .hot / .cold are the number glyphs, .rest the rest."""
    r = SUB[rcv]
    t = T(f'{r}热 {hot}，{r}冷 {cold}', size, INK)            # glyphs (spaces dropped): x ₄ 热 <hot> ， x ₄ 冷 <cold>
    box = RoundedRectangle(corner_radius=0.12, width=t.width + 0.3, height=t.height + 0.2, fill_color=YELLOW,
                           fill_opacity=1, stroke_width=0)
    t.move_to(box)
    g = VGroup(box, t)
    nh, nc = len(str(hot)), len(str(cold))
    g.hot, g.cold = t[3:3 + nh], t[len(t) - nc:]
    g.rest = VGroup(box, *t[:3], *t[3 + nh:len(t) - nc])
    return g.set_z_index(4)


def sum_text(a, b, size=19):
    """'a+b=s' as one Text; returns (text, operand a, '+', operand b, '=', result) glyph groups."""
    la, lb = len(str(a)), len(str(b))
    t = T(f'{a}+{b}={a + b}', size)
    res = t[la + lb + 2:]
    res.set_color(YELLOW)
    return t, t[:la], t[la], t[la + 1:la + 1 + lb], t[la + 1 + lb], res


def prod_text(rcv, s, a, b, size=17):
    """'x₂热：4×3=12' as one Text; returns (text, head, a, '×', b, '=', result)."""
    la, lb = len(str(a)), len(str(b))
    t = T(f'{SUB[rcv]}{s}：{a}×{b}={a * b}', size)
    t[:4].set_color(RED if s == '热' else BLUE)
    res = t[4 + la + lb + 2:]
    res.set_color(YELLOW)
    return t, t[:4], t[4:4 + la], t[4 + la], t[5 + la:5 + la + lb], t[5 + la + lb], res


class Table:
    """ψ of one edge as a 2×2 table: rows = sender (热, 冷), columns = recipient (热, 冷); vals[r][c]."""

    def __init__(self, snd, rcv, vals, x0=356, y0=110, hw=64, cw=84, rh=36):
        self.vals, self.cw, self.rh, self.y0 = vals, cw, rh, y0
        self.snd, self.rcv = SUB[snd], SUB[rcv]
        self.xr = x0 + hw / 2                                  # row-header column
        self.cx = [x0 + hw + cw / 2, x0 + hw + 1.5 * cw]       # 热 / 冷 columns
        self.ry = [y0 + rh, y0 + 2 * rh]                       # 热 / 冷 rows
        self.y_sum = self.ry[1] + rh / 2 + 16
        self.head = VGroup(*[T(SUB[rcv] + s, 18, RCV).move_to(P(self.cx[c], y0)) for c, s in enumerate('热冷')])
        self.rows = VGroup(*[T(SUB[snd] + s, 18, SND).move_to(P(self.xr, self.ry[r])) for r, s in enumerate('热冷')])
        self.cell = VGroup(*[Rectangle(width=px(cw - 6), height=px(rh - 6), fill_color=NODE_FILL, fill_opacity=1,
                                       stroke_color=DIM, stroke_width=1.5).move_to(P(self.cx[c], self.ry[r]))
                             for r in range(2) for c in range(2)])
        self.num = [[T(str(vals[r][c]), 22).move_to(P(self.cx[c], self.ry[r])) for c in range(2)] for r in range(2)]
        self.g = VGroup(self.cell, self.head, self.rows, *self.num[0], *self.num[1])
        self.box = None

    def as_given(self):
        """Show ψ as given, ψ(recipient, sender): recipient labels on the rows, sender labels on the columns, numbers
        transposed. The given labels are a separate group (self.given) that replaces head/rows in self.g."""
        self.given = VGroup(*[T(self.snd + s, 18, SND).move_to(self.head[i]) for i, s in enumerate('热冷')],
                            *[T(self.rcv + s, 18, RCV).move_to(self.rows[i]) for i, s in enumerate('热冷')])
        self.g.remove(self.head, self.rows)
        self.g.add(self.given)
        for r in range(2):
            for c in range(2):
                self.num[r][c].move_to(P(self.cx[r], self.ry[c]))

    def given_cell(self, r, c):
        """The cell where num[r][c] sits while the table is shown as given (row c, column r)."""
        return self.cell[2 * c + r]

    def transpose_anims(self):
        """Cross-fade the labels (old ones gone in the first 40 %, true ones in during the last 40 %, so the two sets
        never overlap or morph) while the two off-diagonal numbers swap along an arc."""
        self.g.remove(self.given)
        self.g.add(self.head, self.rows)               # already in the scene → FadeIn does not add a second copy
        a = [FadeOut(self.given, rate_func=squish_rate_func(smooth, 0, 0.4))]
        a += [FadeIn(m, rate_func=squish_rate_func(smooth, 0.6, 1)) for m in (*self.head, *self.rows)]
        a += [self.num[r][c].animate(path_arc=PI / 2).move_to(P(self.cx[c], self.ry[r]))
              for r in range(2) for c in range(2) if r != c]
        return a

    def col_box(self, c):
        return Rectangle(width=px(self.cw - 1), height=px(2 * self.rh + 2), stroke_color=YELLOW, stroke_width=3) \
            .move_to(P(self.cx[c], (self.ry[0] + self.ry[1]) / 2))


class MsgPass(StepScene):
    ID = 'msgpass'
    TITLE = '树上的消息传递：从叶子把求和一路"打包"送到 x₄'
    FLOW = ['笨办法：枚举', '叶子：每列相加成消息', '中间点：乘来信、乘 ψ、求和', '根：相乘、归一化']

    # ------------------------------------------------------------ helpers
    def panel_out(self):
        if self.pan:
            self.play(*[FadeOut(m) for m in self.pan], run_time=0.3)
        self.pan = []

    def show(self, *mobs, run_time=0.35):
        self.play(*[FadeIn(m, shift=RIGHT * 0.08) for m in mobs], run_time=run_time)
        self.pan += list(mobs)

    def column(self, tab, c, w=None, pause=0.6):
        """Highlight column c (both cells), optionally multiply each cell by its row weight, add top to bottom."""
        cells = [tab.num[0][c], tab.num[1][c]]
        if c == 0:
            tab.box = tab.col_box(0)
            self.play(Create(tab.box), *[m.animate.set_color(YELLOW) for m in cells], run_time=0.4)
            self.pan.append(tab.box)
        else:
            self.play(Transform(tab.box, tab.col_box(1)), *[tab.num[r][0].animate.set_color(WHITE) for r in range(2)],
                      *[m.animate.set_color(YELLOW) for m in cells], run_time=0.4)
        vals = [tab.vals[0][c], tab.vals[1][c]]
        if w:
            self.play(*[Transform(cells[r], T(f'{vals[r]}×{w[r]}', 19, YELLOW).move_to(cells[r])) for r in range(2)],
                      run_time=0.45)
            vals = [vals[r] * w[r] for r in range(2)]
        s, oa, plus, ob, eq, res = sum_text(*vals)
        s.move_to(P(tab.cx[c], tab.y_sum))
        self.play(TransformFromCopy(cells[0], oa), TransformFromCopy(cells[1], ob), FadeIn(plus), FadeIn(eq), run_time=0.5)
        self.play(FadeIn(res, scale=1.4), run_time=0.25)
        self.add(s)
        self.pan.append(s)
        self.wait(pause)
        return res

    def send(self, snd, rcv, hot, cold, res_h, res_c):
        """The two column sums fly into a pill at the sender (or at START[snd]), which then travels along the edge to
        PARK[snd]; the sender greys out."""
        m = msg_pill(rcv, hot, cold).move_to(P(*START.get(snd, NODES[snd])))
        self.play(FadeIn(m.rest), TransformFromCopy(res_h, m.hot), TransformFromCopy(res_c, m.cold), run_time=0.8)
        self.add(m)
        k = ekey(snd, rcv, self.lines)
        tag = T('已加掉', 13, GREY).move_to(P(*TAG[snd]))
        self.play(m.animate.move_to(P(*PARK[snd])), self.nodes[snd].animate.set_fill(GONE_FILL).set_stroke(GREY),
                  self.names[snd].animate.set_color(GREY), self.lines[k].animate.set_color(GREY),
                  self.labs[k].animate.set_color(GREY), FadeIn(tag), run_time=0.9)
        return m

    def leaf(self, snd, rcv, vals, flipped, sums_pause=0.6, mark=None):
        """A leaf: show ψ as (sender rows, recipient columns), add each column, pack the two sums into a message."""
        self.panel_out()
        k = ekey(snd, rcv, self.lines)
        psi = self.labs[k].text
        self.play(self.lines[k].animate.set_color(YELLOW), self.labs[k].animate.set_color(YELLOW),
                  Indicate(self.nodes[snd], color=YELLOW), run_time=0.5)
        a, b = snd[1], rcv[1]
        title = MT(f'm<sub>{a}→{b}</sub>：把<span foreground="{SND}">发送者 {SUB[snd]}</span>加掉', 20, YELLOW)
        given = f'{psi}({SUB[rcv]},{SUB[snd]}) 行列对调' if flipped else f'和 {psi}({SUB[snd]},{SUB[rcv]}) 顺序相同'
        note = MT(f'{psi} 按（<span foreground="{SND}">发送者 {SUB[snd]}</span>，'
                  f'<span foreground="{RCV}">收件人 {SUB[rcv]}</span>）排：{given}', 14, GREY)
        title.next_to(P(X0, 56), RIGHT, buff=0)
        note.next_to(P(X0, 82), RIGHT, buff=0)
        if note.width > px(274):
            note.scale_to_fit_width(px(274))
        tab = Table(snd, rcv, vals)
        if flipped:
            tab.as_given()
        self.show(title, note)
        self.play(FadeIn(tab.g), run_time=0.5)
        self.pan.append(tab.g)
        if flipped:                       # ψ was given as ψ(recipient, sender): swap rows and columns on screen
            ride = []
            if mark:                      # a number the transpose really moves: ring it, let the ring ride along, keep it
                r, c = mark
                ring = SurroundingRectangle(tab.given_cell(r, c), color=RED, buff=0, stroke_width=3.5).set_z_index(3)
                self.wait(0.3)
                self.play(Create(ring), run_time=0.5)
                self.pan.append(ring)
                self.wait(0.5)
                ride = [ring.animate(path_arc=PI / 2).move_to(tab.cell[2 * r + c])]
            else:
                self.wait(0.4)
            self.play(*tab.transpose_anims(), *ride, Indicate(note, color=WHITE, scale_factor=1.05), run_time=1.1)
            if mark:
                self.wait(0.5)
        rule = MT(f'把<span foreground="{SND}">发送者 {SUB[snd]}</span>加掉 = 每一列上下相加', 16)
        rule.next_to(P(X0, 252), RIGHT, buff=0)
        self.show(rule)
        r0 = self.column(tab, 0, pause=sums_pause)
        r1 = self.column(tab, 1, pause=sums_pause)
        self.play(*[tab.num[r][1].animate.set_color(WHITE) for r in range(2)], run_time=0.2)
        return self.send(snd, rcv, tab.vals[0][0] + tab.vals[1][0], tab.vals[0][1] + tab.vals[1][1], r0, r1)

    def gather(self, rcv, msgs, title):
        """Copy the parked messages into the panel side by side and multiply them element-wise (热 with 热, 冷 with 冷)."""
        self.panel_out()
        t = T(title, 19, YELLOW) if '<' not in title else MT(title, 19, YELLOW)
        t.next_to(P(X0, 54), RIGHT, buff=0)
        (ma, ha, ca), (mb, hb, cb) = msgs
        pa, pb = msg_pill(rcv, ha, ca).move_to(ma), msg_pill(rcv, hb, cb).move_to(mb)
        times = T('×', 20).move_to(P(486, 82))
        self.add(pa, pb)
        self.play(FadeIn(t, shift=RIGHT * 0.08), Indicate(self.nodes[rcv], color=YELLOW),
                  pa.animate.next_to(times, LEFT, buff=0.18), pb.animate.next_to(times, RIGHT, buff=0.18),
                  *[m[0].animate.set_fill(DIM) for m in (ma, mb)], *[m[1].animate.set_color(GREY) for m in (ma, mb)],
                  FadeIn(times), run_time=0.8)
        self.pan += [t, pa, pb, times]
        out = []
        for s, col, a, b, sa, sb, y in [('热', RED, ha, hb, pa.hot, pb.hot, 106), ('冷', BLUE, ca, cb, pa.cold, pb.cold, 126)]:
            rects = VGroup(SurroundingRectangle(sa, color=col, buff=0.04, stroke_width=3),
                           SurroundingRectangle(sb, color=col, buff=0.04, stroke_width=3)).set_z_index(5)
            p, head, oa, x, ob, eq, res = prod_text(rcv, s, a, b)
            p.move_to(P(486, y))
            self.play(Create(rects), FadeIn(head), TransformFromCopy(sa, oa), TransformFromCopy(sb, ob), FadeIn(x), FadeIn(eq),
                      run_time=0.7)
            self.play(FadeIn(res, scale=1.4), run_time=0.25)
            self.add(p)
            self.pan += [rects, p]
            self.wait(0.3)
            out.append(res)
        return out

    # ------------------------------------------------------------ the video
    def construct(self):
        self.pan = []
        self.question(r'5 个房间连成一棵树，每条边上有一张"相容性"分数表 $\psi$（即 c55 的 potential（势函数）：这种冷热组合打几分）。想知道 $x_4$ 热的概率，就要把其余 4 个房间**所有热 / 冷组合**的分数加起来。组合数随房间数指数增长——能不能每条边只算一次？',
                      ['想知道 x₄ 热的概率，要把其余房间的所有组合加起来', '能不能每条边只算一次？'])
        nodes, names, lines, labs, g = tree()
        self.nodes, self.names, self.lines, self.labs = nodes, names, lines, labs

        # ---------------------------------------------------------- 1. brute force
        self.step(r'左边是 5 个房间连成的树，每条边一张打分表 $\psi$（c55 的 potential：这种冷热组合打几分）；红圈的 $x_4$ 是要问的房间。笨办法（brute force，暴力枚举）：先固定 $x_4$ 为热，其余 4 个房间 $x_1,x_2,x_3,x_5$ 各有热 / 冷两种，共 $2^4=16$ 种组合（右边 16 个红方块）。拿出其中一种，比如四个房间全热：四条边各取一个分数相乘，$\psi_{12}(\text{热},\text{热})\times\psi_{23}(\text{热},\text{热})\times\psi_{24}(\text{热},\text{热})\times\psi_{45}(\text{热},\text{热})=3\times1\times4\times3=36$。16 种都这样乘完再相加，才得到 $x_4$ 热的总分；$x_4$ 冷还要再算 16 种（蓝框）。**房间每多一个，要枚举的组合就翻一倍。**',
                  '笨办法：固定 x₄，其余 16 种组合逐个相乘再相加', stage=0)
        ask = T('要问的', 15, RED).move_to(P(58, 302))
        self.play(FadeIn(g), run_time=0.8)
        self.play(FadeIn(ask), Indicate(nodes['x4'], color=RED), run_time=0.6)
        self.show(T('笨办法：固定 x₄，逐个枚举', 20, YELLOW).next_to(P(X0, 56), RIGHT, buff=0))
        lab_h = T('x₄=热：16 种组合', 16, RED).next_to(P(X0, 84), RIGHT, buff=0)
        hot_sq = VGroup(*[Square(side_length=px(18), fill_color=RED, fill_opacity=0.8, stroke_width=0)
                          .move_to(P(372 + (i % 8) * 24, 108 + (i // 8) * 24)) for i in range(16)])
        self.show(lab_h)
        self.play(LaggedStart(*[FadeIn(s, scale=0.5) for s in hot_sq], lag_ratio=0.15), run_time=1.3)
        self.add(hot_sq)
        self.pan.append(hot_sq)
        # one square opened up: one concrete assignment and its 4-factor product
        box = RoundedRectangle(corner_radius=0.1, width=px(262), height=px(78), stroke_color=YELLOW, stroke_width=2,
                               fill_color=NODE_FILL, fill_opacity=1).move_to(P(486, 280))
        self.play(Indicate(hot_sq[0], color=YELLOW, scale_factor=1.6), run_time=0.5)
        self.play(TransformFromCopy(hot_sq[0], box), run_time=0.6)
        self.pan.append(box)
        hot_tags = VGroup(*[T('热', 14, RED).move_to(P(*TAG[k])) for k in ('x1', 'x2', 'x3', 'x5', 'x4')])
        line1 = T('其中 1 种：x₁ x₂ x₃ x₅ 全热（x₄ 也热）', 15).move_to(P(486, 256))
        self.play(FadeIn(line1), LaggedStart(*[FadeIn(t, scale=1.5) for t in hot_tags], lag_ratio=0.2), run_time=0.8)
        self.add(hot_tags)
        self.pan += [line1, hot_tags]
        xs = [416, 452, 488, 524]
        facs = VGroup(*[T(v, 20).move_to(P(x, 282)) for v, x in zip('3143', xs)])
        ops = VGroup(*[T('×', 18).move_to(P(x + 18, 282)) for x in xs[:3]], T('= 36', 20, YELLOW).next_to(P(538, 282), RIGHT, buff=0))
        psis = VGroup(*[T(e[2], 12, GREY).move_to(P(x, 304)) for e, x in zip(EDGES, xs)])
        self.play(LaggedStart(*[FadeIn(VGroup(f, p), shift=DOWN * 0.1) for f, p in zip(facs, psis)], lag_ratio=0.3),
                  LaggedStart(*[Indicate(labs[a + b], color=YELLOW) for a, b, _ in EDGES], lag_ratio=0.3), run_time=1.4)
        self.play(FadeIn(ops), run_time=0.4)
        self.add(facs, psis)
        self.pan += [facs, ops, psis]
        lab_c = T('x₄=冷：还要再算 16 种', 16, BLUE).next_to(P(X0, 166), RIGHT, buff=0)
        cold_sq = VGroup(*[Square(side_length=px(18), fill_opacity=0, stroke_color=BLUE, stroke_width=2)
                           .move_to(P(372 + (i % 8) * 24, 190 + (i // 8) * 24)) for i in range(16)])
        self.show(lab_c)
        self.play(LaggedStart(*[FadeIn(s, scale=0.5) for s in cold_sq], lag_ratio=0.1), run_time=0.9)
        self.add(cold_sq)
        self.pan.append(cold_sq)
        self.wait(1.2)

        # ---------------------------------------------------------- 2–4. the three leaves
        self.step(r'换个做法：**从叶子开始，先把它加掉。** $x_5$ 只连着 $x_4$，只有 $\psi_{45}$ 含它。右边把 $\psi_{45}$ 画成 2×2 的表：行 = sender（发送者）$x_5$ 的热 / 冷，列 = recipient（收件人）$x_4$ 的热 / 冷。$\psi_{45}(x_4,x_5)$ 的第一个变量是收件人 $x_4$，所以先把行列对调（这张表恰好对称，对调后数字不变）。这样排是为了：只要永远按（发送者，收件人）排表，加掉发送者就永远是每一列上下相加，不用每次重新想该加行还是加列。把 $x_5$ 加掉 = 每一列上下相加：$x_4$ 热那一列 $\psi_{45}(\text{热},\text{热})+\psi_{45}(\text{热},\text{冷})=3+1=4$；$x_4$ 冷那一列 $\psi_{45}(\text{冷},\text{热})+\psi_{45}(\text{冷},\text{冷})=1+2=3$。两个结果装进一条 message（消息）$m_{5\to4}$：“$x_4$ 热 4，$x_4$ 冷 3”，沿边送给 $x_4$；$x_5$ 变灰，表示已加掉。右下角的说明：消息里的两个数永远是（收件人热时，收件人冷时）。',
                  '叶子 x₅：表的每一列上下相加，两个结果装进消息送给 x₄', stage=1)
        m54 = self.leaf('x5', 'x4', [[3, 1], [1, 2]], flipped=True, sums_pause=0.7)
        legend = MT(f'消息里的两个数 =（<span foreground="{RCV}">收件人</span>热时，'
                    f'<span foreground="{RCV}">收件人</span>冷时）', 15, GREY).next_to(P(X0, 330), RIGHT, buff=0)
        self.play(FadeIn(legend, shift=UP * 0.1), Indicate(m54, color=YELLOW, scale_factor=1.15), run_time=0.7)
        self.wait(0.8)

        self.step(r'叶子 $x_1$ 同理。$\psi_{12}(x_1,x_2)$ 的第一个变量正好是发送者 $x_1$，按原顺序排：行 = $x_1$，列 = 收件人 $x_2$。每一列上下相加：$x_2$ 热那一列 $\psi_{12}(\text{热},\text{热})+\psi_{12}(\text{冷},\text{热})=3+1=4$；$x_2$ 冷那一列 $\psi_{12}(\text{热},\text{冷})+\psi_{12}(\text{冷},\text{冷})=1+1=2$。消息 $m_{1\to2}$：“$x_2$ 热 4，$x_2$ 冷 2”，送给 $x_2$；$x_1$ 变灰。',
                  '叶子 x₁：同样每列相加，消息（x₂热 4，x₂冷 2）送给 x₂', stage=1)
        m12 = self.leaf('x1', 'x2', [[3, 1], [1, 1]], flipped=False, sums_pause=0.4)
        self.wait(0.6)

        self.step(r'叶子 $x_3$：这张表要小心。$\psi_{23}(x_2,x_3)$ 的第一个变量是收件人 $x_2$，所以行列对调，让行 = 发送者 $x_3$、列 = 收件人 $x_2$。这次对调真的挪动了数字：$\psi_{23}(\text{热},\text{冷})=2$ 落到了“$x_3$ 冷、$x_2$ 热”那一格（红框）。还是那条规则：**只要永远按（发送者，收件人）排表，加掉发送者就永远是每一列上下相加。** $x_2$ 热那一列 $\psi_{23}(\text{热},\text{热})+\psi_{23}(\text{热},\text{冷})=1+2=3$；$x_2$ 冷那一列 $\psi_{23}(\text{冷},\text{热})+\psi_{23}(\text{冷},\text{冷})=1+1=2$。消息 $m_{3\to2}$：“$x_2$ 热 3，$x_2$ 冷 2”。',
                  '叶子 x₃：ψ₂₃ 先行列对调，再每列相加，消息送给 x₂', stage=1)
        m32 = self.leaf('x3', 'x2', [[1, 1], [2, 1]], flipped=True, sums_pause=0.5, mark=(1, 0))
        self.wait(0.6)

        # ---------------------------------------------------------- 5. x2: multiply the letters, weight ψ24, sum out x2
        self.step(r'$x_2$ 收齐了两条来信，把它们复制到右边并排放（黄色 = 刚算出的消息，灰色 = 已经用掉的消息：树上的两条原件变灰）。两条信都按（$x_2$ 热，$x_2$ 冷）排，所以同一位置对着乘（element-wise，逐项相乘）：$x_2$ 热 $4\times3=12$，$x_2$ 冷 $2\times2=4$。为什么是乘：$x_2$ 热时，$x_1$ 两种取值 × $x_3$ 两种取值共 4 种组合，每种的分数是两边分数之积（$x_1$ 那边 $\psi_{12}$ 是 3 或 1，$x_3$ 那边 $\psi_{23}$ 是 1 或 2）；4 项加起来 $3\cdot1+3\cdot2+1\cdot1+1\cdot2=3+6+1+2=12=(3+1)\times(1+2)$——先各自加好再相乘，结果一样（乘法分配律）。意思是“$x_2$ 热时，$x_1,x_3$ 那一片一共贡献 12 分；冷时贡献 4 分”。这两个数成为 $\psi_{24}$ 表每一行的权重（表按行 = 发送者 $x_2$、列 = 收件人 $x_4$ 排，正好是原顺序）。**每个格子先乘上所在行的权重，再每一列上下相加。** $x_4$ 热那一列：$\psi_{24}(\text{热},\text{热})\times12+\psi_{24}(\text{冷},\text{热})\times4=4\times12+1\times4=48+4=52$；$x_4$ 冷那一列：$\psi_{24}(\text{热},\text{冷})\times12+\psi_{24}(\text{冷},\text{冷})\times4=1\times12+2\times4=12+8=20$。消息 $m_{2\to4}$：“$x_4$ 热 52，$x_4$ 冷 20”。',
                  'x₂：两条来信逐项相乘 → 当行权重乘 ψ₂₄ → 每列相加', stage=2)
        prods = self.gather('x2', [(m12, 4, 2), (m32, 3, 2)], 'm<sub>2→4</sub>：来信相乘 → 乘 ψ₂₄ → 把 x₂ 加掉')
        k = 'x2x4'
        note = MT(f'ψ₂₄ 按（<span foreground="{SND}">发送者 x₂</span>，<span foreground="{RCV}">收件人 x₄</span>）排：'
                  f'和 ψ₂₄(x₂,x₄) 顺序相同', 14, GREY).next_to(P(X0, 148), RIGHT, buff=0)
        if note.width > px(274):
            note.scale_to_fit_width(px(274))
        tab = Table('x2', 'x4', [[4, 1], [1, 2]], x0=356, y0=172, hw=60, cw=80, rh=32)
        self.play(lines[k].animate.set_color(YELLOW), labs[k].animate.set_color(YELLOW), FadeIn(note), FadeIn(tab.g), run_time=0.5)
        self.pan += [note, tab.g]
        wts = [T(f'×{w}', 18, YELLOW).move_to(P(602, tab.ry[r])) for r, w in enumerate((12, 4))]
        wh = T('来信乘积', 12, GREY).move_to(P(602, tab.y0))
        rule = T('每格先乘所在行的权重，再每一列上下相加', 15).next_to(P(X0, 296), RIGHT, buff=0)
        self.play(TransformFromCopy(prods[0], wts[0][1:]), TransformFromCopy(prods[1], wts[1][1:]),
                  FadeIn(wts[0][0]), FadeIn(wts[1][0]), FadeIn(wh), FadeIn(rule, shift=RIGHT * 0.08), run_time=0.7)
        self.add(*wts)
        self.pan += wts + [wh, rule]
        r0 = self.column(tab, 0, w=(12, 4), pause=0.85)
        r1 = self.column(tab, 1, w=(12, 4), pause=0.85)
        m24 = self.send('x2', 'x4', 52, 20, r0, r1)
        self.wait(0.3)

        # ---------------------------------------------------------- 6. x4: multiply, then normalise
        self.step(r'$x_4$ 收齐两条来信，同理逐项相乘：$x_4$ 热 $52\times4=208$，$x_4$ 冷 $20\times3=60$。这两个数是未归一化（unnormalised）的分数，先画成两根柱子：208 和 60。归一化（normalise）= 两个数都除以它们的和 $208+60=268$：$P(x_4=\text{热})=\frac{208}{268}\approx0.78$，$P(x_4=\text{冷})=\frac{60}{268}\approx0.22$，柱子的比例不变。**结果和逐个枚举 16 + 16 种组合完全一样**，但只做了十来次小加法和乘法——把求和往里推（“往里推”就是：只和一侧有关的求和先单独做完，再和别的相乘），这就是 variable elimination（变量消元）。',
                  'x₄：来信相乘得 208 和 60，都除以 268 ⇒ P(热) ≈ 0.78', stage=3)
        self.pan.append(legend)
        prods = self.gather('x4', [(m24, 52, 20), (m54, 4, 3)], 'x₄：两条来信逐项相乘，再归一化')
        base, H = 290, 98                # bars short enough that the 0.78 label (and its ring) clear the caption
        axis = Line(P(404, base), P(592, base), color=GREY, stroke_width=2)
        hot = Rectangle(width=px(54), height=px(H), fill_color=RED, fill_opacity=1, stroke_width=0).move_to(P(450, base - H / 2))
        hc = H * 60 / 208
        cold = Rectangle(width=px(54), height=px(hc), fill_color=BLUE, fill_opacity=1, stroke_width=0).move_to(P(545, base - hc / 2))
        lh, lc = T('208', 19).next_to(hot, UP, buff=0.08), T('60', 19).next_to(cold, UP, buff=0.08)
        xh, xc = T('热', 16, RED).move_to(P(450, base + 13)), T('冷', 16, BLUE).move_to(P(545, base + 13))
        cap = T('未归一化的分数', 14, GREY).move_to(P(497, 148))
        self.play(Create(axis), FadeIn(xh), FadeIn(xc), FadeIn(cap), run_time=0.4)
        self.play(GrowFromEdge(hot, DOWN), GrowFromEdge(cold, DOWN), TransformFromCopy(prods[0], lh),
                  TransformFromCopy(prods[1], lc), run_time=0.9)
        self.pan += [axis, hot, cold, lh, lc, xh, xc, cap]
        self.wait(0.8)
        norm = T('两个都除以 208 + 60 = 268', 16).move_to(P(497, 326))
        self.play(FadeIn(norm, shift=UP * 0.1), run_time=0.5)
        self.wait(0.6)
        # old labels fade out first, then the probabilities fade in (no morph blurring over the bar tops)
        ph = T('208/268 ≈ 0.78', 18, RED).next_to(hot, UP, buff=0.08)
        pc = T('60/268 ≈ 0.22', 18, BLUE).next_to(cold, UP, buff=0.08)
        pcap = T('概率 P(x₄)', 14, GREY).move_to(cap)
        self.play(FadeOut(lh), FadeOut(lc), FadeOut(cap), run_time=0.3)
        self.play(FadeIn(ph, shift=DOWN * 0.06), FadeIn(pc, shift=DOWN * 0.06), FadeIn(pcap), run_time=0.45)
        self.pan = [m for m in self.pan if m not in (lh, lc, cap)] + [ph, pc, pcap]
        self.play(Circumscribe(ph, color=YELLOW, buff=0.08), run_time=0.8)
        self.wait(2)

        self.takeaway(r'一句话：**消息 = 把发送者那一侧提前加掉后，剩下的（收件人热时，收件人冷时）两个数。** 发一条消息永远是三步：其他来信相乘 → 乘通往收件人的 $\psi$（表按行 = 发送者、列 = 收件人排）→ 对发送者求和（每一列上下相加）。叶子没有其他来信，直接做后两步。求一个节点的边缘时，每条边朝它传一次消息；到达后来信相乘、归一化，结果和暴力枚举完全一样。想一次得到所有节点的边缘，见 c57 的 belief propagation。',
                      ['消息 = 发送者那一侧加掉后剩下的（收件人热，收件人冷）', '其他来信相乘 → 乘通往收件人的 ψ → 对发送者求和',
                       '求一个节点的边缘时，每条边朝它传一次', '到达后来信相乘、归一化 = 暴力枚举的结果'])
