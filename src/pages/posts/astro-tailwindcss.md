---
layout: "../../layouts/PostLayout.astro"

title: "用 Astro 和 TailwindCSS 做个新博客"
pubDate: "2023/06/04"
---

大概一年前 MS 第二学期的时候，做 UI Design 和 Cloud Computing 这两门课的 project 学 React 的时候读到了 Tania Rascia 的这篇 [[Post] Build a CRUD App in React with Hooks](https://www.taniarascia.com/crud-app-in-react-with-hooks/)。当时很喜欢这个博客的风格，于是在这之后的暑假找时间学了下 Gatsby 和 TailwindCSS，模仿她的风格糊了一个博客部署到了 Netlify，还买了个域名。做完以后挺开心的，毕竟第一次拥有了在世界上任何地方输入我自己的名字就能连上的网站。

但博客做完以后就开始经典吃灰，直到几周前做完 [ChaT3Gpt](https://www.yiqing.dev/posts/chat3gpt) 这个项目以后写了一下折腾过程，才把博客翻出来重新 setup 好，发了第一篇文章。经过这一年喜欢的风格也有了点变化，加上有想玩的新的静态网站框架，就决定重做一个。这个版本的 tech stack 很简单，用了 Astro + TailwindCSS，部署在了 Vercel。如果你对实现感兴趣可以在这个 [Github Repo](https://github.com/yiqingfann/yiqing.dev) 看到全部 source code。

<div style="display:flex;gap:0.75rem;justify-content:center;">
  <figure>
    <img src="/assets/astro-tailwindcss/1_blog-v1.gif" alt="1_blog-v1.gif" />
    <figcaption class="text-center">Before</figcaption>
  </figure>
    <figure>
    <img src="/assets/astro-tailwindcss/2_blog-v2.gif" alt="2_blog-v2.gif" />
    <figcaption class="text-center">After</figcaption>
  </figure>
</div>

## 功能：Welcome to the universe, astro(naut)！

在动手之前定义目标的时候，我发现想要的功能其实非常简单 - 用 Markdown 写完一篇文章以后能方便的发布就够了，同时我希望它能自定义程度高，方便折腾。之前用 Gatsby 做的博客其实已经满足这个需求了，但是不少地方用着不太顺手，给我一种臃肿的感觉 - 比如从隔壁文件夹读 Markdown 要用 GraphQL（当然也可能是我的使用姿势不对），对我这种就本地几篇文章的小博客也太 overkill 了。所以这次我想要越简单越好。

关于 Astro，我是在各种 Frontend Framework 对比视频里面开始眼熟它的，印象就是速度很快 zero JavaScript by default，然后可以用任何你喜欢的 UI Component 之类的。但除开这些，我想用 Astro 的原因其实单纯是看到很多 cool kids 都在用（比如 [nexxel](https://www.nexxel.dev/)）。

所以完全没有纠结，上周中的晚上快速把 Astro 官方的 Build a blog 教程做了一遍熟悉一下，周末很快就把新博客做完了。总体感觉是很干净的为内容网站设计的框架，它 file-based routing 的好处是会把所有`pages/`下面的`.astro`和`.md`文件都生成页面，因此没必要像 Gatsby 里那样手动用 GraphQL 先把文件拿到，再用`<div dangerouslySetInnerHTML={{ __html: html }} />` 显示内容。而 file-based routing 的坏处就是对着一堆叫`index` 的文件每次都得花时间看一眼它文件夹的名字是什么。不能 cmd + p 快速跳转文件我会似（。

<img src="/assets/astro-tailwindcss/3_file-based-routing.png" alt="3_file-based-routing.png" width="100%" style="margin:auto" />

## 风格：太美丽啦 @tailwindcss/typography

功能以外就是整体风格了。因为没有什么特别的想法，就决定还是找喜欢的模仿一下。之前在读 [Randy Lu](https://lutaonan.com/) 的博客的时候就非常喜欢这种简单干净的风格，尤其是正文里标题的样式，粗体和链接上细微的颜色变化，恰到好处的行/段间距，让人阅读起来非常舒服。

本来是准备手写样式的，但是偶然间发现 [Anthony Fu](https://antfu.me/) 的正文也是一样的 style，于是 inspect 了一下发现他们两都用了`prose`这个 class，完全没有什么 crazy CSS。搜了一下才发现这是用了 TailwindCSS 的官方 typography 插件，它给一些不能直接控制的 HTML（比如从 Markdown 渲染的）提供了一些好看的默认排版。试了一下真的 work like a charm，只要这一个 class 就把正文所有的样式都 handle 的很好了（甚至 code block），省下了好多手写样式的时间。（后来才回想起来我的旧博客其实也用了这个，只不过当时跟着几个 tutorial 糊里糊涂的做，完全没理解它的作用 lol）

加入`prose`前后的效果，别眨眼：

<figure>
  <img src="/assets/astro-tailwindcss/4_prose.gif" alt="4_prose.gif" />
  <figcaption class="text-center">The magic of <code>prose</code> class</figcaption>
</figure>

## 一些趣事

在这次折腾过程中一件有趣的事是，做 Astro 官方教程的时候，发现有两个页面都有“计算所有 unique tag”的逻辑，很自然的想 extract 成一个 util function 用。但是发现`Astro`这个 object 只有`.astro`文件的 frontmatter 里面才能用，于是就把它作为 argument 传进这个 util function，但很奇怪的是并不能 work。

Astro 算是比较新的框架，Google 不到这个问题，问了 ChatGPT 也解决不了。这种情况以前我会觉得它是一个不可能解决的问题，绕开它好了。但因为最近逐渐意识到跟人交流的重要性，就加了 Astro 的 Discord Channel 把问题发了上去，没想到很快就有人回复了。Astro Core Team 的一个人说我用的`Astro.glob()`是唯一不 work 的，然后建议了一个 work around，我试了一下成功解决了这个问题。这也算是我第一次在公开的地方提问，感觉开源社区还是非常友好的，希望以后也能多做一些这样的交流。

<img src="/assets/astro-tailwindcss/5_astro-discord.png" alt="5_astro-discord.png" width="100%" style="margin:auto" />

另一件有趣的事是，我的这个博客大体上就是把 Randy 他用 Eleventy 写的博客改用 Astro 写了一遍，而就在我快写完这篇文章的时候，发现 Randy 把博客改版了，从 Eleventy 迁移到了 Astro！发现的时候还是挺开心的，有一种虽然是陌生人但是技术让我们有了共同点的感觉，不知道他会不会也写一篇 Astro 的折腾过程 hh。看了一下他的新版本做了我接下来想加的正文目录功能，又有新东西可以玩了，yay！
