import {defineNavbarConfig} from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
    {text: '首页', link: '/'},
    {text: '博客', link: '/blog/'},
    {text: '标签', link: '/blog/tags/'},
    {text: '归档', link: '/blog/archives/'},
    {text: 'c++', link: '/notes/c++/'},
    {text: 'Linux', link: '/notes/Linux/'},
    {
        text: '数据结构',
        items: [
            {text: '线性数据结构', link: '/notes/数据结构/线性数据结构/README.md',},
            {text: '树数据结构', link: '/notes/数据结构/树数据结构/README.md',}
        ]
    },
    {text: '设计模式', link: '/notes/设计模式/'},
    {text: '项目学习', link: '/notes/项目学习/'},


])
