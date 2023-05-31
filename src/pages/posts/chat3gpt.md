---
layout: "../../layouts/PostLayout.astro"

title: "用 T3 Stack 做个 ChatGPT Clone"
createdAt: "2023/05/21"
---

## 为什么做这个 project？

大概一个月前跟家里视频电话的时候，了解到 OpenAI 可能加了自己的过滤条件 ban 了一批梯子。我妈问我有没有可能写个类似的 ChatGPT Clone 网站，正好那个时候在折腾的漫画阅读器差不多告一段落，加上有一堆 Web Dev 的新玩具早就想玩玩了，所以最近这一个月就陆陆续续的在下班时间和周末摸这个项目。

今天（5 月 13 号）感觉基本功能做的差不多了，想着写篇 blog 记录一下折腾的过程。从用户的视角来看，ChatGPT 现有的主要功能都做了：注册，登陆，创建新对话，发送消息，得到回复，自动翻滚，查看历史对话，编辑对话标题，删除对话。如果你想玩玩看可以打开 [ChaT3Gpt](https://chat.yiqing.dev) 。如果你对实现感兴趣可以在这个 [Github Repo](https://github.com/yiqingfann/chat3gpt) 找到全部的 source code。下面是一个简单的例子：

![intro.gif](/assets/chat3gpt/intro.gif)

## 技术栈：好多 Web Dev 新玩具啊

首先说明我是 Web Dev 初学者，下面提到的很多工具除了 React，TailwindCSS，NextJS 以外全都是第一次用，没有深入研究，也没有思考过我手头这个问题是不是最适合用它们解决的。只是单纯的图一乐想玩玩看，所以仅供参考（经典差生文具多

我把这个项目叫做 Cha**T3**Gpt，因为这个项目主要的技术栈是 T3 Stack，并且我实在不想叫它 ChatGPT Clone（笑。这个 stack 来自于我特别喜欢的 [YouTuber Theo](https://www.youtube.com/@t3dotgg) 。他离开 Twitch 自己创业后，把自己项目里经常用到的技术栈拿出来，发起了这个叫做 [create-t3-app](https://create.t3.gg/) 的开源项目，方便开发者可以快速 init 一个 full-stack, typesafe Next.js app

在这个项目里我主要用到的工具是：

- User Interface：React + TailwindCSS
- API Layer：tRPC
- Backend：NextJS
- Data Layer：Prisma
- Cloud Database：PlanetScale
- User Auth：Clerk
- Deploy：Vercel
- DX: TypeScript + ESLint

下面就简单挑一些我折腾过程中印象比较深刻的部分出来聊一聊

## 设计 Lo-Fi UI 和整体的 Architecture

我没什么 UI 设计的基础，况且这是个 clone 性质的项目，所以简单的分析一下 ChatGPT 的 UI 有哪些主要的 component 模仿一下就好了。我喜欢用 Excalidraw 来画简单的 Lo-Fi UI。

![lofi-ui](/assets/chat3gpt/lofi-ui.png)

有了 UI 以后，就是思考一下用户能在 UI 上做哪些操作，为此我需要提供哪些 API，handle 哪些数据。

User Story 1：用户在输入 message，点击发送后，可以看到自己的 message 显示在对话区域，然后看到 assistant message 逐字显示在对话区域

![arch-1](/assets/chat3gpt/arch-1.png)

User Story 2：用户可以在侧边栏创建新对话，编辑一个对话的标题，删除一个对话

![arch-2](/assets/chat3gpt/arch-2.png)

## 我不想等半天看到一大段话蹦出来，能一个字一个字来吗？

MS 最后一学期上 Advanced Web Studio 的时候，Lydia 让我们玩过 GPT-3，我当时做了一个 [[YouTube] 输入 key points 帮你写邮件的 web app](https://youtu.be/KxrduBO2d6s) 。OpenAI 他们提供的默认 API 是 bulk 的：你做一次请求，返回给你全部生成好的内容。从用户的视角出发，体验大概是

1. 我发送了一条消息
2. 我等了半天
3. 我看到一大段话蹦出来了

这个用户体验比较糟糕，所以当时我做的妥协是是等拿到了全部结果以后，用打字机的效果显示出来。但这只不过是把最后“一大段话蹦出来”的生硬体验变得好了一些，整体上来说其实是让用户更慢的看到结果了。

![fake-typewriter](/assets/chat3gpt/fake-typewriter.gif)

当时 ChatGPT 还没发布，我也没深入读 API Doc，所以我觉得这已经是能做的最好的 solution 了。但现在有了 OpenAI 自己的 ChatGPT UI，能看到是一个字一个字出现的，没有中间“等半天”的过程，所以我就开始研究有没有办法做到一样的用户体验。在探索的过程中发现了一个 Vercel 的开发者做的一个教程里提到了用 edge function + streaming 的方式来实现这样的用户体验：[[YouTube] Build a GPT-3 AI app with Next.js and Vercel Edge Functions](https://www.youtube.com/watch?v=9Q9_CQxFUKY)

从下面这个 GIF 对比里可以看到，左边是用了 edge+stream，右边是普通的 lambda+bulk。全过程花费的时间是几乎一样的， 但是不同的是 edge+stream 可以让用户实时看到生成的结果，很大程度的提高了用户体验

![edge-lambda.gif](/assets/chat3gpt/edge-lambda.gif)

看完以后我就很兴奋的把这个轮子改造了一下加到了项目里，确实提高了一大截用户体验。

## 你们经常说的这个 Type Safety，不就是自动补全吗（？

这个项目其实就是为了玩 tRPC 包的饺子，因为 Theo 实在是提到它了太多次了。我对 tRPC 的理解就是一个提高开发者体验的工具 - 如果你的前后端都是 TypeScript，那么用 tRPC 你就可以做到：在 backend 写一个 function，加入 tRPC router，然后在 frontend 直接调用并 auto-complete。前后端任何一边有变化，不能 honor 这个定义好的 contract 的时候会直接报错。下面是官网的一个 demo：

![type-safety.gif](/assets/chat3gpt/type-safety.gif)

我是几个月前开始工作了才开始第一次用 TypeScript 的，在 side project 用这更是第一次，所以我在开始做的时候完全不理解 Type Safety 有什么重要的，不就是自动补全吗（？。我一开始用 tRPC 写的是上面提到的那个 lambda+bulk 的用户体验很差的版本。第一感觉是：确实好用，但感觉也没说的那么神？

为了做逐字显示的功能，从 lambda+bulk 换到 edge+stream 的时候，发现 tRPC 确实是比较深的坑，加上没觉得有多必要，就换回了常用的 NextJS API Routes。现在回想起来从 tRPC 到 API Routes 之后，可能有 50%的 bug 都是因为不 Type-Safe（笑。

转换之后的第一个典中典问题之：ESLint 怎么老报错啊？

![eslint-error](/assets/chat3gpt/eslint-error.png)

于是只好定义 `Conversation` 类让它乖乖闭嘴：

```tsx
type Conversation = {
  conversationId: string;
  title: string;
  createdAt: string;
  userId: string;
};

const createNewConversation = async () => {
  const rsp = await fetch("/api/conversations", { method: "POST" });
  const data = (await rsp.json()) as Conversation;
  return data;
};

const data = createNewConversation();
// do sth with data.conversationId
```

Ok，ESLint 终于不烦我了，但 `data.conversationId` 怎么永远都是 `undefined` 啊？翻来覆去检查了 `POST /api/conversations` 这个接口半天，怀疑是不是 server 上用 prisma 去 db 创建的时候失败了所以没返回东西，但 print 出来完全没问题。眼瞎的我反复看了半天才发现我其实返回的是：

```tsx
{
	conversation: {
		conversationId,
		title,
		createdAt,
		userId,
	}
	// no conversationId here!!!
}
```

多了一个 conversation 这个 key（悲）。

这只是遇到的很多问题的其中一个例子。总之各种折腾之后的结论就是：Type Safety 真的很重要，能让 linter 捕捉到的 bug 还是尽量交给 linter 吧，之后有时间可以深入探索一下 tRPC。感觉能理解为什么 Theo 的 Discord Server 叫做 `Theo’s Typesafe Cult` 了。

<p align="center">
  <img src="/assets/chat3gpt/theo-discord.png" alt="theo-discord" />
</p>

## 有用户了好像不能在 prod 里面乱搞了？

以前在学校里安于课内的 toy project，唯一的 user 只有我自己和 TA，打完分以后就吃灰了，这让我完全没有 dev 和 prod 的概念。开始这个项目的时候我延续一贯的习惯，所有的 feature/fix 都是开个 branch，提 pr，最后 squash merge 回 main。我部署在 vercel，他们默认是把 main 自动 deploy 到 prod，然后其他 branch 自动 deploy 到 preview。

我一个人做，而且也没有用户，所以一开始完全没发现问题。直到有一天，有个同学问我能不能给他老妈开个账号用用看，我没怎么思考就把 prod url 发过去了。发完我才意识到那个时候我才刚把 persist data 这个大 feature 做了一半，有一堆 bug，也没做 mobile responsive，所以当时的 prod 其实是基本不能用的一个版本。为了不让用户看到以后立刻失去兴趣，我迅速 rollback 到了之前一个只能单次聊天，不存数据的稳定版本。

这之后我才第一次意识到，有用户了好像就不能在 prod 里面乱搞了。在公司里我们是把 main branch 当作 dev，然后手动 release 到 prod 的，但这个设计好像不能直接用在 vercel 这一个 main = prod，branch = dev 的逻辑上。于是我就去搜了搜，找到了这篇 [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)，读完以后，参考里面说的把主要工作放在 dev branch 上做，也就是所有的 feature 都从 dev 出发再 merge 回 dev。等要 release 的时候从 dev 搞个 release branch 出来，分别 merge 回 main 和 dev。

不确定这个 workflow 是不是适合我这种一个人做的小项目，因为感觉我并没有在 release branch 上做任何事，还不如直接把 dev merge 回 main。但是至少它解决了我想要保证用户看到的一定是 stable 版本这个问题，所以就先用着了。感觉 CI/CD 方面的 best practice 会挺有意思的，准备找点东西读读。

## 写在最后的一些碎碎念

我以前没有写过 blog，最近推上关注了不少有意思的 web developer，读他们的博客津津有味，加上我很早就有想写博客的想法，就决定从这个项目开始写了。这篇是在项目做完以后才打开一个空白文档对着埋头嗯写的。回忆的时候相当折磨，因为有些一开始遇到的问题已经不记得了，还有不少问题是当时觉得很复杂，现在解决了以后回头看感觉理所当然就懒得写了。以后还是边做项目边顺手记录吧，积累素材，把草稿变成正稿感觉是比较自然的写作流程。

最后谢谢你能看到这里，感觉已经很久没有写过什么东西了，表达能力有很大提升空间（，我会不断迭代写作技巧的。下一个项目想玩下 Astro，准备用它重写一下我这个一年前完全不懂 web dev 的时候东拼西凑做的人博客。此外也有很多非技术的思考想写，那就下一篇再见吧 👋！
