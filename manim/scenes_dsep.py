r"""D-separation on the alarm network (c54).

Determines conditional independence via the 5-step moralized ancestral graph method:
1. Ancestral graph: retain only query/conditioning nodes and their ancestors.
2. Moralize: marry parents of common children with undirected edges.
3. Drop directions: directed arrows become undirected lines.
4. Delete conditioning set S and all incident edges.
5. Check connectivity: if path remains -> independence not implied (does not hold);
   if disconnected -> conditional independence holds.
"""
from manim import (
    Arrow, Circle, Circumscribe, Create, DashedLine,
    FadeIn, FadeOut, Indicate, Line,
    ReplacementTransform, RoundedRectangle, Transform, VGroup,
    DOWN, LEFT, RIGHT, UP,
)
from common import (
    BG, BLUE, GREEN, GREY, INK, M, ORANGE, P, RED, StepScene, T, WHITE, YELLOW, pill, px,
)

POS = {
    'E': (150, 95),
    'B': (330, 95),
    'R': (150, 205),
    'A': (330, 205),
    'L': (240, 305),
}

CH_NAMES = {
    'E': '地震',
    'B': '盗窃',
    'R': '电台',
    'A': '警报',
    'L': '下班',
}

LABEL_POS = {
    'E': LEFT,
    'B': RIGHT,
    'R': LEFT,
    'A': RIGHT,
    'L': RIGHT,
}


def make_card(y_center, height, stroke_color=GREY, fill_color='#1a1d24'):
    """Right-hand panel card container."""
    return RoundedRectangle(
        corner_radius=px(6),
        width=px(216),
        height=px(height),
        stroke_color=stroke_color,
        stroke_width=1.5,
        fill_color=fill_color,
        fill_opacity=0.92,
    ).move_to(P(505, y_center))


def make_node(key, stroke_color=WHITE, fill_color='#20232b', fill_opacity=1.0, stroke_width=2.5):
    """Create node circle, letter, and Chinese label."""
    p = P(*POS[key])
    c = Circle(
        radius=px(18),
        stroke_color=stroke_color,
        stroke_width=stroke_width,
        fill_color=fill_color,
        fill_opacity=fill_opacity,
    ).move_to(p)
    letter = T(key, 22, WHITE).move_to(p)
    ch = T(CH_NAMES[key], 14, GREY).next_to(c, LABEL_POS[key], buff=0.14)
    return c, letter, ch


def make_arrow(u, v, color=GREY):
    """Directed edge between two node perimeters."""
    return Arrow(
        P(*POS[u]),
        P(*POS[v]),
        buff=px(20),
        stroke_width=2.5,
        max_tip_length_to_length_ratio=0.18,
        color=color,
    )


def make_line(u, v, color=GREY, stroke_width=2.5):
    """Undirected line between two node perimeters."""
    return Line(
        P(*POS[u]),
        P(*POS[v]),
        buff=px(20),
        stroke_width=stroke_width,
        color=color,
    )


def make_married_line(u, v):
    """Moralized dashed edge between common parents."""
    return DashedLine(
        P(*POS[u]),
        P(*POS[v]),
        buff=px(20),
        stroke_width=3.2,
        dash_length=px(6),
        color=ORANGE,
    )


