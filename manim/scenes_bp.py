r"""Belief Propagation on a 5-node tree: two-phase message passing (collect then distribute).

Chapter c57 (L21 p24–p37), port of anim-bp from js/viz/scenes_e.js.
Tree: 5 rooms (x1-x5), 4 edges with compatibility tables psi.
Phase 1 (collect): leaves -> root x4 (4 yellow messages).
Phase 2 (distribute): root x4 -> leaves (4 red messages).
Each message m_{i->j}(x_j) multiplies all incoming messages EXCEPT from recipient j,
multiplies edge potential psi_{ij}, and sums out sender x_i.
After both passes, every node's marginal is the product of ALL incoming messages,
with unnormalized sum = 268 = Z for each node.
"""

from manim import (
    BackgroundRectangle, Circle, DOWN, FadeIn, FadeOut, Indicate, LaggedStart, LEFT,
    Line, MarkupText, MathTex, NORMAL, ORIGIN, Rectangle, ReplacementTransform, RIGHT,
    RoundedRectangle, Scene, Text, Transform, UP, VGroup, config,
)

from common import (
    BG, BLUE, DIM, FONT, GREEN, GREY, GRID, INK, M, MT, ORANGE, P, PURPLE, RED,
    SC, StepScene, T, TEAL, WHITE, YELLOW, mat, pill, px,
)

# Graph layout: identical to L21 5-room tree in scenes_core.py / scenes_e.js
NODES = {
    'x1': (110, 62),
    'x2': (110, 182),
    'x3': (290, 182),
    'x4': (110, 302),
    'x5': (290, 302),
}
EDGES = [('x1', 'x2'), ('x2', 'x3'), ('x2', 'x4'), ('x4', 'x5')]
SUB = {'x1': 'x₁', 'x2': 'x₂', 'x3': 'x₃', 'x4': 'x₄', 'x5': 'x₅'}
R_NODE = px(21)


def make_tree(root='x4'):
    """Create static skeleton for the 5-node tree."""
    g = VGroup()
    for a, b in EDGES:
        pa, pb = P(*NODES[a]), P(*NODES[b])
        g.add(Line(pa, pb, color=GREY, stroke_width=3))
    node_circles = {}
    node_labels = {}
    for k, (x, y) in NODES.items():
        c = Circle(
            radius=R_NODE,
            fill_color='#20232b',
            fill_opacity=1,
            stroke_color=YELLOW if k == root else WHITE,
            stroke_width=4 if k == root else 2.5,
        ).move_to(P(x, y))
        lab = T(SUB[k], 24).move_to(P(x, y))
        node_circles[k] = c
        node_labels[k] = lab
        g.add(c, lab)
    root_badge = pill('root', fill=YELLOW, color=INK, size=15).next_to(
        node_circles[root], LEFT, buff=0.15
    )
    g.add(root_badge)
    return node_circles, node_labels, root_badge, g


def get_park_pos(a, b, side):
    """Park position along edge a-b. side=-1 for collect (left/above), +1 for distribute (right/below)."""
    p1 = NODES[a]
    p2 = NODES[b]
    vertical = (p1[0] == p2[0])
    mid_x = (p1[0] + p2[0]) / 2
    mid_y = (p1[1] + p2[1]) / 2
    if vertical:
        park_x = mid_x + side * 46
        park_y = mid_y
    else:
        park_x = mid_x
        park_y = mid_y + side * 24
    return P(park_x, park_y)


def send_parallel(scene, specs, run_time=0.8):
    """Animate sending messages simultaneously. specs: list of (a, b, text, fill, color, side)"""
    pills = []
    targets = []
    for a, b, text, fill, color, side in specs:
        m = pill(text, fill=fill, color=color, size=19).move_to(P(*NODES[a]))
        pills.append(m)
        targets.append(get_park_pos(a, b, side))
    scene.play(*[FadeIn(m, scale=0.7) for m in pills], run_time=0.25)
    scene.play(*[m.animate.move_to(tgt) for m, tgt in zip(pills, targets)], run_time=run_time)
    return pills


