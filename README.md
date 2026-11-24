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

## 离线交互版

拖动方块拧层，拖动空白处环绕观察。选中一处生境，再点 **贴地看**，就能看到树根、桥台和生物与地面的关系。也可以拖动 19.2 秒演示的时间轴，停在一次转层的中间。

![六面引力的六处生境，包括枫溪木屋、珊瑚礁、暮色湖湾、沉木、白鹭塘和水母林](worlds.webp)

## 开发与导出

源代码、艺术素材、Codex 元数据和使用说明集中在 [scene-cube/](scene-cube/)。浏览器演示和模型测试无需安装 npm 依赖。

```sh
node --test
```

导出 MP4 需要 Node.js、Playwright、Chromium 和 FFmpeg。可使用仓库附带的原创立体声音轨。参数和导出命令见 [制作说明](scene-cube/references/production.md)。

## English

World Cube is a Codex skill and an offline browser demo for a twistable miniature world. Each face is a 3×3 terrain grid with its own gravity. Run `node scripts/world-cube.cjs deploy` and open `dist/index.html`. The same export is what Vercel publishes: Node.js 22.x, no install, and `dist/` as the static output. See the [English quick start](scene-cube/README.md) and [skill guide](scene-cube/SKILL.md).

## 许可与灵感

本项目采用 [MIT 许可证](LICENSE)。空间状态协调场景、镜头与动作的思路受到 [Dksie09/unfold](https://github.com/Dksie09/unfold) 启发。本仓库的实现、模型、图像和音轨为项目独立制作。
