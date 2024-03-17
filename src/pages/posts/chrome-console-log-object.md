---
layout: "../../layouts/PostLayout.astro"

title: "薛定谔的console.log(object)"
pubDate: "2024/03/17"
---

> _在观测之前，你永远不会知道 console.log(object)的值是多少（_

最近遇到了一个非常玄学的 bug，让我对 chrome `console.log(object)` 的行为有了新的认识。

打开 chrome console，我们先来试试下面这个例子：

1. 定义一个 nested object `let x = {a: {b: 1}}`
2. `console.log(x)`，但是先不展开看里面的内容
3. `console.log(JSON.stringify(x))`，可以看到这个结果符合预期
4. 然后修改 `x` 增加一点内容：`x.a.c = 2`
5. 回到刚才的 `console.log(x)` 的输出，点击展开内容

<img src="/assets/chrome-console-log-object/1_expand-late.gif" alt="1_expand-late.gif" width="50%" style="margin:auto" />

这时候神奇的事发生了，我们可以看到 `x.a.c` 存在，也就是说在 `x.a.c = 2` 之前就执行的 `console.log(x)`，竟然包括了未来的修改。于是很自然会猜想：难道 chrome 的 `console.log(x)` 其实会显示最新的值吗？我们重新试试：

1. 定义一个 nested object `let x = {a: {b: 1}}`
2. `console.log(x)`，点击展开结果，可以看到内容符合预期
3. `console.log(JSON.stringify(x))`，可以看到这个结果也符合预期
4. 然后修改 `x` 增加一点内容：`x.a.c = 2`

<img src="/assets/chrome-console-log-object/2_expand-early.gif" alt="2_expand-early.gif" width="50%" style="margin:auto" />

可以看到，这次在第 2 步里展开的结果，并没有如猜想的一样变成最新 x 的值。所以明明执行语句的顺序都一样，为什么 `console.log(x)` 在第一个例子里输出了最新的值，但是在第二个例子里输出了旧的值呢？

这里的原因是：虽然执行语句的顺序一样，但是点击展开看 object 内容的时间不同。chrome 在做 `console.log(object)` 的时候，偷懒没有对这个 object 做 deep copy，而是用了这个 object 的 reference，只有在点击展开的时候才 evaluate。换句话说，chrome 里 `console.log(object)` 显示的是点击展开 `object` 时候的值，而不是运行 `console.log` 时候的值。

所以如果你真的想要看到 object 在运行 `console.log` 时候的值，那要么做 stringify，要么和我一起相信 functional programming，avoid mutation（
