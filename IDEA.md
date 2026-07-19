# 报价器 (Quote-Tool) — 彩盒+瓦楞箱报价计算器

> 最后更新: 2026-07-18 21:30

## 项目定位

浙江国立包装彩印部销售专用报价工具。双文件架构：
- `index.html` — 彩盒报价（面纸→浪纸→印刷→表面处理→裱瓦→模切→粘盒→运输→其他）
- `carton.html` — 瓦楞箱报价（4种盒型：普通/全盖/中开/天地盖）

## 项目进展

### ✅ 已完成

- [x] 彩盒完整报价链（10道工序，含印刷142三档自动匹配、浪纸返点、大客户开关、免开机费、免装版费、防刮膜）
- [x] 瓦楞箱4种盒型公式 + 竖瓦/横瓦/异形支持（全mm体系）
- [x] 报价记录模块（localStorage隔离存储、多选XLSX导出、全局tooltip、名称编辑）
- [x] 全量数值兜底审计（16处 isNaN 守卫，禁用 ||0）
- [x] Git 版本管理 + GitHub Pages 部署
- [x] baojia skill v3.1.0（踩坑记录、公式文档、协作流程）
- [x] FORMULAS.md（所有计算逻辑公式，链式写法，可逐行核对代码）

### ⏳ 待办 / 搁置

- [ ] 手机端布局优化
- [ ] 从报价记录恢复参数（当前只存不读）
- [ ] 本地大量新功能未推送（线上版本停在 2026.07.01）

## 🔴 核心踩坑（完整版见 baojia skill）

1. **`||默认值` 覆盖填0**（12+次）→ 一律 `isNaN(x)?default:x`
2. **改完忘记更新时间戳**（7+次）→ 改代码最后一步永远是时间戳
3. **HTML替换禁用正则**（3+次）→ 只用精确字符串match
4. **子代理并行互踩** → 复杂HTML编辑单子代理从git clean base重建
5. **瓦楞箱cm→mm全体系改造** → 改单位扫全文件所有引用位置
6. **尺寸框用 `type="text"` + `readonly`** → 最稳

## 🔴 协作规则

1. 命令词（改/加/删/做/执行/跑）才动手，其余只给方案
2. **需求模糊时提问→确认→动手**：提问引导→95%把握→向boss确认→动手。不许猜。
3. 不自动推送，等boss说"推"
4. 改任何代码/参数→第一时间更新时间戳 + 同步 FORMULAS.md

## 技术架构

- 纯前端 HTML + CSS + JavaScript
- localStorage 持久化（colorBoxHistory / cartonBoxHistory 隔离）
- SheetJS (xlsx-js-style) 导出带样式 XLSX
- GitHub Pages：`lewgniquw.github.io/Quote-Tool/`
- 知识管理：baojia skill + FORMULAS.md + knowledge-base

## 数据源

- 计算公式：`FORMULAS.md`
- 价格准则：`knowledge-base/raw/articles/价格计算准则.md`
- 报价公式：`knowledge-base/raw/articles/报价公式与定价.md`
- 国立设备：`knowledge-base/raw/articles/国立标准.md`
- 协作流程：baojia skill（`skill_view("baojia")`）
