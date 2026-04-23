import fs from 'fs'
import path from 'path'

export default function criticalCssIntegration() {
    return {
        name: 'critical-css',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                // 读取关键CSS文件
                const criticalCssPath = path.resolve('src/styles/critical.css')
                const criticalCss = fs.readFileSync(criticalCssPath, 'utf8')
                
                // 将URL对象转换为本地文件路径
                const dirPath = dir.pathname
                
                // 遍历所有HTML文件
                const htmlFiles = fs.readdirSync(dirPath, { recursive: true })
                    .filter(file => file.endsWith('.html'))
                
                for (const htmlFile of htmlFiles) {
                    const htmlPath = path.join(dirPath, htmlFile)
                    const htmlContent = fs.readFileSync(htmlPath, 'utf8')
                    
                    // 将关键CSS内联到HTML头部
                    const modifiedHtml = htmlContent.replace(
                        '<head>',
                        `<head>\n<style>${criticalCss}</style>`
                    )
                    
                    // 写回修改后的HTML文件
                    fs.writeFileSync(htmlPath, modifiedHtml)
                }
            }
        }
    }
}