/* 简答题"必背关键词"：考场上先写出这 3 个词，再连成两句话。匹配 T13 的真题（按 src）和预测题（按题干开头）。 */
(function (root) {
  'use strict';
  const SML = root.SML;

  const PAST = {
    '2026 Q1a / 2025 Q1a': ['sum of squared residuals', 'least squares', 'MLE under Gaussian noise'],
    '2026 Q1b / 2025 Q1b': ['integrate out the parameters', 'weighted by the prior', 'normaliser (evidence) of Bayes’ rule'],
    '2025 Q1c': ['conditionally independent given C', 'C known ⇒ B adds no information about A', 'not marginal independence'],
    '2021 Q1': ['unrolled over time', 'depth = sequence length', 'shared weights'],
    '2021 Q2': ['functional margin = 1', 'canonical scaling of (w, b)', 'distance = 1/‖w‖'],
    '2021 Q3': ['dual cost grows with n', 'primal grows with feature dimension O(m²)', 'n ≫ m² ⇒ primal'],
    '2021 Q4': ['hidden layer = basis φ(x)', 'linear model on top', 'basis is learned, not fixed'],
    '2021 Q5': ['point estimate', 'ignores uncertainty', 'over-confident / high variance'],
    '2021 Q6': ['flexible models fit noise', 'higher training likelihood ≠ better', 'use held-out data or evidence'],
    '2021 Q7': ['velocity accumulates gradients', 'moves through flat regions / saddles', 'damps oscillations'],
    '2021 Q8': ['little or noisy data', 'variance reduction > bias increase', 'regularisation'],
    '2021 Q9': ['memorises training examples', 'trivial / arbitrary code', 'no useful structure'],
    '2021 Q10': ['conjugacy ⇒ closed-form posterior', 'MAP only needs the mode', 'evidence p(D) not needed'],
    '2021 Q11': ['σ² constant', 'x*′V_N x* depends on x*', 'larger where data are sparse'],
    '2021 Q13(a)': ['p(θ) ∝ exp(−λ r(θ))', '−log posterior = loss + const', 'L2 ↔ Gaussian, L1 ↔ Laplace'],
  };
  const PRED = [
    ['What is the difference between MLE and MAP', ['likelihood vs posterior', 'MAP adds log prior', 'uniform prior ⇒ equal']],
    ['Why does ridge regression help', ['X′X singular', 'add λI ⇒ invertible', 'unique, stable solution']],
    ['Lasso vs ridge', ['L1 ⇒ exact zeros (sparse)', 'L2 shrinks smoothly', 'ridge has closed form']],
    ['State the bias–variance decomposition', ['bias² + variance + noise', 'complex ⇒ low bias, high variance', 'regularisation trades them']],
    ['Why use gradient descent / Newton', ['no closed form', 'Newton uses Hessian, fewer iterations', 'O(d³) per step']],
    ['Why is linear regression with squared loss', ['penalises confident correct points', 'outliers pull the boundary', 'logistic outputs probabilities']],
    ['What does the finite-class generalisation bound', ['holds with prob ≥ 1−δ', 'grows with log|F|', 'shrinks like 1/√n']],
    ['Why can’t we use', ['infinitely many classifiers', 'finitely many dichotomies on n points', 'VC dimension replaces log|F|']],
    ['What is structural risk minimisation', ['empirical risk + complexity penalty', 'choose the class', 'fit vs capacity']],
    ['What is the kernel trick', ['algorithm uses only dot products', 'replace by K = φ′φ', 'never compute φ']],
    ['How can you show a function is a valid kernel', ['explicit feature map', 'closure rules', 'PSD Gram matrix (Mercer)']],
    ['What role does $C$ play', ['weight on slack / hinge loss', 'large C ⇒ near hard margin', 'inverse of regularisation']],
    ['Which training points determine the SVM solution', ['support vectors only', 'complementary slackness λᵢ>0', 'w = Σ λᵢyᵢxᵢ']],
    ['When does the perceptron converge', ['linearly separable', 'finite updates ≤ R²/γ²', 'otherwise cycles forever']],
    ['Why do neural networks need non-linear activation', ['composition of linear maps is linear', 'non-linearity adds expressiveness', 'universal approximation']],
    ['What is the vanishing gradient problem', ['repeated multiplication through time', 'spectral radius < 1 vanishes / > 1 explodes', 'LSTM gated copy']],
    ['What is attention / self-attention', ['weighted average of hidden states', 'softmax relevance weights', 'self-attention: parallel, no recurrence']],
    ['Name ways to regularise deep networks', ['weight decay', 'early stopping', 'dropout']],
    ['How does an autoencoder relate to PCA', ['reconstruct input via bottleneck', 'linear AE ≈ PCA', 'non-linear AE captures curved structure']],
    ['Why must feature selection', ['information leakage', 'optimistic estimate', 'select inside each training fold']],
    ['Why report variance', ['difference may be noise', 'compare means and variances', 't-test / error bars']],
    ['What is the key difference between learning with experts', ['experts: full feedback', 'bandit: only chosen arm', 'bandit must explore']],
    ['Why does the halving / weighted-majority', ['no perfect expert ⇒ all would be dropped', 'down-weight instead', '≈ 2m + O(log n) mistakes']],
    ['What is a conjugate prior', ['posterior in same family as prior', 'closed-form update', 'Beta–Binomial, Normal–Normal']],
    ['Why is Bayesian logistic regression harder', ['no conjugate prior', 'no closed-form posterior', 'Monte Carlo / variational / Laplace']],
    ['Generative vs discriminative', ['generative models P(x, y)', 'discriminative models P(y | x)', 'naive Bayes vs logistic regression']],
    ['Why are graphical models useful', ['full joint needs 2ⁿ−1 parameters', 'factorise into small CPTs', 'read independences from the graph']],
    ['What does belief propagation compute', ['marginals of all nodes', 'leaves → root, then root → leaves', 'message = Σ potential × incoming messages']],
    ['Why does the elimination order matter', ['order ⇒ fill-in ⇒ cliques', 'cost exponential in largest clique', 'optimal order hard; greedy smallest clique']],
    ['BN vs MRF', ['DAG + conditionals vs undirected + potentials', 'D-separation vs plain separation', 'neither subsumes the other']],
  ];

  const tag = (keys) => '**必背关键词**：' + keys.map((k) => '`' + k + '`').join(' · ');
  const page = SML.content.get('T13');
  if (!page) return;
  const walk = (blocks) => (blocks || []).forEach((b) => {
    if (!b || typeof b !== 'object') return;
    if (b.t === 'past' && PAST[b.src] && Array.isArray(b.sol)) b.sol.unshift({ t: 'good', title: '先背这 3 个词', md: tag(PAST[b.src]) });
    if (b.t === 'quiz') b.items.forEach((it) => {
      const hit = PRED.find(([prefix]) => typeof it.q === 'string' && it.q.indexOf(prefix) === 0);
      if (hit) it.explain = tag(hit[1]) + (it.explain ? '\n\n' + it.explain : '');
    });
  });
  walk(page.blocks);
  page.blocks.splice(1, 0, {
    t: 'note', title: '怎么用关键词',
    md: '每道题都标了 **3 个必背关键词**。考场上先把这 3 个词写下来，再用最简单的英文连成两句话（例如 *X is …, because …*），就能拿到大部分分数。整段英文答案是参考，不需要逐字背。',
  });
})(window);
