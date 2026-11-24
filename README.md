# World Cube · 六面引力

**六面各有重力的 3D 像素魔方。** 每面九格拼成一处微缩生境。拧动方块，地形、景物和当地的重力方向一起转动。仓库提供离线交互版与可复用的 Codex Skill。

[交给 Agent 一键部署](#交给-agent-一键部署) · [安装 Codex Skill](#安装-codex-skill) · [下载 60 帧短片](https://github.com/Rain-dust/World-Cube/releases/latest/download/world-cube-demo.mp4)

## 交给 Agent 一键部署

把下面这段发给有终端权限的 Agent 即可。

```text
请把 https://github.com/Rain-dust/World-Cube 部署到本地。
克隆仓库，按仓库根目录的 AGENTS.md 执行 node scripts/world-cube.cjs deploy。
完成后，把可在浏览器打开的 index.html 的绝对路径发给我。
```

自己执行时，需要 Git、Node.js 22 或更新版本，以及支持 WebGL 的浏览器。已下载仓库时，直接从最后一条命令开始。

```sh
git clone https://github.com/Rain-dust/World-Cube.git
cd World-Cube
node scripts/world-cube.cjs deploy
```

打开 `dist/index.html`。整个 `dist/` 可以复制到别处离线使用，无需安装 npm 依赖或启动服务器。结果会输出入口的绝对路径。重复执行会复用相同的文件。如果目标已有其他内容，可以用 `--out 路径` 生成到另一个目录。

## 部署到 Vercel

线上页面使用同一条静态导出，不改魔方、景观、品牌或 [MIT 许可证](LICENSE)。仓库根目录的 [`vercel.json`](vercel.json) 固定为：

| 设置 | 值 |
| --- | --- |
| Framework | 无 |
| Node.js | `22.x`（[`package.json`](package.json) 的 `engines.node`，没有依赖） |
| Install Command | 空字符串，跳过安装 |
| Build Command | `rm -rf dist && node scripts/world-cube.cjs deploy` |
| Output Directory | `dist` |

构建前清掉 `dist/`，是因为导出命令会保留已有且内容不同的目录。Vercel 的干净构建目录里，这条命令只把 `scene-cube/assets/starter/` 复制成可离线打开的静态站点。`dist/` 仍然不入库。

## 安装 Codex Skill

从仓库根目录运行以下命令，将 Skill 安装到指定项目的 `.agents/skills/scene-cube/`。

```sh
node scripts/world-cube.cjs install --project "/path/to/your-project"
```

使用 `install --user` 可安装到个人技能目录。也可下载 [Skill ZIP](https://github.com/Rain-dust/World-Cube/releases/latest/download/scene-cube.zip)，解压后将整个 `scene-cube` 文件夹复制到项目的 `.agents/skills/` 或个人的 `~/.agents/skills/`。安装后，在 Codex 里调用 `$scene-cube`。 [Codex 技能安装说明](https://developers.openai.com/api/reference/cli#use-the-cli-from-a-coding-agent)

> $scene-cube 做一个六面重力魔方。让一座灯塔立在湖岸上，船随着水面晃动。拧层时让一段岸线随方块翻走，再拍一个贴地镜头。交付交互版和 60 帧短片。

## 自然奇境（本分支新增）

默认打开新创作的六面：雪山温泉、沙漠绿洲、竹林溪谷、萤火湿地、火山熔岩、云上海岛。检查器顶部可切回「原版六面」。切换会清除拧动与撤销、退出贴地看，并回到对齐的初始视角，时间轴归零暂停。

- `?suite=natural`（或不带参数）：自然奇境。
- `?suite=original`：原版六景，保留原来的模型、镜头与演示提示。
- `?export=1`：隐藏控件，默认自然奇境；原版画面用 `?suite=original&export=1`。自然奇境不使用原版拟音。

六个新生境均为本地程序化几何与像素地面，无外部模型或图片依赖。基于 [原作者 World-Cube](https://github.com/Rain-dust/World-Cube) 的 MIT 框架继续创作。下面的六景预览图为原版。

## 离线交互版

拖动方块拧层，拖动空白处环绕观察。选中一处生境，再点 **贴地看**，就能看到树根、桥台和生物与地面的关系。也可以拖动 19.2 秒演示的时间轴，停在一次转层的中间。

![六面引力的六处生境，包括枫溪木屋、珊瑚礁、暮色湖湾、沉木、白鹭塘和水母林](worlds.webp)

## 构图适配的边界

自然奇境的正常选景会按魔方壳体与各格景物包围范围适配实际舞台；动画期间收到的尺寸变化会合并，等镜头与转层都结束后只补做一次。贴地看与原版镜头不参与此适配。

活动景物包络来自 **10 个离散时间样本及 0.05 单位高度余量**，不是对所有连续时刻的数学证明。投影测试覆盖指定尺寸、时间与混拼状态，不能代替全部动画时刻的浏览器审片。每次页面首次自然选景会同步生成 6×10 次活动模型包络，可能出现首次停顿；之后按生境 id 缓存复用，切套装/改尺寸不会重复生成。首次停顿及实际帧率仍须浏览器测量，不因测试通过而声称达标。

## 初版验收记录（2026-11-24，Asia/Shanghai）

独立代码复核：49/49 自动测试通过，无未解决的 Critical / Important。浏览器复核报告：桌面 1280×800 与手机布局 390×844 的六景正常选景构图完整，无底部裁切；桌面拖层、撤销、切换套装正常。同浏览器同路径的 RAF 中位间隔样本为自然奇境 **49.9ms**、原版 **83.3ms**，比值 **0.599**，满足不超过原版 1.5 倍的目标。这是该次本地复核样本，不代表其他设备或线上环境。

已知限制，作为可试玩初版保留：
- 部分蒸汽、瀑布、蛙跃、涟漪与骆驼缓行，在浏览器观察中尚不能明确辨认；代码有运动不等于视觉表达已经通过。
- 手机真实 touch 未测；390×844 的布局复核不等于触控通过，也未用鼠标冒充触控。
- 人工复核未准确命中动画进行中 resize 的时序；其镜头动画、转层及重叠生命周期由独立自动回归覆盖，但不能声称已人工验证该竞争时序。
- 活动包络为有限采样，首次生成的同步停顿未单独定量验证；详见上文边界。
- 本记录是本地验收，线上部署还需另做 HTTP 与浏览器复核。

## 本地性能复核

仅在预览 URL 加 `?diagnostics=1` 时，检查器底部显示既有 RAF 回调的样本数、中位帧间隔、P90 和视口。正常页面不采样；该面板不驱动操作或生成帧。切换套装、复位、改变舞台尺寸会重新分批，隐藏标签页期间暂停连续间隔计数。

同一浏览器保持 1280×800：先复位，再做一次 +90° 转层、空白环绕、选第一个生境、贴地看，记录至少 600 帧的读数；切另一套并复位，重复相同路径和相近采样量。不要把单帧、Node 单元测试时间或没有浏览器实测的数值当作性能结果。触控需真实支持触控的测试环境，桌面鼠标操作不能替代。

## 开发与导出

源代码、艺术素材、Codex 元数据和使用说明集中在 [scene-cube/](scene-cube/)。浏览器演示和模型测试无需安装 npm 依赖。

```sh
node --test
```

导出 MP4 需要 Node.js、Playwright、Chromium 和 FFmpeg。CLI 用 `--suite natural`（默认）或 `--suite original` 选套装；不要给输入文件名追加 `?suite=original`。自然奇境始终静音，CLI 会拒绝为它传入 `--audio`。原版画面可显式配仓库附带的原创音轨：

```sh
node scene-cube/scripts/render.cjs scene-cube/assets/starter/index.html natural-cube.mp4 --suite natural
node scene-cube/scripts/render.cjs scene-cube/assets/starter/index.html original-cube.mp4 --suite original --audio scene-cube/assets/gravity-foley.flac
```

上面的 `?suite=original&export=1` 仅供浏览器页面 URL 使用。参数和导出命令见 [制作说明](scene-cube/references/production.md)。

## English

World Cube is a Codex skill and an offline browser demo for a twistable miniature world. Each face is a 3×3 terrain grid with its own gravity. Run `node scripts/world-cube.cjs deploy` and open `dist/index.html`. The same export is what Vercel publishes: Node.js 22.x, no install, and `dist/` as the static output. See the [English quick start](scene-cube/README.md) and [skill guide](scene-cube/SKILL.md).

## 许可与灵感

本项目采用 [MIT 许可证](LICENSE)。空间状态协调场景、镜头与动作的思路受到 [Dksie09/unfold](https://github.com/Dksie09/unfold) 启发。本仓库的实现、模型、图像和音轨为项目独立制作。
