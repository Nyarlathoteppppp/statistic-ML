/* Closed-book formula sheet, by priority. ★★★ = used directly in past papers. */
(function (root) {
  'use strict';
  const T = String.raw;
  const row = (name, tex, src) => [name, '$' + tex + '$', src];

  root.SML.content.add({
    id: 'formulas',
    title: '闭卷必背公式',
    lead: '考试闭卷、没有计算器。官方说复杂公式考试会给（Ed #164，样子见 2026 practice 卷），但下面这些是解题时要自己会写、会用的。★★★ 是往年卷直接用到的，先背这些。每条后面是课件出处。',
    blocks: [
      { t: 'h2', text: '★★★ 往年卷直接用到', id: 'p3' },
      {
        t: 'table', head: ['名称', '公式', '出处'], rows: [
          row('线性回归目标', T`\hat{\bw}=\argmin_{\bw}\sum_{i=1}^n (y_i-\bw'\bx_i)^2`, 'L03 p6'),
          row('正规方程', T`\hat{\bw}=(\bX'\bX)^{-1}\bX'\by`, 'L03 p17'),
          row('边缘似然 / evidence', T`p(\by\mid\bX)=\int p(\by\mid\bX,\bw)\,p(\bw)\,d\bw`, 'L02 p22（离散求和形式）, L18 p15'),
          row('Bayes rule', T`p(\theta\mid D)=\dfrac{p(D\mid\theta)\,p(\theta)}{p(D)}`, 'L02 p22'),
          row('Shattered', T`|\mathcal F(\mathcal X)|=2^{|\mathcal X|}`, 'L07 p23'),
          row('VC dimension', T`\VC(\mathcal F)=\max\{n: S_{\mathcal F}(n)=2^n\}`, 'L07 p23'),
          row('UCB', T`Q_{t-1}(i)=\hat\mu_{t-1}(i)+\sqrt{\dfrac{2\ln t}{N_{t-1}(i)}}`, 'L17 p18'),
          row('Hard-margin SVM', T`\min_{\bw,b}\tfrac12\|\bw\|^2\ \text{s.t.}\ y_i(\bw'\bx_i+b)\ge1`, 'L08 p21'),
          row('点到超平面距离', T`\dfrac{|\bw'\bx+b|}{\|\bw\|};\ \ \text{分对时}=\dfrac{y_i(\bw'\bx_i+b)}{\|\bw\|}`, 'L08 p16–p17'),
          row('Soft-margin SVM', T`\min\tfrac12\|\bw\|^2+C\sum_i\xi_i\ \text{s.t.}\ y_i(\bw'\bx_i+b)\ge1-\xi_i,\ \xi_i\ge0`, 'L08 p34'),
          row('Hinge loss', T`\max\big(0,\,1-y_i(\bw'\bx_i+b)\big)`, 'L08 p32'),
          row('SVM dual', T`\max_{\lambda}\sum_i\lambda_i-\tfrac12\sum_i\sum_j\lambda_i\lambda_jy_iy_jK(\bx_i,\bx_j)`, 'L09 p10, p24'),
          row('dual 约束', T`\lambda_i\ge0\ (\text{soft: }0\le\lambda_i\le C),\quad \sum_i\lambda_iy_i=0`, 'L09 p10, p12'),
          row('恢复 w / 预测', T`\bw^*=\sum_i\lambda_i^*y_i\varphi(\bx_i)\ (\text{线性核时 }\varphi(\bx)=\bx),\quad s=b^*+\sum_i\lambda_i^*y_iK(\bx_i,\bx)`, 'L09 p11, p20, p24'),
          row('卷积层参数', T`C_{out}\cdot C_{in}\cdot K^2\ (+\,C_{out}\ \text{bias})`, 'WS08, L13 p17'),
          row('卷积输出尺寸', T`\lfloor (H+2P-K)/S\rfloor+1`, 'WS08'),
          row('全连接参数', T`n_{in}\cdot n_{out}\ (+\,n_{out})`, 'L11 p9'),
          row('BN 因子分解', T`P(x_1,\dots,x_n)=\prod_i P(x_i\mid x_{pa_i})`, 'L20 p27'),
          row('MRF', T`P(x_1,\dots,x_n)=\tfrac1Z\prod_{c}\psi_c(x_c)`, 'L20 p37'),
          row('条件独立', T`P(A,B\mid C)=P(A\mid C)\,P(B\mid C)`, 'L20 p13'),
          row('树上的消息', T`m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)`, 'L21 p22, p30'),
          row('边缘分布', T`P(x_i)\propto\prod_{k\in N(i)}m_{k\to i}(x_i)`, 'L21 p23, p34'),
          row('Junction tree', T`\text{消元记团}\to\text{只留极大团}\to\text{最大权重生成树（权}=|c_i\cap c_j|)`, 'L22 p6–p22'),
          row('CPT 自由参数', T`(k-1)\times\prod_{p\in pa}k_p`, 'L20 p11'),
          row('Bayesian 线性回归后验', T`V_N=\sigma^2\Big(\bX'\bX+\tfrac{\sigma^2}{\gamma^2}I\Big)^{-1},\ \ \bw_N=\tfrac1{\sigma^2}V_N\bX'\by`, 'L18 p18'),
          row('预测分布', T`y_*\sim\mathcal N\big(\bx_*'\bw_N,\ \sigma^2+\bx_*'V_N\bx_*\big)`, 'L18 p24'),
        ],
      },
      { t: 'note', md: 'D-separation 四步：**祖先图 → moralize（父节点结婚）→ 去方向 → 删条件节点 → 看连通**（L20 p17）。消元：删点前把邻居两两相连，记下团（[T6](#/T06)）。' },

      { t: 'h2', text: '★★ 经常要用', id: 'p2' },
      {
        t: 'table', head: ['名称', '公式', '出处'], rows: [
          row('MLE', T`\hat\theta=\argmax_\theta \sum_i\log p(x_i\mid\theta)`, 'L02 p10–p14'),
          row('MAP', T`\hat\theta=\argmax_\theta\big[\log p(D\mid\theta)+\log p(\theta)\big]`, 'L02 p26'),
          row('正则 ⇔ 先验', T`\lambda r(\theta)\ \Leftrightarrow\ p(\theta)\propto e^{-\lambda r(\theta)}`, 'L05'),
          row('Ridge', T`\hat{\bw}=(\bX'\bX+\lambda I)^{-1}\bX'\by`, 'L05 p14'),
          row('Bias-variance', T`E[(Y-\hat f)^2]=(E[Y]-E[\hat f])^2+\mathrm{Var}(\hat f)+\mathrm{Var}(Y)`, 'L05 p37（参数版本 L02 p19）'),
          row('Logistic', T`P(y=1\mid\bx)=\sigma(\bw'\bx)=\dfrac1{1+e^{-\bw'\bx}}`, 'L04 p22'),
          row('Cross-entropy loss', T`-\sum_i\big[y_i\log\mu_i+(1-y_i)\log(1-\mu_i)\big]`, 'L04 p27, p31'),
          row('GD', T`\theta^{(t+1)}=\theta^{(t)}-\eta\nabla L(\theta^{(t)})`, 'L04 p10'),
          row('Newton-Raphson', T`\theta^{(t+1)}=\theta^{(t)}-\big(\nabla^2L\big)^{-1}\nabla L`, 'L04 p16'),
          row('Beta-Binomial 后验', T`\mathrm{Beta}(\alpha+k,\ \beta+n-k)`, 'L19 p13'),
          row('Beta 均值 / MAP', T`\dfrac{\alpha}{\alpha+\beta}\quad/\quad\dfrac{k+\alpha-1}{n+\alpha+\beta-2}\ (\text{后验两参数都}>1)`, 'L19 p12, WK02'),
          row('Perceptron loss / 更新', T`\max(0,-sy);\ \ \bw\leftarrow\bw+\eta y\bx\ \text{if } sy\le0`, 'L10 p14, p18'),
          row('Perceptron 收敛', T`k\le R^2/\gamma^2\ (\bw^{(0)}=\mathbf 0,\ \eta=1)`, 'L10 p31'),
          row('Backprop', T`\tfrac{\partial L}{\partial w_j}=\delta u_j,\ \ \tfrac{\partial L}{\partial v_{ij}}=\delta\,w_j\,g'(r_j)\,x_i;\ \ \delta=z-y\ (\text{平方损失、恒等输出})`, 'L11 p28–p31'),
          row('Momentum', T`\bv^{(t)}=\alpha\bv^{(t-1)}+\eta\nabla L,\ \ \theta^{(t)}=\theta^{(t-1)}-\bv^{(t)}`, 'L12 p12'),
          row('有限类泛化界', T`R[\hat f]\le\hat R[\hat f]+\sqrt{\dfrac{\log|\mathcal F|+\log(1/\delta)}{2n}}`, 'L06 p17'),
          row('VC 泛化界', T`R[\hat f]\le\hat R[\hat f]+\sqrt{8\,\dfrac{\VC\log(2n+1)+\log(4/\delta)}{n}}`, 'L07 p31'),
          row('Kernel 构造', T`K_1+K_2,\ K_1K_2,\ cK_1,\ f(\bu)K_1(\bu,\bv)f(\bv)`, 'L09 p33'),
          row('多项式 / RBF 核', T`(\bu'\bv+c)^d\ (d\in\mathbb N,\ c\ge0),\quad \exp(-\gamma\|\bu-\bv\|^2)\ (\gamma>0)`, 'L09 p32, p34'),
          row('Attention', T`\bm c=\sum_j\alpha_j\bm h^{(j)},\ \ \alpha_j=\dfrac{e^{e_j}}{\sum_{j'}e^{e_{j'}}}`, 'L14 p17'),
          row('RNN 梯度（线性 RNN）', T`\partial\bm h^{(T)}/\partial\bm h^{(1)}=W^{T-1}`, 'L14 p13'),
        ],
      },

      { t: 'h2', text: '★ 了解即可', id: 'p1' },
      {
        t: 'table', head: ['名称', '公式', '出处'], rows: [
          row('Hoeffding', T`\Pr\big[\mathbb EZ-\tfrac1n\textstyle\sum Z_i>\varepsilon\big]\le e^{-2n\varepsilon^2}`, 'L06 p23'),
          row('Experts：Majority', T`M\le\log_2 n`, 'L16 p6'),
          row('Experts：Halving', T`M\le 2.4\,(m+\log_2 n)`, 'L16 p12'),
          row('Experts：weighted majority', T`M\le 2(1+\varepsilon)m+\dfrac{2\ln n}{\varepsilon}`, 'L16 p18'),
          row('Precision / Recall', T`\dfrac{TP}{TP+FP}\ /\ \dfrac{TP}{TP+FN}`, 'L15 p6–p8'),
          row('Welch t', T`x=\dfrac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}}`, 'L15 p27'),
          row('Adagrad', T`g_i\leftarrow g_i+(\nabla_iL)^2;\ \ \theta_i\leftarrow\theta_i-\dfrac{\eta}{\sqrt{g_i+\epsilon}}\nabla_iL`, 'L12 p13'),
          row('Regret', T`\mu^*T-\sum_{t=1}^T E[R_{i_t}(t)]`, 'L17 p6'),
        ],
      },
    ],
  });
})(window);
