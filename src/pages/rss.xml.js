import rss, { pagesGlobToRssItems } from "@astrojs/rss";

export async function get() {
  return rss({
    title: "Yiqing Fan",
    description: "Yiqing's Blog",
    site: "https://www.yiqing.dev/",
    items: await pagesGlobToRssItems(import.meta.glob("./**/*.md")),
    customData: `<language>zh-cn</language>`,
  });
}
