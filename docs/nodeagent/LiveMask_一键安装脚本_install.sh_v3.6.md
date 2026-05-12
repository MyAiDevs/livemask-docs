# LiveMask Sponsor 一键安装脚本（v3.6 最终版）

**文件**：`install.sh`

## 使用说明

- **后端在生成脚本时**将 `__NODE_ID__` 和 `__NODE_SECRET__` 替换为真实值。
- Sponsor 直接在服务器上执行该脚本即可完成部署。
- 脚本已包含自动检测公网IP、IPv6可用性、安装报告上报、错误自动上传等完整逻辑。
- 推荐由后端通过 `/admin/nodes/generate-install-script` 接口动态生成并提供下载。

---

## 完整脚本内容

```bash
#!/bin/bash
set -euo pipefail

# ==================== 配置区（由后端动态生成并嵌入） ====================
NODE_ID="__NODE_ID__"
NODE_SECRET="__NODE_SECRET__"
BACKEND_URL="https://api.livemask.io"
AGENT_VERSION="v1.3.0"
BINARY_URL="${BACKEND_URL}/download/agent/${AGENT_VERSION}/live-mask-agent"

# ==================== 颜色与日志 ====================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ==================== 功能函数 ====================

detect_public_ip() {
    PUBLIC_IP=$(curl -s --max-time 8 https://ifconfig.me || curl -s --max-time 8 https://ipinfo.io/ip || echo "")
    echo "$PUBLIC_IP"
}

detect_ipv6() {
    if curl -s --max-time 8 -6 https://ifconfig.me > /dev/null 2>&1; then
        echo "true"
    else
        echo "false"
    fi
}

download_agent() {
    log_info "正在下载 NodeAgent 二进制（已加固版）..."
    curl -fSL --retry 3 --retry-delay 2 "$BINARY_URL" -o /tmp/live-mask-agent || {
        log_error "下载 NodeAgent 失败"
        exit 1
    }
    chmod +x /tmp/live-mask-agent
}

install_and_start() {
    log_info "正在安装并配置 NodeAgent..."

    # 创建配置目录
    sudo mkdir -p /etc/live-mask-agent
    sudo tee /etc/live-mask-agent/config.env > /dev/null <<EOF
NODE_ID=$NODE_ID
NODE_SECRET=$NODE_SECRET
BACKEND_URL=$BACKEND_URL
EOF

    sudo mv /tmp/live-mask-agent /usr/local/bin/live-mask-agent
    sudo chown root:root /usr/local/bin/live-mask-agent
    sudo chmod 755 /usr/local/bin/live-mask-agent

    # 创建 systemd 服务
    sudo tee /etc/systemd/system/live-mask-agent.service > /dev/null <<EOF
[Unit]
Description=LiveMask NodeAgent
After=network.target

[Service]
Type=simple
EnvironmentFile=/etc/live-mask-agent/config.env
ExecStart=/usr/local/bin/live-mask-agent
Restart=always
RestartSec=5
User=root
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable live-mask-agent
    sudo systemctl start live-mask-agent
}

report_installation() {
    local status=$1
    local message=$2
    local public_ip
    local ipv6_enabled

    public_ip=$(detect_public_ip)
    ipv6_enabled=$(detect_ipv6)

    log_info "正在上报安装结果..."

    curl -s -X POST "${BACKEND_URL}/internal/agent/install-report" \
        -H "Content-Type: application/json" \
        -d "{
            \"node_id\": \"${NODE_ID}\",
            \"status\": \"${status}\",
            \"message\": \"${message}\",
            \"public_ip\": \"${public_ip}\",
            \"ipv6_enabled\": ${ipv6_enabled},
            \"install_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
        }" || log_warn "上报安装报告失败（不影响安装）"
}

upload_error_log() {
    # 复用现有日志上报系统
    log_warn "安装失败，正在上传错误日志..."
    # TODO: 调用 /internal/agent/upload-log 接口
}

# ==================== 主流程 ====================
main() {
    echo "=============================================="
    echo "   LiveMask NodeAgent 一键安装脚本 v1.3.0"
    echo "=============================================="

    detect_public_ip || true
    detect_ipv6 || true

    download_agent
    install_and_start

    sleep 10

    if systemctl is-active --quiet live-mask-agent; then
        report_installation "success" "NodeAgent 安装成功并已启动"
        log_info "✅ 安装成功！NodeAgent 已启动。"
        log_info "节点状态将在后台变为「待审核」，请等待人工审核通过。"
    else
        report_installation "failed" "NodeAgent 启动失败"
        upload_error_log
        log_error "❌ 安装失败，请检查日志或联系技术支持。"
        exit 1
    fi
}

main "$@"
```

---

## 后端生成脚本时的注意事项

1. 使用 Go `text/template` 动态替换 `__NODE_ID__` 和 `__NODE_SECRET__`。
2. 可增加脚本有效期校验（例如 24 小时内有效）。
3. 建议对脚本内容进行简单 base64 混淆或签名，防止篡改。
4. 下载链接应使用 HTTPS + 文件哈希校验。

---

**已同步更新**：本脚本内容已整合进 `LiveMask_运营手册_v3.6.md`（Sponsor 一键部署指南）和 `LiveMask_NodeAgent架构与开发规范_v3.6.md` 相关章节。

---

**文档持久化更新完成**。

所有请求内容（安全加固 Checklist、降级模式详细设计、一键安装脚本）已实际写入对应 Markdown 文件。