def make_formula_card():
    """Build role-annotated message formula card at top-right."""
    # LaTeX formula split into terms: m_{i->j}(x_j) = \sum_{x_i} \psi(x_i,x_j) \prod_{k \ne j} m_{k->i}(x_i)
    eq = M(
        [r'm_{i\to j}(x_j) = ', r'\sum_{x_i}\;', r'\psi_{ij}(x_i,x_j)\;', r'\prod_{k\ne j} m_{k\to i}(x_i)'],
        size=23,
        color=YELLOW,
    ).move_to(P(488, 70))

    # Three role annotations underneath using T()
    r1 = T('把 i 加掉', 13, GREY).next_to(eq[1], DOWN, buff=0.14).align_to(eq[1], LEFT)
    r2 = T('边上的表', 13, GREY).next_to(eq[2], DOWN, buff=0.14)
    r3 = T('i 收到的其他来信', 13, GREY).next_to(eq[3], DOWN, buff=0.14).align_to(eq[3], RIGHT)

    bg = BackgroundRectangle(VGroup(eq, r1, r2, r3), color=BG, fill_opacity=0.92, buff=0.14)
    box = RoundedRectangle(
        corner_radius=0.08,
        width=bg.width + 0.1,
        height=bg.height + 0.08,
        stroke_color=DIM,
        stroke_width=1.5,
        fill_opacity=0,
    ).move_to(bg)
    return VGroup(bg, box, eq, r1, r2, r3)


def update_panel(scene, old_lines, lines, x=355, y0=126, dy=28, size=19):
    """Update right-side calculation panel with lines (first line yellow)."""
    anims = [FadeOut(m) for m in old_lines] if old_lines else []
    new_mobs = []
    for i, s in enumerate(lines):
        col = YELLOW if i == 0 else WHITE
        if '<sub>' in s or '<sup>' in s:
            mob = MT(s, size=size, color=col)
        else:
            mob = T(s, size=size, color=col)
        mob.next_to(P(x, y0 + i * dy), RIGHT, buff=0)
        if mob.width > px(265):
            mob.scale_to_fit_width(px(265))
        new_mobs.append(mob)
    if anims:
        scene.play(*anims, run_time=0.25)
    scene.play(LaggedStart(*[FadeIn(m, shift=RIGHT * 0.08) for m in new_mobs], lag_ratio=0.15), run_time=0.6)
    return new_mobs


