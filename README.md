# COMP90051 Statistical Machine Learning · 期末复习站

纯静态网站（无构建步骤），直接打开 `index.html` 即可（file:// 可用）。内容为中文讲解，术语保留英文。

- **章节**：`data/chapters/w01–w11.js`，按自己的教学顺序重写课件内容，每章含直觉、推导、例题、练习。
- **题型页**：`data/types/`，按考试题型整理的解题步骤。
- **教学视频**：19 段 3Blue1Brown 风格的 Manim 视频（`media/anim/*.mp4`），每段都有“提问 → 流程条 → 分步演示 → 总结”结构；网页播放器（`js/ui/video.js`）在视频下列出每一步的完整讲解（KaTeX 公式），可点步跳转、单步播放。

## 本地预览

```bash
python3 tests/serve.py 8765
```

（`python -m http.server` 不支持 HTTP Range，视频无法拖动；`tests/serve.py` 支持。）

## 检查

```bash
node tests/site.check.js      # 结构、公式、视频、链接
node tests/core.test.js       # 计算核心单元测试
```

## 重新渲染视频

需要 Manim Community 0.22、ffmpeg、LaTeX（BasicTeX 即可）。场景代码在 `manim/scenes_*.py`，分镜在 `manim/plans/`，公共框架在 `manim/common.py`。

```bash
python manim/render.py eigen gd      # 渲染指定视频并更新 data/videos.js
python manim/render.py --index       # 只重建 data/videos.js
```

## 说明

课件原图、往年试卷全文和课程转写稿（`reference/`）属于课程材料，不随仓库发布；缺少它们时页面里的“课件原图”图块不显示，其余内容不受影响。
