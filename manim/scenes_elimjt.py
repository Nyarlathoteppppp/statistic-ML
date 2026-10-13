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
            r'有环的图直接传消息，信息可能绕圈、重复计算。能不能把变量分成几组，让组与组组成一棵树，再精确地传消息？下面只动图、记录变量集合，不计算概率表。',
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
            r'先把要消的变量的邻居连起来，再把它和邻居记成一组：这就是 **variable elimination（变量消元）** 在图上的记录方式。起点已做过 **moralization（道德化）**，边是 $12,13,24,34,35,45$；橙色虚线 $34$ 是已有结婚边，蓝色是输入变量，黄色是当前操作。消 $x_1$ 时，当前邻居是 $x_2,x_3$，缺少 $23$，所以加紫色 **fill-in edge（填补边）**；对 $x_1$ 求和的结果同时依赖这两个邻居。记录 **clique（团）** $c_1=\{1,2,3\}$，即自己加两个邻居，$1+2=3$ 个变量，然后把 $x_1$ 淡化为历史。',
            '先连邻居，再记下自己和邻居', stage=0,
        )
        self.play(FadeIn(graph), FadeIn(order), FadeIn(header), FadeIn(note),
                  FadeIn(legend), FadeIn(index_note), run_time=1.0)
        change_note('紫虚线：求和后邻居被绑在一起', PURPLE)
        eliminate(1, [2, 3], fill=(2, 3))

        self.step(
            r'这次邻居已经相连，不需要重复补边。消 $x_2$ 时，不再数灰色的 $x_1$；当前邻居为刚补边带来的 $x_3$ 和原有的 $x_4$，橙色 $34$ 已存在，所以新增边为零。记录 $c_2=\{2,3,4\}$：自己加两个当前邻居，$1+2=3$ 个变量，再淡化 $x_2$。',
            '邻居已经相连，就不用再补边', stage=0,
        )
        change_note('橙色边已经连好，不用补', ORANGE)
        eliminate(2, [3, 4], existing=(3, 4))

        self.step(
            r'邻居必须看当前图，而不是最开始的图。消 $x_3$ 时，$x_1,x_2$ 都已经消掉，当前邻居只有 $x_4,x_5$；它们之间已有 $45$，不用补边。记录 $c_3=\{3,4,5\}$，大小仍为 $1+2=3$，然后淡化 $x_3$。',
            '只看当前邻居，不把灰圈算进去', stage=1,
        )
        change_note('下面两个邻居，也已经相连')
        eliminate(3, [4, 5], existing=(4, 5))

        self.step(
            r'最后两个变量也各留下一条记录。消 $x_4$ 时只剩邻居 $x_5$，记录 $c_4=\{4,5\}$，大小 $1+1=2$；消 $x_5$ 时没有邻居，记录 $c_5=\{5\}$，大小 $1+0=1$。按 $x_1,x_2,x_3,x_4,x_5$ 的顺序，每次记一个团，共 $1+1+1+1+1=5$ 个团；整张图只新增过紫色的 $23$。',
            '最后两个变量，也各记一个团', stage=1,
        )
        change_note('先记录，再淡化；记录不能漏')
        eliminate(4, [5])
        eliminate(5, [])

        self.step(
            r'已经被大团完全包含的小团，不必再单独成为树节点，它们的因子可并进大团。$\{5\}\subset\{4,5\}\subset\{3,4,5\}$，所以划去 $c_4,c_5$；五个记录减去两个，$5-2=3$，保留绿色的 $c_1,c_2,c_3$。这种不被其他团严格包含的团叫 **maximal clique（极大团）**，不是只挑最大的一个。',
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
            r'把保留的大团直接变成新图的节点；两个团有共同变量就连边，这叫 **clique graph（团图）**，青色边旁的数是共享变量个数。$c_1\cap c_2=\{x_2,x_3\}$，所以权重 $1+1=2$；$c_2\cap c_3=\{x_3,x_4\}$，也是 $1+1=2$。$c_1\cap c_3=\{x_3\}$，只有一个变量，权重为 $1$；三条边构成三角形，还不是树。',
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
            r'不能随便删一条边：若删 $c_1$—$c_2$，留下权 $2+1=3$ 的树，$x_2$ 从 $c_1$ 到 $c_2$ 必须经过不含它的 $c_3$，信息会断。正确做法是 **maximum-weight spanning tree（最大权重生成树）**：三个节点需 $3-1=2$ 条边，保留权 $2,2$，总权 $2+2=4>3$；删去权 $1$ 的边，得到 **junction tree（联结树）**，相邻交集 $\{x_2,x_3\}$、$\{x_3,x_4\}$ 叫 **separator（分隔集）**。$x_3$ 沿 $c_1$—$c_2$—$c_3$ 连续出现，$x_2$ 在相邻的前两团中，$x_4$ 在相邻的后两团中，这就是 **running intersection property（连续交集性质）**；消元得到的三角化图，其极大团按交集大小取最大权重生成树可保持这个性质。边上传递的 **message（消息）** 不是变量名本身，而是共享变量的函数：例如发往 $c_3$ 的消息只依赖 $x_3,x_4$，其余变量被求和掉。',
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
            r'记住整条流程：先连当前邻居、记录自己和邻居，再消元；五个记录中只留三个极大团。团图的权重来自共享变量个数 $2,2,1$，取最大权重生成树，保留 $c_1$—$c_2$—$c_3$，两条 separator 分别是 $\{x_2,x_3\}$ 与 $\{x_3,x_4\}$。考试要检查当前邻居、子团包含关系和 running intersection；消息是分隔集变量的函数。',
            ['先连当前邻居，记团，再消元',
             '只留极大团，按共享变量数连树',
             '分隔集承载消息，共享变量不断线'],
        )
