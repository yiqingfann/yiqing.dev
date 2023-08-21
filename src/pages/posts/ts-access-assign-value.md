---
layout: "../../layouts/PostLayout.astro"

title: "TypeScript 在 Access 和 Assign Value 时的不同类型推断"
pubDate: "2023/08/20"
---

最近遇到了一个有意思的 TypeScript 小问题，让我理解了 TS 在 access 和 assign value 的时候会有不同的类型推断。下面是一个简单的例子：我们现在有一个 object，想要在 runtime 根据 key 的取值来修改对应的 value：

```typescript
type User = {
  name: string;
  age: number;
};

const user: User = {
  name: "frank",
  age: 24,
};

const key = Math.random() < 0.5 ? "name" : "age";
// key has type "name" | "age"

const value = user[key];
// access value: user[key] has type string | number

user[key] = key === "name" ? "felix" : 23; // TS error: Type 'string | number' is not assignable to type 'never'
// assign value: user[key] has type never
```

这么写从逻辑上看好像没有问题，但是 TS 会对最后一行的 assignemnt 报错说 `Type 'string | number' is not assignable to type 'never'`。研究了一下发现同样是推断 `user[key]` 的类型，但是在 access 和 assign 的情况下，TS 的表现是不同的：

- 在 access value 时候，TS 会做 union，推断出 `user[key]` 的类型是 `string | number`。这里的表现比较符合直觉，毕竟是有两种可能所以取 union。

- 在 assign value 的时候，TS 会做 intersection，推断出 `user[key]` 的类型是 `string & number = never`。第一眼会感觉有点反直觉，但其实这里 TS 是想要确保 RHS 可以安全的赋给**所有可能的** LHS，所以才为了会找一个跟 LHS 所有 type 都 compatible 的子集而做 intersection。

要解决这个 error 的方法也非常简单：~~// @ts-ignore~~

```typescript
if (key === "name") {
  // user[key] has type string
  user[key] = "felix";
} else {
  // user[key] has type number
  user[key] = 23;
}
```

这样就不会有 error 的原因是 TS 会做 type narrowing，推断出在第一条 branh 上 `user[key]` 只能是 `string`，在第二条 branch 上 `user[key]` 只能是 `number`。

需要注意的是这种 type narrowing 只适用于 explicit control flow，所以这里的 if statement 可以，而一开始的 ternary expression 就不行。
