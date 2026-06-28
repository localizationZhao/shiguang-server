# lecture4_课堂作业（二）

## 文件概述

RESTful_PHP.md：PHP后台RESTful服务实现方案与主流开发框架调研报告

## 核心要点

### RESTful服务核心概念

- 基于HTTP协议的软件架构风格
- 将一切视为资源，每个资源拥有唯一URI
- 通过HTTP方法（GET、POST、PUT、DELETE）操作资源
- 使用JSON或XML格式传输数据

### PHP实现方案

1. **原生PHP**：无框架依赖，适合学习底层原理
2. **全栈框架**：Laravel、Symfony、ThinkPHP，适合中大型项目
3. **轻量级框架**：Slim、Lumen，专为API设计，性能优先

### 主流框架对比

| 框架 | 适用场景 |
|------|----------|
| Laravel | 中大型项目，语法优雅，生态丰富 |
| Symfony | 企业级复杂系统，组件化设计 |
| ThinkPHP | 国内中小项目，中文支持好 |
| Slim/Lumen | 高性能API服务，微服务架构 |