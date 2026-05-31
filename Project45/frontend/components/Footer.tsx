export default function Footer() {
  return (
    <footer className="bg-heritage-ink text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-heritage-red to-heritage-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">遗</span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">非遗数字传承系统</h3>
                <p className="text-xs text-gray-400">Intangible Heritage Digital Platform</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              致力于保护和传承中华优秀传统文化，通过数字化技术让古老的非遗技艺焕发新生，让更多人了解、学习和爱上非遗。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-heritage-gold transition-colors">
                <span className="text-sm">微</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-heritage-gold transition-colors">
                <span className="text-sm">博</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-heritage-gold transition-colors">
                <span className="text-sm">抖</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-heritage-gold">快速链接</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">首页</a></li>
              <li><a href="/live" className="text-gray-400 hover:text-white transition-colors">直播教学</a></li>
              <li><a href="/crafts" className="text-gray-400 hover:text-white transition-colors">技艺传承</a></li>
              <li><a href="/works" className="text-gray-400 hover:text-white transition-colors">作品溯源</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-heritage-gold">联系我们</h4>
            <ul className="space-y-2 text-gray-400">
              <li>电话：400-123-4567</li>
              <li>邮箱：contact@heritage.com</li>
              <li>地址：北京市朝阳区非遗文化中心</li>
              <li>工作时间：周一至周日 9:00-18:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 非遗数字传承系统 版权所有 | 京ICP备12345678号
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            传承千年文化，弘扬匠人精神
          </p>
        </div>
      </div>
    </footer>
  );
}
