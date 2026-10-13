"""c58: graph elimination -> maximal cliques -> junction tree.

Port of anim-elim-jt. No numerical inference is performed in this scene:
set entries are variable indices, and edge weights count shared variables.
"""
from manim import (
    Circle, Circumscribe, Create, DashedLine, Dot, FadeIn, FadeOut,
    Indicate, Line, RoundedRectangle, Transform, VGroup,
)
from common import (
    BG, BLUE, GREEN, GREY, M, ORANGE, P, PURPLE, RED, StepScene,
    T, TEAL, WHITE, YELLOW, px,
)


class ElimJt(StepScene):
    ID = 'elim-jt'
    TITLE = '消元找团：把有环的图变成团的树'
    FLOW = ['连邻居记团', '消完变量', '留极大团', '数共享变量', '连树传消息']

    def construct(self):
        self.question(
            r'c57 的消息传递只在树上精确。图里一旦有环，消息可能绕着环转回来，同一份信息被重复计算。**办法是把变量捆成几组，让组与组连成一棵树，再在这棵树上精确地传消息。** 本视频只在图上操作、记下每组有哪些变量，不计算任何概率表。',
            ['有环的图，怎样不让信息绕圈？', '把变量分组，让组与组连成树。'],
        )
        # Browser coordinates, with extra headroom for the persistent FLOW bar.
        pos = {1: (150, 90), 2: (62, 170), 3: (238, 170),
               4: (62, 270), 5: (238, 270)}
        edges = {}
        for a, b in [(1, 2), (1, 3), (2, 4), (3, 5), (4, 5)]:
            edges[a, b] = Line(P(*pos[a]), P(*pos[b]), color=GREY,
                               stroke_width=2.5).set_z_index(0)
        edges[3, 4] = DashedLine(P(*pos[3]), P(*pos[4]), color=ORANGE,
                                 stroke_width=3, dash_length=px(6)).set_z_index(0)
        nodes, circles = {}, {}
        for i in range(1, 6):
            c = Circle(radius=px(19), stroke_color=BLUE, stroke_width=2.5,
                       fill_color=BG, fill_opacity=1).move_to(P(*pos[i]))
            circles[i] = c
            nodes[i] = VGroup(c, M(r'x_%d' % i, 30, BLUE).move_to(c)).set_z_index(2)
        graph = VGroup(*edges.values(), *nodes.values())
        order = M(r'x_1\to x_2\to x_3\to x_4\to x_5', 22, BLUE).move_to(P(150, 49))
        header = T('记录：自己和当前邻居', 20, WHITE).move_to(P(450, 55))
        note = T('橙虚线：已有的结婚边', 18, ORANGE).move_to(P(150, 311))
        legend = T('灰圈：已消元，不再算邻居', 17, GREY).move_to(P(150, 337))
        index_note = T('集合内数字是变量编号', 17, GREY).move_to(P(450, 289))
        rows = []
        contents = [r'c_1=\{1,2,3\}', r'c_2=\{2,3,4\}',
                    r'c_3=\{3,4,5\}', r'c_4=\{4,5\}', r'c_5=\{5\}']

        def card(tex, point, color=YELLOW, size=27, width=160):
            label = M(tex, size, color)
            box = RoundedRectangle(width=px(width), height=px(30),
                                   corner_radius=px(5), stroke_color=color,
                                   stroke_width=1.5, fill_color=BG, fill_opacity=1)
            return VGroup(box, label.move_to(box)).move_to(point).set_z_index(3)

        def change_note(text, color=GREY):
            self.play(Transform(note, T(text, 18, color).move_to(P(150, 311))), run_time=0.5)

        def eliminate(v, nbrs, fill=None, existing=None):
            self.play(circles[v].animate.set_stroke(YELLOW, width=4), run_time=0.5)
            if nbrs:
                self.play(*[Indicate(nodes[u], color=YELLOW, scale_factor=1.12)
                            for u in nbrs], run_time=0.6)
            if fill is not None:
                a, b = fill
                edges[a, b] = DashedLine(P(*pos[a]), P(*pos[b]), color=PURPLE,
                                         stroke_width=3.5, dash_length=px(6)).set_z_index(0)
                self.play(Create(edges[a, b]), run_time=0.8)
            if existing is not None:
                self.play(Indicate(edges[existing], color=YELLOW), run_time=0.6)
            # The record is made BEFORE the node is dimmed.
            start = P(150, 125 if v == 1 else 222)
            row = card(contents[v - 1], start)
            self.play(FadeIn(row), run_time=0.5)
            self.play(row.animate.move_to(P(450, 90 + 40 * (v - 1))), run_time=0.8)
            rows.append(row)
            incident = [e for (a, b), e in edges.items() if v in (a, b)]
            self.play(nodes[v].animate.set_opacity(0.3),
                      *[e.animate.set_opacity(0.15) for e in incident], run_time=0.5)
            nodes[v][0].set_stroke(GREY)          # eliminated = grey ring (matches the legend)
            self.wait(1.2)

        self.step(
            r'左边是已做过 moralization（道德化：共同孩子的父母连边，再去掉箭头）的无向图，边是 $12,13,24,34,35,45$，橙色虚线 $34$ 就是那条已有的结婚边；上方是消元顺序 $x_1\to x_2\to x_3\to x_4\to x_5$。这是 variable elimination（变量消元）在图上的记录方式：**消一个变量前，先把它当前的邻居两两连上，再把“它 + 邻居”记成一个 clique（团）。** 消 $x_1$（黄圈）：邻居 $x_2,x_3$ 闪动，两者之间缺边，于是补一条紫色的 fill-in edge（填补边）$23$，因为对 $x_1$ 求和后得到的新表同时依赖 $x_2,x_3$，它们从此被绑在一起。记下 $c_1=\{1,2,3\}$（数字是变量编号）：自己 1 个加邻居 2 个，共 $1+2=3$ 个变量；然后 $x_1$ 变灰，不再算邻居。',
            '先连邻居，再记下自己和邻居', stage=0,
        )
        self.play(FadeIn(graph), FadeIn(order), FadeIn(header), FadeIn(note),
                  FadeIn(legend), FadeIn(index_note), run_time=1.0)
        change_note('紫虚线：求和后邻居被绑在一起', PURPLE)
        eliminate(1, [2, 3], fill=(2, 3))

        self.step(
            r'消 $x_2$：灰色的 $x_1$ 已经消掉，不再算邻居；当前邻居是 $x_3$（刚补的紫边带来的）和原有的 $x_4$。这两个邻居之间已有橙色的 $34$（闪动的那条），已经相连就不用再补边。记录 $c_2=\{2,3,4\}$：自己加两个当前邻居，$1+2=3$ 个变量，然后 $x_2$ 变灰。',
            '邻居已经相连，就不用再补边', stage=0,
        )
        change_note('橙色边已经连好，不用补', ORANGE)
        eliminate(2, [3, 4], existing=(3, 4))

        self.step(
            r'消 $x_3$：它曾经连着 $x_1$ 和 $x_2$（后者靠紫色补边），但这两个都已变灰，所以当前邻居只有 $x_4,x_5$。**邻居要看当前的图，已经消掉的变量不算。** $x_4,x_5$ 之间已有边 $45$，不用补。记录 $c_3=\{3,4,5\}$，大小仍是 $1+2=3$，然后 $x_3$ 变灰。',
            '只看当前邻居，不把灰圈算进去', stage=1,
        )
        change_note('下面两个邻居，也已经相连')
        eliminate(3, [4, 5], existing=(4, 5))

        self.step(
            r'最后两个变量也各记一条，不能漏。消 $x_4$：只剩一个邻居 $x_5$，没有需要互连的邻居对，记 $c_4=\{4,5\}$，大小 $1+1=2$。消 $x_5$：已经没有邻居，记 $c_5=\{5\}$，大小 $1+0=1$。**每消一个变量就记一个团，5 个变量共 $1+1+1+1+1=5$ 个团。** 整个过程只新增过一条紫色填补边 $23$。',
            '最后两个变量，也各记一个团', stage=1,
        )
        change_note('先记录，再淡化；记录不能漏')
        eliminate(4, [5])
        eliminate(5, [])

        self.step(
            r'右边 5 条记录里，$c_4,c_5$ 被红线划掉：$\{5\}\subset\{4,5\}\subset\{3,4,5\}$，它们的变量全在 $c_3$ 里。被大团完全包含的小团，不必单独成为树上的节点，它们的因子可以并进大团。五条记录去掉两条，$5-2=3$，留下绿色的 $c_1,c_2,c_3$。**不被其他团严格包含的团叫 maximal clique（极大团），三个都要留，不是只挑最大的一个。**',
            '被别的团包含的，不必单独保留', stage=2,
        )
        self.play(Circumscribe(rows[2], color=GREEN), run_time=0.8)
        strikes = VGroup(*[Line(P(385, y), P(515, y), color=RED, stroke_width=2.5)
                           .set_z_index(4) for y in (210, 250)])
        subset = M(r'\{5\}\subset\{4,5\}\subset\{3,4,5\}', 21, GREEN).move_to(P(450, 289))
        self.play(*[rows[i][0].animate.set_stroke(GREEN) for i in range(3)],
                  *[rows[i][1].animate.set_color(GREEN) for i in range(3)],
                  rows[3].animate.set_opacity(0.3), rows[4].animate.set_opacity(0.3),
                  Create(strikes), FadeOut(index_note), FadeIn(subset), run_time=0.8)
        change_note('已被包含的小团，并入大团', GREEN)
        self.wait(1.4)

        self.step(
            r'现在把三个极大团当作新图的节点，两个团只要有共同变量，就连一条青色边，这张图叫 clique graph（团图）。每条边先显示两团的交集，再换成交集里变量的个数，当作边的权重：$c_1\cap c_2=\{x_2,x_3\}$，两个变量，权重 $1+1=2$；$c_2\cap c_3=\{x_3,x_4\}$，也是 $1+1=2$；$c_1\cap c_3=\{x_3\}$，只有一个变量，权重 $1$。**两个团共享几个变量，边的权重就是几。** 三条边围成三角形，又有环，还不是树。',
            '把大团当节点，共享几个就标几', stage=3,
        )
        cp = {1: (390, 112), 2: (548, 196), 3: (390, 280)}
        self.play(
            *[Transform(rows[i - 1], card(contents[i - 1], P(*cp[i]), GREEN, 22, 142))
              for i in (1, 2, 3)],
            FadeOut(rows[3]), FadeOut(rows[4]),
            FadeOut(strikes), FadeOut(subset),
            Transform(header, T('权重：共享几个变量', 20, WHITE).move_to(P(463, 55))),
            run_time=1.2,
        )
        jt_edges, weights = {}, {}
        edge_specs = [
            ((1, 2), r'\{x_2,x_3\}', '2', (484, 139)),
            ((2, 3), r'\{x_3,x_4\}', '2', (484, 253)),
            ((1, 3), r'\{x_3\}', '1', (350, 196)),
        ]
        for (a, b), tex, count, at in edge_specs:
            e = Line(P(*cp[a]), P(*cp[b]), color=TEAL, stroke_width=3).set_z_index(1)
            jt_edges[a, b] = e
            shared = M(tex, 22, TEAL).move_to(P(*at)).set_z_index(4)
            self.play(Create(e), run_time=0.5)
            self.play(FadeIn(shared), run_time=0.5)
            self.wait(1.2)
            self.play(Transform(shared, M(count, 24, TEAL).move_to(P(*at))), run_time=0.5)
            weights[a, b] = shared
        self.wait(1.2)

        self.step(
            r'要变成树，得删一条边，但不能随便删。先看红色的错误做法：删掉 $c_1$—$c_2$，留下的树总权重 $2+1=3$；$x_2$ 在 $c_1$ 和 $c_2$ 里都有，可从 $c_1$ 到 $c_2$ 必须经过不含 $x_2$ 的 $c_3$，关于 $x_2$ 的信息就断了。**正确做法是取 maximum-weight spanning tree（最大权重生成树）：保留共享变量最多、又不成环的边。** 3 个节点需要 $3-1=2$ 条边，留下两条权重 2 的边，总权重 $2+2=4>3$，删掉权重 1 的边，就得到 junction tree（联结树）$c_1$—$c_2$—$c_3$；边上的交集 $\{x_2,x_3\}$、$\{x_3,x_4\}$ 叫 separator（分隔集）。$x_3$ 沿 $c_1$—$c_2$—$c_3$ 连续出现，$x_2$ 在相邻的前两团，$x_4$ 在相邻的后两团，同一变量沿树不断线，这叫 running intersection property（连续交集性质）；用消元（连同填补边）得到的极大团，按交集大小取最大权重生成树，就能保住这个性质。最后沿边移动的黄点代表 message（消息）：它不是变量名本身，而是 separator 变量的函数，例如发往 $c_3$ 的消息只依赖 $x_3,x_4$，其余变量都已求和掉。',
            '共享变量沿树不断线，消息只带交集', stage=4,
        )
        score = M(r'2+1=3', 24, RED).move_to(P(468, 78))
        self.play(jt_edges[1, 2].animate.set_opacity(0.12),
                  weights[1, 2].animate.set_opacity(0.12),
                  jt_edges[1, 3].animate.set_color(RED), FadeIn(score),
                  Transform(header, T('随便删边：共享变量会断', 19, RED).move_to(P(463, 55))),
                  run_time=0.6)
        change_note('错误路径中间的团没有 x₂', RED)
        self.play(Circumscribe(rows[2], color=RED), run_time=0.6)
        self.wait(1.2)
        self.play(jt_edges[1, 2].animate.set_opacity(1).set_color(GREEN),
                  jt_edges[2, 3].animate.set_color(GREEN),
                  FadeOut(jt_edges[1, 3]), FadeOut(weights[1, 3]),
                  Transform(score, M(r'2+2=4', 24, GREEN).move_to(P(468, 78))),
                  Transform(header, T('保留共享最多、又不成环的边', 19, GREEN).move_to(P(463, 55))),
                  run_time=0.8)
        # Explicitly bounded labels, well inside x=626 (especially {x_3,x_4}).
        for key, tex, at in [((1, 2), r'\{x_2,x_3\}', (505, 135)),
                             ((2, 3), r'\{x_3,x_4\}', (505, 261))]:
            target = M(tex, 23, YELLOW)
            if target.width > px(116):
                target.scale_to_fit_width(px(116))
            target.move_to(P(*at)).set_z_index(4)
            self.play(Transform(weights[key], target), run_time=0.5)
        change_note('边上的交集：消息只依赖这些变量', YELLOW)
        self.wait(1.2)
        self.play(*[Indicate(rows[i], color=YELLOW, scale_factor=1.03) for i in range(3)],
                  Indicate(jt_edges[1, 2], color=YELLOW),
                  Indicate(jt_edges[2, 3], color=YELLOW), run_time=0.8)
        continuity = M(r'x_3\in c_1,\ c_2,\ c_3', 23, YELLOW).move_to(P(468, 78))
        self.play(Transform(score, continuity),
                  Transform(header, T('同一变量沿树不断线', 20, YELLOW).move_to(P(463, 55))),
                  run_time=0.5)
        # Light travelling along the edge represents a table indexed by the separator.
        packet = Dot(P(*cp[2]), radius=px(5), color=YELLOW).set_z_index(5)
        self.play(FadeIn(packet), run_time=0.5)
        self.play(packet.animate.move_to(P(*cp[3])), run_time=1.2)
        self.play(FadeOut(packet), Circumscribe(weights[2, 3], color=YELLOW), run_time=0.5)
        self.wait(1.4)

        # StepScene's closing veil uses the default layer; let it cover the diagram.
        for mob in self.mobjects:
            mob.set_z_index(0)
        self.takeaway(
            r'一句话：**按顺序消元，每消一个变量先把它当前的邻居两两连上、记下“它 + 邻居”这个团；只留极大团；按共享变量个数连成团图，取最大权重生成树，就得到 junction tree。** 本例五条记录留下三个极大团，团图边权 $2,2,1$，保留 $c_1$—$c_2$—$c_3$，两条 separator 分别是 $\{x_2,x_3\}$ 与 $\{x_3,x_4\}$；消息是 separator 变量的函数。考试做这类题要逐步检查：当前邻居（已消掉的不算）、填补边、子团包含关系，以及 running intersection 是否成立。',
            ['先连当前邻居，记团，再消元',
             '只留极大团，按共享变量数连树',
             '分隔集承载消息，共享变量不断线'],
        )
