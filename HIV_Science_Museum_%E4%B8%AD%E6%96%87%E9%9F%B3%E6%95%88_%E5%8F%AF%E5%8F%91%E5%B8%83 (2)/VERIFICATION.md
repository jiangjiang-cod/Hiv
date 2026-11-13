# HIV 科学小馆验证报告

## 交互与页面

- 本机 Chrome 实际打开首页、九个直接展品地址及十张分享图。首页有九张卡片且未加载任何模拟。直接打开单个展品，只请求该模拟。每个部署用副本都与原始孤立目录中的 HTML 逐字节一致。
- 用两种动作偏好操作全部 **54 个步骤按钮**。逐项检查顺序解锁、复位和随步骤更新的中文讲解。正常动画模式下，54 个步骤在启动后约 0.75 秒均观察到了 SVG 状态变化；也检查了每一步的结束状态。原版各自的逐帧验证仍适用于保留的源文件。
- 实测鼠标卡片、下拉选项和相邻展品链接，390 px 手机和 768 px 平板模拟触控，检查手机端所有九个机器内部没有横向溢出。检查九个菜单缩略图实际解码。查看了桌面、移动端及菜单截图。
- 实测 Space、Enter、←、→、Escape，以及输入框、证据链接与分享按钮获得焦点时的原生按键行为。切换到别的机器、返回、前进和关闭菜单后，先前机器仍处于原步骤。该进度保留在同一站内浏览会话中。
- 每个步骤检查页面上外部证据链接的 `target="_blank"` 与 `rel="noopener noreferrer"`。以测试响应验证打开新标签、`window.opener` 为空且展品进度仍在。用替身 Web Share 接口检查键盘触发的分享参数和展品地址。浏览器测试未向社交平台发帖。
- 第一次截图发现导览光标与部分画框进入展品裁切，已重新截取只保留机器主体的图。统一了展品卡的图片比例，并为下拉菜单加入独立的小尺寸图，避免刚打开菜单时出现空白缩略图。

[桌面首页](verification/home-desktop.png) · [桌面展品](verification/machine-desktop.png) · [手机展品](verification/machine-phone.png) · [展开的导航](verification/navigation.png)

## 医学内容

中文讲解使用原机器的当前场景标题同步。核对了原来的模型和仪表输出、中文讲解中的数值及其条件，并保留原始证据链接和英文原文。画面上的数值示例和教学符号仍由原模型绘制，网页不会计算个人风险或给出诊断。

- CD4 计数阈值与 AIDS 定义性疾病。[NIH HIV and AIDS Basics](https://hivinfo.nih.gov/understanding-hiv/fact-sheets/hiv-and-aids-basics)
- 可能具有传染性的体液、适合的暴露入口、日常接触与蚊虫叮咬。[CDC How HIV Spreads](https://www.cdc.gov/hiv/causes/)
- 安全套的屏障作用与按医嘱使用 PrEP 的相对风险估计。[CDC Condom Use](https://www.cdc.gov/condom-use/) · [CDC Clinical Guidance for PrEP](https://www.cdc.gov/hivnexus/hcp/prep/)
- 血液经皮职业暴露的历史研究估计及适用范围。[美国公共卫生署 2025 年职业暴露指南](https://pmc.ncbi.nlm.nih.gov/articles/PMC12616222/)
- 妊娠、分娩和喂养的不同条件及照护。[NIH Intrapartum Care](https://clinicalinfo.hiv.gov/en/guidelines/perinatal/intrapartum-care) · [NIH Infant Feeding](https://clinicalinfo.hiv.gov/en/guidelines/perinatal/preventing-transmission-infant-feeding)
- 美国 CDC 非职业暴露 PEP 的时间窗与标准疗程。[CDC 2025 nPEP](https://www.cdc.gov/mmwr/volumes/74/rr/rr7401a1.htm)
- ART、持续病毒抑制及 U=U 的性传播适用范围。[NIH Treatment as Prevention](https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-arv/arv-therapy-as-prevention)
- 静脉血实验室抗原／抗体及核酸检测窗口、用药与复查条件。[CDC Getting Tested](https://www.cdc.gov/hiv/testing/) · [CDC HIV Partners](https://www.cdc.gov/hivpartners/php/hiv-testing/index.html)

## 分享图与发布

- 九台机器的截图时间分别为 **16.40、15.60、22.20、24.45、22.30、19.00、15.20、24.55、14.25 秒**，均来自已验证步骤的中间画面。首页组合九幅机器图。逐张查看合成结果，程序检查所有 PNG 尺寸为 **1200 × 630**。
- 用 Twitterbot User-Agent 向本地服务读取十条独立 HTML 地址和十张 PNG。检查静态 Open Graph 和 X Card 标签、绝对 HTTPS 元数据地址、十条页面与图片路径、图片 HTTP 类型和尺寸。以示例自定义 HTTPS 域名和示例 Vercel 项目域名运行生产构建，确认地址生成，另验证非 HTTPS 自定义源被拒绝。
- 当前环境没有可用的 Vercel 登录或项目关联，也没有收到实际自定义域名。尚未发布，未检查公网 DNS、HTTPS 证书或 X 实际渲染。生产构建用实际 `SITE_URL` 或 Vercel 项目生产域名生成公网地址；本地构建使用保留的 `.invalid` 域名并禁止索引。

[十张分享图总览](verification/social-sheet.png) · [Vercel 发布与公网验证步骤](README.md)

## 复现

用 `npm run build` 和 `npm run dev` 启动本地站。测试工具使用已有的 Playwright、Sharp 和 Chrome。运行 `node src/verify.cjs`、`node src/verify-motion.cjs`；可通过 `CHROME_PATH` 指定 Chrome 可执行文件。构建和发布不依赖这些测试包。

## PEP 时间滑块更新

第 07 台增加 0–72 小时滑块，使用同一个模型驱动原有时钟指针和读数。时间窗读数表示距常规启动上限的时间，是否需要 PEP 仍由医务人员根据暴露类型和风险评估。72 小时是常规上限，超过后仍应就医安排检测和随访。依据为上文所列的 CDC 2025 年非职业暴露指南。

Chrome 检查了 0、24、71、72 小时的读数和指针、键盘滑块操作、切换展品再返回、恢复顺序教学，以及 73 小时的模型分支。复测通过全部 54 个顺序按钮。核对滑块的 73 个整点模型状态，并与更新前的页面比较了原导览的 2,161 个模型时间点和 9 张截图。录制模式保留原导览画面。

[查看 72 小时边界截图](verification/pep-slider.png)
