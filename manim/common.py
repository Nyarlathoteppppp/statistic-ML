r"""Shared helpers for the site's Manim videos (3Blue1Brown style, no LaTeX on this machine).

Every scene subclasses StepScene and splits itself into steps:

    class Eigen(StepScene):
        ID = 'eigen'                      # file name: media/anim/eigen.mp4
        TITLE = '特征向量：……'
        def construct(self):
            self.step(r'Markdown 旁白（网页上显示，可用 $\\lambda$）', '视频里的短字幕')
            self.play(...)

`step()` records the start time of each step; render.py turns those into data/videos.js so the web page can
jump to a step, play one step and pause, and show the full caption (with KaTeX) under the video.

Text and maths: Chinese / plain labels with T() (PingFang); real formulas with M(r'\frac{\partial L}{\partial w_j}')
(MathTex, BasicTeX is installed). Never put Chinese inside M() (no CJK LaTeX packages). Small Unicode maths inside
T() is fine ('x₁', 'ψ₂₄'); letter subscripts inside T() via MT('w<sub>j</sub>') (subtitles too).
Place things with P(x, y) in a 640x360 px layout (y down, keep y <= 345) and px(n) for lengths.
"""
import json
import os

if os.path.isdir('/Library/TeX/texbin') and '/Library/TeX/texbin' not in os.environ.get('PATH', ''):
    os.environ['PATH'] = '/Library/TeX/texbin:' + os.environ.get('PATH', '')   # BasicTeX (latex, dvisvgm)

import numpy as np

from manim import (
    BackgroundRectangle, DOWN, FadeIn, FadeOut, LEFT, Line, MarkupText, MathTex, NORMAL, Rectangle, RIGHT, RoundedRectangle, Scene,
    Text, Transform, UP, VGroup, config,
)

FONT = 'PingFang SC'
BG = '#16171c'
BLUE = '#58C4DD'
YELLOW = '#F4D35E'
GREEN = '#83C167'
RED = '#FC6255'
TEAL = '#5CD0B3'
PURPLE = '#B189D9'
ORANGE = '#FF9F43'
GREY = '#7c8494'
WHITE = '#ECEFF4'
DIM = '#3a3f4b'
GRID = '#2c4a5c'
INK = '#16171c'          # text colour on light pills

config.background_color = BG

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIMINGS = os.path.join(SITE, 'manim', 'timings')


SC = 50.0       # px per Manim unit for P()
LIFT = 0.35     # stage is lifted so its bottom edge clears the subtitle bar


def P(x, y):
    """Layout coordinates in px (640x360 stage, origin top-left, y down) -> Manim point (y up).
    The stage maps to 12.8x7.2 units, centred horizontally and lifted above the subtitle bar,
    so the web layouts of js/viz/scenes_*.js can be reused. Keep content inside y <= 345."""
    return np.array([(x - 320) / SC, (180 - y) / SC + LIFT, 0.0])


def px(n):
    """A length in layout px -> Manim units (for radii, widths, offsets used with P())."""
    return n / SC


def T(s, size=28, color=WHITE, weight=NORMAL, **kw):
    """Chinese / Unicode text. Digit subscripts ₀–₉ and Greek are fine; for letter subscripts use MT()."""
    return Text(str(s), font=FONT, font_size=size, color=color, weight=weight, **kw)


def M(tex, size=34, color=WHITE, **kw):
    r"""A LaTeX formula (MathTex). Several strings → separately colourable parts: M(r'\hat\mu', '+', r'\sqrt{…}')."""
    parts = tex if isinstance(tex, (list, tuple)) else [tex]
    return MathTex(*parts, font_size=size, color=color, **kw)


def MT(s, size=28, color=WHITE, **kw):
    """Pango-markup text for real sub/superscripts: MT('∂L/∂w<sub>j</sub> = δ·u<sub>j</sub>').
    Escape a literal '<' or '&' as &lt; / &amp;."""
    sub = '<span size="70%%" rise="%d">' % -int(800 + 42 * size)     # tuned by eye for PingFang
    sup = '<span size="70%%" rise="%d">' % int(900 + 52 * size)
    s = str(s).replace('<sub>', sub).replace('<sup>', sup).replace('</sub>', '</span>').replace('</sup>', '</span>')
    return MarkupText(s, font=FONT, font_size=size, color=color, **kw)


def mat(rows, size=30, color=WHITE, hbuff=0.5, vbuff=0.22):
    """A bracketed matrix built from Text (no LaTeX). rows: list of lists of str/numbers."""
    cells = VGroup(*[T(v, size, color) for r in rows for v in r])
    cells.arrange_in_grid(rows=len(rows), cols=len(rows[0]), buff=(hbuff, vbuff))
    h = cells.height + 0.25
    def bracket(sign):
        v = Line(UP * h / 2, DOWN * h / 2, color=color, stroke_width=2.5)
        t = Line(UP * h / 2, UP * h / 2 + RIGHT * 0.12 * sign, color=color, stroke_width=2.5)
        b = Line(DOWN * h / 2, DOWN * h / 2 + RIGHT * 0.12 * sign, color=color, stroke_width=2.5)
        return VGroup(v, t, b)
    lb = bracket(1).next_to(cells, LEFT, buff=0.12)
    rb = bracket(-1).next_to(cells, RIGHT, buff=0.12)
    return VGroup(lb, cells, rb)


