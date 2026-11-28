#!/usr/bin/env python3
"""Sound design 20 s — sec, tactile, family-friendly. 48 kHz stereo, deterministic (seed fixe)."""
import math, random, wave, os
from array import array

SR = 48000; DUR = 20.0; N = int(SR*DUR)
rng = random.Random(20261128)
L = [0.0]*N; R = [0.0]*N

def add(t, buf, gain=1.0, pan=0.0):
    s = int(round(t*SR)); gl = gain*(1.0-pan); gr = gain*(1.0+pan)
    for i, v in enumerate(buf):
        j = s+i
        if 0 <= j < N:
            L[j] += v*gl; R[j] += v*gr

def pop(dur=0.055, f=2200):
    M = int(SR*dur); out = []
    for i in range(M):
        u = i/M; env = math.exp(-u*18)
        out.append((0.55*math.sin(2*math.pi*f*i/SR) + 0.22*math.sin(2*math.pi*f*1.7*i/SR) + 0.30*rng.uniform(-1,1))*env)
    return out

def thump(dur=0.16, f0=110, f1=48):
    M = int(SR*dur); out = []; ph = 0.0
    for i in range(M):
        u = i/M; f = f0+(f1-f0)*u; ph += 2*math.pi*f/SR
        out.append((0.72*math.sin(ph) + 0.18*rng.uniform(-1,1))*math.exp(-u*7.5))
    return out

def snap(dur=0.075):
    M = int(SR*dur); lp = 0.0; out = []
    for i in range(M):
        u = i/M; n = rng.uniform(-1,1); a = 1-math.exp(-2*math.pi*6500/SR); lp += a*(n-lp)
        out.append(lp*math.exp(-u*14)*0.85)
    return out

def whoosh(dur=0.42, rise=True, bright=1.0):
    M = int(SR*dur); lp = 0.0; hp = 0.0; prev = 0.0; out = []
    for i in range(M):
        u = i/M; n = rng.uniform(-1,1)
        cut = 500+4200*(u if rise else 1-u)
        a = 1-math.exp(-2*math.pi*cut/SR); lp += a*(n-lp)
        hp = 0.92*(hp+lp-prev); prev = lp
        env = math.sin(math.pi*u)**1.6
        out.append((hp*0.65 + 0.12*math.sin(2*math.pi*(320+500*u)*i/SR)*bright)*env)
    return out

def tick(dur=0.05, f=1600):
    M = int(SR*dur); out = []
    for i in range(M):
        u = i/M; env = math.exp(-u*22)
        out.append((0.5*math.sin(2*math.pi*f*i/SR) + 0.4*rng.uniform(-1,1))*env)
    return out

def bell(dur=0.9, f=880.0):
    """Cloche douce, partiels non harmoniques contrôlés — papier/verre, pas de cloche d'église."""
    M = int(SR*dur); out = []
    parts = [(1.0, 1.0, 1.6), (2.76, 0.42, 3.1), (5.4, 0.22, 4.6), (8.9, 0.11, 6.2)]
    for i in range(M):
        u = i/M; t = i/SR; s = 0.0
        for r, a, d in parts:
            s += a*math.sin(2*math.pi*f*r*t)*math.exp(-t*d)
        out.append(s*math.exp(-t*1.4)*math.sin(math.pi*min(1, u*24)))
    return out

def coin(dur=0.5):
    M = int(SR*dur); out = []
    for i in range(M):
        u = i/M; t = i/SR
        env = math.exp(-t*7.5)
        s = (0.45*math.sin(2*math.pi*2637*t) + 0.28*math.sin(2*math.pi*3951*t) + 0.16*math.sin(2*math.pi*5274*t))
        out.append(s*env)
    return out

def shimmer(dur=0.62):
    M = int(SR*dur); out = []
    fs = [880, 1174.66, 1567.98, 2093.0]
    for i in range(M):
        u = i/M; t = i/SR; env = math.sin(math.pi*u)**1.3*math.exp(-u*1.4)
        s = sum(0.20*math.sin(2*math.pi*f*t + 0.5*math.sin(2*math.pi*(2.5+k)*t)) for k, f in enumerate(fs))
        out.append(s*env)
    return out

def chord(dur=1.6):
    """Résolution chaleureuse F–A–C–E (Fmaj7), légère ouverture stéréo gérée par pan."""
    M = int(SR*dur); out = []
    fs = [174.61, 220.0, 261.63, 329.63]
    for i in range(M):
        u = i/M; t = i/SR
        env = math.sin(math.pi*min(1, u*1.4))**1.1*math.exp(-u*1.7)
        s = sum(0.22*math.sin(2*math.pi*f*t + 0.25*math.sin(2*math.pi*1.1*t)) for f in fs)
        out.append(s*env)
    return out

def riser(dur=0.9):
    M = int(SR*dur); out = []; lp = 0.0
    for i in range(M):
        u = i/M; n = rng.uniform(-1,1)
        cut = 400+6000*u**2
        a = 1-math.exp(-2*math.pi*cut/SR); lp += a*(n-lp)
        env = u**2.2
        out.append((lp*0.8 + 0.10*math.sin(2*math.pi*(180+900*u)*i/SR))*env)
    return out

# ---------- S1 0.00–1.80 ----------
add(0.04, pop(0.05, 2400), 0.40)
add(0.04, thump(0.10, 150, 70), 0.16)
add(0.30, thump(0.18, 125, 52), 0.40)
add(0.30, snap(0.065), 0.24, pan=-0.05)
add(0.12, whoosh(0.30, True, 0.9), 0.14, pan=0.10)
add(0.70, tick(0.045, 1900), 0.16, pan=-0.08)
add(1.18, bell(0.75, 1046.5), 0.18, pan=0.06)
add(1.60, whoosh(0.34, False, 1.2), 0.24, pan=0.10)