class BeliefProp(StepScene):
    ID = 'bp'
    TITLE = 'Belief propagation：先收后发，两趟得到所有边缘'
    FLOW = ['规则与选根', '收：叶子 → 根', '发：从根分发', '读全部边缘']

    def construct(self):
        # Opening question card
        self.question(
            r'c56 那棵 5 个房间的树，每条边上有一张相容性打分表 $\psi$。上次的消元一次只求出一个房间（$x_4$）的边缘分布；现在想要每一个房间的边缘。如果每个房间各做一次消元，每次都要把整棵树走一遍，总共约 $O(n^2)$，而且大部分消息被重复计算。Belief propagation（信念传播）的办法是任选一个节点当 root（根）：**先把消息从叶子收到 root（collect），再从 root 发回叶子（distribute），两趟就算出所有节点的边缘。**',
            ['想要所有房间的边缘，要对每个房间各做一次消元？', '两趟消息传递：一收一发，一次全算完'],
            hold=2.6,
        )

        # 1. Setup static tree and persistent annotated formula card
        node_circles, node_labels, root_badge, tree_group = make_tree(root='x4')
        formula_card = make_formula_card()
        panel_mobs = []

        # Step 1: 规则与选根 (stage 0)
        self.step(
            r'树画出来了，黄圈的 $x_4$ 被选为 root。右上角是整个算法唯一的一条规则：$m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$，其中 $N(i)$ 是 $x_i$ 的邻居。公式三项下面各标了一段小字，从右往左读：**发送者 $x_i$ 先把除收件人 $x_j$ 以外的来信逐项相乘，再乘上两点之间的打分表 $\psi_{ij}$，最后对自己的取值求和（把 $x_i$ 加掉）。** 右边面板写的“只乘除收件人外的其他来信”就是这个意思：只把“除收件人以外”的来信乘进来。算法分两个阶段：① collect（收），消息从叶子流向 root；② distribute（发），消息从 root 流回叶子。',
            '选 x₄ 为根：两趟传递，先从叶子收向根，再从根发回叶子',
            stage=0,
        )
        self.play(FadeIn(tree_group), FadeIn(formula_card), run_time=1.0)

        lines1 = [
            '两阶段信念传播（BP）',
            '选定根节点：root = x₄',
            '① collect：叶子向根汇聚',
            '② distribute：从根分发回叶子',
            '规则：只乘除收件人外的其他来信',
        ]
        panel_mobs = update_panel(self, panel_mobs, lines1)
        self.wait(1.2)

        # Step 2: 收：叶子 → 根 (stage 1)
        self.step(
            r'第 1 阶段 collect（收）：黄色消息从叶子流向 root $x_4$。**collect 就是 c56 以 $x_4$ 为查询节点的那次消元。** 三片叶子先同时发信：叶子没有别的来信，直接对打分表求和、把自己加掉（括号里依次是收件人取热、取冷）：$m_{5\to4}=(3+1,\ 1+2)=(4,3)$，$m_{1\to2}=(3+1,\ 1+1)=(4,2)$，$m_{3\to2}=(1+2,\ 1+1)=(3,2)$。$x_2$ 要等这两条信都到了才能往 $x_4$ 发，因为它的消息要把 $x_1,x_3$ 两侧的信息都带上：先逐项相乘 $(4\times3,\ 2\times2)=(12,4)$，再乘 $\psi_{24}$ 把 $x_2$ 加掉，$m_{2\to4}=(4\times12+1\times4,\ 1\times12+2\times4)=(52,20)$。最后 $x_4$ 收齐两条来信，逐项相乘得 $(52\times4,\ 20\times3)=(208,60)$。',
            '第 1 阶段 collect：叶子把信息汇聚到根 x₄（黄色消息）',
            stage=1,
        )
        # 3 leaves send to internal nodes simultaneously
        leaf_specs = [
            ('x5', 'x4', '(4,3)', YELLOW, INK, -1),
            ('x1', 'x2', '(4,2)', YELLOW, INK, -1),
            ('x3', 'x2', '(3,2)', YELLOW, INK, -1),
        ]
        collect_pills1 = send_parallel(self, leaf_specs, run_time=0.85)
        self.play(
            node_circles['x1'].animate.set_fill('#5a4a16'),
            node_circles['x3'].animate.set_fill('#5a4a16'),
            node_circles['x5'].animate.set_fill('#5a4a16'),
            run_time=0.4,
        )
        self.wait(0.4)

        # x2 aggregates incoming (4,2) and (3,2) -> (12,4), sends m24 -> (52,20)
        x2_specs = [('x2', 'x4', '(52,20)', YELLOW, INK, -1)]
        collect_pills2 = send_parallel(self, x2_specs, run_time=0.85)
        self.play(
            node_circles['x2'].animate.set_fill('#5a4a16'),
            node_circles['x4'].animate.set_fill('#5a4a16'),
            run_time=0.4,
        )

        lines2 = [
            '第 1 阶段 collect（收）',
            'm₅→₄ = (4, 3)　m₁→₂ = (4, 2)',
            'm₃→₂ = (3, 2)　m₂→₄ = (52, 20)',
            'root x₄ 收齐两条来信：',
            '(52·4, 20·3) = (208, 60)',
        ]
        panel_mobs = update_panel(self, panel_mobs, lines2)
        self.wait(1.2)

        # Step 3: 发：从根分发 (stage 2)
        self.step(
            r'第 2 阶段 distribute（发）：红色消息从 root $x_4$ 往回发，规则不变，右上角闪动的“i 收到的其他来信”就是关键。发给 $x_5$ 时只乘 $m_{2\to4}=(52,20)$，不乘 $x_5$ 自己发来的 $m_{5\to4}$：**那条信装的本来就是 $x_5$ 一侧的信息，再送回给 $x_5$，同一份信息就被算了两遍。** 乘 $\psi_{45}$ 把 $x_4$ 加掉：$x_5$ 热 $52\times3+20\times1=176$，冷 $52\times1+20\times2=92$，得 $m_{4\to5}=(176,92)$。同理，发给 $x_2$ 时只乘 $m_{5\to4}=(4,3)$：$x_2$ 热 $4\times4+3\times1=19$，冷 $4\times1+3\times2=10$，得 $m_{4\to2}=(19,10)$。',
            '第 2 阶段 distribute：根往外发，只乘除收件人外的其他来信',
            stage=2,
        )
        lines3 = [
            '第 2 阶段 distribute（发）',
            'm₄→₅：只乘 m₂→₄ = (52, 20)',
            'x₅：(52·3 + 20·1, 52·1 + 20·2) = (176, 92)',
            'm₄→₂：只乘 m₅→₄ = (4, 3)',
            'x₂：(4·4 + 3·1, 4·1 + 3·2) = (19, 10)',
        ]
        panel_mobs = update_panel(self, panel_mobs, lines3)

        # Highlight role label "other incoming messages" in formula card
        self.play(Indicate(formula_card[5], color=YELLOW), run_time=0.6)

        root_out_specs = [
            ('x4', 'x5', '(176,92)', RED, WHITE, 1),
            ('x4', 'x2', '(19,10)', RED, WHITE, 1),
        ]
        dist_pills1 = send_parallel(self, root_out_specs, run_time=0.85)
        self.wait(1.2)

        # Step 4: 发：送达叶子 (stage 2)
        self.step(
            r'$x_2$ 收到 root 的回信 $m_{4\to2}=(19,10)$ 后，才向两片叶子发信：这样发出去的消息才带得上 $x_4,x_5$ 那一侧的信息。发给 $x_3$：把除 $x_3$ 以外的来信相乘，$m_{1\to2}\cdot m_{4\to2}=(4\times19,\ 2\times10)=(76,20)$，再乘 $\psi_{23}$ 把 $x_2$ 加掉：$x_3$ 热 $76\times1+20\times1=96$，冷 $76\times2+20\times1=172$，得 $m_{2\to3}=(96,172)$。发给 $x_1$：相乘的是 $m_{3\to2}\cdot m_{4\to2}=(3\times19,\ 2\times10)=(57,20)$，再乘 $\psi_{12}$：$x_1$ 热 $57\times3+20\times1=191$，冷 $57\times1+20\times1=77$，得 $m_{2\to1}=(191,77)$。**现在 4 条边上每个方向各有一条消息，共 8 条，全部算齐。**',
            'x₂ 汇总其他来信发给叶子：每条边两个方向各有一条消息',
            stage=2,
        )
        lines4 = [
            'distribute：x₂ 发给两片叶子',
            'm₂→₃：乘 m₁→₂·m₄→₂ = (76, 20)',
            '过 ψ₂₃ ⇒ (76+20, 152+20) = (96, 172)',
            'm₂→₁：乘 m₃→₂·m₄→₂ = (57, 20)',
            '过 ψ₁₂ ⇒ (171+20, 57+20) = (191, 77)',
        ]
        panel_mobs = update_panel(self, panel_mobs, lines4)

        x2_out_specs = [
            ('x2', 'x3', '(96,172)', RED, WHITE, 1),
            ('x2', 'x1', '(191,77)', RED, WHITE, 1),
        ]
        dist_pills2 = send_parallel(self, x2_out_specs, run_time=0.85)
        self.wait(1.2)

        # Step 5: 读全部边缘 (stage 3)
        self.step(
            r'5 个节点一起闪绿：**每个节点把收到的所有来信逐项相乘，就是它的边缘分布（还没归一化）。** 叶子只有一条来信：$x_1:(191,77)$，$x_3:(96,172)$，$x_5:(176,92)$；$x_2$ 有三条，$(4\times3\times19,\ 2\times2\times10)=(228,40)$；$x_4$ 就是 collect 结束时的 $(208,60)$。自检：每一对加起来都是 $268$（如 $191+77=268$，$228+40=268$），它就是 $Z$（配分函数，所有热冷组合的分数总和）；每对除以 268 就是精确的边缘概率，例如 $x_4$ 热的概率是 $208/268$。$n$ 个节点的树只有 $n-1$ 条边，一共只算 $2(n-1)=8$ 条消息，比做 5 次独立消元省掉大量重复计算。',
            '每点把所有来信相乘即为边缘，未归一化总和均等于 Z = 268',
            stage=3,
        )
        lines5 = [
            '每点所有来信相乘 ⇒ 边缘',
            'x₁: (191, 77)　x₂: (228, 40)',
            'x₃: (96, 172)　x₄: (208, 60)',
            'x₅: (176, 92)',
            '每对之和均为 268 = Z ✓',
        ]
        panel_mobs = update_panel(self, panel_mobs, lines5)

        # All 5 nodes indicate with GREEN to show marginals are complete
        self.play(*[Indicate(node_circles[k], color=GREEN) for k in NODES], run_time=1.0)
        self.wait(1.8)

        # Takeaway closing card
        self.takeaway(
            r'一句话：belief propagation 靠的是树上没有环。**选一个 root，先 collect（叶子 → root），再 distribute（root → 叶子），每条边两个方向各传一条消息，每个节点把所有来信相乘、归一化，就得到全部边缘。** 发信规则 $m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$：只把收件人以外的来信相乘，乘上边上的表，再把发送者加掉。$n$ 个节点的树有 $n-1$ 条边，共 $2(n-1)$ 条消息，两趟线性时间就够。概念题常问：分哪两个阶段、为什么两趟就够；复习时也要能说清为什么不乘收件人发来的那条消息、一共要发几条消息。',
            [
                '两阶段BP：一收一发，2(n−1) 条消息得到全部边缘',
                '发信规则：乘除收件人外的其他来信，再把发送者加掉',
                '边缘计算：每点所有来信相乘，未归一化和恒为配分函数 Z',
            ],
            hold=3.5,
        )
