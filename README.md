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

## 东方山水：第一批本地候验收（尚未发布）

源码新增 `?suite=eastern`，默认仍为 natural，original 保留。东方六景为江南水巷（船/红幡）、梯田山寨（水轮/槽水）、雪夜禅寺（钟/长幡）、漓江渔火（筏/扳罾）、古道茶山（行人/茶梢）、海崖楼阁（帆舟/浪脊）。检查器已开放套装的按钮均在文档流中，切换会取消旧动画/指针、清撤销/贴地与时间轴，并复位目标套装。

三批按东方→奇幻→微缩顺序在同一工作树串行制作；目前五套/30景已有本地候验收实现，默认natural不变，并非已发布或全部验收通过。各批证据与未测项见下文及实施记录。

东方两份本地经典脚本按需加载，普通natural首屏不请求；失败保留当前套装、可重试，迟到请求不覆盖新选择。导出器等待 `window.sceneCube.ready` 后才取首帧；`model(id,t,pass)` 在相应套装ready后仍是同步接口。东方使用逐格保守边界，正常选景包含完整当前魔方，贴地适配当前景，不在每帧重新生成包络。原版/natural几何及其既有镜头不改。

自动投影检查可验证代表性端点位移、网格尺寸与有限遮挡射线，不证明完整轮廓的肉眼可读。东方桌面六景两项动作已有真实浏览器/录像审片确认；手机六景普通/贴地静态构图有报告，但完整周期8px边距未严测。**遮挡比例的完整人工量测、touch、首帧和规定同路径RAF三轮仍未测**；之前natural的历史数据不能充当东方验收。未运行实际MP4导出，不能声称音频流探测已通过。

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

### 东方执行记录（2026-11-25，Asia/Shanghai）

首轮弱可读问题经过敞开钟亭、真实钟体非对称结构/正确摆轴、亮色尖叶、同筏扳罾、镜头遮挡与接地检查等修复，最后以实际目标复核：水巷船穿桥/红幡、梯田水轮/槽水、禅寺钟/长幡、漓江筏橹/随筏金网、茶山行人/尖叶、海崖帆舟/浪脊均有桌面真人浏览器或真实10秒WebM审片证据。漓江筏与灰峰、邻面结构被确认是透视分离，不是穿模。冷启动迟到请求和三个建筑支撑的独立Important已关闭。冻结快照含91项新鲜自动测试、干净构建和执行记录；这不是完整验收或上线声明。

规格4.5允许贴地裁其它背面，但当前景主体/两动态包络必须完整、距边≥8px；普通选景仍须全魔方完整。手机六景普通/贴地静态主体已检查，完整周期8px未严测；真实touch、首帧、规定10秒预热/30秒采样/三轮RAF及实际编码音轨仍未测。

### 奇幻秘境：第二批本地候验收（尚未发布）

新增 `?suite=fantasy`：月光菌林（绕飞扑翼蛾/升腾孢子）、水晶洞窟（绕转悬晶/扩散水环）、浮空遗迹（轨道浮石/折面旗帜）、巨树书屋（翻页飞书/悬灯）、星砂秘泉（双臂星砂/摆动吊坠）、冰晶龙巢（连体尾梢/鼻前冰羽）。五套整套切换，默认仍natural；civilizations的本地候验收状态见下一节。奇幻的两个本地经典脚本仅按需加载；新包络采用缓存的分组件几何并集，不每帧重新求全模型。几何采用独立主角与构图，不复用旧景换色。

新增自动检查覆盖真实网格支撑/接触、跨格时序、静态遮挡、投影、加载竞态、切换复位、缓存和CLI静音，但不能充当人眼验收。**父代理已回报奇幻桌面六景核心两动作真实录像清楚留框**：40c18ef5复核晶洞/遗迹/星泉/龙巢，1d2a书屋，d031菌林；独立复核120/120且三项Important关闭。此前冻结判断由错目标或整周期稀疏抽帧造成，已撤回。手机完整周期8px、真touch、首帧、标准RAF三轮、实际MP4音轨仍未测，手机直接产品与响应式QA的最新结果尚待父回报。独立复核确认尺寸是设计下限（星砂仍须≤.055），已按§100/104局部加宽水环、刚性旋转同尺寸星砂、加宽断环与相连龙体，不动全局镜头/原版。代表性手机水环轮廓法向厚3.695CSSpx、星砂最短轴3.158；桌面环体/整龙（不计支撑）最小宽比20.12%/20.50%。这是实际网格数学回归，不是人眼验收。旧8772六段真实录像经逐帧解码均非冻结，龙尾与鼻前冰息区域也有周期像素变化；冰息在旧贴地视角向画面左伸出，不能把头后静态冰柱当目标。完整周期/手机仍须按正确目标逐条短片审读，完整口径及数值见实施记录。隔离QA录制页不入产品构建，使用实际画布与原速度、无音轨。

### 微缩文明：第三批本地候验收（尚未发布）

