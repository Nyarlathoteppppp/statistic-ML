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
            r'树上有 5 个房间，每条边有一张相容性打分表 $\psi$。想要**所有**房间的温度边缘分布，难道要对每个房间各做一次消元（$O(n^2)$）？**Belief propagation（信念传播）** 的想法：选任意一个节点作为 root，**一收（collect）一发（distribute）**，两趟传递就一次算出所有节点的边缘。',
            ['想要所有房间的边缘，要对每个房间各做一次消元？', '两趟消息传递：一收一发，一次全算完'],
            hold=2.6,
        )

        # 1. Setup static tree and persistent annotated formula card
        node_circles, node_labels, root_badge, tree_group = make_tree(root='x4')
        formula_card = make_formula_card()
        panel_mobs = []

        # Step 1: 规则与选根 (stage 0)
        self.step(
            r'选 $x_4$ 为 **root（根）**。核心规则：$m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$。发送者 $x_i$ 把**除了收件人 $x_j$ 以外**收到的所有来信相乘，乘上两点间的打分表 $\psi_{ij}$，再对自己求和（消掉 $x_i$）。整个算法分两阶段：① **collect（收）**：叶子向 root 汇聚；② **distribute（发）**：root 向叶子发回。',
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
            r'**第 1 阶段 collect（收）**：从叶子向 root $x_4$ 发消息，这就是 c56 的消元。叶子没有其他来信，直接对打分表求和：$m_{5\to4}=(3+1, 1+2)=(4,3)$，$m_{1\to2}=(3+1, 1+1)=(4,2)$，$m_{3\to2}=(1+2, 1+1)=(3,2)$。中间点 $x_2$ 收齐后先相乘 $(4\times3, 2\times2)=(12,4)$，乘 $\psi_{24}$ 消掉 $x_2$ 得 $m_{2\to4}=(4\times12+1\times4, 1\times12+2\times4)=(52,20)$。$x_4$ 收齐两条来信：$(52\times4, 20\times3)=(208,60)$。',
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
            r'**第 2 阶段 distribute（发）**：从 root $x_4$ 往回发，**规则不变**。关键注意：发给 $x_5$ 时，**绝不能乘** $x_5$ 自己发来的 $m_{5\to4}$，否则信息被重复计算！只乘 $m_{2\to4}=(52,20)$，乘 $\psi_{45}$ 把 $x_4$ 加掉：$x_5$ 热 $52\times3+20\times1=176$，冷 $52\times1+20\times2=92$，得红色消息 $m_{4\to5}=(176,92)$。同理，发给 $x_2$ 时只乘 $m_{5\to4}=(4,3)$：$x_2$ 热 $4\times4+3\times1=19$，冷 $4\times1+3\times2=10$，得 $m_{4\to2}=(19,10)$。',
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
            r'$x_2$ 接着向两片叶子发。发给 $x_3$：乘除 $x_3$ 外的来信 $m_{1\to2}\cdot m_{4\to2}=(4\times19, 2\times10)=(76,20)$，乘 $\psi_{23}$ 把 $x_2$ 加掉：$x_3$ 热 $76\times1+20\times1=96$，冷 $76\times2+20\times1=172$，得 $m_{2\to3}=(96,172)$。发给 $x_1$：乘 $m_{3\to2}\cdot m_{4\to2}=(3\times19, 2\times10)=(57,20)$，乘 $\psi_{12}$ 把 $x_2$ 加掉：$x_1$ 热 $57\times3+20\times1=191$，冷 $57\times1+20\times1=77$，得 $m_{2\to1}=(191,77)$。现在 4 条边上正反共 8 条消息全部算齐！',
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
            r'现在**每个节点把收到的所有来信相乘**，就是该节点的边缘分布：$x_1:(191,77)$，$x_2:(4\times3\times19, 2\times2\times10)=(228,40)$，$x_3:(96,172)$，$x_4:(208,60)$，$x_5:(176,92)$。**自检**：每一对数字之和都是 $268=Z$（配分函数）！归一化后即可得到每个节点的精确边缘概率。树上有 $n$ 个节点只有 $n-1$ 条边，总共只需算 $2(n-1)=8$ 条消息，比做 5 次独立消元省下大量重复计算。',
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
            r'**一句话总结**：Belief propagation（信念传播）利用树上无环的结构，选定一个根，先由叶子向根 collect，再由根向叶子 distribute。树上 $n-1$ 条边共产生 $2(n-1)$ 条消息；最后每个节点把所有来信相乘并归一化，两趟线性时间就一次性求出了所有节点的边缘分布。',
            [
                '两阶段BP：一收一发，2(n−1) 条消息得到全部边缘',
                '发信规则：乘除收件人外的其他来信，再把发送者加掉',
                '边缘计算：每点所有来信相乘，未归一化和恒为配分函数 Z',
            ],
            hold=3.5,
        )