# ---------- S2 1.80–4.20 · 10 leçons ----------
add(1.80, whoosh(0.42, True, 1.3), 0.22, pan=-0.10)
add(1.86, thump(0.14, 110, 58), 0.20)
for k in range(10):
    add(1.98 + 0.05*k, tick(0.038, 1500+40*k), 0.075, pan=(-0.35+0.078*k))
add(2.30, shimmer(0.55), 0.10, pan=0.04)
add(3.96, riser(0.30), 0.16)
add(4.00, whoosh(0.26, False, 1.1), 0.20, pan=0.08)

# ---------- S3 4.20–6.80 · besoin / envie ----------
add(4.20, whoosh(0.40, True, 1.2), 0.24, pan=0.06)
add(4.34, pop(0.045, 1700), 0.24, pan=-0.12)
add(4.42, pop(0.045, 2100), 0.24, pan=0.12)
for k in range(3):
    add(4.72 + 0.07*k, tick(0.035, 1700), 0.10, pan=-0.18)
for k in range(3):
    add(4.80 + 0.07*k, tick(0.035, 2000), 0.10, pan=0.18)
add(5.36, bell(0.55, 1318.5), 0.16)
add(6.02, pop(0.035, 2600), 0.14)
add(6.54, whoosh(0.28, False, 1.0), 0.18)

# ---------- S4 6.80–9.40 · 3 enveloppes ----------
add(6.80, whoosh(0.40, True, 1.25), 0.24, pan=-0.06)
for k in range(3):
    add(7.06 + 0.09*k, snap(0.06), 0.20, pan=(-0.16+0.16*k))
    add(7.06 + 0.09*k, thump(0.12, 105, 55), 0.13)
for k in range(12):
    add(7.40 + 0.11*k, coin(0.20), 0.055, pan=(-0.30+0.055*k))
add(8.34, coin(0.35), 0.07, pan=-0.14)
add(8.40, coin(0.40), 0.075, pan=0.14)
add(9.14, whoosh(0.26, False, 1.0), 0.18)

# ---------- S5 9.40–11.90 · épargne projet ----------
add(9.40, whoosh(0.40, True, 1.2), 0.22, pan=0.08)
add(9.62, bell(0.85, 880.0), 0.16, pan=-0.04)
add(9.94, shimmer(0.85), 0.12, pan=0.02)
for k in range(14):
    add(9.96 + 0.10*k, coin(0.18), 0.042, pan=(0.24-0.03*k))
for k in range(3):
    add(10.02 + 0.14*k, tick(0.04, 1450+120*k), 0.10, pan=0.20)
add(10.72, pop(0.04, 2000), 0.12)
add(11.64, whoosh(0.26, False, 1.0), 0.18)

# ---------- S6 11.90–14.40 · réfléchir ----------
add(11.90, whoosh(0.40, True, 1.2), 0.22, pan=-0.06)
for k, t in enumerate([12.16, 12.48, 12.80]):
    add(t, pop(0.045, 1500+300*k), 0.26, pan=(-0.12+0.12*k))
    add(t, snap(0.05), 0.12, pan=(-0.12+0.12*k))
add(12.34, tick(0.035, 2400), 0.10, pan=-0.05)
add(12.66, tick(0.035, 2400), 0.10, pan=0.05)
add(13.14, bell(0.70, 1174.66), 0.14)
add(14.14, whoosh(0.28, False, 1.0), 0.18)

# ---------- S7 14.40–16.80 · facts ----------
add(14.40, whoosh(0.38, True, 1.1), 0.20, pan=0.06)
for k in range(4):
    add(14.56 + 0.08*k, tick(0.045, 1350+180*k), 0.14, pan=(-0.26+0.174*k))
add(15.10, pop(0.035, 2500), 0.10)
add(15.26, shimmer(0.45), 0.09)
add(16.54, whoosh(0.28, False, 1.0), 0.18)

# ---------- S8 16.80–20.00 · outro + hold ----------
add(16.80, whoosh(0.46, True, 1.3), 0.24, pan=-0.04)
add(16.84, thump(0.18, 120, 50), 0.22)
add(16.86, chord(2.20), 0.24, pan=0.02)
add(17.06, bell(1.00, 880.0), 0.16, pan=-0.10)
add(17.28, bell(0.95, 1108.73), 0.12, pan=0.10)
add(17.62, pop(0.05, 1900), 0.34)
add(17.62, snap(0.055), 0.16)
add(17.86, shimmer(0.60), 0.10)
add(19.00, chord(0.95), 0.10)

peak = max(max(abs(x) for x in L), max(abs(x) for x in R))
if peak > 0:
    sc = 0.92/peak
    L = [x*sc for x in L]; R = [x*sc for x in R]
rms = math.sqrt(sum(x*x for x in L+R)/(2*N))
target = 10**(-17.0/20)
g = target/rms if rms > 0 else 1.0
L = [math.tanh(x*g*1.05)*0.94 for x in L]
R = [math.tanh(x*g*1.05)*0.94 for x in R]

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/audio/leo-lea.wav')
wf = wave.open(out, 'wb'); wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
buf = array('h')
for i in range(N):
    buf.append(int(max(-1, min(1, L[i]))*32767)); buf.append(int(max(-1, min(1, R[i]))*32767))
wf.writeframes(buf.tobytes()); wf.close()
print('wav', out, os.path.getsize(out), 'bytes', DUR, 's', 'rms_in', round(rms, 4), 'gain', round(g, 3))