`?suite=civilizations`包含蒸汽车站（往返车/提箱）、风车农庄（红帆/金斗水轮）、运河集市（转向货舟/吊篮）、矿山工坊（矿斗/槽式锻锤）、沙海驿城（双驮兽/青桶）、星际温室（单臂灌溉头/实体通风板）。两个经典脚本按需加载；没有更换引擎、音轨或旧24景。切换、URL、CLI、复位、缓存和动态fit复用现有接口。

新动作使用绝对时间，周期均整除19.2秒，商队为解析恒速圆角路径、货舟在放宽的端部船池连续调头；吊绳/轮轴/槽销/铰链有实际几何连接。为共享§184可读性与净空门槛，局部加宽吊箱/篮、矿斗/锤头和灌溉头；驿城青桶移至y=.50（原建议y=.12与商队的.18净空冲突），保留升程、周期，实际动物面片包围盒保守最小间隔约.199。没有修改批准spec或降低标准。

实际网格的尺寸、位移、遮挡数值探针和GL上传/绘制跟踪只是自动回归，不能冒充视觉验收。后续父代理回传微缩六景两项核心动作已有真实录像检查；修后车站1371确认桌面及手机核心动作清楚，轮轨Important已独立关闭。**这不代表所有普通/贴地视角的完整周期8px包络、真实touch、正式三轮RAF、首帧或CLI成品音轨通过**。10秒不足商队/货舟/列车19.2秒全周期，既有文明QA录20秒；所有隔离QA均不入产品构建。最新实测/未测边界见[三套验收状态](docs/superpowers/acceptance/2026-11-25-three-suites-status.md)，执行细节见 `docs/superpowers/plans/2026-11-24-miniature-civilizations.md`。

## 本地性能复核

仅在预览 URL 加 `?diagnostics=1` 时，检查器底部显示既有 RAF 回调的样本数、中位帧间隔、P90 和视口。正常页面不采样；该面板不驱动操作或生成帧。切换套装、复位、改变舞台尺寸会重新分批，隐藏标签页期间暂停连续间隔计数。

新批次按同机器/浏览器/1280×800、同DPR/录制状态/同路径，每轮预热10秒、连续采样30秒、共3轮；分别取各轮median和P90的三轮中位值，两指标各≤对应原版1.5倍。路径为0–12秒六面各2秒、12–18秒贴地/退出/环绕、18–24秒正反层转/undo、24–30秒播放演示；双方采用同节奏。首帧/首次fit另记。390×844需同设备原版对照；1440×900仅补充。工具不能可靠控制路径或采样则标未测，不用Node耗时、单帧或历史数字代替。触控须真实支持touch，不能鼠标冒充。

### 当前收尾状态（2026-11-25，Asia/Shanghai）

十八景桌面核心两动作的父回传证据与仍缺的完整包络/状态会话分开记录。桌面正式RAF尝试因路径计时不可靠而无有效对比，手机390×844同设备原版对照也仍未测；不使用历史natural样本或Node耗时填补。真实首帧、已验证冷缓存、touch及CLI五套成片/音轨仍须分别如实记录。准备隔离普通CI验收CLI，不代表已有成片、全部验收或生产发布；详见[状态记录](docs/superpowers/acceptance/2026-11-25-three-suites-status.md)。

## 开发与导出

源代码、艺术素材、Codex 元数据和使用说明集中在 [scene-cube/](scene-cube/)。浏览器演示和模型测试无需安装 npm 依赖。

```sh
node --test
```

导出 MP4 需要 Node.js、Playwright、Chromium 和 FFmpeg。CLI 用 `--suite natural`（默认）、`--suite eastern`、`--suite fantasy`、`--suite civilizations` 或 `--suite original` 选已开放套装；不要给输入文件名追加 `?suite=original`。自然奇境、东方山水、奇幻秘境与微缩文明均按静音配置导出（实际编码成品音轨仍须验收），CLI拒绝为它们传入 `--audio`。原版画面可显式配仓库附带的原创音轨：

```sh
node scene-cube/scripts/render.cjs scene-cube/assets/starter/index.html natural-cube.mp4 --suite natural
node scene-cube/scripts/render.cjs scene-cube/assets/starter/index.html fantasy-cube.mp4 --suite fantasy
node scene-cube/scripts/render.cjs scene-cube/assets/starter/index.html civilizations-cube.mp4 --suite civilizations
node scene-cube/scripts/render.cjs scene-cube/assets/starter/index.html original-cube.mp4 --suite original --audio scene-cube/assets/gravity-foley.flac
```

上面的 `?suite=original&export=1` 仅供浏览器页面 URL 使用。参数和导出命令见 [制作说明](scene-cube/references/production.md)。

## English

World Cube is a Codex skill and an offline browser demo for a twistable miniature world. Each face is a 3×3 terrain grid with its own gravity. Run `node scripts/world-cube.cjs deploy` and open `dist/index.html`. The same export is what Vercel publishes: Node.js 22.x, no install, and `dist/` as the static output. See the [English quick start](scene-cube/README.md) and [skill guide](scene-cube/SKILL.md).

## 许可与灵感

本项目采用 [MIT 许可证](LICENSE)。空间状态协调场景、镜头与动作的思路受到 [Dksie09/unfold](https://github.com/Dksie09/unfold) 启发。本仓库的实现、模型、图像和音轨为项目独立制作。
