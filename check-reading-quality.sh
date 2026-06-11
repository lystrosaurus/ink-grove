#!/bin/bash
# 阅读质量检查脚本

echo "═══════════════════════════════════════"
echo "   📚 阅读质量检查工具 v1.0"
echo "═══════════════════════════════════════"
echo ""

# 检查知识笔记数量
notes=$(ls /workspace/knowledge-notes/ 2>/dev/null | wc -l)
echo "📝 知识笔记总数：$notes 份"

# 检查阅读记录数量
logs=$(ls /workspace/reading-log/ 2>/dev/null | wc -l)
echo "📖 阅读记录总数：$logs 份"

# 检查完成书籍数量
done=$(ls /workspace/book-list/done/ 2>/dev/null | wc -l)
echo "✅ 完成书籍总数：$done 本"
echo ""

# 随机抽样检查（5 本）
echo "═══════════════════════════════════════"
echo "   随机抽样检查（5 本）"
echo "═══════════════════════════════════════"
echo ""

# 检查笔记平均行数
total_lines=0
count=0
for note in /workspace/knowledge-notes/*.md; do
    if [ -f "$note" ]; then
        lines=$(wc -l < "$note")
        total_lines=$((total_lines + lines))
        count=$((count + 1))
    fi
done

if [ $count -gt 0 ]; then
    avg=$((total_lines / count))
    echo "📊 知识笔记平均行数：$avg 行"
    
    if [ $avg -ge 200 ]; then
        echo "   评级：✅ 优秀（内容充分）"
    elif [ $avg -ge 100 ]; then
        echo "   评级：⚠️ 良好（建议补充）"
    else
        echo "   评级：❌ 待改进（需要扩充）"
    fi
fi

# 检查阅读记录
total_log_lines=0
log_count=0
for log in /workspace/reading-log/*.md; do
    if [ -f "$log" ]; then
        lines=$(wc -l < "$log")
        total_log_lines=$((total_log_lines + lines))
        log_count=$((log_count + 1))
    fi
done

if [ $log_count -gt 0 ]; then
    log_avg=$((total_log_lines / log_count))
    echo "📊 阅读记录平均行数：$log_avg 行"
fi

echo ""
echo "═══════════════════════════════════════"
echo "   质量改进建议"
echo "═══════════════════════════════════════"
echo ""

# 检查低质量笔记（少于 50 行）
echo "⚠️  需要补充的笔记（<50 行）:"
low_count=0
for note in /workspace/knowledge-notes/*.md; do
    if [ -f "$note" ]; then
        lines=$(wc -l < "$note")
        if [ $lines -lt 50 ]; then
            basename "$note" .md
            low_count=$((low_count + 1))
        fi
    fi
done | head -10

if [ $low_count -eq 0 ]; then
    echo "   无（所有笔记均达标）"
else
    echo "   ... 共 $low_count 份需要补充"
fi

echo ""
echo "═══════════════════════════════════════"
