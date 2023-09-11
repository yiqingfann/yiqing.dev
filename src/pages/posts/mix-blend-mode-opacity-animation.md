---
layout: "../../layouts/PostLayout.astro"

title: "CSS 的 Mix Blend Mode 和 Opacity Animation"
pubDate: "2023/09/10"
---

## 问题

最近遇到了一个问题：想把某个 element 的颜色跟它背景的颜色混合起来，并且在这个 element 显示的时候做一个 fade in 的效果。在解决的过程中遇到了一些反直觉的现象，让我对 css stacking context 有了初步的理解。

我们可以先找一个简单的例子 - 有粉色和蓝色两个方块：

```tsx
export default function App() {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <div
          style={{
            width: 200,
            height: 200,
            backgroundColor: "pink",
          }}
        />
      </div>

      <div style={{ position: "absolute", top: 100, left: 100 }}>
        <div
          style={{
            width: 200,
            height: 200,
            backgroundColor: "lightblue",
          }}
        />
      </div>
    </div>
  );
}
```

<p align="center">
  <img src="/assets/mix-blend-mode-opacity-animation/1_overlap.png" alt="1_overlap.png" />
</p>

首先对于把蓝色 element 和背景中的粉色混合在一起这部分需求，我们可以用 CSS 的 `mixBlendMode` 来解决：

```tsx
export default function App() {
  return (
      ...
        <div
          style={{
            width: 200,
            height: 200,
            backgroundColor: "lightblue",
            mixBlendMode: "multiply",
          }}
        />
      ...
  );
}
```

<p align="center">
  <img src="/assets/mix-blend-mode-opacity-animation/2_blend.png" alt="2_blend.png" />
</p>

颜色混合搞定了，接下来对于让蓝色 element fade in 这部分需求，我们可以把蓝色 element 的 parent `div` 换成 framer motion 的 `moiton.div`，然后做一个 从 0 到 1 的 opacity animation：

```tsx
export default function App() {
  return (
    ...
      <motion.div
        style={{ position: "absolute", top: 100, left: 100 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            backgroundColor: "lightblue",
            mixBlendMode: "multiply",
          }}
        />
      </motion.div>
    ...
  );
}
```

<p align="center">
  <img src="/assets/mix-blend-mode-opacity-animation/3_opacity_problem.gif" alt="3_opacity_problem.gif" />
</p>

可以看到这里出现了问题：在 fade in 的过程中，蓝色 element 并没有和背景中的粉色混合在一起，而是等到动画结束才突然有了正常的混合效果。

## 理解

花了点时间读了下 mix blend mode 是怎么 work 的，我总结成了一句话：

> mix blend mode 就是：在同一个 stacking context 里，把某个 element 的颜色和所有在它底下的东西的颜色混合起来

听起来还是有点抽象，为了通俗易懂的解释，我想到了一个不完美但简单的 mental model：

> 每个 stacking context 可以想象成一个盒子，而每个 element 可以想象成一个盘子。所以 mixBlendMode 就是：在同一个盒子中，把某个盘子的颜色和所有在它底下的盘子的颜色混合起来

现在我们尝试用这个 mental model 来解释开头的例子：在最一开始还没有加入 opacity animation 的时候，只有一个盒子 A（默认的 stacking context），盒子 A 里面从下到上有粉色的盘子 1 和蓝色的盘子 2。因为盘子 2 有 `mixBlendMode` ，所以它的蓝色和在它下面的盘子 1 的粉色混合起来了。

有很多情况会创造新的盒子（stacking context），其中之一就是当某个盘子（element）的 opacity < 1 的的时候。

所以在从 0 到 1 的 opacity animation 过程中的任意时刻，比如盘子 2 的 parent `motion.div` 的 opacity = 0.5 的时候，由于 opacity < 1，这个 `motion.div` 变成了一个新的盒子 B。换句话说这时候盘子 2 其实是被盒子 B 包裹起来的，盒子 A 里从下到上是盘子 1，盒子 B（内有盘子 2）。这时候虽然盒子 B 里面的盘子 2 有 `mixBlendMode` ，但因为盒子 B 里只有盘子 2 一样东西，所以盘子 2 的下面没有其他东西可以做颜色的混合，就保持了原本的蓝色（就算从用户的视角来看蓝色的盘子 2 下面还有粉色的盘子 1，它们“应该混合才对”）。

最终当 opacity animation 结束时， `motion.div` 的 opacity = 1，所以包裹盘子 2 的盒子 B 就消失了，盘子 2 和盘子 1 再次处在了同一个盒子 A 中，在 `mixBlendMode` 的作用下盘子 2 的蓝色就和盘子 1 的粉色混合起来了。

## 解决

在理解了原因之后，解决方案就很简单了。既然盘子 2 是因为被盒子 B 包裹起来了所以没有东西可以混合，那么把 `mixBlendMode` 运用在盒子 B 而不是盘子 2 上就好了。因为盒子 B 和盘子 1 一直处于同一个盒子 A 中，所以盒子 2 的蓝色会一直和在它下面的盘子 1 的粉色混合起来。

```tsx
export default function App() {
  return (
    ...
      <motion.div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          mixBlendMode: "multiply"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            backgroundColor: "lightblue"
          }}
        />
      </motion.div>
    ...
  );
}
```

<p align="center">
  <img src="/assets/mix-blend-mode-opacity-animation/4_opacity_correct.gif" alt="4_opacity_correct.gif" />
</p>

可以看到，现在 mix blend mode 和 opacity animation 能同时 work 了，yay！
