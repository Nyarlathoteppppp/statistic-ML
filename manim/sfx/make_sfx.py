"""Synthesise the videos' soft UI sounds (44.1 kHz mono WAV), so no third-party audio is needed.

    <venv>/bin/python manim/sfx/make_sfx.py

tick  new step (very quiet click)          pop   something is highlighted (Indicate, Flash, ...)
good  a check passes / a slot is filled    bad   a mistake / a duplicate
card  question or takeaway card appears (soft three-note chord)
"""
import os
import wave

import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))


def env(n, attack=0.004, tau=0.05):
    t = np.arange(n) / SR
    a = np.minimum(1.0, t / attack)
    return a * np.exp(-t / tau)


def tone(freq, dur, tau, attack=0.004, harm=0.15, glide=None):
    """A sine (optionally gliding to `glide` Hz) with a little second harmonic and an exponential decay."""
    n = int(SR * dur)
    f = np.full(n, float(freq)) if glide is None else np.geomspace(freq, glide, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + harm * np.sin(2 * ph)
    return y * env(n, attack, tau)


def place(parts, dur):
    out = np.zeros(int(SR * dur))
    for start, y in parts:
        i = int(SR * start)
        out[i:i + len(y)] += y[:len(out) - i]
    return out


def save(name, y, peak_db=-3.0):
    y = y / (np.max(np.abs(y)) + 1e-9) * 10 ** (peak_db / 20)
    fade = int(SR * 0.004)
    y[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(HERE, name + '.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((y * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    save('tick', tone(1500, 0.07, 0.012, attack=0.001, harm=0.3))
    save('pop', tone(900, 0.11, 0.035, attack=0.002, glide=520))
    save('good', place([(0.0, tone(880.0, 0.22, 0.07)), (0.08, tone(1318.5, 0.32, 0.11))], 0.42))
    save('bad', tone(240, 0.2, 0.07, attack=0.003, harm=0.35, glide=170))
    save('card', place([(0.0, tone(523.25, 0.9, 0.35, attack=0.015)), (0.06, tone(659.25, 0.85, 0.32, attack=0.015)),
                        (0.12, tone(783.99, 0.8, 0.3, attack=0.015))], 1.0))
    print('wrote', sorted(f for f in os.listdir(HERE) if f.endswith('.wav')))
