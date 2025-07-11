import {defineThemeConfig} from 'vuepress-theme-plume'
import {navbar} from './navbar'
import {notes} from './notes'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
    logo: 'https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/logo.png',

    appearance: true,  // 配置 深色模式

    social: [
        {icon: 'github', link: 'https://github.com/flycodeu/codeCenter'},
    ],
    // navbarSocialInclude: ['github'], // 允许显示在导航栏的 social 社交链接
    // aside: true, // 页内侧边栏， 默认显示在右侧
    // outline: [2, 3], // 页内大纲， 默认显示 h2, h3

    /**
     * 文章版权信息
     * @see https://theme-plume.vuejs.press/guide/features/copyright/
     */
    copyright: true,

    prevPage: true,   // 是否启用上一页链接
    nextPage: true,   // 是否启用下一页链接
    createTime: true, // 是否显示文章创建时间

    /* 站点页脚 */
    footer: {
        message: '2025 飞云编程 | <a href="https://beian.miit.gov.cn/">苏ICP备2023015652号<a/> | <a href="https://theme-plume.vuejs.press/">Plume主题</a>',
        copyright: '',
    },

    /**
     * @see https://theme-plume.vuejs.press/config/basic/#profile
     */
    profile: {
        avatar: 'https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/bg02.jpg',
        name: '飞云的编程宝典',
        description: '飞云的编程宝典',
        // circle: true,
         location: 'JiangSu',
        // organization: '',
    },

    navbar,
    notes,

    /**
     * 公告板
     * @see https://theme-plume.vuejs.press/guide/features/bulletin/
     */
    bulletin: {
        layout: 'top-right',
        contentType: 'markdown',
        title: '公告板',
        content: '2025-03-04正式迁移知识库到此项目',
    },

    /* 过渡动画 @see https://theme-plume.vuejs.press/config/basic/#transition */
    transition: {
      page: true,        // 启用 页面间跳转过渡动画
      postList: true,    // 启用 博客文章列表过渡动画
      appearance: 'fade',  // 启用 深色模式切换过渡动画, 或配置过渡动画类型
    },

})
