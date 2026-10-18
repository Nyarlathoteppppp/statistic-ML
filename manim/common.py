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
import re

if os.path.isdir('/Library/TeX/texbin') and '/Library/TeX/texbin' not in os.environ.get('PATH', ''):
    os.environ['PATH'] = '/Library/TeX/texbin:' + os.environ.get('PATH', '')   # BasicTeX (latex, dvisvgm)

import numpy as np

from manim import (
    BackgroundRectangle, Circumscribe, DOWN, FadeIn, FadeOut, Flash, FocusOn, Indicate, LEFT, Line, MarkupText, MathTex,
    NORMAL, Rectangle, RIGHT, RoundedRectangle, Scene, SingleStringMathTex, Text, Transform, UP, VGroup, Wiggle, config,
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

# Pacing. The videos have no voice-over, so every step must leave enough still time to read what it puts on screen:
# after a new subtitle a short lead (read most of it before anything moves), and at the end of the step enough still
# time for the rest of the subtitle plus the new labels/cards (padding is added to the step's last frame).
CPS = float(os.environ.get('SML_CPS', '4.5'))    # reading speed in units per second (one Chinese character = 1 unit)
PACE = os.environ.get('SML_PACE', '1') != '0'   # SML_PACE=0: the scene's own timing, no padding (for comparison)
LEAD_FRAC, LEAD_MAX = 0.6, 3.0                   # lead after a new subtitle: this share of its reading time, capped
TEXT_FRAC = 0.8                                  # new on-screen text is partly read while it fades in
HOLD = 1.0                                       # a last look at the finished frame
TEXT_CAP = 10.0                                  # at most this much padding for new text (⏭ pauses at step end anyway)
PACE_LOG = os.environ.get('SML_PACE_LOG')        # optional dir: per-step reading stats as <ID>.json

# Sound: soft UI cues made by manim/sfx/make_sfx.py. step() ticks, Indicate/Flash/… pop, cards chime; scenes can call
# self.sfx('good' | 'bad' | 'pop' | 'tick') for moments with a meaning. SML_SOUND=0 renders silent.
SFX_DIR = os.path.join(SITE, 'manim', 'sfx')
SOUND = os.environ.get('SML_SOUND', '1') != '0'
SFX_BOOST = 8.0                                  # dB added to every cue (peaks end near -14 dBFS)
POP_ANIMS = (Indicate, Flash, Circumscribe, Wiggle, FocusOn)
_TAG = re.compile(r'<[^>]+>')


def read_units(s):
    """Reading load of a string: a Chinese character 1, punctuation 0.3, any other visible character 0.4."""
    u = 0.0
    for ch in _TAG.sub('', str(s)):
        if '\u4e00' <= ch <= '\u9fff':
            u += 1.0
        elif ch.isspace():
            continue
        elif ch in '，。；：、（）“”！？,.;:()':
            u += 0.3
        else:
            u += 0.4
    return u


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
        self._st = None          # reading stats of the running step
        self._log = []
        self._pop_at = -9.0

    def step(self, say, short=None, stage=None):
        """Start a new step: pad the previous one to its reading time, remember the start time, optionally show a
        short on-screen caption (then a lead pause to read it) and move the process bar to FLOW[stage]."""
        self._finish_step()
        self.steps.append({'t': round(self.renderer.time, 2), 'say': say})
        self._st = {'t': self.renderer.time, 'cap': read_units(short) if short else 0.0, 'anim': 0.0, 'still': 0.0,
                    'lead': 0.0, 'texts': self._texts()}
        if short is not None:
            self.sfx('tick', -22)
        if stage is not None:
            self.flow(stage)
        if short is not None:
            self.caption(short)
            if PACE:
                self._st['lead'] = min(LEAD_MAX, LEAD_FRAC * self._st['cap'] / CPS)
                self.wait(self._st['lead'])

    # ---- pacing -------------------------------------------------------------------------------------------------
    def _texts(self):
        """(kind, string, reading units) of every text/formula on screen except the process bar and the caption."""
        chrome = {id(m) for g in (self._flow, self._cap) if g is not None for m in g.get_family()}
        out = set()
        for top in self.mobjects:
            for m in top.get_family():
                if id(m) in chrome:
                    continue
                if isinstance(m, (Text, MarkupText)):
                    out.add(('t', m.text, read_units(m.text)))
                elif isinstance(m, SingleStringMathTex):
                    out.add(('m', m.get_tex_string(), 0.4 * len(m.family_members_with_points())))
        return out

    def _finish_step(self):
        """Hold the step's last frame until its subtitle and new on-screen text have had time to be read."""
        st, self._st = self._st, None
        if st is None:
            return
        new = sum(u for _, _, u in self._texts() - st['texts'])
        need = max(0.0, st['cap'] / CPS - st['lead']) + min(TEXT_CAP, TEXT_FRAC * new / CPS) + HOLD
        pad = max(0.0, need - (st['still'] - st['lead'])) if PACE else 0.0
        if pad > 0.05:
            Scene.wait(self, pad)
        self._log.append({'t': round(st['t'], 2), 'cap': round(st['cap'], 1), 'text': round(new, 1),
                          'anim': round(st['anim'], 2), 'still': round(st['still'], 2), 'lead': round(st['lead'], 2),
                          'pad': round(pad, 2)})

    def play(self, *args, **kwargs):
        if (self._st is not None and any(isinstance(a, POP_ANIMS) for a in args)
                and self.renderer.time - self._pop_at > 0.35):
            self._pop_at = self.renderer.time
            self.sfx('pop', -20)
        t0 = self.renderer.time
        super().play(*args, **kwargs)
        if self._st is not None:
            self._st['anim'] += self.renderer.time - t0

    def wait(self, duration=1.0, stop_condition=None, frozen_frame=None):
        t0 = self.renderer.time
        super().wait(duration, stop_condition=stop_condition, frozen_frame=frozen_frame)
        if self._st is not None:
            self._st['still'] += self.renderer.time - t0

    def sfx(self, name, gain=-16):
        """Play manim/sfx/<name>.wav now (tick, pop, good, bad, card)."""
        if SOUND:
            self.add_sound(os.path.join(SFX_DIR, name + '.wav'), gain=gain + SFX_BOOST)
        if name != 'tick':
            self._pop_at = self.renderer.time      # no automatic pop on top of a cue the scene chose

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
        self.sfx('card', -18)
        self.play(FadeIn(g, shift=UP * 0.2), run_time=0.8)
        if PACE:
            hold = max(hold, sum(read_units(l) for l in lines) / CPS + HOLD)
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
        self.sfx('card', -16)
        for m in g:
            self.play(FadeIn(m, shift=UP * 0.15), run_time=0.5)
        if PACE:      # the lines fade in one by one (0.5 s each); the rest of the reading happens on the held card
            hold = max(hold, sum(read_units(l) for l in lines) / CPS + 1.5 - 0.5 * len(lines))
        self.wait(hold)
        self._st = None

    def tear_down(self):
        if not self.ID:
            return
        if PACE_LOG:
            os.makedirs(PACE_LOG, exist_ok=True)
            with open(os.path.join(PACE_LOG, self.ID + '.json'), 'w', encoding='utf-8') as f:
                json.dump({'id': self.ID, 'dur': round(self.renderer.time, 2), 'steps': self._log}, f, indent=1)
        if os.environ.get('SML_NO_TIMINGS'):
            return
        os.makedirs(TIMINGS, exist_ok=True)
        with open(os.path.join(TIMINGS, self.ID + '.json'), 'w', encoding='utf-8') as f:
            json.dump({'id': self.ID, 'title': self.TITLE, 'dur': round(self.renderer.time, 2), 'steps': self.steps},
                      f, ensure_ascii=False, indent=1)
