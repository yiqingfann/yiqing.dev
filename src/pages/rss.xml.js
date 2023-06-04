import rss, { pagesGlobToRssItems } from "@astrojs/rss";

export async function get() {
  return rss({
    title: "Yiqing Fan",
    description: "Yiqing's Blog",
    site: "https://yiqing-dot-dev-git-add-rss-yiqingfann.vercel.app/",
    items: await pagesGlobToRssItems(import.meta.glob("./posts/*.md")),
    customData: `<language>zh-cn</language>`,
  });
}