def pill(s, fill=YELLOW, color=INK, size=24):
    """A rounded label, e.g. a message (4,2) travelling along an edge."""
    t = T(s, size, color)
    box = RoundedRectangle(corner_radius=0.12, width=t.width + 0.3, height=t.height + 0.2,
                           fill_color=fill, fill_opacity=1, stroke_width=0)
    return VGroup(box, t.move_to(box))


class StepScene(Scene):
    ID = None
    TITLE = ''
    FLOW = None      # stage names of the whole process, shown as a bar at the top (keep layout y >= 40 px)

    def setup(self):
        self.steps = []
        self._cap = None
        self._flow = None

    def step(self, say, short=None, stage=None):
        """Start a new step: remember its start time; optionally show a short on-screen caption and move the
        process bar to FLOW[stage]."""
        self.steps.append({'t': round(self.renderer.time, 2), 'say': say})
        if stage is not None:
            self.flow(stage)
        if short is not None:
            self.caption(short)

    def flow(self, i):
        """Highlight stage i of the process bar (done stages light, current yellow and boxed, later ones dim)."""
        if not self.FLOW:
            return
        if self._flow is None:
            items = []
            for k, name in enumerate(self.FLOW):
                if k:
                    items.append(T('→', 16, GREY))
                items.append(T(name, 17, '#4a5060'))
            row = VGroup(*items).arrange(RIGHT, buff=0.16)
            if row.width > 13:
                row.scale_to_fit_width(13)
            row.to_edge(UP, buff=0.14)
            self._names = [m for m in items if m.text != '→']
            box = RoundedRectangle(corner_radius=0.08, width=0.1, height=0.1, stroke_color=YELLOW, stroke_width=2,
                                   fill_opacity=0).move_to(self._names[0])
            bg = BackgroundRectangle(row, color=BG, fill_opacity=0.85, buff=0.1)
            self._flow = VGroup(bg, row, box).set_z_index(10)
            self._flow_box = box
            self.play(FadeIn(bg), FadeIn(row), run_time=0.5)
            self.add(box.set_z_index(11))
        cur = self._names[i]
        target = RoundedRectangle(corner_radius=0.08, width=cur.width + 0.22, height=cur.height + 0.16,
                                  stroke_color=YELLOW, stroke_width=2, fill_opacity=0).move_to(cur)
        anims = [n.animate.set_color(YELLOW if k == i else '#b8c0cc' if k < i else '#4a5060')
                 for k, n in enumerate(self._names)]
        self.play(*anims, Transform(self._flow_box, target), run_time=0.45)

    def caption(self, text):
        t = MT(text, 22) if '<sub>' in text or '<sup>' in text else T(text, 22)
        if t.width > 13:
            t.scale_to_fit_width(13)
        t.to_edge(DOWN, buff=0.22)
        g = VGroup(BackgroundRectangle(t, color=BG, fill_opacity=0.88, buff=0.12), t).set_z_index(10)
        if self._cap is None:
            self.play(FadeIn(g), run_time=0.35)
        else:
            self.play(FadeOut(self._cap), FadeIn(g), run_time=0.35)
        self._cap = g

    def _lines(self, lines, big=34, small=26):
        rows = []
        for i, l in enumerate(lines):
            size, color = (big, YELLOW) if i == 0 else (small, WHITE)
            rows.append(MT(l, size, color) if '<sub>' in l or '<sup>' in l else T(l, size, color))
        g = VGroup(*rows).arrange(DOWN, buff=0.32)
        if g.width > 12.4:
            g.scale_to_fit_width(12.4)
        return g

    def question(self, say, lines, hold=2.6):
        """Opening card: the question this video answers (why the idea is needed). Call first in construct()."""
        self.step(say)
        g = self._lines(lines)
        self.play(FadeIn(g, shift=UP * 0.2), run_time=0.8)
        self.wait(hold)
        self.play(FadeOut(g, shift=UP * 0.2), run_time=0.5)

    def takeaway(self, say, lines, hold=3.5):
        """Closing card over a dimmed scene: one-sentence idea (yellow) + the formula / rule it boils down to."""
        self.step(say)
        veil = Rectangle(width=config.frame_width + 1, height=config.frame_height + 1, fill_color=BG,
                         fill_opacity=0.95, stroke_width=0).set_z_index(9)
        g = self._lines(lines, 32, 26).set_z_index(11)
        out = [FadeOut(self._cap)] if self._cap is not None else []
        self._cap = None
        self.play(*out, FadeIn(veil), run_time=0.6)
        if self._flow is not None:          # recap: the whole process lights up above the veil
            self.add(self._flow)
            self.play(*[n.animate.set_color(WHITE) for n in self._names], FadeOut(self._flow_box), run_time=0.6)
        g.shift(DOWN * 0.2)
        for m in g:
            self.play(FadeIn(m, shift=UP * 0.15), run_time=0.5)
        self.wait(hold)

    def tear_down(self):
        if not self.ID:
            return
        os.makedirs(TIMINGS, exist_ok=True)
        with open(os.path.join(TIMINGS, self.ID + '.json'), 'w', encoding='utf-8') as f:
            json.dump({'id': self.ID, 'title': self.TITLE, 'dur': round(self.renderer.time, 2), 'steps': self.steps},
                      f, ensure_ascii=False, indent=1)