class Dsep(StepScene):
    ID = 'dsep'
    TITLE = 'D-separation：从贝叶斯网读出条件独立性'
    FLOW = ['祖先图', '父母结婚', '去掉方向', '删掉条件', '找路径']

    def construct(self):
        # Opening question card
        self.question(
            r'Bayesian network（贝叶斯网）里每个节点都带一张条件概率表。想知道“已知某些变量之后，另外两个变量还有没有关系”，按定义要拿表里的数逐格验证等式，非常麻烦。D-separation（D 分离）给出一套只看图、不看数字的五步判断法，往年真题多次考过。',
            ['贝叶斯网中，两个变量何时条件独立？', '不看概率表，只看图的五步判断法'],
        )

        # =====================================================================
        # QUESTION 1: L ⊥ B | A ?
        # =====================================================================

        # Step 1: Question 1 Setup
        c_E, l_E, ch_E = make_node('E', stroke_color='#7c8494')
        c_B, l_B, ch_B = make_node('B', stroke_color=GREEN, stroke_width=3.5)
        c_R, l_R, ch_R = make_node('R', stroke_color='#7c8494')
        c_A, l_A, ch_A = make_node('A', stroke_color='#b8c0cc', fill_color='#4a5060', stroke_width=3.0)
        c_L, l_L, ch_L = make_node('L', stroke_color=BLUE, stroke_width=3.5)

        nodes_q1 = VGroup(c_E, l_E, ch_E, c_B, l_B, ch_B, c_R, l_R, ch_R, c_A, l_A, ch_A, c_L, l_L, ch_L)

        arr_ER = make_arrow('E', 'R')
        arr_EA = make_arrow('E', 'A')
        arr_BA = make_arrow('B', 'A')
        arr_RL = make_arrow('R', 'L')
        arr_AL = make_arrow('A', 'L')
        arrows_q1 = VGroup(arr_ER, arr_EA, arr_BA, arr_RL, arr_AL)

        box1 = make_card(62, 36, stroke_color=YELLOW)
        q1_tex = M(r'L \perp B \mid A \ ?', 26, YELLOW).move_to(box1)
        tag1 = T('查询：蓝 L、绿 B，灰底 A 为已知条件', 14, GREY).next_to(box1, DOWN, buff=0.06)
        card1 = VGroup(box1, q1_tex)

        self.step(
            r'这是课件的报警网络：地震 $E$、盗窃 $B$、电台报道 $R$、警报 $A$、下班离开 $L$，箭头从原因指向结果：$E\to R$，$E\to A$，$B\to A$，$R\to L$，$A\to L$。第一问：$L\perp B\mid A$ 成立吗？它读作“给定 $A$ 时 $L$ 与 $B$ 条件独立”，意思是已经知道警报 $A$ 之后，再知道有没有盗窃，对猜我下不下班没有任何帮助。蓝圈 $L$、绿圈 $B$ 是要判断的两个变量，灰底的 $A$ 是已知的条件。',
            '问题一：已知警报响了（A），下班（L）与盗窃（B）独立吗？',
            stage=0,
        )
        self.play(FadeIn(nodes_q1), FadeIn(arrows_q1), FadeIn(card1), FadeIn(tag1), run_time=1.0)
        self.wait(1.2)

        # Step 2: Stage 0 祖先图
        box2 = make_card(120, 46, stroke_color=BLUE)
        t2 = T('① 祖先图 Anc(L, B, A)', 16, BLUE).next_to(box2.get_top(), DOWN, buff=0.08)
        m2 = M(r'\{E, B, R, A, L\}', 22, WHITE).next_to(t2, DOWN, buff=0.05)
        VGroup(t2, m2).move_to(box2)
        card2 = VGroup(box2, t2, m2)

        self.step(
            r'第 ① 步取 ancestral graph（祖先图）：只保留问题里出现的 $L$、$B$、$A$，以及它们的所有祖先（父节点、父节点的父节点……），其余节点删掉。$L$ 的父节点是 $R$、$A$；再往上，$R$ 的父节点是 $E$，$A$ 的父节点是 $E$、$B$。所以 5 个节点 $\{E,B,R,A,L\}$ 全在祖先图里（屏幕上写作 $\mathrm{Anc}(L,B,A)$，即 $L$、$B$、$A$ 和它们所有祖先），这一步一个也没删。',
            '① 祖先图：L 的祖先包含 R, A, E, B，5 个节点全部保留',
            stage=0,
        )
        self.play(
            Indicate(c_L, color=YELLOW),
            Indicate(c_R, color=YELLOW),
            Indicate(c_A, color=YELLOW),
            Indicate(c_E, color=YELLOW),
            Indicate(c_B, color=YELLOW),
            FadeIn(card2),
            run_time=1.1,
        )
        self.wait(1.2)

        # Step 3: Stage 1 父母结婚 (moralize)
        eb_married = make_married_line('E', 'B')
        ra_married = make_married_line('R', 'A')

        box3 = make_card(175, 46, stroke_color=ORANGE)
        t3 = T('② 父母结婚 (moralize)', 16, ORANGE).next_to(box3.get_top(), DOWN, buff=0.08)
        m3 = T('E—B（孩子 A）、R—A（孩子 L）', 15, ORANGE).next_to(t3, DOWN, buff=0.05)
        VGroup(t3, m3).move_to(box3)
        card3 = VGroup(box3, t3, m3)
        why_eb = T('因共同孩子 A 结婚', 14, ORANGE).move_to(P(240, 80))
        why_ra = T('因共同孩子 L 结婚', 14, ORANGE).move_to(P(240, 191))

        self.step(
            r'第 ② 步 moralize（父母结婚）：在祖先图里，凡是有共同孩子的两个父节点，之间连一条无向边（橙色虚线）。$A$ 的父母是 $E$、$B$，所以连 $E$—$B$；$L$ 的父母是 $R$、$A$，所以连 $R$—$A$。为什么要连：听到警报后，如果得知发生了地震，“是盗窃引起的”可能就变小，这叫 explaining away（解释排除）。**观测到共同的孩子（或它的后代）后，原本无关的两个父节点会变得相关，结婚边就表示这件事。**这里的 $L$ 没被观测，但它是被问的变量，所以留在祖先图里；规则统一成：祖先图里每个共同孩子的父母都结婚，不用再判断孩子有没有被观测——孩子能留在祖先图里，说明它自己或它的后代在问题里出现，父母就可能经由它变得相关。（本例给 $R$、$A$ 连边也不改变结论，因为它们本来就都和 $L$ 直接相连。）',
            '② 父母结婚：共同孩子 A ⇒ E—B；共同孩子 L ⇒ R—A',
            stage=1,
        )
        self.play(Create(eb_married), Create(ra_married), FadeIn(card3), FadeIn(why_eb), FadeIn(why_ra), run_time=1.1)
        self.wait(1.2)

        # Step 4: Stage 2 去掉方向
        line_ER = make_line('E', 'R')
        line_EA = make_line('E', 'A')
        line_BA = make_line('B', 'A')
        line_RL = make_line('R', 'L')
        line_AL = make_line('A', 'L')

        box4 = make_card(229, 44, stroke_color=GREY)
        t4 = T('③ 去掉方向：箭头化为无向边', 16, WHITE).move_to(box4)
        card4 = VGroup(box4, t4)

        self.step(
            r'第 ③ 步去掉方向：五条箭头都变成普通的无向线，连同两条结婚边，现在是一张无向图。方向唯一的用处是区分“汇合”，这在前两步已经处理完，所以之后只看有没有路。这样，有向图上“是否条件独立”的问题，就变成了无向图上“两个点之间还有没有路”的问题。',
            '③ 去掉方向：所有有向箭头变为无向边',
            stage=2,
        )
        self.play(
            ReplacementTransform(arr_ER, line_ER),
            ReplacementTransform(arr_EA, line_EA),
            ReplacementTransform(arr_BA, line_BA),
            ReplacementTransform(arr_RL, line_RL),
            ReplacementTransform(arr_AL, line_AL),
            FadeIn(card4),
            run_time=0.9,
        )
        self.wait(1.0)

        # Step 5: Stage 3 删掉条件 A
        self.step(
            r'第 ④ 步删掉条件集 $S=\{A\}$。已知的中间点会挡住经过它的链和分叉（上面三种形状表的前两行），所以把它删掉；汇合造成的相关已经由结婚边保留下来，删 $A$ 不会丢掉它。画面上，已知节点 $A$ 消失，连着它的 4 条边先闪红，再一起删掉，即 $E$—$A$、$B$—$A$、$A$—$L$ 和结婚边 $R$—$A$。结婚边 $R$—$A$ 虽然是刚连上的，可它的一端就是 $A$，所以和 $A$ 一起走（图上标着“与 A 相连，一并删掉”）；结婚边 $E$—$B$ 的两端是 $E$、$B$，不连着 $A$，所以留了下来（橙色虚线闪了一下）。**留下的 $E$—$B$，就是“观测了 $A$”留下的痕迹。**',
            '④ 删掉条件：删去 A 及 4 条边（R—A 一起没了，E—B 留下）',
            stage=3,
        )
        t4_updated = T('③ 去方向　④ 删去条件 A', 16, WHITE).next_to(box4.get_top(), DOWN, buff=0.07)
        sub4 = T('A 的 4 条边全删（含 R—A）', 14, '#9fb3c8').next_to(t4_updated, DOWN, buff=0.04)
        VGroup(t4_updated, sub4).move_to(box4)

        # First show WHICH edges go with A: its 4 edges turn red; the R-A marriage edge gets a note
        why_ra_del = T('与 A 相连，一并删掉', 14, RED).move_to(why_ra)
        self.play(
            c_A.animate.set_stroke(RED, width=3.5),
            line_EA.animate.set_color(RED),
            line_BA.animate.set_color(RED),
            line_AL.animate.set_color(RED),
            ra_married.animate.set_color(RED).set_stroke(width=4.2),
            Transform(why_ra, why_ra_del),
            Transform(t4, t4_updated),
            FadeIn(sub4),
            run_time=0.8,
        )
        self.play(Indicate(ra_married, color=RED, scale_factor=1.06), Indicate(why_ra, color=RED), run_time=0.8)
        self.wait(0.6)
        self.play(
            FadeOut(c_A),
            FadeOut(l_A),
            FadeOut(ch_A),
            FadeOut(line_EA),
            FadeOut(line_BA),
            FadeOut(line_AL),
            FadeOut(ra_married),
            FadeOut(why_ra),
            run_time=0.9,
        )
        self.play(Indicate(eb_married, color=ORANGE, scale_factor=1.05), Indicate(why_eb, color=YELLOW), run_time=0.8)
        self.wait(0.8)

        # Step 6: Stage 4 找路径 (Q1 Conclusion)
        box5 = make_card(292, 66, stroke_color=RED)
        t5 = T('⑤ 仍连通：L—R—E—B', 16, RED).next_to(box5.get_top(), DOWN, buff=0.08)
        why5 = T('E—B 是结婚边（A 的父母）', 14, ORANGE).next_to(t5, DOWN, buff=0.05)
        verdict5 = pill('不保证独立 (does not hold)', fill=RED, color=WHITE, size=15).next_to(why5, DOWN, buff=0.08)
        VGroup(t5, why5, verdict5).move_to(box5)
        card5 = VGroup(box5, t5, why5, verdict5)

        self.step(
            r'第 ⑤ 步找路径：剩下的三条边变红，$L$—$R$（原来的 $R\to L$）、$R$—$E$（原来的 $E\to R$）和结婚边 $E$—$B$，正好连成一条路 $L$—$R$—$E$—$B$。**$L$ 和 $B$ 之间还有路，所以 $L\perp B\mid A$ 不成立：图不能保证它们独立。**考试写 does not hold in general，并写出这条路径。直觉：听到警报后，地震和盗窃互相牵制；电台报不报地震，又影响我下不下班。',
            '⑤ 找路径：L—R—E—B 连通（E—B 是结婚边）⇒ 不保证独立',
            stage=4,
        )
        self.play(
            line_RL.animate.set_color(RED).set_stroke(width=4.5),
            line_ER.animate.set_color(RED).set_stroke(width=4.5),
            eb_married.animate.set_color(RED).set_stroke(width=4.5),
            FadeIn(card5),
            run_time=1.0,
        )
        self.wait(1.5)

        # =====================================================================
        # QUESTION 2: R ⊥ A | E ? (Reset & Contrast)
        # =====================================================================

        # Step 7: Reset DAG and Q2 Stage 0 祖先图 (L gets eliminated!)
        q1_remnants = [
            card1, tag1, card2, card3, card4, sub4, card5, why_eb,
            c_E, l_E, ch_E, c_B, l_B, ch_B, c_R, l_R, ch_R, c_L, l_L, ch_L,
            line_RL, line_ER, eb_married,
        ]

        # Fresh DAG for Q2
        c_E2, l_E2, ch_E2 = make_node('E', stroke_color='#b8c0cc', fill_color='#4a5060', stroke_width=3.0)
        c_B2, l_B2, ch_B2 = make_node('B', stroke_color='#7c8494')
        c_R2, l_R2, ch_R2 = make_node('R', stroke_color=BLUE, stroke_width=3.5)
        c_A2, l_A2, ch_A2 = make_node('A', stroke_color=GREEN, stroke_width=3.5)
        c_L2, l_L2, ch_L2 = make_node('L', stroke_color='#7c8494')

        arr_ER2 = make_arrow('E', 'R')
        arr_EA2 = make_arrow('E', 'A')
        arr_BA2 = make_arrow('B', 'A')
        arr_RL2 = make_arrow('R', 'L')
        arr_AL2 = make_arrow('A', 'L')

        box_q2_1 = make_card(62, 36, stroke_color=YELLOW)
        q2_tex = M(r'R \perp A \mid E \ ?', 26, YELLOW).move_to(box_q2_1)
        tag_q2_1 = T('查询：蓝 R、绿 A，灰底 E 为已知条件', 14, GREY).next_to(box_q2_1, DOWN, buff=0.06)
        card_q2_1 = VGroup(box_q2_1, q2_tex)

        box_q2_2 = make_card(128, 62, stroke_color=BLUE)
        t_q2_2 = T('① 祖先图 Anc(R, A, E)', 16, BLUE).next_to(box_q2_2.get_top(), DOWN, buff=0.07)
        m_q2_2 = M(r'\{E, B, R, A\}', 21, WHITE).next_to(t_q2_2, DOWN, buff=0.05)
        sub_q2_2 = T('L 不是祖先，第一步即被剔除！', 14, YELLOW).next_to(m_q2_2, DOWN, buff=0.05)
        VGroup(t_q2_2, m_q2_2, sub_q2_2).move_to(box_q2_2)
        card_q2_2 = VGroup(box_q2_2, t_q2_2, m_q2_2, sub_q2_2)

        self.step(
            r'第二问：$R\perp A\mid E$ 成立吗？图重新画好：蓝圈 $R$、绿圈 $A$ 是要判断的变量，灰底的 $E$ 是已知条件。第 ① 步取祖先图：$R$ 的父节点是 $E$，$A$ 的父节点是 $E$、$B$，$E$ 和 $B$ 没有父节点，所以祖先图 $\mathrm{Anc}(R,A,E)$ 是 $\{E,B,R,A\}$。**$L$ 是 $R$ 和 $A$ 的孩子，不是 $R$、$A$、$E$ 中任何一个的祖先，所以第一步就连同两条箭头被删掉。**',
            '问题二：R ⊥ A | E？L 不是祖先，第一步就被剔除！',
            stage=0,
        )
        self.play(
            *[FadeOut(m) for m in q1_remnants],
            FadeIn(VGroup(c_E2, l_E2, ch_E2, c_B2, l_B2, ch_B2, c_R2, l_R2, ch_R2, c_A2, l_A2, ch_A2, c_L2, l_L2, ch_L2)),
            FadeIn(VGroup(arr_ER2, arr_EA2, arr_BA2, arr_RL2, arr_AL2)),
            FadeIn(card_q2_1),
            FadeIn(tag_q2_1),
            run_time=0.9,
        )
        # Fade out node L and its arrows
        self.play(
            FadeOut(c_L2),
            FadeOut(l_L2),
            FadeOut(ch_L2),
            FadeOut(arr_RL2),
            FadeOut(arr_AL2),
            FadeIn(card_q2_2),
            run_time=0.9,
        )
        self.wait(1.3)

        # Step 8: Stages 1-3 Moralize, drop directions, delete condition E
        eb2_married = make_married_line('E', 'B')
        line_ER2 = make_line('E', 'R')
        line_EA2 = make_line('E', 'A')
        line_BA2 = make_line('B', 'A')

        box_q2_3 = make_card(206, 70, stroke_color=ORANGE)
        t_q2_3 = T('② 父母结婚：仅 E—B 结婚', 16, ORANGE).next_to(box_q2_3.get_top(), DOWN, buff=0.07)
        sub_q2_3 = T('（L 已删，R 与 A 不结婚！）', 15, YELLOW).next_to(t_q2_3, DOWN, buff=0.05)
        sub_q2_3b = T('③ 去方向　④ 删条件 E', 15, GREY).next_to(sub_q2_3, DOWN, buff=0.05)
        VGroup(t_q2_3, sub_q2_3, sub_q2_3b).move_to(box_q2_3)
        card_q2_3 = VGroup(box_q2_3, t_q2_3, sub_q2_3, sub_q2_3b)
        why_eb2 = T('因共同孩子 A 结婚', 14, ORANGE).move_to(P(240, 80))

        self.step(
            r'第 ② 步父母结婚：剩下的图里只有 $A$ 有两个父母 $E$、$B$，所以只连一条 $E$—$B$。$R$ 和 $A$ 唯一的共同孩子 $L$ 已经删掉，所以 $R$ 与 $A$ 不结婚。**这一点决定结论：如果 $R$—$A$ 结了婚，删掉 $E$ 后这条边还在，$R$ 和 $A$ 就直接相连了。**接着第 ③ 步去掉方向，第 ④ 步删掉条件节点 $E$ 和连着它的三条边 $E$—$R$、$E$—$A$、$E$—$B$，只剩 $B$—$A$ 一条线。',
            '核心差别：L 已删，R 与 A 不结婚！删去 E 后 R 孤立',
            stage=1,
        )
        self.play(Create(eb2_married), FadeIn(why_eb2), FadeIn(card_q2_3), run_time=0.8)
        self.flow(2)
        self.play(
            ReplacementTransform(arr_ER2, line_ER2),
            ReplacementTransform(arr_EA2, line_EA2),
            ReplacementTransform(arr_BA2, line_BA2),
            run_time=0.7,
        )
        self.flow(3)
        self.play(
            FadeOut(c_E2),
            FadeOut(l_E2),
            FadeOut(ch_E2),
            FadeOut(line_ER2),
            FadeOut(line_EA2),
            FadeOut(eb2_married),
            FadeOut(why_eb2),
            run_time=0.9,
        )
        self.wait(1.3)

        # Step 9: Stage 4 Check connectivity (Q2 Conclusion)
        box_q2_4 = make_card(286, 58, stroke_color=GREEN)
        t_q2_4 = T('⑤ 找路径：R 孤立，无路到 A', 16, GREEN).next_to(box_q2_4.get_top(), DOWN, buff=0.08)
        verdict_q2_4 = pill('条件独立成立 (holds)', fill=GREEN, color=INK, size=15).next_to(t_q2_4, DOWN, buff=0.08)
        VGroup(t_q2_4, verdict_q2_4).move_to(box_q2_4)
        card_q2_4 = VGroup(box_q2_4, t_q2_4, verdict_q2_4)

        self.step(
            r'第 ⑤ 步找路径：删掉 $E$ 之后，$R$ 一条边也没有，成了孤立点（绿色方框绕它描了一圈），走不到 $A$。**$R$ 和 $A$ 之间没有路，所以给定 $E$ 时它们被 D-separated，$R\perp A\mid E$ 成立。**考试写 holds。直觉：电台报道和警报的共同原因是地震；地震已知后，电台报不报只取决于地震，和警报再无联系。',
            '⑤ 找路径：R 没有连边，无法到达 A ⇒ 条件独立成立！',
            stage=4,
        )
        self.play(
            Circumscribe(c_R2, color=GREEN, stroke_width=3.5),
            FadeIn(card_q2_4),
            run_time=1.1,
        )
        self.wait(1.5)

        # Takeaway
        self.takeaway(
            r'**判断 $X\perp Y\mid S$：取祖先图 → 父母结婚 → 去方向 → 删掉 $S$ → 看 $X$、$Y$ 是否还连通；有路就不保证独立，没路就独立成立。**问题一 $L\perp B\mid A$：$A$ 让 $E$—$B$ 结婚，删掉 $A$（结婚边 $R$—$A$ 也随之删掉）后仍有 $L$—$R$—$E$—$B$，不保证独立。问题二 $R\perp A\mid E$：$L$ 第一步就被删掉，$R$、$A$ 不结婚，删掉 $E$ 后 $R$ 孤立，独立成立。考试按这五步写，结论写 does not hold in general（并写出路径）或 holds。',
            [
                '祖先图 → 父母结婚 → 去方向 → 删条件 → 看连通',
                '问题一：A 让 E—B 结婚，删 A 后 L—R—E—B 仍连通 ⇒ 不保证独立',
                '问题二：L 被剔除，R、A 不结婚，删 E 后 R 孤立 ⇒ 独立成立',
                '有路径 ⇒ 不保证独立；断开 ⇒ 条件独立成立',
            ],
            hold=3.5,
        )
