# HIV 科学小馆

静态中文网站。首页展示九台机器。每台机器拥有自己的网页、可操作的模拟和可分享的网址。原始模拟逐字节打包在 `machines/`，网站层提供中文讲解、键盘导航和展品切换。站内切换时保留已打开的模拟页面；刷新、关闭标签页或打开另一标签页会启动新的参观会话。

## 本地预览

在项目目录运行（Node.js 20 或更新版本）：

```sh
npm run build
npm run dev
```

打开终端输出的 `http://127.0.0.1:4173/`。站点用同源 iframe 和 ES 模块，预览时需要通过本地 HTTP 服务打开。构建、预览和部署无需安装 npm 依赖。展品 WebP 和十张 1200 × 630 PNG 原图在 `assets/`，已包含在项目中。

## 发布到 Vercel 并绑定域名

当前交付未发布。以下命令中的 `museum.yourdomain.com` 和 `your-vercel-project` 需要换成你的实际域名和 Vercel 项目名。

1. 在项目目录运行：

   ```sh
   npx vercel login
   npx vercel link
   ```

   选择你的团队和项目，或创建新项目。也可以在 Vercel 控制台导入本目录所在的 Git 仓库，选择本目录作为 Root Directory。项目的 `vercel.json` 设置构建命令为 `node src/build.mjs`，输出目录为 `dist`。

2. 在 Vercel 项目 Settings → Environment Variables 新建生产环境变量 `SITE_URL=https://museum.yourdomain.com`。变量值填写将用于分享的最终 HTTPS 源地址，省略路径。若先用 Vercel 自带域名，可填项目的固定生产 `*.vercel.app` 地址，或让构建使用 Vercel 提供的生产域名变量。切换到自定义域名时更新 `SITE_URL`，然后重新部署以更新所有十页的分享地址。

   ```sh
   npx vercel deploy --prod
   npx vercel domains add museum.yourdomain.com your-vercel-project
   npx vercel domains inspect museum.yourdomain.com
   ```

3. 在实际 DNS 提供商添加 `domains inspect` 给出的**准确记录和值**。通常子域用 CNAME（例如主机名 `museum`），根域用 A 记录（主机名 `@`）。若 Vercel 要求额外的 TXT 所有权验证记录，也要添加。保留与该主机名无关的现有记录。若由 Vercel 托管 DNS，也可以在 Vercel DNS 控制台添加。以项目返回的目标值为准。确认生产站无需登录即可读取页面和图片。

4. 等待 DNS 生效后，再运行 `npx vercel domains inspect museum.yourdomain.com` 和 `npx vercel certs ls`。Vercel 在 DNS 验证成功后签发 HTTPS 证书。确认自定义域名为分享时使用的地址。

5. 验证公网 HTML 与图片：

   ```sh
   SITE_URL=https://museum.yourdomain.com node src/verify-public.mjs
   ```

   该脚本对首页、九条展品网址和十张分享图以 Twitterbot User-Agent 发起 HTTPS 请求，检查页面 URL、元数据、图片地址和 PNG 尺寸。随后在 X 的发帖编辑器中粘贴展品网址，观察实际卡片是否正确显示；可以关闭草稿，无需发布帖子。在公网浏览器操作一台机器后打开它的 CDC、WHO 或 NIH 链接，确认原页面进度仍然保留。

[Vercel CLI 发布文档](https://vercel.com/docs/projects/deploy-from-cli) · [Vercel 自定义域名与 DNS 文档](https://vercel.com/docs/domains/set-up-custom-domain)
