// 动态加载 Markdown 文章内容
// 文章 MD 文件存放在 src/content/articles/ 目录下

const articleModules = import.meta.glob('../content/articles/*.md', { as: 'raw', eager: false })

export async function loadArticleContent(mdFile) {
  const path = `../content/articles/${mdFile}`
  if (articleModules[path]) {
    const content = await articleModules[path]()
    return content
  }
  throw new Error(`Article not found: ${mdFile}`)
}
