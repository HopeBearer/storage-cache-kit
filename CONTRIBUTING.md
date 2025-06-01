# 贡献指南

感谢你对 `@ort-fe/storage-cache-kit` 的贡献兴趣！我们欢迎各种形式的贡献，包括但不限于功能请求、bug报告、文档改进、代码贡献等。

## 开发环境设置

1. 克隆仓库
   ```bash
   git clone https://github.com/hopebearer/storage-cache-kit.git
   cd storage-cache-kit
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 运行开发服务器
   ```bash
   npm run dev
   ```

4. 运行测试
   ```bash
   npm test
   ```

## 提交代码

1. 创建一个新的分支
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 做出修改并提交
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   ```

   我们使用[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)规范，常用的类型有：
   - `feat`: 新功能
   - `fix`: 修复bug
   - `docs`: 文档更新
   - `style`: 代码风格修改（不影响代码运行）
   - `refactor`: 重构代码
   - `test`: 添加或修改测试
   - `chore`: 构建过程或辅助工具的变动

3. 推送到远程仓库
   ```bash
   git push origin feature/your-feature-name
   ```

4. 创建Pull Request

## 代码规范

- 所有代码必须通过TypeScript类型检查
- 所有代码必须通过ESLint检查
- 所有新功能必须有相应的测试
- 保持代码简洁，遵循单一职责原则

## 报告Bug

如果你发现了bug，请在GitHub Issues中报告，并尽可能提供：

1. 问题的详细描述
2. 复现步骤
3. 预期行为与实际行为
4. 环境信息（浏览器、Node.js版本等）
5. 可能的解决方案

## 功能请求

如果你有新功能的想法，请在GitHub Issues中提出，并尽可能提供：

1. 功能的详细描述
2. 使用场景
3. 可能的实现方式

## 许可证

通过贡献代码，你同意你的贡献将在MIT许可证下发布。 