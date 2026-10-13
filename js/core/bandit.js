(function (root) {
  'use strict';

  function argmax(values) {
    if (!values.length) return [];
    const maximum = Math.max.apply(null, values);
    return values.reduce((indices, value, i) => {
      if (value === maximum) indices.push(i);
      return indices;
    }, []);
  }

  /** L17 p18–p22: {n,s} arms and optional {t,rho,Q0,ln} -> UCB scores and all maximisers. */
  function ucb(arms, opts) {
    opts = opts || {};
    const t = opts.t === undefined ? arms.reduce((sum, arm) => sum + arm.n, 0) + 1 : opts.t;
    const rho = opts.rho === undefined ? 2 : opts.rho;
    const Q0 = opts.Q0 === undefined ? Infinity : opts.Q0;
    const lnT = opts.ln && Object.prototype.hasOwnProperty.call(opts.ln, t) ? opts.ln[t] : Math.log(t);
    const scores = arms.map(arm => {
      const mean = arm.n ? arm.s / arm.n : null;
      const bonus = arm.n ? Math.sqrt(rho * lnT / arm.n) : 0;
      return { n: arm.n, s: arm.s, mean, bonus, Q: arm.n ? mean + bonus : Q0 };
    });
    return { t, lnT, arms: scores, choice: argmax(scores.map(arm => arm.Q)) };
  }

  /** L17 p8–p9: {n,s} arms and initial Q0 -> indices maximising empirical reward. */
  function greedyChoice(arms, Q0) {
    if (Q0 === undefined) Q0 = Infinity;
    return argmax(arms.map(arm => arm.n ? arm.s / arm.n : Q0));
  }

  /** L17 p13: arms, epsilon, Q0 -> probabilities with uniform exploration and uniform greedy ties. */
  function epsGreedyProbs(arms, eps, Q0) {
    if (eps === undefined) eps = 0.1;
    if (eps < 0 || eps > 1) throw new Error('epsilon must lie in [0,1]');
    if (!arms.length) return [];
    const best = new Set(greedyChoice(arms, Q0));
    return arms.map((arm, i) => eps / arms.length + (best.has(i) ? (1 - eps) / best.size : 0));
  }

  function seededRng(seed) {
    let state = (seed === undefined ? 1 : seed) >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      let value = Math.imul(state ^ (state >>> 15), state | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** L17 p8–p22: seeded policy simulation -> {steps,choices,rewards,arms,totalReward}.
   * rewardFn(armIndex, mean, rng, round) overrides Bernoulli rewards; round is one-based.
   */
  function simulate(options) {
    const means = options.means, rounds = options.rounds;
    if (!means.length) throw new Error('at least one arm is required');
    const rng = seededRng(options.seed);
    const policy = options.policy || 'ucb';
    const arms = means.map(() => ({ n: 0, s: 0 }));
    const steps = [], choices = [], rewards = [];
    let totalReward = 0;
    for (let t = 1; t <= rounds; t++) {
      let choice, probabilities = null;
      if (policy === 'ucb' || policy === 'greedy') {
        const best = policy === 'ucb' ? ucb(arms, { t, rho: options.rho, Q0: options.Q0 }).choice : greedyChoice(arms, options.Q0);
        choice = best[Math.floor(rng() * best.length)];
      } else if (['epsGreedy', 'eps-greedy', 'epsilon-greedy', 'epsilonGreedy'].indexOf(policy) !== -1) {
        probabilities = epsGreedyProbs(arms, options.eps, options.Q0);
        const draw = rng();
        let cumulative = 0;
        choice = arms.length - 1;
        for (let i = 0; i < arms.length; i++) {
          cumulative += probabilities[i];
          if (draw < cumulative) { choice = i; break; }
        }
      } else {
        throw new Error('unknown policy: ' + policy);
      }
      const reward = options.rewardFn ? options.rewardFn(choice, means[choice], rng, t) : (rng() < means[choice] ? 1 : 0);
      arms[choice].n++;
      arms[choice].s += reward;
      totalReward += reward;
      choices.push(choice);
      rewards.push(reward);
      steps.push({ t, choice, reward, probabilities, arms: arms.map(arm => ({ n: arm.n, s: arm.s })) });
    }
    return { steps, choices, rewards, arms, totalReward };
  }

  const api = { ucb, greedyChoice, epsGreedyProbs, simulate };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.bandit = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
